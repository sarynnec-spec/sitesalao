/**
 * Ícone do Facebook.
 *
 * Pela mesma razão do Instagram: o lucide-react v1 retirou os ícones de
 * marca. Mantém o traço de 1.25 e a grelha de 24 do resto do conjunto.
 */
export function IconeFacebook({
  size = 16,
  strokeWidth = 1.25,
  className,
}: {
  size?: number
  strokeWidth?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}
