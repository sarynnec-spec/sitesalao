import { Reveal } from '@/components/motion/reveal'

/** Rótulo de secção: filete metálico + número + nome. */
export function RotuloSeccao({ numero, children }: { numero: string; children: string }) {
  return (
    <Reveal className="flex items-center gap-5">
      <span className="metal h-px w-10 shrink-0" />
      <span className="font-display text-sm italic text-gold/70">{numero}</span>
      <span className="text-[0.62rem] uppercase tracking-[0.42em] text-gold">{children}</span>
    </Reveal>
  )
}
