import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

function validateTictoSignature(payload: unknown, signature: string | null): boolean {
  if (!signature || !process.env.TICTO_WEBHOOK_SECRET) return false
  const hmac = crypto.createHmac('sha256', process.env.TICTO_WEBHOOK_SECRET)
  hmac.update(JSON.stringify(payload))
  const expectedSignature = hmac.digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

async function updateSubscription(
  email: string,
  status: string,
  expiresAt: string | null
) {
  const supabase = createAdminClient()
  await supabase
    .from('profiles')
    .update({
      subscription_status: status,
      subscription_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email)
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const signature = request.headers.get('x-ticto-signature')

    // In development, skip signature validation
    if (process.env.NODE_ENV === 'production' && !validateTictoSignature(payload, signature)) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { event, customer_email, subscription_status, expires_at } = payload

    switch (event) {
      case 'subscription.activated':
        await updateSubscription(customer_email, 'active', expires_at)
        break
      case 'subscription.cancelled':
        await updateSubscription(customer_email, 'cancelled', null)
        break
      case 'subscription.expired':
        await updateSubscription(customer_email, 'expired', null)
        break
      case 'subscription.renewed':
        await updateSubscription(customer_email, 'active', expires_at)
        break
      default:
        console.log('Unknown Ticto event:', event)
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Ticto webhook error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
