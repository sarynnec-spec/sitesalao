'use client'

/**
 * Coordenação da abertura.
 *
 * A hero precisa de saber quando pode começar a sua própria entrada, mas
 * não pode depender disso para existir — se a abertura for saltada,
 * bloqueada pelo browser ou nunca correr, o site tem de aparecer na
 * mesma. Daí o `jaTerminou`: quem se subscreve depois do facto é
 * chamado de imediato em vez de ficar à espera de um evento que já passou.
 */

export const EVENTO_ABERTURA = 'lode:abertura-terminada'

let jaTerminou = false

export function marcarAberturaTerminada() {
  if (jaTerminou) return
  jaTerminou = true
  window.dispatchEvent(new Event(EVENTO_ABERTURA))
}

export function quandoAberturaTerminar(callback: () => void) {
  if (jaTerminou) {
    callback()
    return () => {}
  }
  window.addEventListener(EVENTO_ABERTURA, callback, { once: true })
  return () => window.removeEventListener(EVENTO_ABERTURA, callback)
}

/**
 * Decide se vale a pena correr o filme.
 *
 * A abertura é um luxo: custa um vídeo inteiro antes do primeiro pixel
 * útil. Em ligação fraca, com poupança de dados ou com movimento
 * reduzido, o luxo transforma-se em obstáculo — nesses casos entra-se
 * directamente no site.
 */
export function deveCorrerAbertura(): boolean {
  if (typeof window === 'undefined') return false

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

  // Já viu o filme nesta sessão. Repetir a cada navegação é castigo.
  if (sessionStorage.getItem('lode:abertura') === 'vista') return false

  const conexao = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
    }
  ).connection

  if (conexao?.saveData) return false
  if (conexao?.effectiveType && /2g/.test(conexao.effectiveType)) return false

  return true
}

export function registarAberturaVista() {
  try {
    sessionStorage.setItem('lode:abertura', 'vista')
  } catch {
    // Modo privado pode recusar. Não é motivo para partir nada.
  }
}
