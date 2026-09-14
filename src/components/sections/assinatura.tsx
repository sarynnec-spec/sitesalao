'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { gsap, useGSAP, prefereMenosMovimento } from '@/lib/gsap'
import { assinatura, atelierImagens } from '@/lib/site'
import { TextReveal, Reveal } from '@/components/motion/reveal'

/**
 * Placa de assinatura.
 *
 * O mesmo arranjo em todos os ecrãs: fotografia em cima, frase por baixo
 * em preto.
 *
 * Chegou a haver uma versão em que, no computador, a frase assentava
 * sobre a fotografia. Parecia mais imponente, mas tapava os três cabelos
 * — que são a única razão de esta fotografia existir. Deixar a imagem
 * respirar sozinha vale mais do que a sobreposição.
 *
 * No computador a altura da fotografia é limitada a uma fracção do ecrã
 * para que imagem e frase caibam juntas: a 1920 px, uma banda 16:9 a
 * toda a largura daria 1080 px de altura e a frase ficaria fora do campo
 * de visão.
 */
export function Assinatura() {
  const raiz = useRef<HTMLElement>(null)
  const media = useRef<HTMLDivElement>(null)
  const regua = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      if (prefereMenosMovimento()) return

      /**
       * A aproximação termina no centro, não no fim da passagem.
       *
       * Se terminasse no fim, no momento em que se está a olhar para a
       * secção ela estaria a meio do percurso — ampliada, e portanto
       * interpolada e menos nítida que o ficheiro. Assim chega ao tamanho
       * nativo exactamente quando fica à frente dos olhos.
       */
      gsap.fromTo(
        media.current,
        { scale: 1.06 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: raiz.current, start: 'top bottom', end: 'center center', scrub: 1 },
        },
      )

      gsap.fromTo(
        regua.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.6,
          ease: 'expo.out',
          scrollTrigger: { trigger: raiz.current, start: 'top 70%', once: true },
        },
      )
    },
    { scope: raiz },
  )

  return (
    <section
      ref={raiz}
      className="relative flex flex-col items-center overflow-hidden py-12 md:pb-16 md:pt-24"
    >
      {/* No telemóvel ocupa a largura toda; no computador a altura manda
          e a largura segue a proporção.
          A altura é o que sobra do ecrã depois do cabeçalho e das
          margens, com um tecto de 760 px. Assim a fotografia fica o
          maior possível sem nunca passar por trás do cabeçalho — e a
          frase entra logo a seguir, como no telemóvel. */}
      <div
        ref={media}
        className="relative aspect-[16/11] w-full overflow-hidden will-change-transform md:aspect-[16/9] md:h-[min(calc(100svh-15rem),760px)] md:w-auto md:max-w-[94vw]"
      >
        <Image
          src={atelierImagens.equipa.src}
          alt={atelierImagens.equipa.alt}
          fill
          sizes="(max-width: 768px) 100vw, 90vw"
          quality={86}
          loading="lazy"
          // Dessaturar e baixar o contraste aproxima a fotografia — bem
          // mais quente e clara — da paleta do resto do site. Sem véu por
          // cima: aqui não há texto a proteger, e o véu só a apagaria.
          className="object-cover [filter:saturate(0.72)_contrast(1.04)]"
        />

        {/* A base dissolve-se no preto, para a fotografia não terminar
            num corte recto por cima da frase. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-void to-transparent" />
        <div className="vignette pointer-events-none absolute inset-0 opacity-70" />
      </div>

      <div className="relative z-10 mt-12 w-full px-gutter text-center md:mt-10">
        <Reveal className="flex flex-col items-center gap-5">
          <span ref={regua} className="metal block h-px w-16 origin-center" />
          <span className="text-[0.62rem] uppercase tracking-[0.42em] text-gold">
            {assinatura.sobre}
          </span>
        </Reveal>

        <TextReveal
          as="p"
          text={assinatura.frase}
          className="mx-auto mt-6 max-w-4xl font-display text-[clamp(2rem,3.8vw,3.6rem)] leading-[1] tracking-[-0.035em] text-bone"
        />

        <Reveal delay={0.2} y={18}>
          <p className="mx-auto mt-6 max-w-2xl text-[0.68rem] uppercase leading-relaxed tracking-[0.26em] text-bone-dim">
            {assinatura.nota}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
