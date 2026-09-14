/**
 * Converte os originais de midia/ para public/ optimizado.
 * Os originais nunca são servidos: são pesados (ate 8 MB) e tem extensao
 * dupla trocada (.webp.png que e PNG). Correr: node scripts/build-assets.mjs
 */
import sharp from 'sharp'
import { mkdirSync, copyFileSync, existsSync, statSync, rmSync } from 'fs'
import { execFileSync } from 'child_process'

const SRC = 'C:/laragon/www/sitesalao/midia'
const OUT = 'C:/laragon/www/sitesalao/public'

// Video de origem, usado tanto para a recompressao como para extrair
// o fotograma final de onde sai o logotipo que voa.
const videoOrigemBruto = `${SRC}/videos/logo/logoinicial.mp4.mp4`

const imagens = [
  // Capa da hero: o enquadramento deixa o terco esquerdo livre, que e
  // onde assenta a headline. Qualidade um pouco acima das outras porque
  // e a imagem que ocupa o ecra inteiro e serve de elemento LCP.
  { de: `${SRC}/imagens/hero/capa.png`,             para: 'capa',              w: 2000, q: 84 },
  // Retratos fotografados sobre preto: ver `aplicarCampoPlano` abaixo.
  { de: `${SRC}/imagens/hero/gallery-01.webp.png`,  para: 'anderson-poltrona', w: 1400, campoPlano: { limite: 14, sigma: 40 } },
  { de: `${SRC}/imagens/hero/gallery-02.webp.png`,  para: 'atelier-equipa',    w: 2400 },
  { de: `${SRC}/imagens/hero/gallery-03.webp.png`,  para: 'atelier-salao',     w: 2400 },
  { de: `${SRC}/imagens/hero/gallery-04.webp.png`,  para: 'anderson-spray',    w: 1400, campoPlano: { limite: 14, sigma: 40 } },
  { de: `${SRC}/imagens/hero/gallery-05.webp.jpeg`, para: 'trabalho-01',       w: 1200 },
  { de: `${SRC}/imagens/hero/gallery-06.webp.jpeg`, para: 'trabalho-02',       w: 1200 },
  { de: `${SRC}/imagens/hero/gallery-07.webp.jpeg`, para: 'trabalho-03',       w: 1200 },
  { de: `${SRC}/imagens/hero/gallery-08.webp.jpeg`, para: 'trabalho-04',       w: 1200 },
]

mkdirSync(`${OUT}/images`, { recursive: true })
mkdirSync(`${OUT}/video`, { recursive: true })

/**
 * Correccao de campo plano.
 *
 * Os retratos feitos sobre preto nao tem o fundo uniforme: ha um brilho
 * difuso, mais forte em redor da figura, que sobe o preto ate ao nivel
 * 12 no campo intermedio enquanto os cantos ficam a 0. Um ajuste de
 * niveis uniforme nao apanha isso — baixa tudo por igual e o halo
 * mantem-se.
 *
 * O brilho e de baixa frequencia; o detalhe da pele da poltrona e de
 * alta. Desfocar muito isola o campo de luz, que depois se subtrai. O
 * `limite` trava quanto se pode subtrair, para as zonas com informacao
 * real nao escurecerem: sem ele, a figura toda perdia densidade.
 */
async function aplicarCampoPlano(cano, { limite, sigma }) {
  const { data, info } = await cano.clone().raw().toBuffer({ resolveWithObject: true })
  const campo = await cano.clone().greyscale().blur(sigma).raw().toBuffer()
  const { width, height, channels } = info
  const out = Buffer.alloc(data.length)
  for (let p = 0; p < width * height; p++) {
    const sub = Math.min(campo[p], limite)
    for (let k = 0; k < channels; k++) out[p * channels + k] = Math.max(0, data[p * channels + k] - sub)
  }
  return sharp(out, { raw: { width, height, channels } })
}

let total = 0
for (const it of imagens) {
  const alvo = `${OUT}/images/${it.para}.webp`
  let cano = sharp(it.de).resize({ width: it.w, withoutEnlargement: true })
  if (it.campoPlano) cano = await aplicarCampoPlano(cano, it.campoPlano)
  const info = await cano.webp({ quality: it.q ?? 82, effort: 6 }).toFile(alvo)
  total += info.size
  console.log(`${it.para.padEnd(20)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0).padStart(5)} KB`)
}

