'use server'

/**
 * Marcação — entrega automática ao salão, sem o cliente sair do site.
 *
 * O cliente preenche e vê a confirmação no próprio site; esta função
 * corre no servidor (Vercel) e avisa o salão automaticamente por trás.
 *
 * Sem chaves configuradas (prévia/demonstração) não envia a ninguém —
 * apenas devolve sucesso, para mostrar a experiência. Quando o salão
 * fecha contigo, põem-se as variáveis de ambiente do salão e a mesma
 * marcação passa a chegar-lhe sozinha:
 *   - WhatsApp (CallMeBot):  SALAO_WHATSAPP + SALAO_CALLMEBOT_APIKEY
 *   - Telegram (opcional):   SALAO_TELEGRAM_TOKEN + SALAO_TELEGRAM_CHAT
 */
export type DadosMarcacao = {
  servico: string
  dia: string
  hora: string
  nome: string
  telefone?: string
}

export async function criarMarcacao(dados: DadosMarcacao): Promise<{ ok: boolean }> {
  if (!dados?.servico || !dados?.dia || !dados?.hora || !dados?.nome?.trim()) {
    return { ok: false }
  }

  const texto = [
    'Nova marcacao pelo site:',
    `• Servico: ${dados.servico}`,
    `• Dia: ${dados.dia} as ${dados.hora}`,
    `• Cliente: ${dados.nome.trim()}${dados.telefone?.trim() ? ` (${dados.telefone.trim()})` : ''}`,
  ].join('\n')

  const tarefas: Promise<unknown>[] = []

  const phone = process.env.SALAO_WHATSAPP
  const apikey = process.env.SALAO_CALLMEBOT_APIKEY
  if (phone && apikey) {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
      phone,
    )}&text=${encodeURIComponent(texto)}&apikey=${encodeURIComponent(apikey)}`
    tarefas.push(fetch(url).catch(() => {}))
  }

  const token = process.env.SALAO_TELEGRAM_TOKEN
  const chat = process.env.SALAO_TELEGRAM_CHAT
  if (token && chat) {
    tarefas.push(
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat, text: texto }),
      }).catch(() => {}),
    )
  }

  await Promise.allSettled(tarefas)
  return { ok: true }
}
