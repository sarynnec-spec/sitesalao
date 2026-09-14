/**
 * Pino de localização — dourado, com volume e a flutuar.
 *
 * O volume não vem de um `filter: drop-shadow` genérico: vem da rampa
 * metálica completa do sistema (sombra → meio-tom → luz → especular)
 * aplicada na diagonal, mais um brilho especular no canto superior
 * esquerdo e um rebordo escuro em baixo à direita. É a mesma lógica do
 * `metal-text` do resto do site — um tom só faria um pino amarelo
 * chapado.
 *
 * Tudo é SVG e CSS. Uma cena 3D a sério (three.js) custaria centenas de
 * kB de runtime para um elemento de 70 px que nunca roda.
 */
export function PinoMapa({ className }: { className?: string }) {
  return (
    <span aria-hidden className={className}>
      <span className="pino-cena relative block h-[72px] w-[72px]">
        {/* ---- Halos no chão ----
            Duas ondas desfasadas a abrir a partir da base. São o que
            lê como "aqui" — o pino sozinho seria só um ícone. */}
        <span className="pino-halo" style={{ animationDelay: '0s' }} />
        <span className="pino-halo" style={{ animationDelay: '1.3s' }} />

        {/* ---- Sombra projectada ----
            Encolhe quando o pino sobe e alarga quando desce: é a
            sombra que vende a altura, não o deslocamento em si. */}
        <span className="pino-sombra" />

        {/* ---- Corpo ---- */}
        <svg
          viewBox="0 0 64 88"
          className="pino-corpo absolute inset-x-0 top-0 mx-auto h-[62px] w-[62px] overflow-visible"
        >
          <defs>
            {/* Rampa metálica na diagonal: luz em cima à esquerda,
                sombra profunda em baixo à direita. */}
            <linearGradient id="pino-metal" x1="18%" y1="4%" x2="86%" y2="94%">
              <stop offset="0%" stopColor="#fff5c1" />
              <stop offset="18%" stopColor="#fbd87a" />
              <stop offset="46%" stopColor="#ce9a44" />
              <stop offset="76%" stopColor="#836330" />
              <stop offset="100%" stopColor="#583701" />
            </linearGradient>

            {/* Especular: mancha de luz, não um branco sólido. */}
            <radialGradient id="pino-brilho" cx="34%" cy="24%" r="42%">
              <stop offset="0%" stopColor="#fff5c1" stopOpacity="0.92" />
              <stop offset="60%" stopColor="#fbd87a" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#fbd87a" stopOpacity="0" />
            </radialGradient>

            {/* Furo central: escurece para o fundo, como uma cavidade. */}
            <radialGradient id="pino-furo" cx="42%" cy="34%" r="72%">
              <stop offset="0%" stopColor="#1a1917" />
              <stop offset="70%" stopColor="#070707" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
          </defs>

          {/* Corpo em gota. */}
          <path
            d="M32 1.5C16.8 1.5 4.5 13.8 4.5 29c0 8.6 5 18.9 11 27.7 4.7 6.9 9.7 12.6 12.5 15.7l4 4.4 4-4.4c2.8-3.1 7.8-8.8 12.5-15.7 6-8.8 11-19.1 11-27.7 0-15.2-12.3-27.5-27.5-27.5z"
            fill="url(#pino-metal)"
          />
          {/* Rebordo claro só no lado iluminado. */}
          <path
            d="M32 1.5C16.8 1.5 4.5 13.8 4.5 29c0 8.6 5 18.9 11 27.7"
            fill="none"
            stroke="#fff5c1"
            strokeOpacity="0.55"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Especular por cima do metal. */}
          <ellipse cx="24" cy="22" rx="15" ry="13" fill="url(#pino-brilho)" />

          {/* Cavidade central. */}
          <circle cx="32" cy="28.5" r="10.5" fill="url(#pino-furo)" />
          <circle
            cx="32"
            cy="28.5"
            r="10.5"
            fill="none"
            stroke="#583701"
            strokeOpacity="0.9"
            strokeWidth="1"
          />
          {/* Fio de luz no bordo superior da cavidade — é o que faz o
              furo parecer fundo e não um círculo pintado. */}
          <path
            d="M23.4 22.6a10.5 10.5 0 0 1 12.2-3.4"
            fill="none"
            stroke="#fbd87a"
            strokeOpacity="0.5"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <style>{`
        .pino-cena { transform-style: preserve-3d; }

        .pino-corpo {
          transform-origin: 50% 100%;
          animation: pino-flutuar 3.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
          filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.75));
        }

        .pino-sombra {
          position: absolute;
          left: 50%;
          bottom: 2px;
          width: 30px;
          height: 8px;
          margin-left: -15px;
          border-radius: 9999px;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 72%);
          animation: pino-sombra 3.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }

        .pino-halo {
          position: absolute;
          left: 50%;
          bottom: -4px;
          width: 54px;
          height: 18px;
          margin-left: -27px;
          border-radius: 9999px;
          border: 1px solid #ce9a44;
          opacity: 0;
          animation: pino-halo 2.6s ease-out infinite;
        }

        @keyframes pino-flutuar {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-9px) scale(1.02); }
        }

        @keyframes pino-sombra {
          0%, 100% { transform: scaleX(1);    opacity: 0.85; }
          50%      { transform: scaleX(0.62); opacity: 0.42; }
        }

        /* Halo contido de propósito: a 0.65 o anel espalhava luz pela
           fotografia à volta e o mapa deixava de parecer uma
           fotografia — parecia iluminado por dentro. */
        @keyframes pino-halo {
          0%   { transform: scale(0.5); opacity: 0; }
          18%  { opacity: 0.34; }
          100% { transform: scale(1.7); opacity: 0; }
        }

        /* Ao passar o rato no cartão, o pino levanta e o metal acende. */
        .grupo-mapa:hover .pino-corpo {
          animation-play-state: paused;
          transform: translateY(-13px) scale(1.1);
          filter: drop-shadow(0 14px 18px rgba(0, 0, 0, 0.8)) brightness(1.12);
          transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1), filter 600ms ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .pino-corpo, .pino-sombra, .pino-halo { animation: none; }
          .pino-halo { opacity: 0.3; }
          .grupo-mapa:hover .pino-corpo { transform: none; }
        }
      `}</style>
    </span>
  )
}
