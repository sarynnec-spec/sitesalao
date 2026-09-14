/**
 * Gera os ficheiros de marca a partir do logotipo.
 * Correr: node scripts/build-marca.mjs
 *
 *   src/app/icon.png        512x512   favicon
 *   src/app/apple-icon.png  180x180   ecra inicial iOS
 *   public/logo-social.jpg  1200x630  og:image
 *
 * O icone NAO leva fundo quadrado.
 *
 * O selo e redondo; assente num quadrado preto, dentro do recipiente
 * arredondado que o Safari e o Chrome desenham a volta do favicon,
 * lia-se como um autocolante colado por cima — cantos pretos a sobrar
 * de um lado e a barra do browser do outro. Aqui o preto vai so dentro
 * da circunferencia, exactamente ate onde o selo chega, e o resto fica
 * transparente: o icone assenta em qualquer barra, clara ou escura.
 *
 * A imagem de partilha e o caso oposto — ai o rectangulo e o formato,
 * e o preto cheio e o que a faz ler como cartao da casa.
 */
import sharp from 'sharp'

const RAIZ = 'C:/laragon/www/sitesalao'
const LOGO = `${RAIZ}/public/images/lode-logo-alfa.webp`

/**
 * Disco preto do tamanho do selo.
 *
 * O raio e dado em fraccao do lado para acompanhar a escala a que o
 * logotipo e desenhado: o preto tem de acabar onde o anel dourado
 * acaba, nem antes (fica um aro claro por dentro) nem depois (volta o
 * efeito de autocolante).
 */
function disco(lado, fraccao) {
  const r = (lado / 2) * fraccao
  return Buffer.from(
    `<svg width="${lado}" height="${lado}">
       <circle cx="${lado / 2}" cy="${lado / 2}" r="${r}" fill="#000000"/>
     </svg>`,
  )
}

/** Halo dourado tenue, so na imagem de partilha. */
function halo(largura, altura) {
  const r = Math.min(largura, altura) * 0.72
  return Buffer.from(
    `<svg width="${largura}" height="${altura}">
       <defs>
         <radialGradient id="g" cx="50%" cy="50%" r="50%">
           <stop offset="0%" stop-color="#ce9a44" stop-opacity="0.18"/>
           <stop offset="62%" stop-color="#000000" stop-opacity="0"/>
         </radialGradient>
       </defs>
       <circle cx="${largura / 2}" cy="${altura / 2}" r="${r}" fill="url(#g)"/>
     </svg>`,
  )
}

/** Icone: disco preto + selo, fundo transparente. */
async function icone({ lado, selo, fraccaoDisco, saida }) {
  const marca = await sharp(LOGO)
    .resize({
      width: selo,
      height: selo,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer()

  await sharp({
    create: {
      width: lado,
      height: lado,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: disco(lado, fraccaoDisco) },
      { input: marca, gravity: 'center' },
    ])
    .png({ compressionLevel: 9 })
    .toFile(saida)

  console.log('escrito:', saida)
}

/** Imagem de partilha: rectangulo preto cheio + halo + selo. */
async function social({ largura, altura, selo, saida }) {
  const marca = await sharp(LOGO)
    .resize({
      width: selo,
      height: selo,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer()

  await sharp({
    create: {
      width: largura,
      height: altura,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([
      { input: halo(largura, altura) },
      { input: marca, gravity: 'center' },
    ])
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(saida)

  console.log('escrito:', saida)
}

// O selo ocupa quase todo o quadrado; o disco preto acompanha-o.
await icone({ lado: 512, selo: 500, fraccaoDisco: 0.965, saida: `${RAIZ}/src/app/icon.png` })
await icone({ lado: 180, selo: 176, fraccaoDisco: 0.965, saida: `${RAIZ}/src/app/apple-icon.png` })
await social({ largura: 1200, altura: 630, selo: 430, saida: `${RAIZ}/public/logo-social.jpg` })
