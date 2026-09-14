'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Check, ArrowUpRight } from 'lucide-react'
import { servicos, agendamento } from '@/lib/site'
import { TextReveal, Reveal } from '@/components/motion/reveal'
import { RotuloSeccao } from '@/components/ui/rotulo-seccao'
import { criarMarcacao } from '@/lib/marcacao'

/**
 * Marcação online — confirmação no próprio site, sem o cliente sair.
 *
 * Valida os campos (React Hook Form + Zod) e chama a server action
 * `criarMarcacao`, que avisa o salão automaticamente por trás. O cliente
 * vê "Marcação recebida" sem abrir o WhatsApp. Na prévia (sem chaves do
 * salão) nada é entregue — mostra só a experiência; a entrega real
 * liga-se quando o salão fecha (ver src/lib/marcacao.ts).
 */
const esquema = z.object({
  servico: z.string().min(1, 'Escolha o serviço'),
  dia: z.string().min(1, 'Escolha o dia'),
  hora: z.string().min(1, 'Escolha a hora'),
  nome: z.string().trim().min(2, 'Escreva o seu nome'),
  telefone: z.string().trim().optional(),
})

type Dados = z.infer<typeof esquema>

export function Agendamento() {
  const [enviado, setEnviado] = useState(false)
  const [resumo, setResumo] = useState<Dados | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Dados>({
    resolver: zodResolver(esquema),
    defaultValues: {
      servico: servicos[0]?.titulo ?? '',
      dia: '',
      hora: '',
      nome: '',
      telefone: '',
    },
  })

  const hoje = new Date().toISOString().slice(0, 10)

  async function marcar(dados: Dados) {
    // Momento "wow": confete dourado ao confirmar.
    const confetti = (await import('canvas-confetti')).default
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const cores = ['#C9A96A', '#E4CE9A', '#B8935A', '#efe7d6']
      confetti({
        particleCount: 120,
        spread: 80,
        startVelocity: 42,
        origin: { y: 0.6 },
        colors: cores,
      })
    }

    // Avisa o salão automaticamente por trás (server-side). Na prévia,
    // sem chaves configuradas, apenas devolve sucesso.
    await criarMarcacao(dados)

    setResumo(dados)
    setEnviado(true)
    toast.success('Marcação recebida', {
      description: `${dados.servico} · ${dados.dia} às ${dados.hora}`,
    })
  }

  return (
    <section id="agendamento" className="relative py-section">
      <div className="px-gutter">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <RotuloSeccao numero="04">{agendamento.sobre}</RotuloSeccao>
            <TextReveal
              as="h2"
              text={agendamento.titulo}
              className="mt-9 max-w-2xl font-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.94] text-bone"
            />
          </div>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-sm leading-relaxed font-light text-bone-dim">
              {agendamento.nota}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.12} y={26} className="mt-16">
          {enviado ? (
            <div className="flex flex-col items-center gap-6 border border-gold/20 bg-void px-8 py-20 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 text-gold">
                <Check size={26} strokeWidth={1.25} />
              </span>
              <h3 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-none text-bone">
                Marcação recebida
              </h3>
              <p className="max-w-md text-sm leading-relaxed font-light text-bone-dim">
                Obrigado{resumo?.nome ? `, ${resumo.nome}` : ''}! Registámos o seu pedido
                {resumo ? ` para ${resumo.servico} · ${resumo.dia} às ${resumo.hora}` : ''}. O salão
                confirma consigo em breve.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEnviado(false)
                  setResumo(null)
                }}
                className="mt-2 flex items-center gap-2 text-[0.6rem] tracking-[0.26em] text-gold uppercase transition-colors hover:text-gold-light"
              >
                Fazer outra marcação
                <ArrowUpRight size={13} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(marcar)}
              noValidate
              className="grid gap-px border border-gold/12 bg-gold/12 sm:grid-cols-2"
            >
              <Campo label="Serviço" erro={errors.servico?.message} className="sm:col-span-2">
                <select {...register('servico')} className={campoClasse}>
                  {servicos.map((s) => (
                    <option key={s.id} value={s.titulo} className="bg-void text-bone">
                      {s.titulo}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo label="Dia" erro={errors.dia?.message}>
                <input type="date" min={hoje} {...register('dia')} className={campoClasse} />
              </Campo>

              <Campo label="Hora" erro={errors.hora?.message}>
                <select {...register('hora')} defaultValue="" className={campoClasse}>
                  <option value="" className="bg-void text-bone-dim">
                    Escolher hora
                  </option>
                  {agendamento.horas.map((h) => (
                    <option key={h} value={h} className="bg-void text-bone">
                      {h}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo label="Nome" erro={errors.nome?.message}>
                <input
                  type="text"
                  placeholder="O seu nome"
                  {...register('nome')}
                  className={campoClasse}
                />
              </Campo>

              <Campo label="Telefone (opcional)" erro={errors.telefone?.message}>
                <input
                  type="tel"
                  placeholder="+351 ..."
                  {...register('telefone')}
                  className={campoClasse}
                />
              </Campo>

              <div className="bg-void p-9 sm:col-span-2 sm:p-12">
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    className="metal-vivo group relative inline-flex items-center justify-center overflow-hidden px-9 py-4 text-[0.7rem] tracking-[0.26em] text-void uppercase transition-shadow duration-500 hover:shadow-[0_0_46px_-14px_var(--color-gold)]"
                  >
                    <span className="relative z-[2]">Confirmar marcação</span>
                  </button>
                  <p className="text-[0.6rem] tracking-[0.26em] text-bone-dim uppercase">
                    {agendamento.rodape}
                  </p>
                </div>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}

const campoClasse =
  'w-full appearance-none bg-void px-6 py-5 text-sm font-light text-bone outline-none transition-colors placeholder:text-bone-dim/60 focus:text-gold-light'

function Campo({
  label,
  erro,
  children,
  className,
}: {
  label: string
  erro?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`flex flex-col gap-3 bg-void px-6 pt-6 ${className ?? ''}`}>
      <span className="text-[0.55rem] tracking-[0.34em] text-gold uppercase">{label}</span>
      <div className="-mx-6 -mt-3">{children}</div>
      {erro && (
        <span className="-mt-2 pb-1 text-[0.6rem] tracking-[0.18em] text-gold-light uppercase">
          {erro}
        </span>
      )}
    </label>
  )
}
