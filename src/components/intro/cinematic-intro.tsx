'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { travarScroll, destravarScroll } from '@/components/providers/smooth-scroll'
import {
  deveCorrerAbertura,
  marcarAberturaTerminada,
  registarAberturaVista,
} from '@/lib/intro'

/**
 * Fracção da altura do fotograma ocupada pelo logótipo.
 *
 * A imagem que substitui o vídeo tem a mesma resolução dele (720×1280) e
 * usa o mesmo `object-contain`, por isso ocupa exactamente o mesmo
 * rectângulo — a troca não desloca nem redimensiona nada. Mas o logótipo
 * em si só preenche parte dessa altura, e é isso que o voo precisa de
 * saber para aterrar do tamanho do cabeçalho.
 *
 * Valor calculado por `scripts/build-assets.mjs`, que o imprime ao gerar
 * a imagem: 675 px de logótipo num fotograma de 1280.
 */
const FRACAO_LOGO_NO_VIDEO = 0.5273

/** Nunca prender o visitante. Se o vídeo se arrastar, o site abre à mesma. */
const DURACAO_MAXIMA_MS = 9000
/** Se o vídeo não estiver pronto a tempo, a abertura não acontece de todo. */
const ESPERA_MAXIMA_CARREGAMENTO_MS = 1400

