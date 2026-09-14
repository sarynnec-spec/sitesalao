'use client'

import { useRef, type ReactNode } from 'react'
import { gsap, prefereMenosMovimento } from '@/lib/gsap'
import { irPara } from '@/components/providers/smooth-scroll'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  href: string
  variante?: 'metal' | 'contorno'
  className?: string
}

/**
 * Botão com atracção magnética.
 *
 * O elemento desloca-se uns poucos pixéis na direcção do ponteiro. O
 * limite baixo é deliberado: acima de ~8 px deixa de parecer um objecto
 * físico e passa a parecer um bug. É um `<a>` verdadeiro — o efeito é
 * decoração por cima de navegação que funciona sem JS.
 */
export function Botao({ children, href, variante = 'metal', className }: Props) {
  const raiz = useRef<HTMLAnchorElement>(null)
  const interior = useRef<HTMLSpanElement>(null)

  const aoMover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefereMenosMovimento()) return
    const el = raiz.current
    if (!el) return
    const caixa = el.getBoundingClientRect()
    const dx = e.clientX - (caixa.left + caixa.width / 2)
    const dy = e.clientY - (caixa.top + caixa.height / 2)
    gsap.to(el, { x: dx * 0.16, y: dy * 0.22, duration: 0.6, ease: 'power3.out' })
    gsap.to(interior.current, { x: dx * 0.06, y: dy * 0.09, duration: 0.6, ease: 'power3.out' })
  }

  /**
   * A aproximação tem de ser feita em GSAP, e não em `hover:scale` do
   * CSS: o efeito magnético já escreve `transform` neste elemento, e uma
   * transformação vinda da folha de estilos entraria em conflito com ela.
   * Aqui as duas partilham o mesmo motor.
   *
   * 1.04 é deliberadamente pouco. Acima disso o botão "salta" e perde a
   * contenção que o resto da página tem.
   */
  const aoEntrar = () => {
    if (prefereMenosMovimento()) return
    gsap.to(raiz.current, { scale: 1.04, duration: 0.55, ease: 'power3.out' })
  }

  const aoSair = () => {
    gsap.to(raiz.current, { scale: 1, duration: 0.55, ease: 'power3.out' })
    gsap.to([raiz.current, interior.current], {
      x: 0,
      y: 0,
      duration: 0.9,
      ease: 'elastic.out(1, 0.5)',
    })
  }

  const ehInterno = href.startsWith('#')

  return (
    <a
      ref={raiz}
      href={href}
      onMouseMove={aoMover}
      onMouseEnter={aoEntrar}
      onMouseLeave={aoSair}
      onFocus={aoEntrar}
      onBlur={aoSair}
      onClick={
        ehInterno
          ? (e) => {
              e.preventDefault()
              irPara(href)
            }
          : undefined
      }
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden px-9 py-4 text-[0.7rem] uppercase tracking-[0.26em] transition-shadow duration-500 will-change-transform',
        variante === 'metal'
          ? // O texto é preto sobre metal: é o único sítio do site onde
            // o dourado é superfície e não luz. `metal-vivo` acrescenta
            // a lâmina de luz em ciclo; a sombra no hover é luz a
            // derramar do próprio botão, não um halo de néon — daí o
            // desfoque largo e o alcance negativo.
            // `metal-vivo` traz a sua própria chapa; juntar `metal`
            // devolveria o ponto quente que estamos a evitar.
            'metal-vivo text-void hover:shadow-[0_0_46px_-14px_var(--color-gold)]'
          : 'sweep border border-gold/40 text-gold-light transition-colors hover:border-gold/80 hover:bg-gold/5',
        className,
      )}
    >
      <span ref={interior} className="relative z-[2] inline-block will-change-transform">
        {children}
      </span>
    </a>
  )
}
