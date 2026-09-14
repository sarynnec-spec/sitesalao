import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { site, indexavel } from '@/lib/site'
import { SmoothScroll } from '@/components/providers/smooth-scroll'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  // Só os pesos que o design usa. Cada peso extra é uma fonte a descarregar.
  weight: ['400', '500'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.nome} — ${site.assinatura} · Luxury Hair Experience`,
    template: `%s — ${site.nome}`,
  },
  description: site.descricao,
  applicationName: site.nome,
  authors: [{ name: site.autor }],
  keywords: [
    'cabeleireiro de luxo',
    'atelier de cabelo',
    'balayage',
    'coloração de autor',
    'Anderson Costa',
    site.nome,
  ],
  alternates: { canonical: '/' },
  /**
   * Partilha. A imagem é o selo da casa sobre o preto da marca
   * (`public/logo-social.jpg`, gerado por `scripts/build-marca.mjs`) —
   * o logotipo de origem tem fundo transparente e, sem o preto por
   * baixo, a pré-visualização no WhatsApp saía como um rectângulo
   * branco.
   */
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: site.url,
    siteName: site.nome,
    title: `${site.nome} | Salão de Beleza`,
    description: 'Especialista em cabelos loiros e transformação capilar.',
    images: [
      {
        url: '/logo-social.jpg',
        width: 1200,
        height: 630,
        alt: `${site.nome} ${site.assinatura}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.nome} | Salão de Beleza`,
    description: 'Especialista em cabelos loiros e transformação capilar.',
    images: ['/logo-social.jpg'],
  },
  robots: {
    index: indexavel,
    follow: indexavel,
    googleBot: { index: indexavel, follow: indexavel, 'max-image-preview': 'large' },
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
}

/**
 * JSON-LD. É o que faz o Google mostrar horário, morada e telefone
 * directamente na pesquisa — para um negócio local vale mais que
 * qualquer meta tag.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HairSalon',
  name: `${site.nome} ${site.assinatura}`,
  description: site.descricao,
  url: site.url,
  image: `${site.url}/images/lode-logo.webp`,
  telephone: site.telefone,
  email: site.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.morada.rua,
    postalCode: site.morada.codigoPostal,
    addressLocality: site.morada.cidade,
    addressCountry: site.morada.pais,
  },
  founder: { '@type': 'Person', name: site.autor },
  sameAs: [site.instagram.url],
  priceRange: '€€€',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '20:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '19:00',
    },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT" className={`${playfair.variable} ${inter.variable}`}>
      <body className="grain bg-void text-bone antialiased">
        {/*
          Tapa-vista da abertura, decidido antes do primeiro pixel.

          A abertura é um componente de cliente: até o `useEffect` correr
          ela devolve `null`, e o que o browser pintava nesse intervalo
          era o site — um relâmpago da página antes do filme começar, que
          matava o suspense.

          Este script corre durante a análise do documento, antes de
          qualquer pintura e antes do React, e repete exactamente os
          critérios de `deveCorrerAbertura()`. Se a abertura vai correr,
          marca o documento e o CSS tapa tudo de preto desde o início.
          Se não vai — visita repetida, movimento reduzido, rede fraca —
          não marca nada e o site entra directo, sem preto nenhum.

          O `setTimeout` é a rede de segurança: se o React nunca chegar a
          montar, mais vale o site à vista do que um ecrã preto eterno.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
var r=matchMedia('(prefers-reduced-motion: reduce)').matches;
var v=sessionStorage.getItem('lode:abertura')==='vista';
var c=navigator.connection||{};
var lenta=c.saveData||(c.effectiveType&&/2g/.test(c.effectiveType));
if(!r&&!v&&!lenta)document.documentElement.setAttribute('data-abertura','sim');
}catch(e){}
setTimeout(function(){document.documentElement.removeAttribute('data-abertura')},10000);})()`,
          }}
        />
        {/* O JSON-LD é o que afirma ao Google o telefone, a morada e o
            horário do negócio. Enquanto forem inventados, não se publica:
            é a declaração de facto mais directa da página inteira. */}
        {indexavel && (
          <script
            type="application/ld+json"
            // Conteúdo estático e nosso — não há input de utilizador aqui.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}

        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-6 focus:left-6 focus:z-[100] focus:border focus:border-gold/40 focus:bg-void focus:px-5 focus:py-3 focus:text-sm focus:tracking-widest focus:text-gold-light focus:uppercase"
        >
          Saltar para o conteúdo
        </a>

        <SmoothScroll>{children}</SmoothScroll>
        <Toaster
          position="top-center"
          theme="dark"
          toastOptions={{
            style: {
              background: '#0a0a0a',
              border: '1px solid rgba(201,169,106,0.3)',
              color: '#efe7d6',
            },
          }}
        />
      </body>
    </html>
  )
}
