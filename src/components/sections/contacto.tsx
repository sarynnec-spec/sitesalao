import Image from 'next/image'
import { Phone, Mail, MapPin, MessageCircle, ArrowUpRight } from 'lucide-react'
import { IconeInstagram } from '@/components/ui/icone-instagram'
import { IconeFacebook } from '@/components/ui/icone-facebook'
import { PinoMapa } from '@/components/ui/pino-mapa'
import { site } from '@/lib/site'
import { TextReveal, Reveal } from '@/components/motion/reveal'
import { RotuloSeccao } from '@/components/ui/rotulo-seccao'
import { Botao } from '@/components/ui/botao'

export function Contacto() {
  const moradaCompleta = `${site.morada.rua}, ${site.morada.codigoPostal} ${site.morada.cidade}`

  return (
    <section id="contacto" className="relative pt-section">
      <div className="px-gutter">
        <RotuloSeccao numero="05">Contacto</RotuloSeccao>

        <TextReveal
          as="h2"
          // Em atributo JSX o `\n` seria literal; tem de vir por expressão.
          text={'Marcar é o\nprimeiro gesto'}
          className="mt-9 max-w-3xl font-display text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.92] text-bone"
        />

        <Reveal delay={0.15} className="mt-12 flex flex-wrap items-center gap-4">
          <Botao href={site.whatsapp} variante="metal">
            Marcar por WhatsApp
          </Botao>
          <Botao href={`tel:${site.telefoneHref}`} variante="contorno">
            Ligar agora
          </Botao>
        </Reveal>

        <div className="mt-24 grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* ---- Contactos ---- */}
          <Reveal className="lg:col-span-6">
            <h3 className="text-[0.6rem] tracking-[0.34em] text-gold uppercase">Directo</h3>
            <ul className="mt-8 space-y-5">
              <LinhaContacto
                icone={<Phone size={15} strokeWidth={1.25} />}
                href={`tel:${site.telefoneHref}`}
                texto={site.telefone}
              />
              <LinhaContacto
                icone={<MessageCircle size={15} strokeWidth={1.25} />}
                href={site.whatsapp}
                texto="WhatsApp"
                externo
              />
              <LinhaContacto
                icone={<Mail size={15} strokeWidth={1.25} />}
                href={`mailto:${site.email}`}
                texto={site.email}
              />
              <LinhaContacto
                icone={<IconeInstagram size={15} />}
                href={site.instagram.url}
                texto={`@${site.instagram.handle}`}
                externo
              />
              <LinhaContacto
                icone={<IconeFacebook size={15} />}
                href={site.facebook.url}
                texto={`@${site.facebook.nome}`}
                externo
              />
              <LinhaContacto
                icone={<MapPin size={15} strokeWidth={1.25} />}
                href={site.mapaLink}
                texto={moradaCompleta}
                externo
              />
            </ul>
          </Reveal>

          {/* ---- Horário ---- */}
          <Reveal delay={0.08} className="lg:col-span-6">
            <h3 className="text-[0.6rem] tracking-[0.34em] text-gold uppercase">Horário</h3>
            <dl className="mt-8 space-y-5">
              {site.horario.map((h) => (
                <div key={h.dias}>
                  <dt className="text-sm font-light text-bone">{h.dias}</dt>
                  <dd className="mt-1 text-[0.68rem] tracking-[0.2em] text-bone-dim uppercase">
                    {h.horas}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* ---- Mapa ----
            Imagem estática em vez do iframe do OpenStreetMap: o mapa
            incorporado arrastava scripts de terceiros, os separadores
            de zoom e a barra de atribuição por cima do desenho.

            Ocupa a linha toda e mantém a proporção nativa do ficheiro
            (1727×911). A imagem já traz a sua própria composição — o
            cartão "No coração do Porto" à esquerda e a barra de
            endereço em baixo — por isso qualquer corte comia texto, e
            metê-la numa coluna de 5/12 deixava esse texto ilegível. */}
        <Reveal delay={0.16} className="mt-20">
          <h3 className="text-[0.6rem] tracking-[0.34em] text-gold uppercase">Atelier</h3>
          <a
            href={site.mapaLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir ${moradaCompleta} no Google Maps (abre noutro separador)`}
            /* No computador fica a 75% da largura. A proporção é a mesma
               e o `object-contain` mantém-se, por isso encolhe na
               altura na mesma medida — não há corte nenhum. Alinhado à
               esquerda, a acompanhar o rótulo "Atelier" e as colunas de
               cima; centrá-lo descolava-o do resto da secção. */
            className="grupo-mapa group mt-8 block w-full focus-visible:outline-none lg:max-w-[75%]"
          >
            <span className="relative block aspect-[1727/911] w-full overflow-hidden border border-gold/15 bg-carbon transition-colors duration-700 group-hover:border-gold/50 group-focus-visible:border-gold">
              <Image
                src="/images/mapa.webp.png"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 69vw"
                quality={94}
                loading="lazy"
                className="object-contain"
              />

              {/* Pino com a ponta em cima do metro dos Combatentes, que
                  é a referência de quem vem de transportes.

                  A escala é responsiva e o `origin-bottom` é o que a
                  mantém ancorada: o pino tem 72 px fixos e o cartão
                  encolhe com o ecrã, por isso no telemóvel ocupava
                  quase metade da altura e saía pelo topo fora. A ponta
                  fica no mesmo ponto do mapa em qualquer tamanho. */}
              <span className="pointer-events-none absolute top-[41.5%] left-[57%] -translate-x-1/2 -translate-y-full">
                <span className="block origin-bottom scale-[0.45] sm:scale-[0.62] lg:scale-100">
                  <PinoMapa />
                </span>
              </span>
            </span>

            {/* A chamada fica FORA da imagem.

                Por cima dela, qualquer caixa — com fundo, contorno ou
                desfoque — pousava como um vidro sobre a fotografia e
                tirava-lhe a naturalidade. E era supérflua: a imagem já
                traz a sua própria barra de endereço, e o cartão inteiro
                continua clicável. Aqui em baixo diz-se o mesmo sem
                tocar no desenho. */}
            <span className="mt-5 flex items-center gap-2 text-[0.58rem] tracking-[0.26em] text-gold uppercase transition-colors duration-500 group-hover:text-gold-light">
              Ver no Google Maps
              <ArrowUpRight size={12} strokeWidth={1.5} />
            </span>
          </a>
        </Reveal>
      </div>

      {/* ---- Rodapé ---- */}
      <footer className="mt-32 border-t border-gold/12 px-gutter py-14">
        <div className="flex flex-col items-center gap-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-4">
            <span className="relative block h-14 w-14 shrink-0">
              <Image
                src="/images/lode-logo-alfa.webp"
                alt={`${site.nome} ${site.assinatura}`}
                fill
                sizes="56px"
                loading="lazy"
                className="object-contain"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="metal-text font-display text-xl tracking-[0.18em]">{site.nome}</span>
              <span className="mt-1.5 text-[0.55rem] tracking-[0.32em] text-bone-dim uppercase">
                {site.assinatura}
              </span>
            </span>
          </div>

          <p className="text-[0.6rem] tracking-[0.26em] text-bone-dim uppercase">
            © {new Date().getFullYear()} {site.nome} · Todos os direitos reservados
          </p>
        </div>
      </footer>
    </section>
  )
}

function LinhaContacto({
  icone,
  href,
  texto,
  externo,
}: {
  icone: React.ReactNode
  href: string
  texto: string
  externo?: boolean
}) {
  return (
    <li>
      <a
        href={href}
        {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group flex items-start gap-4 text-sm font-light text-bone transition-colors duration-500 hover:text-gold-light"
      >
        <span className="mt-0.5 text-gold/60 transition-colors duration-500 group-hover:text-gold">
          {icone}
        </span>
        <span className="border-b border-transparent pb-0.5 transition-colors duration-500 group-hover:border-gold/40">
          {texto}
        </span>
      </a>
    </li>
  )
}