export function CinematicIntro() {
  const [ativa, setAtiva] = useState<boolean | null>(null)
  const raiz = useRef<HTMLDivElement>(null)
  const caixaVideo = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const logo = useRef<HTMLDivElement>(null)
  const terminou = useRef(false)
  // O botão precisa de chamar a mesma função de encerramento que o
  // teclado e o fim do vídeo — guardá-la aqui evita duplicar a lógica.
  const encerrarRef = useRef<(imediato?: boolean) => void>(() => {})

  // Decidido no cliente: depende de sessionStorage, ligação e preferência
  // de movimento, nenhum dos quais existe no servidor.
  useEffect(() => setAtiva(deveCorrerAbertura()), [])

  /**
   * Retira o tapa-vista posto pelo script do `layout.tsx`.
   *
   * Só depois de `ativa` estar decidido: nesse momento a abertura já
   * está no DOM a cobrir o ecrã (z-90, por cima do tapa-vista em 89),
   * por isso não há um fotograma sequer em que o site fique à vista.
   */
  useEffect(() => {
    if (ativa === null) return
    document.documentElement.removeAttribute('data-abertura')
  }, [ativa])

  useEffect(() => {
    if (ativa !== true) {
      if (ativa === false) marcarAberturaTerminada()
      return
    }

    travarScroll()
    const elVideo = video.current
    const elRaiz = raiz.current
    const elCaixa = caixaVideo.current
    if (!elVideo || !elRaiz || !elCaixa) return

    /**
     * Fecha a abertura. `imediato` serve para quando o visitante salta:
     * aí ninguém quer ver mais um segundo de animação.
     */
    const encerrar = (imediato = false) => {
      if (terminou.current) return
      terminou.current = true
      registarAberturaVista()

      const alvo = document.querySelector('[data-logo-slot]')
      const tl = gsap.timeline({
        onComplete: () => {
          destravarScroll()
          marcarAberturaTerminada()
          setAtiva(false)
        },
      })

      if (imediato || !alvo) {
        tl.to(elRaiz, { autoAlpha: 0, duration: imediato ? 0.35 : 0.6, ease: 'power2.out' })
        return
      }

      // O logótipo não "desaparece e reaparece": voa para o sítio exacto
      // onde o cabeçalho o vai mostrar. Medimos os dois rectângulos e
      // animamos a diferença — é o que dá a leitura de continuidade.
      const de = elCaixa.getBoundingClientRect()
      const para = (alvo as HTMLElement).getBoundingClientRect()
      // A escala é calculada sobre o tamanho visível do logótipo, não
      // sobre a caixa: a caixa é maior do que ele, e usá-la faria o
      // logótipo aterrar mais pequeno do que o espaço do cabeçalho.
      const escala = para.height / (de.height * FRACAO_LOGO_NO_VIDEO)
      const dx = para.left + para.width / 2 - (de.left + de.width / 2)
      const dy = para.top + para.height / 2 - (de.top + de.height / 2)

      /**
       * Antes de voar, troca-se o vídeo pelo logótipo em PNG.
       *
       * Um `<video>` não tem canal alfa: o que se movia era o rectângulo
       * inteiro do vídeo, e via-se uma caixa preta a atravessar o ecrã.
       * A troca acontece com os dois no mesmo sítio e no mesmo tamanho,
       * por isso lê-se como o vídeo a assentar, não como um corte — e o
       * que voa a seguir é só o logótipo, recortado.
       */
      // Troca instantânea, não cruzada. Um `crossfade` entre os dois
      // deixava-os ambos a meia opacidade a meio do caminho: como estão
      // sobrepostos sobre preto, o logótipo escurecia e lia-se como uma
      // piscada. E os 0,32 s de transição adiavam o voo, o que dava a
      // sensação de atraso. Sendo a mesma imagem, no mesmo sítio e no
      // mesmo tamanho, a troca a seco é literalmente invisível — e o
      // movimento arranca no mesmo instante.
      tl.set(logo.current, { autoAlpha: 1 })
        .set(elVideo, { autoAlpha: 0 })
        .to(elCaixa, {
          x: dx,
          y: dy,
          scale: escala,
          duration: 1.5,
          ease: 'power3.inOut',
        })
        // O fundo abre antes do logótipo chegar: quando o movimento
        // termina, o site já está lá — não há um "corte" a preto.
        .to(elRaiz, { backgroundColor: 'rgba(0,0,0,0)', duration: 1.1 }, '<0.25')
        /**
         * Entrega ao cabeçalho, sem buraco pelo meio.
         *
         * Antes, o logótipo que voava desvanecia-se primeiro e só no
         * fim da linha temporal é que o cabeçalho era avisado para
         * acender o seu — ficava um intervalo com o sítio vazio, e era
         * essa a última piscada.
         *
         * Agora o cabeçalho acende-se no instante da aterragem, por
         * baixo do logótipo que voou e que ainda está opaco a tapá-lo.
         * Passados os 500 ms da transição dele, este desaparece de uma
         * vez — sem desvanecimento, porque é a mesma imagem no mesmo
         * sítio e cruzá-las voltaria a escurecer o conjunto.
         */
        .call(() => marcarAberturaTerminada())
        .set(elCaixa, { autoAlpha: 0 }, '+=0.55')
        .set(elRaiz, { pointerEvents: 'none' })
    }

    encerrarRef.current = encerrar

    /* ---- Entrada: o logótipo emerge do preto, sem pressa. ---- */
    const tlEntrada = gsap.timeline()
    tlEntrada.fromTo(
      elCaixa,
      { autoAlpha: 0, scale: 1.06, filter: 'blur(14px)' },
      { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 1.6, ease: 'power2.out' },
    )

    /* ---- O vídeo manda no ritmo, mas com rédea curta. ----
       Toca à velocidade natural: acelerá-lo para encurtar a abertura
       fazia a animação do logótipo parecer apressada. */
    const aoTerminarVideo = () => encerrar()
    elVideo.addEventListener('ended', aoTerminarVideo)

    const limite = window.setTimeout(() => encerrar(), DURACAO_MAXIMA_MS)

    // Autoplay pode ser recusado mesmo com `muted`. Se for, não vale a
    // pena insistir — entra-se no site.
    const reproducao = elVideo.play()
    if (reproducao) reproducao.catch(() => encerrar(true))

    // Rede lenta: em vez de um ecrã preto à espera, abre o site.
    const esperaCarregamento = window.setTimeout(() => {
      if (elVideo.readyState < 2) encerrar(true)
    }, ESPERA_MAXIMA_CARREGAMENTO_MS)

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') encerrar(true)
    }
    window.addEventListener('keydown', aoTeclar)

    return () => {
      elVideo.removeEventListener('ended', aoTerminarVideo)
      window.removeEventListener('keydown', aoTeclar)
      window.clearTimeout(limite)
      window.clearTimeout(esperaCarregamento)
      tlEntrada.kill()
      destravarScroll()
    }
  }, [ativa])

  if (ativa !== true) return null

  return (
    <div
      ref={raiz}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-void"
      role="presentation"
    >
      <div
        ref={caixaVideo}
        className="relative aspect-square w-[min(76vw,540px)]"
        style={{ visibility: 'hidden' }}
      >
        <video
          ref={video}
          className="absolute inset-0 h-full w-full object-contain"
          src="/video/intro.mp4"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* É o último fotograma do próprio vídeo, com o fundo tornado
            transparente. Mesma resolução, mesmo `object-contain`, mesma
            caixa: no instante da troca não há nada que se desloque,
            redimensione ou mude de desenho. */}
        <div ref={logo} className="absolute inset-0 opacity-0">
          <Image
            src="/images/lode-logo-video.webp"
            alt=""
            aria-hidden
            fill
            priority
            sizes="(max-width: 768px) 76vw, 540px"
            className="object-contain"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => encerrarRef.current(true)}
        className="absolute bottom-10 right-8 text-[0.68rem] uppercase tracking-[0.32em] text-bone-dim transition-colors duration-300 hover:text-gold-light focus-visible:text-gold-light"
      >
        Saltar
      </button>
    </div>
  )
}
