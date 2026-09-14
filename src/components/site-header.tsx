'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
// `LazyMotion` + `domAnimation` carrega só o motor de animação de DOM
// em vez do pacote completo do Framer Motion. Como aqui só há opacidade
// e deslocação, o resto era peso morto no bundle inicial.
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { navegacao, site } from '@/lib/site'
import { irPara, travarScroll, destravarScroll } from '@/components/providers/smooth-scroll'
import { quandoAberturaTerminar } from '@/lib/intro'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const [solido, setSolido] = useState(false)
  const [aberto, setAberto] = useState(false)
  const [logoVisivel, setLogoVisivel] = useState(false)
  const botaoMenu = useRef<HTMLButtonElement>(null)
  const menosMovimento = useReducedMotion()

  // O logótipo só entra quando a abertura o "entrega" aqui. Se não
  // houver abertura, entra de imediato.
  useEffect(() => quandoAberturaTerminar(() => setLogoVisivel(true)), [])

  useEffect(() => {
    const aoScroll = () => setSolido(window.scrollY > 40)
    aoScroll()
    window.addEventListener('scroll', aoScroll, { passive: true })
    return () => window.removeEventListener('scroll', aoScroll)
  }, [])

  // Menu aberto: trava o fundo e devolve o foco ao botão ao fechar,
  // senão o Tab reinicia no topo do documento.
  useEffect(() => {
    if (aberto) travarScroll()
    else destravarScroll()
  }, [aberto])

  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAberto(false)
        botaoMenu.current?.focus()
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [aberto])

  const navegar = (href: string) => {
    setAberto(false)
    irPara(href)
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-700',
          solido
            ? 'border-b border-gold/12 bg-void/72 backdrop-blur-xl backdrop-saturate-150'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between px-gutter transition-[padding] duration-700',
            solido ? 'py-3' : 'py-5',
          )}
        >
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              irPara('#top')
            }}
            aria-label={`${site.nome} — início`}
            className="group flex items-center gap-3"
          >
            <span
              data-logo-slot
              className={cn(
                'relative block h-11 w-11 shrink-0 transition-opacity duration-500 sm:h-12 sm:w-12',
                logoVisivel ? 'opacity-100' : 'opacity-0',
              )}
            >
              {/* O mesmo ficheiro que a abertura faz voar até aqui. Se
                  fossem imagens diferentes, o logótipo mudava de forma
                  no instante da entrega e a continuidade quebrava-se. */}
              <Image
                src="/images/lode-logo-alfa.webp"
                alt=""
                fill
                sizes="48px"
                priority
                className="object-contain"
              />
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="metal-text font-display text-lg tracking-[0.18em]">
                {site.nome}
              </span>
              <span className="mt-1 text-[0.55rem] uppercase tracking-[0.34em] text-bone-dim">
                {site.assinatura}
              </span>
            </span>
          </a>

          <nav aria-label="Principal" className="hidden items-center gap-9 lg:flex">
            {navegacao.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  navegar(item.href)
                }}
                className="group relative py-1 text-[0.7rem] uppercase tracking-[0.26em] text-bone-dim transition-colors duration-500 hover:text-gold-light"
              >
                {item.label}
                <span className="metal absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
              </a>
            ))}
            <a
              href="#contacto"
              onClick={(e) => {
                e.preventDefault()
                navegar('#contacto')
              }}
              className="sweep border border-gold/35 px-6 py-3 text-[0.68rem] uppercase tracking-[0.26em] text-gold-light transition-colors duration-500 hover:border-gold/70"
            >
              Agendar
            </a>
          </nav>

          <button
            ref={botaoMenu}
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-controls="menu-movel"
            className="flex items-center gap-2 text-gold-light lg:hidden"
          >
            <span className="text-[0.66rem] uppercase tracking-[0.26em]">
              {aberto ? 'Fechar' : 'Menu'}
            </span>
            {aberto ? <X size={18} strokeWidth={1.25} /> : <Menu size={18} strokeWidth={1.25} />}
          </button>
        </div>
      </header>

      <LazyMotion features={domAnimation} strict>
      <AnimatePresence>
        {aberto && (
          <m.div
            id="menu-movel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: menosMovimento ? 0 : 0.4 }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-void/97 px-gutter backdrop-blur-2xl lg:hidden"
          >
            <nav aria-label="Principal (móvel)" className="flex flex-col gap-2">
              {navegacao.map((item, i) => (
                <m.a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    navegar(item.href)
                  }}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: menosMovimento ? 0 : 0.6,
                    delay: menosMovimento ? 0 : 0.08 + i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="border-b border-gold/10 py-5 font-display text-4xl text-bone transition-colors duration-300 hover:text-gold-light"
                >
                  {item.label}
                </m.a>
              ))}
            </nav>
            <p className="mt-12 text-[0.66rem] uppercase tracking-[0.3em] text-bone-dim">
              {site.morada.cidade} · {site.telefone}
            </p>
          </m.div>
        )}
      </AnimatePresence>
      </LazyMotion>
    </>
  )
}
