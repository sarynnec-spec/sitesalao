'use client'

import { useEffect, useRef } from 'react'
import { prefereMenosMovimento } from '@/lib/gsap'

/**
 * Poeira dourada.
 *
 * Canvas 2D, não WebGL: são umas dezenas de pontos a derivar devagar.
 * Three.js aqui traria ~150 KB de bundle e um contexto de GPU para
 * desenhar o que cabe em cinquenta linhas — o efeito não justifica o
 * custo, e o critério do projecto é que a tecnologia sirva a ideia.
 *
 * Cuidados que fazem a diferença entre "atmosfera" e "bateria a arder":
 *  - pára quando o separador está em segundo plano;
 *  - respeita movimento reduzido;
 *  - `devicePixelRatio` limitado a 2 (em retina 3× o custo quadruplica).
 */
export function GoldDust() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (prefereMenosMovimento()) return
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx) return

    let largura = 0
    let altura = 0
    let raf = 0

    type Particula = { x: number; y: number; r: number; vx: number; vy: number; a: number; fase: number }
    let particulas: Particula[] = []

    const dimensionar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      largura = el.clientWidth
      altura = el.clientHeight
      el.width = largura * dpr
      el.height = altura * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Densidade por área, não número fixo: um ultrawide não pode
      // ficar vazio nem um telemóvel saturado.
      const quantidade = Math.round((largura * altura) / 42000)
      particulas = Array.from({ length: quantidade }, () => ({
        x: Math.random() * largura,
        y: Math.random() * altura,
        r: Math.random() * 1.1 + 0.3,
        vx: (Math.random() - 0.5) * 0.09,
        vy: -Math.random() * 0.14 - 0.02,
        a: Math.random() * 0.32 + 0.06,
        fase: Math.random() * Math.PI * 2,
      }))
    }

    let t = 0
    const desenhar = () => {
      t += 0.006
      ctx.clearRect(0, 0, largura, altura)
      for (const p of particulas) {
        p.x += p.vx + Math.sin(t + p.fase) * 0.06
        p.y += p.vy
        if (p.y < -6) {
          p.y = altura + 6
          p.x = Math.random() * largura
        }
        if (p.x < -6) p.x = largura + 6
        if (p.x > largura + 6) p.x = -6

        // Cintilação lenta — poeira parada lê-se como sujidade no ecrã.
        const brilho = p.a * (0.65 + 0.35 * Math.sin(t * 2.2 + p.fase))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(251, 216, 122, ${brilho})`
        ctx.fill()
      }
      raf = requestAnimationFrame(desenhar)
    }

    const arrancar = () => {
      if (!raf) raf = requestAnimationFrame(desenhar)
    }
    const parar = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }
    const aoMudarVisibilidade = () => (document.hidden ? parar() : arrancar())

    dimensionar()
    arrancar()

    window.addEventListener('resize', dimensionar)
    document.addEventListener('visibilitychange', aoMudarVisibilidade)

    return () => {
      parar()
      window.removeEventListener('resize', dimensionar)
      document.removeEventListener('visibilitychange', aoMudarVisibilidade)
    }
  }, [])

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[55] h-full w-full opacity-70"
    />
  )
}
