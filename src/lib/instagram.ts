/**
 * Feed do Instagram.
 *
 * IMPORTANTE — isto NÃO é obtido automaticamente do Instagram.
 * O Instagram não permite recolha automática de publicações: não há
 * endpoint público, o HTML da página exige sessão autenticada e a
 * recolha por scraping viola os Termos de Utilização da Meta (além de
 * partir sempre que eles mudam o markup).
 *
 * As duas vias legítimas são:
 *
 *  1. Instagram Basic Display API / Instagram Graph API
 *     Requer uma app na Meta for Developers e um token de acesso da
 *     conta. Depois basta substituir `publicacoes` por uma chamada a
 *     `https://graph.instagram.com/me/media?fields=id,caption,media_type,
 *      media_url,thumbnail_url,permalink&access_token=…` dentro de um
 *     Server Component com `next: { revalidate: 3600 }`. A forma dos
 *     dados abaixo já corresponde à resposta dessa API, para a troca
 *     ser directa.
 *
 *  2. Curadoria manual — o que está aqui agora: as imagens que foram
 *     entregues, servidas localmente. Mais rápido, sem dependência
 *     externa e sem token a expirar de dois em dois meses.
 *
 * Os nomes têm extensão dupla porque foram guardados assim; repare que
 * a 3 e a 7 são `.webp.webp` e as restantes `.webp.jpg`. O next/image
 * converte-as a pedido, seja qual for o formato de origem.
 */

export type PublicacaoInstagram = {
  id: string
  tipo: 'imagem' | 'video'
  src: string
  /** Obrigatório em vídeo: é o fotograma mostrado antes do hover. */
  poster?: string
  largura: number
  altura: number
  legenda: string
  alt: string
  permalink: string
}

const PERFIL = 'https://www.instagram.com/andycostahairstylist'

export const publicacoes: PublicacaoInstagram[] = [
  {
    id: 'ig1',
    tipo: 'imagem',
    src: '/images/imagem1.webp.jpg',
    largura: 3550,
    altura: 4096,
    legenda: 'Trabalho de cor',
    alt: 'Trabalho de coloração assinado por Anderson Costa',
    permalink: PERFIL,
  },
  {
    id: 'ig2',
    tipo: 'imagem',
    src: '/images/imagem2.webp.jpg',
    largura: 1760,
    altura: 2347,
    legenda: 'Madeixas',
    alt: 'Madeixas iluminadas feitas no atelier LODÊ',
    permalink: PERFIL,
  },
  {
    id: 'ig3',
    tipo: 'imagem',
    src: '/images/imagem3.webp.webp',
    largura: 1042,
    altura: 1344,
    legenda: 'Castanho iluminado',
    alt: 'Cabelo castanho comprido com mechas acobreadas',
    permalink: PERFIL,
  },
  {
    id: 'ig4',
    tipo: 'imagem',
    src: '/images/imagem4.webp.jpg',
    largura: 1440,
    altura: 1800,
    legenda: 'Coloração',
    alt: 'Resultado de coloração no atelier LODÊ',
    permalink: PERFIL,
  },
  {
    id: 'ig5',
    tipo: 'imagem',
    src: '/images/imagem5.webp.jpg',
    largura: 1361,
    altura: 1524,
    legenda: 'Loiro trabalhado',
    alt: 'Cabelo loiro com raiz esbatida',
    permalink: PERFIL,
  },
  {
    id: 'ig6',
    tipo: 'imagem',
    src: '/images/imagem6.webp.jpg',
    largura: 1440,
    altura: 1800,
    legenda: 'Corte e cor',
    alt: 'Corte e coloração assinados por Anderson Costa',
    permalink: PERFIL,
  },
  {
    id: 'ig7',
    tipo: 'imagem',
    src: '/images/imagem7.webp.webp',
    largura: 1179,
    altura: 1404,
    legenda: 'Cobre profundo',
    alt: 'Cabelo ondulado em tons de cobre e castanho profundo',
    permalink: PERFIL,
  },
  {
    id: 'ig8',
    tipo: 'imagem',
    src: '/images/imagem8.webp.jpg',
    largura: 1440,
    altura: 1800,
    legenda: 'Transformação',
    alt: 'Transformação de cor feita no atelier LODÊ',
    permalink: PERFIL,
  },
]
