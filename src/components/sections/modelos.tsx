'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { modelos } from '@/lib/site'
import { prefereMenosMovimento } from '@/lib/gsap'
import { TextReveal, Reveal } from '@/components/motion/reveal'
import { RotuloSeccao } from '@/components/ui/rotulo-seccao'
import { cn } from '@/lib/utils'

/** Quantos cartões ficam visíveis de cada lado do central. */
const ALCANCE = 3
/** Pausa entre avanços automáticos. */
const INTERVALO_MS = 5200

/**
 * Geometria de cada cartão em função da distância ao centro.
 *
 * As transições são feitas em CSS e não em GSAP: são estados discretos —
 * um cartão está a uma posição ou a outra — e uma `transition` sobre a
 * mudança de classe dá exactamente isso, sem uma linha de temporização
 * a manter. Só `transform` e `opacity`, para tudo correr na camada de
 * composição.
 */
function geometria(distancia: number) {
  const lado = Math.sign(distancia)
  const d = Math.abs(distancia)

  if (d === 0) return { x: 0, rotacao: 0, escala: 1, z: 0, opacidade: 1, desfoque: 0 }
  if (d > ALCANCE) return { x: lado * 150, rotacao: -lado * 38, escala: 0.6, z: -520, opacidade: 0, desfoque: 6 }

  // Afastamento decrescente: os cartões acumulam-se para fora, como um
  // baralho aberto em leque.
  const x = lado * (52 + (d - 1) * 26)
  return {
    x,
    rotacao: -lado * (26 + (d - 1) * 4),
    escala: 1 - d * 0.11,
    z: -d * 150,
    opacidade: d === 1 ? 0.82 : d === 2 ? 0.5 : 0.24,
    desfoque: (d - 1) * 1.4,
  }
}