// Logo: fica em WebP e tambem em PNG para o og:image / favicon.
/**
 * Logo com canal alfa a serio.
 *
 * O original e um JPEG: dourado sobre preto, sem transparencia e com
 * artefactos de compressao a volta das letras. Sobre o preto do site
 * isso le-se como uma caixa cinzenta em redor do logotipo, e
 * `mix-blend-mode: screen` nao resolve — o cabecalho tem `z-index`, o
 * que cria contexto de empilhamento e isola a mistura.
 *
 * Como o logotipo e luz sobre preto, a luminancia E a opacidade: o
 * canal cinzento passa a alfa. A rampa metalica fica intacta e o fundo
 * desaparece por completo, sobre qualquer cor.
 *
 * `linear(1.3, -14)` empurra os cinzentos baixos (os artefactos) para
 * zero sem tocar nas altas-luzes do dourado.
 */
const base = sharp(`${SRC}/logos/logo.svg.jpeg`).resize({
  width: 900,
  withoutEnlargement: true,
})

const alfa = await base.clone().greyscale().linear(1.3, -14).toColourspace('b-w').toBuffer()

const rgba = await base.clone().ensureAlpha().joinChannel(alfa).png().toBuffer()

const logo = await sharp(rgba)
  // Apara o vazio transparente em redor. Sem isto o medalhao ficaria
  // com margens enormes e, numa caixa de 44 px no cabecalho, sobrava-lhe
  // menos de metade da altura para desenhar.
  .trim({ threshold: 6 })
  .webp({ quality: 92, effort: 6, alphaQuality: 100 })
  .toFile(`${OUT}/images/lode-logo.webp`)
console.log(
  `${'lode-logo (alfa)'.padEnd(20)} ${logo.width}x${logo.height}  ${(logo.size / 1024).toFixed(0).padStart(5)} KB  canais=${logo.channels}`,
)

/* ---- Logotipo que voa no fim da abertura ---------------------------
 *
 * E extraido do ULTIMO FOTOGRAMA DO PROPRIO VIDEO, e nao de um ficheiro
 * a parte.
 *
 * O logotipo fornecido em separado (logosemfundo.png) e um desenho
 * diferente do que corre no video: o anel exterior e irregular, mais
 * espesso em baixo a esquerda, enquanto o do video e um circulo limpo.
 * Ao trocar um pelo outro, o logotipo parecia inclinar-se. Usando o
 * fotograma do proprio video, o que fica no ecra e literalmente a mesma
 * imagem — nao ha nada que possa mudar.
 *
 * Mantem-se a resolucao completa do video (720x1280) de proposito: com
 * a mesma geometria e o mesmo `object-contain`, o logotipo aparece
 * exactamente no mesmo sitio e tamanho, sem factores de correccao.
 * ------------------------------------------------------------------ */
const ffmpegBin = (await import('ffmpeg-static')).default
const fotograma = `${OUT}/images/.ultimo-fotograma.png`

execFileSync(
  ffmpegBin,
  ['-y', '-hide_banner', '-loglevel', 'error', '-sseof', '-0.1', '-i', videoOrigemBruto, '-frames:v', '1', fotograma],
  { stdio: 'inherit' },
)

/**
 * Recorte por luminancia, com desmultiplicacao.
 *
 * Dourado sobre preto: a luminancia de cada pixel e exactamente a sua
 * opacidade. Mas nao basta colar a luminancia no canal alfa — o browser
 * desenha `cor x alfa` sobre o fundo, e o resultado sai mais escuro que
 * o original. E preciso dividir a cor pelo alfa (desmultiplicar) para
 * que `(cor / alfa) x alfa` volte a dar a cor de partida.
 *
 * Sem isto o logotipo escurecia visivelmente no instante da troca.
 */
