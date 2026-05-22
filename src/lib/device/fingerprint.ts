// Device fingerprint using FingerprintJS
// Provides stable device ID for device binding (max 2 devices per account)

let cachedFingerprint: string | null = null;

export async function getDeviceFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint;

  try {
    const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    cachedFingerprint = result.visitorId;
    return cachedFingerprint;
  } catch {
    // Fallback fingerprint using available browser data
    const fallback = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
    ].join('|');
    
    // Simple hash
    let hash = 0;
    for (let i = 0; i < fallback.length; i++) {
      const char = fallback.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    cachedFingerprint = Math.abs(hash).toString(36);
    return cachedFingerprint;
  }
}

export function getDeviceInfo() {
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPod/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);

  return {
    type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
    name: generateDeviceName(ua),
    userAgent: ua,
  };
}

function generateDeviceName(ua: string): string {
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Samsung/.test(ua)) return 'Samsung Galaxy';
  if (/Pixel/.test(ua)) return 'Google Pixel';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows NT/.test(ua)) return 'Windows PC';
  if (/Macintosh/.test(ua)) return 'Mac';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Dispositivo';
}

export async function validateOrRegisterDevice(
  userId: string,
  supabaseClient: import('@supabase/supabase-js').SupabaseClient
): Promise<{
  allowed: boolean;
  device?: Record<string, unknown>;
  isNew?: boolean;
  reason?: string;
  message?: string;
  devices?: Record<string, unknown>[];
}> {
  const fingerprint = await getDeviceFingerprint();
  const deviceInfo = getDeviceInfo();

  // Check if device already registered
  const { data: existingDevice } = await supabaseClient
    .from('user_devices')
    .select('*')
    .eq('user_id', userId)
    .eq('device_fingerprint', fingerprint)
    .single();

  if (existingDevice) {
    await supabaseClient
      .from('user_devices')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', existingDevice.id);
    return { allowed: true, device: existingDevice };
  }

  // Check device count
  const { data: userDevices, count } = await supabaseClient
    .from('user_devices')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_active', true);

  if (count !== null && count >= 2) {
    return {
      allowed: false,
      reason: 'device_limit',
      message: 'Você atingiu o limite de 2 dispositivos. Remova um dispositivo nas configurações para continuar.',
      devices: userDevices || [],
    };
  }

  // Register new device
  const { data: newDevice } = await supabaseClient
    .from('user_devices')
    .insert({
      user_id: userId,
      device_fingerprint: fingerprint,
      device_name: deviceInfo.name,
      device_type: deviceInfo.type,
      user_agent: deviceInfo.userAgent,
    })
    .select()
    .single();

  return { allowed: true, device: newDevice || undefined, isNew: true };
}
