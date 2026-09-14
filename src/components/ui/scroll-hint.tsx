'use client'

import { useEffect, useState } from 'react'
import { irPara } from '@/components/providers/smooth-scroll'

/**
 * Indicação de scroll. Desaparece assim que a pessoa percebe a
 * mensagem — mantê-la depois disso é ruído.
 */
export function ScrollHint() {
  const [visivel, setVisivel] = useState(true)

  useEffect(() => {
    const aoScroll = () => setVisivel(window.scrollY < 120)
    window.addEventListener('scroll', aoScroll, { passive: true })
    return () => window.removeEventListener('scroll', aoScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => irPara('#atelier')}
      aria-label="Descer para o atelier"
      className="group flex items-center gap-4 transition-opacity duration-700"
      style={{ opacity: visivel ? 1 : 0, pointerEvents: visivel ? 'auto' : 'none' }}
    >
      <span className="relative block h-14 w-px overflow-hidden bg-gold/20">
        <span className="metal absolute inset-x-0 top-0 h-1/2 animate-[descer_2.6s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
      </span>
      <span className="text-[0.6rem] uppercase tracking-[0.34em] text-bone-dim transition-colors duration-500 group-hover:text-gold-light">
        Descer
      </span>

      <style>{`
        @keyframes descer {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[descer_2\\.6s_cubic-bezier\\(0\\.65\\,0\\,0\\.35\\,1\\)_infinite\\] {
            animation: none;
            transform: translateY(0);
          }
        }
      `}</style>
    </button>
  )
}