const cru = await sharp(fotograma).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const px = cru.data
const rgbaVideo = Buffer.alloc(px.length)
for (let i = 0; i < px.length; i += 4) {
  const r = px[i], g = px[i + 1], b = px[i + 2]
  // O alfa e o canal MAIS FORTE, nao a luminancia.
  //
  // Com luminancia, o dourado saturado rebentava: #ce9a44 tem
  // luminancia 159, e dividir o vermelho (206) por 159/255 dava 331,
  // que ao ser cortado nos 255 perdia informacao — o logotipo saia com
  // a cor errada. Usando o maximo dos tres canais, a divisao nunca
  // ultrapassa 255 e a recomposicao devolve o pixel original exacto.
  const a = Math.max(r, g, b)
  if (a < 6) continue // fundo preto: transparente
  rgbaVideo[i] = Math.round((r * 255) / a)
  rgbaVideo[i + 1] = Math.round((g * 255) / a)
  rgbaVideo[i + 2] = Math.round((b * 255) / a)
  rgbaVideo[i + 3] = a
}
const comAlfa = await sharp(rgbaVideo, {
  raw: { width: cru.info.width, height: cru.info.height, channels: 4 },
}).png().toBuffer()

const doVideo = await sharp(comAlfa)
  .webp({ quality: 92, effort: 6, alphaQuality: 100 })
  .toFile(`${OUT}/images/lode-logo-video.webp`)

// Fraccao da altura do fotograma ocupada pelo logotipo — e o que o voo
// precisa de saber para aterrar no tamanho certo do cabecalho.
const { info: recorte } = await sharp(comAlfa).trim({ threshold: 6 }).raw().toBuffer({ resolveWithObject: true })
console.log(
  `${'lode-logo-video'.padEnd(20)} ${doVideo.width}x${doVideo.height}  ${(doVideo.size / 1024).toFixed(0).padStart(5)} KB` +
    `  | logo ocupa ${recorte.width}x${recorte.height} => FRACAO_LOGO_NO_VIDEO = ${(recorte.height / doVideo.height).toFixed(4)}`,
)

// Versao aparada, para o cabecalho e o rodape.
const aparado = await sharp(comAlfa)
  .trim({ threshold: 6 })
  .resize({ width: 720, withoutEnlargement: true })
  .webp({ quality: 92, effort: 6, alphaQuality: 100 })
  .toFile(`${OUT}/images/lode-logo-alfa.webp`)
console.log(
  `${'lode-logo-alfa'.padEnd(20)} ${aparado.width}x${aparado.height}  ${(aparado.size / 1024).toFixed(0).padStart(5)} KB  canais=${aparado.channels}`,
)

rmSync(fotograma, { force: true })

/**
 * Video de abertura, recomprimido.
 *
 * O original sai do editor a 7060 kb/s com faixa de audio — 6 MB para
 * 6,9 s de uma animacao sobre fundo preto, que e material altamente
 * compressivel. Sendo o primeiro pedido pesado da pagina, era ele que
 * fazia a abertura auto-saltar em ligacoes lentas.
 *
 * CRF 26 com `preset veryslow`: medido contra o original, a diferenca
 * media e de 0,79 niveis em 255 — imperceptivel — e o ficheiro fica
 * cerca de 16x mais pequeno. `-an` remove o audio, que nunca e ouvido
 * (o video toca em silencio). `+faststart` poe o indice no inicio, para
 * o browser comecar a reproduzir sem descarregar o ficheiro todo.
 */
const videoAlvo = `${OUT}/video/intro.mp4`

try {
  const ffmpeg = (await import('ffmpeg-static')).default
  execFileSync(
    ffmpeg,
    [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-i', videoOrigemBruto,
      '-c:v', 'libx264',
      '-crf', '26',
      '-preset', 'veryslow',
      '-profile:v', 'high',
      '-pix_fmt', 'yuv420p',
      '-an',
      '-movflags', '+faststart',
      videoAlvo,
    ],
    { stdio: 'inherit' },
  )
  const antes = statSync(videoOrigemBruto).size
  const depois = statSync(videoAlvo).size
  console.log(
    `\nintro.mp4  ${(antes / 1048576).toFixed(2)} MB -> ${(depois / 1024).toFixed(0)} KB  (${(antes / depois).toFixed(1)}x mais pequeno)`,
  )
} catch (erro) {
  // Sem ffmpeg o site continua a funcionar, so com o ficheiro pesado.
  console.log('\nAVISO: recompressao falhou, a copiar o video original')
  console.log(`  ${erro.message}`)
  copyFileSync(videoOrigemBruto, videoAlvo)
}

console.log(`total imagens: ${(total / 1024 / 1024).toFixed(2)} MB`)
