import type { MetadataRoute } from 'next'
import { site, indexavel } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  if (!indexavel) {
    // Sem dados reais, o site não deve ser rastreado de todo.
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${site.url}/sitemap.xml`,
  }
}
