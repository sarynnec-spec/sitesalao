import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { heroCopy, site } from '@/lib/site'
import { HeroBackdrop } from './hero-backdrop'
import { TextReveal, Reveal } from '@/components/motion/reveal'
import { Botao } from '@/components/ui/botao'
import { ScrollHint } from '@/components/ui/scroll-hint'

/**
 * Componente de servidor: o texto da hero — que é o elemento LCP — vai
 * no HTML inicial e não depende de JavaScript para existir. Só as
 * camadas de movimento à volta é que são cliente.
 *
 * A verificação do ficheiro acontece no build: basta colocar um
 * `public/video/hero.mp4` e o fundo passa de imagem a vídeo sem tocar
 * em código.
 */
export function Hero() {
  const temVideo = existsSync(join(process.cwd(), 'public', 'video', 'hero.mp4'))

  return (
    <section
      id="top"
      // No telemóvel o bloco de texto desce: começava a 128 px, em cima
      // do espelho iluminado da fotografia, e o rótulo dourado ficava
      // ilegível. Menos folga em baixo empurra tudo para a zona escura e
      // aproveita o vazio que sobrava por cima do "Descer".
      className="relative flex min-h-svh flex-col justify-end overflow-hidden pb-8 pt-32 sm:pb-28"
    >
      <HeroBackdrop temVideo={temVideo} />

      <div className="relative z-10 px-gutter">
        <div className="max-w-4xl">
          <Reveal delay={0.1} className="mb-9 flex items-center gap-5">
            <span className="metal h-px w-14 shrink-0" />
            <span className="text-[0.62rem] uppercase tracking-[0.42em] text-gold">
              {heroCopy.sobre}
            </span>
          </Reveal>

          {/* Um pouco mais contida do que o máximo possível: a headline
              tinha de deixar respirar a figura do Anderson à direita da
              fotografia, em vez de a atravessar. */}
          <h1 className="font-display text-[clamp(2.6rem,8.2vw,8.5rem)] leading-[0.9] tracking-[-0.04em] text-bone">
            <TextReveal
              text={heroCopy.titulo[0]}
              as="span"
              gatilho="abertura"
              className="block"
            />
            {/* Uma palavra em metal. Se fossem as duas, o dourado
                deixaria de ser acento e passaria a ser a cor do texto.

                O gradiente vai na palavra, não na linha: a palavra é
                animada e ganha camada de composição própria, e um
                `background-clip: text` do elemento pai não pinta dentro
                dessa camada — o texto sairia invisível. */}
            <TextReveal
              text={heroCopy.titulo[1]}
              as="span"
              gatilho="abertura"
              delay={0.14}
              className="block italic"
              wordClassName="metal-text"
            />
          </h1>

          <Reveal delay={0.75} y={22} className="mt-10 max-w-xl">
            <p className="text-base font-light leading-relaxed text-bone-dim sm:text-lg">
              {heroCopy.subtitulo}
            </p>
          </Reveal>

          <Reveal delay={0.9} y={18} className="mt-12 flex flex-wrap items-center gap-4">
            <Botao href={heroCopy.primario.href} variante="metal">
              {heroCopy.primario.label}
            </Botao>
            <Botao href={heroCopy.secundario.href} variante="contorno">
              {heroCopy.secundario.label}
            </Botao>
          </Reveal>
        </div>
      </div>

      <div className="relative z-10 mt-5 flex items-end justify-between px-gutter sm:mt-16">
        <ScrollHint />
        <Reveal delay={1.1} className="hidden text-right sm:block">
          <p className="text-[0.6rem] uppercase tracking-[0.34em] text-bone-dim">
            {site.morada.cidade}
          </p>
          <p className="mt-2 text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">
            {site.assinatura}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
