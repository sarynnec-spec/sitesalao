'use client'

import { useRef, type ElementType, type ReactNode } from 'react'
import { gsap, useGSAP, prefereMenosMovimento } from '@/lib/gsap'
import { quandoAberturaTerminar } from '@/lib/intro'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------
   Revelação de texto palavra a palavra.

   A divisão é feita no render, em React, e não com um plugin que mexe
   no DOM depois de montar. Assim o texto vai inteiro no HTML servido —
   o Google, o leitor de ecrã e o "seleccionar e copiar" continuam a ver
   uma frase, não uma pilha de <span>.
   ------------------------------------------------------------------ */

type TextRevealProps = {
  text: string
  as?: ElementType
  className?: string
  wordClassName?: string
  delay?: number
  /** A hero espera pela abertura; as restantes secções esperam pelo scroll. */
  gatilho?: 'scroll' | 'abertura'
}

export function TextReveal({
  text,
  as: Tag = 'span',
  className,
  wordClassName,
  delay = 0,
  gatilho = 'scroll',
}: TextRevealProps) {
  const raiz = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefereMenosMovimento()) return
      const palavras = raiz.current?.querySelectorAll('[data-palavra]')
      if (!palavras?.length) return

      const animar = () =>
        gsap.fromTo(
          palavras,
          // 125 e não 100: a palavra tem de sair por completo da
          // máscara, que agora é mais alta para caber as descidas.
          { yPercent: 125, rotate: 1.5 },
          {
            yPercent: 0,
            rotate: 0,
            duration: 1.15,
            ease: 'expo.out',
            // O stagger é o que faz a frase parecer escrita em vez de
            // empurrada. 45 ms lê como cadência; 150 ms lê como lista.
            stagger: 0.045,
            delay,
            scrollTrigger:
              gatilho === 'scroll'
                ? { trigger: raiz.current, start: 'top 82%', once: true }
                : undefined,
          },
        )

      if (gatilho === 'abertura') return quandoAberturaTerminar(animar)
      animar()
    },
    { scope: raiz, dependencies: [text] },
  )

  // Preserva quebras de linha explícitas escritas no conteúdo (\n).
  const linhas = text.split('\n')

  return (
    <Tag ref={raiz} className={className}>
      {linhas.map((linha, iLinha) => (
        <span key={iLinha} className="block">
          {linha.split(' ').map((palavra, i) => (
            /**
             * A máscara tem de ser mais alta do que a caixa de linha.
             *
             * Com `leading` abaixo de 1 — que é o que dá o aspecto
             * compacto ao display — a caixa de linha fica menor que os
             * glifos, e o `overflow: hidden` corta as descidas: o "y" de
             * Luxury passa a ler-se como "v". O `pb` dá o espaço em
             * falta e o `-mb` devolve-o ao layout, para as linhas não
             * se afastarem.
             */
            <span
              key={`${iLinha}-${i}`}
              className="-mb-[0.22em] inline-block overflow-hidden align-bottom"
            >
              <span
                data-palavra
                className={cn('inline-block pb-[0.22em] will-change-transform', wordClassName)}
              >
                {palavra}
                {/* Espaço dentro da máscara: fora dela colapsa e as
                    palavras colam-se umas às outras. */}
                {i < linha.split(' ').length - 1 ? ' ' : ''}
              </span>
            </span>
          ))}
        </span>
      ))}
    </Tag>
  )
}

/* ------------------------------------------------------------------
   Revelação genérica de bloco.
   Desfoque ligeiro + subida curta. O desfoque é o que dá a sensação
   de foco de câmara a assentar, em vez de um simples fade.
   ------------------------------------------------------------------ */

export function Reveal({
  children,
  className,
  delay = 0,
  y = 34,
  blur = true,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  blur?: boolean
  as?: ElementType
}) {
  const raiz = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefereMenosMovimento()) return

      /**
       * `opacity`, nunca `autoAlpha`.
       *
       * `autoAlpha` acrescenta `visibility: hidden`, e isso retira o
       * elemento — e tudo o que ele contém — da ordem de tabulação e da
       * árvore de acessibilidade. Como a revelação só dispara ao entrar
       * no ecrã, e o Tab nunca chega a algo que o browser salta, secções
       * inteiras ficavam inalcançáveis por teclado e invisíveis para
       * leitores de ecrã. Com `opacity` o elemento continua a existir
       * para quem navega sem rato.
       */
      const tween = gsap.fromTo(
        raiz.current,
        { opacity: 0, y, filter: blur ? 'blur(10px)' : 'blur(0px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.25,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: raiz.current, start: 'top 88%', once: true },
        },
      )

      // Rede de segurança: se o foco entrar antes de a revelação
      // disparar, mostra já. Ninguém pode ficar com o foco num
      // elemento que não vê.
      const el = raiz.current
      const aoReceberFoco = () => tween.progress(1)
      el?.addEventListener('focusin', aoReceberFoco)
      return () => el?.removeEventListener('focusin', aoReceberFoco)
    },
    { scope: raiz },
  )

  return (
    <Tag ref={raiz} className={className} data-reveal>
      {children}
    </Tag>
  )
}

/* ------------------------------------------------------------------
   Parallax. `velocidade` é a fracção da altura do ecrã que o elemento
   percorre a mais (ou a menos) que o scroll. Valores acima de ~0.2
   denunciam o truque.
   ------------------------------------------------------------------ */

export function Parallax({
  children,
  velocidade = 0.12,
  className,
}: {
  children: ReactNode
  velocidade?: number
  className?: string
}) {
  const raiz = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefereMenosMovimento()) return
      gsap.fromTo(
        raiz.current,
        { yPercent: -velocidade * 100 },
        {
          yPercent: velocidade * 100,
          ease: 'none',
          scrollTrigger: {
            trigger: raiz.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    },
    { scope: raiz },
  )

  return (
    <div ref={raiz} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  )
}
