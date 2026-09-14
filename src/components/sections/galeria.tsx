'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { trabalhos } from '@/lib/site'
import { TextReveal, Reveal, Parallax } from '@/components/motion/reveal'
import { RotuloSeccao } from '@/components/ui/rotulo-seccao'
import { cn } from '@/lib/utils'

// Só carrega quando a primeira fotografia é aberta.
const Lightbox = dynamic(() => import('./lightbox').then((m) => m.Lightbox))

/**
 * Galeria editorial.
 *
 * A grelha é assimétrica de propósito: colunas e alturas diferentes,
 * com duas peças a subir e duas a descer. Uma grelha regular de quatro
 * quadrados é um catálogo; esta lê-se como uma página de revista.
 */
export function Galeria() {
  const [aberto, setAberto] = useState(false)
  const [indice, setIndice] = useState(0)

  const abrir = useCallback((i: number) => {
    setIndice(i)
    setAberto(true)
  }, [])

  const anterior = useCallback(
    () => setIndice((i) => (i - 1 + trabalhos.length) % trabalhos.length),
    [],
  )
  const seguinte = useCallback(() => setIndice((i) => (i + 1) % trabalhos.length), [])

  return (
    <section id="trabalhos" className="relative py-section">
      <div className="px-gutter">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <RotuloSeccao numero="03">Trabalhos</RotuloSeccao>
            <TextReveal
              as="h2"
              text="Arquivo"
              className="mt-9 font-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.94] text-bone"
            />
          </div>
          <Reveal delay={0.1}>
            <p className="max-w-xs text-sm font-light leading-relaxed text-bone-dim">
              Trabalhos reais, sem retoque de cor. O que se vê é o que sai do atelier.
            </p>
          </Reveal>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-12 sm:gap-y-24">
          {trabalhos.map((t, i) => (
            <div
              key={t.id}
              className={cn(
                // O desencontro vertical é o que dá ritmo à leitura.
                // Nada de `justify-self`: numa grelha isso tira o
                // `stretch` ao item, ele encolhe para o conteúdo e o
                // `w-full` da imagem passa a resolver contra quase nada.
                t.destaque ? 'sm:col-span-7' : 'sm:col-span-5 sm:mt-24',
              )}
            >
              <Reveal y={40}>
                <button
                  type="button"
                  onClick={() => abrir(i)}
                  className="group block w-full text-left"
                  aria-label={`Ver ${t.titulo} em tamanho grande`}
                >
                  <div className="relative overflow-hidden bg-carbon">
                    <Parallax velocidade={0.05}>
                      <Image
                        src={t.src}
                        alt={t.alt}
                        width={t.largura}
                        height={t.altura}
                        sizes="(max-width: 640px) 92vw, 46vw"
                        quality={80}
                        loading="lazy"
                        className="w-full origin-center object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-[1.06]"
                      />
                    </Parallax>

                    {/* Véu que levanta no hover — a fotografia "acende". */}
                    <div className="pointer-events-none absolute inset-0 bg-void/35 transition-opacity duration-700 group-hover:opacity-0" />

                    {/* Halo dourado: um contorno interior, não uma sombra
                        colorida. Sombra dourada faria parecer néon. */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 shadow-[inset_0_0_0_1px_var(--color-gold),inset_0_0_60px_-20px_var(--color-gold)] transition-opacity duration-700 group-hover:opacity-100" />
                  </div>

                  <div className="mt-6 flex items-baseline justify-between gap-6">
                    <div>
                      <h3 className="font-display text-2xl text-bone transition-colors duration-500 group-hover:text-gold-light">
                        {t.titulo}
                      </h3>
                      <p className="mt-2 text-[0.62rem] uppercase tracking-[0.26em] text-bone-dim">
                        {t.legenda}
                      </p>
                    </div>
                    <span className="font-display text-sm italic text-gold/40">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                </button>
              </Reveal>
            </div>
          ))}
        </div>
      </div>

      {/* Só é montada — e só é descarregada — depois do primeiro clique. */}
      {aberto && (
        <Lightbox
          itens={trabalhos}
          indice={indice}
          aberto={aberto}
          onAbertoChange={setAberto}
          onAnterior={anterior}
          onSeguinte={seguinte}
        />
      )}

    </section>
  )
}
