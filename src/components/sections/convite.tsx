'use client'

import { Fragment, useRef } from 'react'
import Image from 'next/image'
import { gsap, useGSAP, prefereMenosMovimento } from '@/lib/gsap'
import { convite } from '@/lib/site'
import { Botao } from '@/components/ui/botao'

/**
 * Convite ao agendamento.
 *
 * Três tempos:
 *
 *   1. a fotografia emerge do preto, desfocada, e ganha nitidez;
 *   2. recua para a direita, abrindo o espaço à esquerda;
 *   3. o texto condensa-se nesse espaço, de desfocado para nítido.
 *
 * Houve aqui um jato de partículas douradas desenhado em canvas. Saiu:
 * o spray da fotografia é branco e o dourado por cima dele lia-se como
 * um efeito colado, não como parte da imagem. O movimento que ficou é o
 * da própria fotografia a ceder o palco ao texto.
 */
export function Convite() {
  const raiz = useRef<HTMLElement>(null)
  const figura = useRef<HTMLDivElement>(null)
  const imagem = useRef<HTMLDivElement>(null)
  const texto = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // Com movimento reduzido nada disto corre: o conteúdo já está no
      // seu lugar final e legível, que é o que interessa.
      if (prefereMenosMovimento()) return

      const elTexto = texto.current
      const elFigura = figura.current
      if (!elTexto || !elFigura) return

      const palavras = elTexto.querySelectorAll('[data-condensa]')

      /**
       * O deslocamento inicial é definido aqui, e não com uma classe do
       * Tailwind.
       *
       * O Tailwind v4 escreve as suas deslocações na propriedade
       * `translate`; o GSAP escreve em `transform`. São propriedades
       * distintas e o browser aplica as duas — o resultado era a
       * fotografia a ficar encravada à esquerda, porque a classe
       * continuava a puxá-la enquanto o GSAP a dava por chegada. Um só
       * sistema a mandar no movimento resolve.
       */
      const ecraLargo = window.matchMedia('(min-width: 768px)').matches
      if (ecraLargo) gsap.set(elFigura, { xPercent: -46 })

      gsap.set(elTexto, { autoAlpha: 0 })
      gsap.set(palavras, { autoAlpha: 0, y: 26, filter: 'blur(14px)' })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: elFigura, start: 'top 62%', once: true },
      })

      // 1. A fotografia emerge do escuro.
      tl.from(imagem.current, {
        autoAlpha: 0,
        scale: 1.07,
        filter: 'blur(16px)',
        duration: 1.4,
        ease: 'power2.out',
      })

      // 2. Recua para a direita. Em telemóvel não há para onde recuar:
      //    as colunas empilham.
      if (ecraLargo) {
        tl.to(elFigura, { xPercent: 0, duration: 1.5, ease: 'power3.inOut' }, '+=0.15')
      } else {
        tl.to({}, { duration: 0.35 })
      }

      // 3. O texto condensa-se no espaço aberto.
      tl.to(elTexto, { autoAlpha: 1, duration: 0.3 }, '-=1.05')
      tl.to(
        palavras,
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.15,
          ease: 'power3.out',
          stagger: 0.075,
        },
        '<',
      )
    },
    { scope: raiz },
  )

  return (
    <section
      ref={raiz}
      className="relative flex min-h-svh items-center overflow-hidden py-16 md:pb-8 md:pt-20"
    >
      {/* A coluna da fotografia é a mais larga: é ela que carrega a cena. */}
      <div className="grid w-full items-center gap-12 px-gutter md:grid-cols-[0.95fr_1.15fr] md:gap-12">
        <div ref={texto} className="relative z-20 order-2 md:order-1">
          <h2 className="font-display text-[clamp(2.1rem,4.2vw,4rem)] leading-[1.02] tracking-[-0.035em]">
            {convite.titulo.split('\n').map((linha, i) => (
              <span key={i} className="block">
                {/* O espaço fica FORA do span, como nó de texto entre
                    palavras. Dentro de um `inline-block` o espaço final
                    é descartado na formatação, e as palavras colavam-se
                    umas às outras. */}
                {linha.split(' ').map((palavra, j, todas) => (
                  <Fragment key={j}>
                    <span
                      data-condensa
                      className="metal-text inline-block will-change-[transform,filter]"
                    >
                      {palavra}
                    </span>
                    {j < todas.length - 1 ? ' ' : null}
                  </Fragment>
                ))}
              </span>
            ))}
          </h2>

          <p
            data-condensa
            className="mt-7 max-w-md text-base font-light leading-relaxed text-bone will-change-[transform,filter]"
          >
            {convite.subtitulo}
          </p>

          <div data-condensa className="mt-10 will-change-[transform,filter]">
            <Botao href={convite.botao.href} variante="metal">
              {convite.botao.label}
            </Botao>
          </div>
        </div>

        <div ref={figura} className="order-1 will-change-transform md:order-2">
          {/* Tecto de altura em vez de largura: o retrato é vertical, e
              limitá-lo pela altura é o que impede a secção de crescer
              para lá do que cabe no ecrã. */}
          <div ref={imagem} className="relative flex justify-center">
            <Image
              src={convite.imagem.src}
              alt={convite.imagem.alt}
              width={convite.imagem.largura}
              height={convite.imagem.altura}
              sizes="(max-width: 768px) 94vw, 52vw"
              quality={86}
              loading="lazy"
              // Telemóvel a 70svh, computador a 96svh. No computador
              // isto é quase toda a altura útil do ecrã: a margem em
              // volta é o mínimo para o topo não ir parar por baixo do
              // cabeçalho fixo.
              className="dissolver-no-fundo h-auto max-h-[70svh] w-auto max-w-full object-contain md:max-h-[96svh]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
