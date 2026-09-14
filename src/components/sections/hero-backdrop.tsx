'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { gsap, useGSAP, prefereMenosMovimento } from '@/lib/gsap'
import { quandoAberturaTerminar } from '@/lib/intro'
import { atelierImagens } from '@/lib/site'

/**
 * Camada de fundo da hero: vídeo se existir, imagem caso contrário.
 *
 * Seja qual for a fonte, o tratamento é o mesmo — é ele que transforma
 * material de salão em imagem de cinema:
 *   1. dessaturação e escurecimento, para o dourado do logo ser a única
 *      cor viva no ecrã;
 *   2. deriva lenta (parallax + aproximação) que nunca pára;
 *   3. fuga de luz dourada a atravessar o enquadramento;
 *   4. vinheta a fechar as bordas.
 * O grão vem da camada global em `globals.css`.
 */
export function HeroBackdrop({ temVideo }: { temVideo: boolean }) {
  const raiz = useRef<HTMLDivElement>(null)
  const media = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)

  useGSAP(
    () => {
      if (prefereMenosMovimento()) return

      // O vídeo só arranca quando a abertura sai da frente. Deixá-lo a
      // correr por trás de um ecrã preto é gastar bateria e largura de
      // banda em pixéis que ninguém vê.
      const parar = quandoAberturaTerminar(() => {
        video.current?.play().catch(() => {
          /* Autoplay recusado: fica o primeiro fotograma. */
        })
        /**
         * Entrada só de foco — sem `scale`.
         *
         * A deriva contínua aqui em baixo já está a animar o `scale`
         * desde que o componente monta. Quando esta entrada disparava,
         * forçava o valor de repente para 1.16 por cima dessa deriva a
         * meio do caminho: um salto instantâneo de escala que se via
         * como um zoom logo a seguir ao logótipo aterrar. Duas animações
         * a disputar a mesma propriedade.
         *
         * O desfoque e a saturação sozinhos dão a mesma sensação de
         * câmara a focar, e não tocam na geometria — por isso não há
         * nada que salte.
         */
        gsap.fromTo(
          media.current,
          { filter: 'blur(18px) saturate(0.25)' },
          {
            filter: 'blur(0px) saturate(0.78)',
            duration: 2.6,
            ease: 'power2.out',
          },
        )
      })

      // Deriva contínua: o enquadramento nunca fica completamente
      // parado, como numa câmara em travelling muito lento.
      gsap.to(media.current, {
        scale: 1.14,
        duration: 26,
        ease: 'none',
        repeat: -1,
        yoyo: true,
      })

      // Parallax de saída: o fundo move-se menos que o conteúdo, o que
      // cria a separação de planos.
      gsap.to(media.current, {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: { trigger: raiz.current, start: 'top top', end: 'bottom top', scrub: true },
      })

      return parar
    },
    { scope: raiz },
  )

  return (
    <div ref={raiz} className="absolute inset-0 overflow-hidden bg-void" aria-hidden>
      {/*
        No telemóvel a camada da imagem não ocupa o ecrã todo.
        A fotografia é 16:9 e o ecrã é vertical: para preencher 844 px de
        altura com 390 px de largura, o `object-cover` ampliava-a quase
        4× e sobrava um grande plano do rosto. Limitando a altura a 62%
        do ecrã, a ampliação cai para menos de metade e volta a ver-se a
        cena — o atelier, as ferramentas no ar, a figura inteira. O resto
        da hero é preto, que é o fundo da página de qualquer forma.
      */}
      <div
        ref={media}
        className="absolute inset-x-0 top-0 h-[62svh] will-change-transform md:inset-0 md:h-auto"
      >
        {temVideo ? (
          <video
            ref={video}
            className="h-full w-full object-cover opacity-70 [filter:saturate(0.62)_contrast(1.08)]"
            src="/video/hero.mp4"
            poster={atelierImagens.capa.src}
            muted
            loop
            playsInline
            preload="none"
          />
        ) : (
          <Image
            src={atelierImagens.capa.src}
            alt=""
            fill
            // A hero é o LCP. `priority` tira-a da fila de lazy loading
            // e manda-a no preload do documento.
            priority
            sizes="100vw"
            quality={78}
            // Num ecrã estreito, `object-cover` sobre uma imagem 16:9
            // corta quase tudo em largura e o Anderson — que está no
            // terço direito — ficava de fora. Puxar o enquadramento
            // para 74% mantém-no visível; em ecrã largo o recorte é
            // pequeno e o centro chega.
            className="object-cover object-[66%_42%] opacity-[0.88] [filter:saturate(0.78)_contrast(1.04)] md:object-center"
          />
        )}
      </div>

      {/*
        Telemóvel: véu que fecha a banda de imagem e sustenta o texto.

        Faz duas coisas ao mesmo tempo — apaga o limite onde a fotografia
        acaba, e garante contraste onde o texto assenta. A segunda é a
        crítica: medido, a headline ficava por cima de um candeeiro aceso
        (#f9dfb2) com 1,06:1, praticamente ilegível. Os 85% de preto a
        partir dos 26% da altura resolvem isso sem tocar no topo da banda,
        que é onde a cena se lê.
      */}
      <div className="absolute inset-x-0 bottom-0 top-[14svh] bg-[linear-gradient(to_bottom,transparent_0%,color-mix(in_oklab,var(--color-void)_88%,transparent)_20%,var(--color-void)_50%)] md:hidden" />

      {/*
        Véu assimétrico, só a partir de `md`.

        Um gradiente uniforme obriga a escolher entre texto legível e
        fotografia visível. Este é forte à esquerda — onde a headline e o
        subtítulo assentam — e desaparece por completo à direita, onde
        está o Anderson. Medido: com um véu uniforme mais leve, o
        subtítulo caía para 4,05:1 e a headline para 2,95:1, ambos abaixo
        do mínimo; com os cortes abaixo volta a haver margem sem escurecer
        a metade direita da imagem.
      */}
      <div className="absolute inset-0 hidden bg-[linear-gradient(to_right,var(--color-void)_0%,color-mix(in_oklab,var(--color-void)_90%,transparent)_28%,color-mix(in_oklab,var(--color-void)_70%,transparent)_58%,transparent_92%)] md:block" />

      {/* No telemóvel o texto já assenta em preto por baixo da banda de
          imagem, por isso basta um véu leve para dar profundidade. */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-void/25 md:hidden" />

      <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/42" />
      <div className="vignette absolute inset-0 opacity-70" />

      {/* Fuga de luz: uma mancha dourada muito ténue a atravessar o
          enquadramento, como reflexo numa lente.

          A intensidade é baixa de propósito. Ela cruza a zona onde o
          subtítulo assenta, e medido no seu ponto mais forte fazia o
          contraste desse texto oscilar até 4,3:1 — abaixo do mínimo.
          Como é um floreado atmosférico e o texto é conteúdo, quem cede
          é ela. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 left-[12%] h-[140%] w-[38%] -rotate-12 animate-[fuga_19s_ease-in-out_infinite] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--color-gold)_10%,transparent),transparent_68%)] blur-3xl" />
      </div>

      <style>{`
        @keyframes fuga {
          0%, 100% { transform: translateX(-14%) rotate(-12deg); opacity: 0.5; }
          50%      { transform: translateX(26%) rotate(-12deg);  opacity: 0.62; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[fuga_19s_ease-in-out_infinite\\] { animation: none; }
        }
      `}</style>
    </div>
  )
}
