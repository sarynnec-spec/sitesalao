'use client'

import Image from 'next/image'
import { Scissors, Sparkles, Droplets, Crown, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { servicos } from '@/lib/site'
import { TextReveal, Reveal } from '@/components/motion/reveal'
import { RotuloSeccao } from '@/components/ui/rotulo-seccao'
import { irPara } from '@/components/providers/smooth-scroll'

const icones: Record<string, LucideIcon> = { Scissors, Sparkles, Droplets, Crown }

export function Servicos() {
  return (
    <section id="servicos" className="relative py-section">
      <div className="px-gutter">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <RotuloSeccao numero="02">Serviços</RotuloSeccao>
            <TextReveal
              as="h2"
              text="O que se faz aqui"
              className="mt-9 max-w-2xl font-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.94] text-bone"
            />
          </div>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-sm leading-relaxed font-light text-bone-dim">
              Todos os serviços começam com uma conversa e um diagnóstico. Nenhum preço é fechado
              antes de perceber o cabelo que está à frente.
            </p>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-px border border-gold/12 bg-gold/12 sm:grid-cols-2">
          {servicos.map((servico, i) => {
            const Icone = icones[servico.icone] ?? Sparkles
            return (
              <Reveal key={servico.id} delay={i * 0.07} y={26} className="group relative bg-void">
                {/* Cartão inteiro clicável, mas com âncora real por
                    dentro: funciona com teclado e sem JavaScript. */}
                <a
                  href="#agendamento"
                  onClick={(e) => {
                    e.preventDefault()
                    irPara('#agendamento')
                  }}
                  className="sweep relative flex h-full flex-col overflow-hidden p-9 sm:p-12"
                >
                  {/*
                    Fotografia de fundo, contida de propósito.

                    `saturate(0.4) sepia(0.35)` puxa a cor para o
                    castanho e tira-lhe a estridência — a fotografia
                    passa a ser textura, não assunto. A cor plena
                    competiria com o dourado, que no site é a única cor
                    viva, e tornaria o texto ilegível por cima.
                  */}
                  <Image
                    src={servico.imagem}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    quality={72}
                    loading="lazy"
                    className="scale-105 object-cover opacity-[0.45] [filter:saturate(0.4)_sepia(0.35)_contrast(1.05)_brightness(1.5)] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-[0.66]"
                  />
                  {/* Véu que garante o contraste do texto por cima.
                      Aligeirado para deixar a fotografia respirar; o
                      canto superior esquerdo mantém-se o mais fechado
                      porque é onde assentam o ícone e o título. */}
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-void/80 via-void/62 to-void/45" />

                  <div className="relative z-10 flex items-start justify-between">
                    <Icone
                      size={26}
                      strokeWidth={1}
                      className="text-gold transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:text-gold-light"
                    />
                    <span className="font-display text-sm text-gold/40 italic">
                      {servico.numero}
                    </span>
                  </div>

                  <h3 className="relative z-10 mt-14 font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-none text-bone transition-colors duration-500 group-hover:text-gold-light">
                    {servico.titulo}
                  </h3>

                  <p className="relative z-10 mt-5 max-w-sm flex-1 text-sm leading-[1.85] font-light text-bone-dim">
                    {servico.descricao}
                  </p>

                  <div className="relative z-10 mt-10 flex items-center justify-between gap-4">
                    <span className="text-[0.6rem] tracking-[0.26em] text-bone-dim uppercase">
                      {servico.detalhe}
                    </span>
                    <span className="flex items-center gap-2 text-[0.6rem] tracking-[0.26em] text-gold uppercase opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 sm:-translate-x-2">
                      Marcar
                      <ArrowUpRight size={13} strokeWidth={1.25} />
                    </span>
                  </div>
                </a>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
