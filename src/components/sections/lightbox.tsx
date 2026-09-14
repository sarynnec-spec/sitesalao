'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'
import { X, ArrowLeft, ArrowRight } from 'lucide-react'
import type { Trabalho } from '@/lib/site'

/**
 * Lightbox isolada num módulo próprio para poder ser importada
 * dinamicamente: o Radix Dialog só entra no bundle quando alguém clica
 * numa fotografia. Numa página que a maioria das pessoas percorre sem
 * abrir nenhuma imagem, é peso que não se paga à entrada.
 *
 * O Radix trata do foco preso, do Escape, do `aria-modal` e de devolver
 * o foco ao botão de origem — é exactamente aí que as lightboxes
 * artesanais falham em acessibilidade.
 */
export function Lightbox({
  itens,
  indice,
  aberto,
  onAbertoChange,
  onAnterior,
  onSeguinte,
}: {
  itens: readonly Trabalho[]
  indice: number
  aberto: boolean
  onAbertoChange: (v: boolean) => void
  onAnterior: () => void
  onSeguinte: () => void
}) {
  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onAnterior()
      if (e.key === 'ArrowRight') onSeguinte()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [aberto, onAnterior, onSeguinte])

  const atual = itens[indice]
  if (!atual) return null

  return (
    <Dialog.Root open={aberto} onOpenChange={onAbertoChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-void/96 backdrop-blur-xl data-[state=open]:animate-[surgir_400ms_ease-out]" />
        <Dialog.Content className="fixed inset-0 z-[81] flex flex-col items-center justify-center p-6 focus:outline-none sm:p-12">
          <Dialog.Title className="sr-only">{atual.titulo}</Dialog.Title>
          <Dialog.Description className="sr-only">{atual.alt}</Dialog.Description>

          <div className="relative flex max-h-[74vh] items-center justify-center">
            <Image
              key={atual.id}
              src={atual.src}
              alt={atual.alt}
              width={atual.largura}
              height={atual.altura}
              sizes="(max-width: 640px) 90vw, 62vw"
              quality={88}
              className="max-h-[74vh] w-auto animate-[surgir_500ms_cubic-bezier(0.16,1,0.3,1)] object-contain"
            />
          </div>

          <div className="mt-8 flex w-full max-w-2xl items-center justify-between gap-6">
            <button
              type="button"
              onClick={onAnterior}
              aria-label="Trabalho anterior"
              className="flex h-11 w-11 items-center justify-center border border-gold/25 text-gold transition-colors duration-500 hover:border-gold/70 hover:text-gold-light"
            >
              <ArrowLeft size={16} strokeWidth={1.25} />
            </button>

            <div className="text-center">
              <p className="font-display text-xl text-bone">{atual.titulo}</p>
              <p className="mt-2 text-[0.6rem] uppercase tracking-[0.3em] text-bone-dim">
                {atual.legenda} · {String(indice + 1).padStart(2, '0')} /{' '}
                {String(itens.length).padStart(2, '0')}
              </p>
            </div>

            <button
              type="button"
              onClick={onSeguinte}
              aria-label="Trabalho seguinte"
              className="flex h-11 w-11 items-center justify-center border border-gold/25 text-gold transition-colors duration-500 hover:border-gold/70 hover:text-gold-light"
            >
              <ArrowRight size={16} strokeWidth={1.25} />
            </button>
          </div>

          <Dialog.Close
            aria-label="Fechar"
            className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center text-bone-dim transition-colors duration-500 hover:text-gold-light sm:right-10 sm:top-10"
          >
            <X size={20} strokeWidth={1.25} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>

      <style>{`
        @keyframes surgir {
          from { opacity: 0; transform: scale(0.985); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Dialog.Root>
  )
}