export function Modelos() {
  const [activo, setActivo] = useState(0)
  const [emPausa, setEmPausa] = useState(false)
  const total = modelos.itens.length
  const menosMovimento = useRef(false)

  useEffect(() => {
    menosMovimento.current = prefereMenosMovimento()
  }, [])

  const ir = useCallback((n: number) => setActivo((a) => (a + n + total) % total), [total])

  // Avanço automático, travado por hover, por foco e por preferência de
  // movimento reduzido. Um carrossel que anda sozinho e não pára é uma
  // armadilha para quem lê devagar.
  useEffect(() => {
    if (emPausa || menosMovimento.current) return
    const t = window.setInterval(() => ir(1), INTERVALO_MS)
    return () => window.clearInterval(t)
  }, [emPausa, ir])

  return (
    <section
      id="trabalhos"
      className="relative overflow-hidden py-section"
      aria-roledescription="carrossel"
      aria-label="Trabalhos em modelos"
    >
      {/* Cabeçalho centrado: o carrossel por baixo é simétrico em
          relação ao eixo do ecrã, e um título encostado à esquerda
          deixava o conjunto a pender para um dos lados.

          Sem `max-w` no contentor. Uma largura máxima aqui era mais
          estreita do que o título e partia-o em três linhas — e como
          o bloco ficava colado ao `px-gutter`, lia-se como texto
          alinhado à esquerda em vez de centrado. */}
      <div className="px-gutter text-center">
        <div className="flex justify-center">
          <RotuloSeccao numero="—">{modelos.sobre}</RotuloSeccao>
        </div>

        {/* `whitespace-nowrap` nas linhas garante exactamente as duas
            do conteúdo: a quebra é a do `\n`, nunca uma do browser.
            O corpo acompanha a largura do ecrã (`6.2vw`) para que a
            linha maior — "Transformamos autoestima" — caiba inteira
            entre as margens em qualquer tamanho. */}
        <TextReveal
          as="h2"
          text={modelos.titulo}
          className="mt-9 text-center font-display text-[clamp(1.4rem,5.6vw,5.4rem)] leading-[1.06] tracking-[-0.035em] text-bone [&>span]:whitespace-nowrap"
        />
        <Reveal delay={0.12} y={20}>
          {/* Duas linhas em qualquer ecrã: a largura acompanha o
              viewport (`88vw`) em vez de ficar presa a um valor em
              rem, que no telemóvel era maior do que o próprio ecrã e
              deixava a frase a partir onde calhava. O `text-balance`
              reparte as duas linhas com comprimento semelhante. */}
          <p className="mx-auto mt-11 max-w-[min(30rem,88vw)] text-balance text-center text-[clamp(1.05rem,4.4vw,1.35rem)] font-light leading-relaxed text-bone-dim">
            {modelos.nota}
          </p>
        </Reveal>
      </div>

      <div
        className="relative mt-28 select-none sm:mt-32"
        onMouseEnter={() => setEmPausa(true)}
        onMouseLeave={() => setEmPausa(false)}
        onFocusCapture={() => setEmPausa(true)}
        onBlurCapture={() => setEmPausa(false)}
      >
        <Reveal>
        {/* `perspective` no contentor e `preserve-3d` nos filhos: é o que
            faz os cartões laterais recuarem de facto em profundidade em
            vez de apenas encolherem. */}
        <div
          className="relative mx-auto flex h-[clamp(22.1rem,59.9vw,37.7rem)] items-center justify-center [perspective:1500px]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {modelos.itens.map((item, i) => {
            // Distância circular: o cartão 12 está a um passo do 0.
            let d = i - activo
            if (d > total / 2) d -= total
            if (d < -total / 2) d += total
            const g = geometria(d)
            const central = d === 0

            return (
              <button
                key={item.id}
                type="button"
                aria-label={central ? undefined : `Ver trabalho ${i + 1} de ${total}`}
                aria-hidden={Math.abs(d) > ALCANCE}
                tabIndex={Math.abs(d) > ALCANCE ? -1 : 0}
                onClick={() => setActivo(i)}
                className={cn(
                  'absolute h-full w-[clamp(14.5rem,37.7vw,23.4rem)] transition-[transform,opacity,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
                  central
                    ? 'z-30 cursor-default drop-shadow-[0_30px_60px_rgba(0,0,0,0.85)]'
                    : 'z-10 cursor-pointer',
                )}
                style={{
                  transform: `translateX(${g.x}%) translateZ(${g.z}px) rotateY(${g.rotacao}deg) scale(${g.escala})`,
                  opacity: g.opacidade,
                  filter: g.desfoque ? `blur(${g.desfoque}px)` : undefined,
                  pointerEvents: Math.abs(d) > ALCANCE ? 'none' : 'auto',
                }}
              >
                <span className="relative block h-full w-full overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 80vw, 32vw"
                    quality={72}
                    className="object-cover brightness-150"
                  />

                  {/* Contorno dourado.
                      Uma borda a sério e não `box-shadow` com valor
                      arbitrário: uma sombra de duas camadas dentro de
                      `shadow-[...]` tem vírgulas que o parser do Tailwind
                      lê como separadores, e a regra saía pela metade. */}
                  <span
                    className={cn(
                      'pointer-events-none absolute inset-0 border transition-colors duration-700',
                      // O cartao central leva o dourado cheio: a 70% o
                      // filete perdia-se contra as zonas claras da
                      // fotografia e deixava de se ler como moldura.
                      central ? 'border-gold' : 'border-gold/30',
                    )}
                  />

                  {/* Véu nos laterais: afunda-os sem lhes tirar a cor. */}
                  <span
                    className={cn(
                      'pointer-events-none absolute inset-0 bg-void transition-opacity duration-700',
                      central ? 'opacity-0' : 'opacity-25',
                    )}
                  />

                  {/* ---- Cantos que se acendem ----------------------
                      Quatro esquadros de 1 px que percorrem o perímetro
                      em sequência. Só aparecem no cartão central: em
                      todos ao mesmo tempo seria ruído, e é justamente o
                      contraste com os lados apagados que faz o olho
                      pousar no centro. */}
                  {central && (
                    <span aria-hidden className="pointer-events-none absolute inset-0">
                      {[
                        'left-0 top-0 border-l border-t',
                        'right-0 top-0 border-r border-t',
                        'right-0 bottom-0 border-r border-b',
                        'left-0 bottom-0 border-l border-b',
                      ].map((posicao, k) => (
                        <span
                          key={k}
                          className={cn(
                            'absolute h-12 w-12 border-gold-light',
                            'animate-[acender_4.4s_ease-in-out_infinite]',
                            posicao,
                          )}
                          style={{ animationDelay: `${k * 0.42}s` }}
                        />
                      ))}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {/* ---- Comandos ---- */}
        <div className="mt-12 flex items-center justify-center gap-8 px-gutter">
          <button
            type="button"
            onClick={() => ir(-1)}
            aria-label="Trabalho anterior"
            className="flex h-12 w-12 items-center justify-center border border-gold/25 text-gold transition-colors duration-500 hover:border-gold/70 hover:text-gold-light"
          >
            <ArrowLeft size={16} strokeWidth={1.25} />
          </button>

          <p aria-live="polite" className="min-w-24 text-center text-[0.62rem] uppercase tracking-[0.3em] text-bone-dim">
            {String(activo + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </p>

          <button
            type="button"
            onClick={() => ir(1)}
            aria-label="Trabalho seguinte"
            className="flex h-12 w-12 items-center justify-center border border-gold/25 text-gold transition-colors duration-500 hover:border-gold/70 hover:text-gold-light"
          >
            <ArrowRight size={16} strokeWidth={1.25} />
          </button>
        </div>
        </Reveal>
      </div>

      <style>{`
        @keyframes acender {
          0%, 100% { opacity: 0.3; }
          14%      { opacity: 1; }
          34%      { opacity: 0.3; }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-[acender"] { animation: none; opacity: 0.65; }
        }
      `}</style>
    </section>
  )
}
