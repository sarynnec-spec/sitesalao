/**
 * Fonte única de verdade do conteúdo.
 *
 * Morada, telefone e redes são os reais. Continua marcado como
 * PLACEHOLDER apenas o horário, que ainda não foi confirmado — e ele
 * aparece no rodapé e no JSON-LD que o Google lê.
 */

/**
 * O site só é indexável quando isto for explicitamente ligado.
 *
 * Enquanto os contactos forem inventados, permitir indexação punha a
 * LODÊ na pesquisa do Google com telefone e morada falsos — pior do que
 * não aparecer. Ligar com `LODE_INDEXAVEL=true` só depois de os dados
 * reais estarem neste ficheiro.
 */
export const indexavel = process.env.LODE_INDEXAVEL === 'true'

/**
 * Domínio.
 *
 * Cada plataforma injecta o seu no build: o Vercel em
 * `VERCEL_PROJECT_PRODUCTION_URL` (sem protocolo), o Netlify em `URL`.
 * Sem nenhum deles, o canónico e as imagens de partilha apontariam para
 * um domínio que ainda não existe. `NEXT_PUBLIC_SITE_URL` tem prioridade
 * para quando houver domínio próprio.
 */
const dominioVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (dominioVercel ? `https://${dominioVercel}` : undefined) ??
  process.env.URL ??
  'https://lode.pt'

export const site = {
  nome: 'LODÊ',
  autor: 'Anderson Costa',
  assinatura: 'by Anderson Costa',
  url: siteUrl,
  descricao:
    'LODÊ by Anderson Costa — cabeleireiro no Porto, especialista em madeixas e coloração. Cor de autor, corte desenhado à medida e marcação por WhatsApp.',

  telefone: '+351 933 173 909',
  telefoneHref: '+351933173909',
  /** Ligação própria do negócio, com a mensagem já preparada. */
  whatsapp: 'https://api.whatsapp.com/message/E5SNGJQ4V2NXN1?autoload=1&app_absent=0',
  email: 'lodeandycosta@hotmail.com',

  morada: {
    rua: 'Rua Costa Cabral 421',
    codigoPostal: '4200-213',
    cidade: 'Porto',
    pais: 'PT',
  },

  // Destino do cartão do mapa na secção de contacto. O mapa em si é
  // agora uma imagem (`/images/maps.webp.png`); esta ligação é o que
  // abre ao carregar nele, já com a morada pesquisada no Google Maps.
  mapaLink: 'https://maps.google.com/?q=Rua+Costa+Cabral+421,+Porto',

  // PLACEHOLDER — o horário ainda não foi confirmado.
  horario: [
    { dias: 'Terça — Sexta', horas: '10:00 — 20:00' },
    { dias: 'Sábado', horas: '09:00 — 19:00' },
    { dias: 'Domingo — Segunda', horas: 'Encerrado' },
  ],

  instagram: {
    handle: 'andycostahairstylist',
    url: 'https://www.instagram.com/andycostahairstylist',
  },
  facebook: {
    nome: 'andyhairstylist',
    url: 'https://www.facebook.com/andyhairstylist/',
  },
} as const

