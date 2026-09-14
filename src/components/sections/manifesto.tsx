import Image from 'next/image'
import { manifesto, atelierImagens } from '@/lib/site'
import { TextReveal, Reveal, Parallax } from '@/components/motion/reveal'
import { RotuloSeccao } from '@/components/ui/rotulo-seccao'

/**
 * O retrato foi fotografado sobre preto puro. Em vez de o encaixar num
 * cartão, deixamo-lo assentar directamente no fundo da página: o preto
 * da fotografia e o preto do site são o mesmo, e a figura parece emergir
 * do escuro. Sem moldura, sem sombra, sem borda — é o momento em que a
 * limitação do material passa a ser a direcção de arte.
 */
export function Manifesto() {
  return (
    <section id="atelier" className="relative py-section">
      <div className="grid items-center gap-16 px-gutter lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5 lg:col-start-1">
          <Parallax velocidade={0.06}>
            <div className="relative mx-auto aspect-[2/3] w-full max-w-md">
              {/* Sem gradiente por cima: a máscara esbate os quatro
                  lados da própria fotografia. Um véu sobreposto só
                  resolvia a base e continuava a deixar o limite recto
                  visível nos lados e no topo. */}
              <Image
                src={atelierImagens.retrato.src}
                alt={atelierImagens.retrato.alt}
                width={atelierImagens.retrato.largura}
                height={atelierImagens.retrato.altura}
                sizes="(max-width: 1024px) 88vw, 34vw"
                quality={80}
                className="dissolver-no-fundo h-full w-full object-cover"
              />
            </div>
          </Parallax>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <RotuloSeccao numero="01">{manifesto.sobre}</RotuloSeccao>

          {/* O gradiente vai na palavra e não na linha: a palavra é
              animada e ganha camada de composição própria, e um
              `background-clip: text` no elemento pai não pinta lá
              dentro — o título sairia invisível. */}
          <TextReveal
            as="h2"
            text={manifesto.titulo}
            className="mt-9 font-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.94]"
            wordClassName="metal-text"
          />

          <div className="mt-10 space-y-6">
            {manifesto.paragrafos.map((p, i) => (
              <Reveal key={i} delay={i * 0.08} y={20}>
                <p className="max-w-xl text-base font-light leading-[1.85] text-bone">{p}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2} className="mt-14">
            <div className="hairline w-full" />
            <dl className="grid grid-cols-3 gap-6 pt-8">
              {manifesto.marcas.map((m) => (
                <div key={m.label}>
                  <dt className="metal-text font-display text-4xl leading-none sm:text-5xl">
                    {m.valor}
                  </dt>
                  <dd className="mt-3 text-[0.6rem] uppercase leading-relaxed tracking-[0.24em] text-bone-dim">
                    {m.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
