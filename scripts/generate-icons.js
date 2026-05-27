// Gerador de ícones PNG para o Farol PWA
// Usa a lib 'sharp' disponível no node_modules do Next.js
// Cria 8 tamanhos a partir de um SVG base

const path = require('path')
const fs = require('fs')

// Sharp está em node_modules (usado pelo Next.js internamente)
let sharp
try {
  sharp = require('sharp')
} catch {
  // Tenta path direto do next
  try {
    sharp = require(path.join(__dirname, '..', 'node_modules', 'sharp'))
  } catch (e2) {
    console.error('sharp não encontrado:', e2.message)
    process.exit(1)
  }
}

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons')

// Criar diretório se não existir
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  console.log('Criado diretório:', OUTPUT_DIR)
}

// SVG do farol — fundo #0F1729, farol âmbar centralizado
function buildSVG(size) {
  const pad = Math.floor(size * 0.1)
  const innerSize = size - pad * 2
  const cx = size / 2
  
  // Proporções relativas ao tamanho
  const baseW = Math.round(innerSize * 0.45)
  const bodyH = Math.round(innerSize * 0.48)
  const baseH = Math.round(innerSize * 0.12)
  const topH = Math.round(innerSize * 0.07)
  const capH = Math.round(innerSize * 0.08)
  
  const bodyTop = pad + capH + topH
  const bodyBottom = bodyTop + bodyH
  const baseTop = bodyBottom
  const baseBottom = baseTop + baseH
  
  const bodyTopW = Math.round(baseW * 0.55)
  const bodyBottomW = baseW
  
  const topY = pad + capH
  const capY = pad
  
  // Window in lighthouse body
  const winW = Math.round(bodyTopW * 0.6)
  const winH = Math.round(bodyH * 0.45)
  const winX = cx - winW / 2
  const winY = bodyTop + Math.round(bodyH * 0.12)
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#0F1729"/>
  
  <!-- Light rays (subtle) -->
  <line x1="${cx}" y1="${topY + topH/2}" x2="${cx - Math.round(innerSize*0.35)}" y2="${pad - 2}" stroke="#FCD34D" stroke-width="${Math.max(1, Math.round(size*0.007))}" stroke-linecap="round" opacity="0.5"/>
  <line x1="${cx}" y1="${topY + topH/2}" x2="${cx + Math.round(innerSize*0.35)}" y2="${pad - 2}" stroke="#FCD34D" stroke-width="${Math.max(1, Math.round(size*0.007))}" stroke-linecap="round" opacity="0.5"/>
  <line x1="${cx}" y1="${topY + topH/2}" x2="${cx - Math.round(innerSize*0.42)}" y2="${topY + topH/2}" stroke="#FCD34D" stroke-width="${Math.max(1, Math.round(size*0.007))}" stroke-linecap="round" opacity="0.35"/>
  <line x1="${cx}" y1="${topY + topH/2}" x2="${cx + Math.round(innerSize*0.42)}" y2="${topY + topH/2}" stroke="#FCD34D" stroke-width="${Math.max(1, Math.round(size*0.007))}" stroke-linecap="round" opacity="0.35"/>
  
  <!-- Cap / spire -->
  <polygon points="${cx},${capY} ${cx - Math.round(topH*0.7)},${topY} ${cx + Math.round(topH*0.7)},${topY}" fill="#F59E0B"/>
  
  <!-- Lantern top -->
  <rect x="${cx - bodyTopW/2}" y="${topY}" width="${bodyTopW}" height="${topH}" rx="${Math.round(topH*0.3)}" fill="#FBBF24"/>
  
  <!-- Body (trapezoid via polygon) -->
  <polygon points="${cx - bodyTopW/2},${bodyTop} ${cx + bodyTopW/2},${bodyTop} ${cx + bodyBottomW/2},${bodyBottom} ${cx - bodyBottomW/2},${bodyBottom}" fill="#F59E0B"/>
  
  <!-- Window dark -->
  <rect x="${winX}" y="${winY}" width="${winW}" height="${winH}" rx="${Math.round(winW*0.15)}" fill="#0F1729"/>
  <!-- Window glow -->
  <rect x="${winX + Math.round(winW*0.12)}" y="${winY + Math.round(winH*0.1)}" width="${Math.round(winW*0.76)}" height="${Math.round(winH*0.8)}" rx="${Math.round(winW*0.1)}" fill="#FCD34D" opacity="0.85"/>
  
  <!-- Base platform -->
  <rect x="${cx - bodyBottomW/2 - Math.round(size*0.03)}" y="${baseTop}" width="${bodyBottomW + Math.round(size*0.06)}" height="${Math.round(baseH*0.45)}" rx="${Math.round(size*0.02)}" fill="#D97706"/>
  
  <!-- Foundation -->
  <rect x="${cx - bodyBottomW/2}" y="${baseTop + Math.round(baseH*0.45)}" width="${bodyBottomW}" height="${Math.round(baseH*0.55)}" rx="${Math.round(size*0.015)}" fill="#B45309"/>
</svg>`
}

async function generateIcons() {
  console.log('Gerando ícones PWA do Farol...\n')
  
  const results = []
  
  for (const size of SIZES) {
    const svg = buildSVG(size)
    const svgBuffer = Buffer.from(svg)
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`)
    
    try {
      await sharp(svgBuffer)
        .png({ quality: 100 })
        .resize(size, size)
        .toFile(outputPath)
      
      const stats = fs.statSync(outputPath)
      console.log(`✓ icon-${size}x${size}.png — ${Math.round(stats.size/1024)}KB`)
      results.push({ size, path: outputPath, ok: true })
    } catch (err) {
      console.error(`✗ icon-${size}x${size}.png — ERRO:`, err.message)
      results.push({ size, path: outputPath, ok: false, error: err.message })
    }
  }
  
  const ok = results.filter(r => r.ok).length
  const fail = results.filter(r => !r.ok).length
  console.log(`\nResultado: ${ok}/${SIZES.length} ícones gerados com sucesso`)
  if (fail > 0) console.log(`${fail} falharam — verificar erros acima`)
  
  // Salvar também a versão maior como apple-touch-icon (legado)
  try {
    const svg512 = buildSVG(512)
    await sharp(Buffer.from(svg512)).png({ quality: 100 }).resize(180, 180)
      .toFile(path.join(OUTPUT_DIR, 'apple-touch-icon.png'))
    console.log('✓ apple-touch-icon.png (180x180)')
  } catch (e) {
    console.log('✗ apple-touch-icon:', e.message)
  }
  
  return results
}

generateIcons().catch(e => {
  console.error('ERRO FATAL:', e.message)
  process.exit(1)
})
