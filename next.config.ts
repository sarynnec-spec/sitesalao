import type { NextConfig } from 'next'

const indexavel = process.env.LODE_INDEXAVEL === 'true'

const nextConfig: NextConfig = {
  async headers() {
    // Cabeçalho ao nível do Next, não do Netlify.
    //
    // As regras `[[headers]]` do netlify.toml aplicam-se aos ficheiros
    // estáticos, mas não às páginas servidas pelo runtime do Next — o
    // HTML saía sem `noindex`, que é precisamente onde ele faz falta.
    if (indexavel) return []

    return [
      {
        source: '/:caminho*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default nextConfig
