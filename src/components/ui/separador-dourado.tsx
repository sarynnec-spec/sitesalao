'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefereMenosMovimento } from '@/lib/gsap'

/**
 * Linha dourada que se desenha ao entrar no ecrã.
 *
 * Cresce a partir do centro em vez de deslizar de um lado: a partir do
 * centro lê-se como uma linha a ser traçada; de um lado lê-se como um
 * elemento a entrar. É a única transição entre secções — mantém o
 * "silêncio visual" pedido e dá ritmo à descida.
 */
export function SeparadorDourado() {
  const raiz = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefereMenosMovimento()) return
      gsap.fromTo(
        raiz.current!.firstElementChild,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.8,
          ease: 'expo.out',
          scrollTrigger: { trigger: raiz.current, start: 'top 92%', once: true },
        },
      )
    },
    { scope: raiz },
  )

  return (
    <div ref={raiz} className="px-gutter" aria-hidden>
      <div className="hairline w-full origin-center" />
    </div>
  )
}
