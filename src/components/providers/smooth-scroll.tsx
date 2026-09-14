'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefereMenosMovimento } from '@/lib/gsap'

/**
 * Instância partilhada. A abertura precisa de travar o scroll enquanto
 * corre; passar isto por contexto obrigaria metade da árvore a ser
 * client. Um singleton de módulo resolve com muito menos custo.
 */
let lenisRef: Lenis | null = null

export function travarScroll() {
  lenisRef?.stop()
  document.documentElement.classList.add('lenis-stopped')
}

export function destravarScroll() {
  lenisRef?.start()
  document.documentElement.classList.remove('lenis-stopped')
}

export function irPara(alvo: string) {
  // O deslocamento tem de cobrir a altura do cabeçalho fixo, senão o
  // título da secção chega tapado por ele.
  if (lenisRef) lenisRef.scrollTo(alvo, { offset: -110, duration: 1.6 })
  else document.querySelector(alvo)?.scrollIntoView({ behavior: 'smooth' })
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const montado = useRef(false)

  useEffect(() => {
    if (montado.current) return
    montado.current = true

    // Scroll interpolado causa desconforto vestibular real. Quem pediu
    // menos movimento fica com o scroll nativo do browser, e o site
    // continua inteiro.
    if (prefereMenosMovimento()) {
      ScrollTrigger.refresh()
      return
    }

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      // O toque no telemóvel já é suave por natureza; interpolar por
      // cima torna-o pastoso e atrasa a resposta.
      syncTouch: false,
      autoRaf: false,
    })
    lenisRef = lenis

    // Sem isto o ScrollTrigger lê a posição nativa enquanto o Lenis
    // ainda está a interpolar — as marcas ficam sempre desfasadas.
    lenis.on('scroll', ScrollTrigger.update)

    const tick = (tempo: number) => lenis.raf(tempo * 1000)
    gsap.ticker.add(tick)

    /**
     * Quando o Tab leva o foco para fora do ecrã, o browser faz um
     * scroll nativo que o Lenis ignora — o elemento focado fica
     * invisível e a navegação por teclado parte-se. Reagimos ao foco.
     */
    const aoFocar = (e: FocusEvent) => {
      const alvo = e.target as HTMLElement | null
      if (!alvo) return
      const caixa = alvo.getBoundingClientRect()
      const foraDoEcra = caixa.top < 80 || caixa.bottom > window.innerHeight - 40
      if (foraDoEcra) lenis.scrollTo(alvo, { offset: -120, immediate: true })
    }
    window.addEventListener('focusin', aoFocar)

    // As imagens e fontes mudam a altura da página depois do primeiro
    // render; sem refresh as posições dos triggers ficam erradas.
    const aoCarregar = () => ScrollTrigger.refresh()
    window.addEventListener('load', aoCarregar)
    const timer = window.setTimeout(aoCarregar, 900)

    return () => {
      window.removeEventListener('focusin', aoFocar)
      window.removeEventListener('load', aoCarregar)
      window.clearTimeout(timer)
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef = null
    }
  }, [])

  return <>{children}</>
}
