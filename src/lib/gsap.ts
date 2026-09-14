'use client'

/**
 * Registo dos plugins GSAP num único sítio.
 * Registar em vários componentes duplica o registo e, com SSR, tenta
 * tocar no `document` durante o render do servidor.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)

  // O default de 0.5s "salta" quando o browser engasga. Desligar mantém
  // as timelines coladas ao scroll do Lenis.
  gsap.ticker.lagSmoothing(0)
}

/** Verdadeiro quando o visitante pediu menos movimento. */
export function prefereMenosMovimento() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export { gsap, ScrollTrigger, useGSAP }
