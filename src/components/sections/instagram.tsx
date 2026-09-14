'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { IconeInstagram } from '@/components/ui/icone-instagram'
import { gsap, useGSAP, prefereMenosMovimento } from '@/lib/gsap'
import { publicacoes } from '@/lib/instagram'
import { site } from '@/lib/site'
import { TextReveal, Reveal } from '@/components/motion/reveal'
import { RotuloSeccao } from '@/components/ui/rotulo-seccao'
import { Botao } from '@/components/ui/botao'

/**
 * Tira horizontal ligada ao scroll vertical.
 *
 * Sem `pin`: a secção não trava a página, apenas desliza enquanto passa.
 * Isso evita o spacer que o pin injecta no DOM (a causa habitual de
 * layouts que saltam) e mantém a barra de scroll honesta em relação ao
 * comprimento real do documento.
 *
 * Em ecrãs pequenos vira scroll horizontal nativo, que é o gesto que a
 * pessoa já espera de um feed.
 */
export function InstagramSection() {
  const raiz = useRef<HTMLDivElement>(null)
  const tira = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefereMenosMovimento()) return
      if (!window.matchMedia('(min-width: 1024px)').matches) return

      const el = tira.current
      if (!el) return
      const percurso = el.scrollWidth - window.innerWidth
      if (percurso <= 0) return

      gsap.to(el, {
        x: -percurso,
        ease: 'none',
        scrollTrigger: {
          trigger: raiz.current,
          start: 'top 70%',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
    },
    { scope: raiz },
  )

  return (
    <section id="instagram" ref={raiz} className="relative overflow-hidden py-section">
      <div className="px-gutter">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <RotuloSeccao numero="03">Instagram</RotuloSeccao>
            <TextReveal
              as="h2"
              text="Últimos trabalhos"
              className="mt-9 font-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.94] text-bone"
            />
          </div>
          <Reveal delay={0.1} className="flex flex-col items-start gap-6">
            <a
              href={site.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-gold transition-colors duration-500 hover:text-gold-light"
            >
              <IconeInstagram size={17} />
              <span className="tracking-[0.12em]">@{site.instagram.handle}</span>
            </a>
            <Botao href={site.instagram.url} variante="contorno">
              Seguir no Instagram
            </Botao>
          </Reveal>
        </div>
      </div>

      <div className="mt-20 overflow-x-auto pb-4 lg:overflow-visible lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          ref={tira}
          className="flex w-max gap-5 px-gutter will-change-transform sm:gap-8"
        >
          {publicacoes.map((p) => (
            <PublicacaoCartao key={p.id} publicacao={p} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PublicacaoCartao({ publicacao }: { publicacao: (typeof publicacoes)[number] }) {
  const video = useRef<HTMLVideoElement>(null)

  /**
   * Reels começam ao passar o rato e param ao sair. Deixá-los todos a
   * correr de uma vez seria meia dúzia de descodificadores de vídeo
   * activos ao mesmo tempo — em telemóvel isso derruba o frame rate e
   * a bateria. `pause` + `currentTime = 0` devolve o poster.
   */
  const entrar = () => {
    if (prefereMenosMovimento()) return
    video.current?.play().catch(() => {})
  }
  const sair = () => {
    const v = video.current
    if (!v) return
    v.pause()
    v.currentTime = 0
  }

  return (
    <a
      href={publicacao.permalink}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={entrar}
      onMouseLeave={sair}
      onFocus={entrar}
      onBlur={sair}
      className="group relative block w-[68vw] shrink-0 sm:w-[36vw] lg:w-[26vw]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-carbon">
        {publicacao.tipo === 'video' ? (
          <>
            <video
              ref={video}
              src={publicacao.src}
              poster={publicacao.poster}
              muted
              loop
              playsInline
              preload="none"
              className="h-full w-full object-cover"
              aria-label={publicacao.alt}
            />
            <span className="pointer-events-none absolute bottom-4 left-4 flex h-9 w-9 items-center justify-center border border-gold/40 bg-void/60 text-gold backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-0">
              <Play size={12} strokeWidth={1.5} fill="currentColor" />
            </span>
          </>
        ) : (
          <Image
            src={publicacao.src}
            alt={publicacao.alt}
            width={publicacao.largura}
            height={publicacao.altura}
            sizes="(max-width: 640px) 68vw, (max-width: 1024px) 36vw, 26vw"
            quality={78}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-void/30 transition-opacity duration-700 group-hover:opacity-0" />

        {/* Mesmo contorno dourado dos cartões do carrossel: presente
            sempre, e não só ao passar o rato. Uma borda a sério em vez
            de `shadow-[inset_…]` — é o que os trabalhos usam, e assim as
            duas secções lêem-se como o mesmo objecto. */}
        <div className="pointer-events-none absolute inset-0 border border-gold/30 transition-colors duration-700 group-hover:border-gold" />
      </div>

      <p className="mt-4 text-[0.62rem] uppercase tracking-[0.26em] text-bone-dim transition-colors duration-500 group-hover:text-gold">
        {publicacao.legenda}
      </p>
    </a>
  )
}