export const navegacao = [
  { label: 'Atelier', href: '#atelier' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Trabalhos', href: '#trabalhos' },
  { label: 'Marcar', href: '#agendamento' },
  { label: 'Contacto', href: '#contacto' },
] as const

export const heroCopy = {
  sobre: 'Atelier de cabelo · Portugal',
  titulo: ['Luxury Hair', 'Experience'],
  subtitulo:
    'Cor de autor, corte desenhado à medida e um cuidado que começa muito antes da tesoura. Um atelier onde o tempo é a matéria-prima.',
  primario: { label: 'Agendar Horário', href: '#agendamento' },
  secundario: { label: 'Ver Trabalhos', href: '#trabalhos' },
} as const

/**
 * Marcação online — versão de demonstração.
 *
 * Não há backend: o formulário abre o WhatsApp do salão já com o
 * serviço, o dia e a hora escritos. É o que dá o efeito "site a sério"
 * na prévia, sem custo nem infra. A marcação com calendário real só se
 * monta depois de o cliente fechar.
 *
 * Para trocar por outra barbearia, muda só `horas` (e, se quiseres, os
 * textos). Os serviços vêm da lista `servicos` acima.
 */
export const agendamento = {
  sobre: 'Marcação',
  titulo: 'Marque online\nem segundos',
  nota: 'Escolha o serviço, o dia e a hora. A confirmação chega no instante, por WhatsApp — sem esperas, sem chamadas.',
  horas: [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
  ],
  rodape: 'Marcação sem compromisso · resposta imediata',
} as const

/**
 * Placa de assinatura, a ecrã inteiro entre a hero e o atelier.
 *
 * A frase descreve literalmente o que a fotografia mostra — três cores
 * distintas saídas da mesma mão. Uma legenda genérica ("excelência",
 * "paixão pelo cabelo") desperdiçaria a imagem; esta faz o visitante
 * reparar no que está a ver.
 */
export const assinatura = {
  sobre: 'O ofício',
  frase: 'A mesma mão.\nNunca a mesma cor.',
  nota: 'Três clientes, três fórmulas, uma tarde de trabalho.',
} as const

/**
 * Carrossel de modelos.
 *
 * Os ficheiros têm extensão dupla (`.webp.jpg`) porque foram guardados
 * assim; são JPEG. O next/image converte-os a pedido, por isso não é o
 * ficheiro de origem que segue para o visitante.
 */
export const modelos = {
  sobre: 'O resultado',
  titulo: 'Transformamos autoestima\nem resultados',
  nota: 'Trabalhos reais, sem retoque de cor. O que se vê é o que sai do atelier.',
  itens: Array.from({ length: 13 }, (_, i) => ({
    id: `modelo-${i + 1}`,
    src: `/images/modelo${i + 1}.webp.jpg`,
    alt: `Trabalho de cabelo assinado por Anderson Costa — ${i + 1} de 13`,
  })),
} as const

/**
 * Convite final, antes da secção do Instagram.
 *
 * `bico` é a posição do bico do frasco em fracções da fotografia, e é
 * de onde parte o jato desenhado em canvas. Ao trocar a fotografia é
 * este par de números que precisa de ser reajustado — mais nada.
 */
export const convite = {
  imagem: {
    // Nome actual do ficheiro em public/images.
    src: '/images/anderson-spray.webp.webp',
    largura: 1023,
    altura: 1537,
    alt: 'Anderson Costa sentado num banco, a accionar um frasco de spray',
  },
  bico: { x: 0.46, y: 0.26 },
  titulo: 'Pronta para a sua\nmelhor versão?',
  subtitulo: 'Agende o seu horário e viva uma experiência transformadora.',
  botao: { label: 'Agendar agora', href: '#agendamento' },
} as const

export const manifesto = {
  sobre: 'O autor',
  titulo: 'Sobre o\nAnderson Costa',
  paragrafos: [
    'Expertise, paixão e um olhar artístico que traduz a beleza de forma única.',
    'Com anos de experiência, Anderson Costa é referência em mechas, colorimetria e transformações que elevam a autoestima.',
  ],
  marcas: [
    { valor: '15+', label: 'anos de ofício' },
    { valor: '1', label: 'cliente de cada vez' },
    { valor: '100%', label: 'diagnóstico antes de cor' },
  ],
} as const

export const servicos = [
  {
    id: 'cor',
    numero: '01',
    titulo: 'Cor de autor',
    descricao:
      'Balayage, iluminação e correcção. A fórmula é desenhada para a base real do cabelo, nunca para a fotografia da referência.',
    detalhe: 'Diagnóstico incluído · 150 min',
    icone: 'Sparkles',
    imagem: '/images/tons.webp.jpg',
  },
  {
    id: 'corte',
    numero: '02',
    titulo: 'Corte desenhado',
    descricao:
      'Leitura da forma e do movimento natural antes do primeiro corte. Estrutura que continua a funcionar três meses depois.',
    detalhe: 'Lavagem e finalização · 60 min',
    icone: 'Scissors',
    imagem: '/images/corte.webp.jpg',
  },
  {
    id: 'tratamento',
    numero: '03',
    titulo: 'Tratamento capilar',
    descricao:
      'Couro cabeludo e fibra avaliados antes de qualquer produto. Reconstrução, hidratação ou nutrição — o que o cabelo pedir.',
    detalhe: 'Protocolo personalizado · 45 min',
    icone: 'Droplets',
    imagem: '/images/capilar.webp.jpg',
  },
  {
    id: 'evento',
    numero: '04',
    titulo: 'Noiva e evento',
    descricao:
      'Prova prévia incluída. Penteado construído para aguentar o dia inteiro — a cerimónia, o abraço e a pista de dança.',
    detalhe: 'Sob consulta · deslocação possível',
    icone: 'Crown',
    imagem: '/images/noiva.webp.jpg',
  },
] as const

/**
 * Galeria. As imagens vêm de public/images (originais em midia/).
 * `destaque` marca as que ocupam a coluna larga no layout editorial.
 */
export const trabalhos = [
  {
    id: 't1',
    src: '/images/trabalho-01.webp',
    largura: 1042,
    altura: 1344,
    titulo: 'Castanho iluminado',
    legenda: 'Balayage sobre base escura',
    alt: 'Cabelo castanho comprido e ondulado com mechas acobreadas, visto de costas',
    destaque: true,
  },
  {
    id: 't2',
    src: '/images/trabalho-02.webp',
    largura: 1175,
    altura: 1346,
    titulo: 'Loiro mel',
    legenda: 'Iluminação em duas sessões',
    alt: 'Cabelo loiro mel comprido e ondulado segurado pela mão do cabeleireiro',
    destaque: false,
  },
  {
    id: 't3',
    src: '/images/trabalho-03.webp',
    largura: 1176,
    altura: 1565,
    titulo: 'Loiro claro',
    legenda: 'Raiz esbatida, comprimento trabalhado',
    alt: 'Cabelo loiro claro muito comprido com ondas soltas, visto de costas',
    destaque: false,
  },
  {
    id: 't4',
    src: '/images/trabalho-04.webp',
    largura: 1179,
    altura: 1404,
    titulo: 'Cobre profundo',
    legenda: 'Correcção de cor',
    alt: 'Cabelo ondulado em tons de cobre e castanho profundo, visto de costas',
    destaque: true,
  },
] as const

export const atelierImagens = {
  /**
   * Fundo da hero. O enquadramento deixa o terço esquerdo livre — é lá
   * que assenta a headline — e coloca o Anderson à direita, onde o
   * gradiente de escurecimento é mais leve e ele continua a ler-se.
   */
  capa: {
    // Ficheiro por optimizar (PNG de 1,8 MB). Não é servido tal e qual:
    // o next/image converte-o e redimensiona-o a pedido. Quando o
    // conjunto de fotografias estiver fechado, passa pelo
    // scripts/build-assets.mjs como as outras.
    src: '/images/novacapa.webp.png',
    largura: 1677,
    altura: 938,
    alt: 'Anderson Costa de braços abertos no atelier, entre cadeiras de pele e espelhos dourados',
  },
  retrato: {
    src: '/images/anderson-poltrona.webp',
    largura: 1024,
    altura: 1536,
    alt: 'Anderson Costa sentado numa poltrona de pele preta, de fato preto, sobre fundo escuro',
  },
  spray: {
    src: '/images/anderson-spray.webp',
    largura: 1023,
    altura: 1537,
    alt: 'Anderson Costa a aplicar spray de fixação, contra fundo preto',
  },
  salao: {
    src: '/images/atelier-salao.webp',
    largura: 2400,
    altura: 1340,
    alt: 'Interior do atelier com espelhos dourados, candeeiros e cadeiras de pele',
  },
  equipa: {
    src: '/images/atelier-equipa.webp',
    largura: 2400,
    altura: 1340,
    alt: 'Anderson Costa com três clientes de costas, mostrando trabalhos de cor distintos',
  },
} as const

export type Trabalho = (typeof trabalhos)[number]
