// Robot de CodeWorld visto desde arriba, mirando hacia la derecha (Este); MazeView lo rota según su dirección.
// El cuerpo usa currentColor para que el CSS lo pinte rojo cuando choca.

export function Robot({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden focusable="false">
      <rect x="9" y="3" width="26" height="8" rx="3" fill="#1e1b4b" />
      <rect x="9" y="37" width="26" height="8" rx="3" fill="#1e1b4b" />
      <rect x="5" y="9" width="36" height="30" rx="10" fill="currentColor" />
      <rect x="5" y="9" width="36" height="13" rx="10" fill="#fff" opacity="0.18" />
      <rect x="25" y="14" width="13" height="20" rx="5" fill="#e0e7ff" />
      <circle cx="32" cy="19.5" r="2.8" fill="#1e1b4b" />
      <circle cx="32" cy="28.5" r="2.8" fill="#1e1b4b" />
      <circle cx="33" cy="18.6" r="0.9" fill="#fff" />
      <circle cx="33" cy="27.6" r="0.9" fill="#fff" />
      <circle cx="14" cy="24" r="3.5" fill="#facc15" stroke="#1e1b4b" strokeWidth="1.2" />
    </svg>
  )
}

/** Nombre de la app con el robot; «grande» es la versión de la portada. */
export function Logo({ grande = false }: { grande?: boolean }) {
  return (
    <h1 className={grande ? 'logo' : 'logo-barra'}>
      <Robot className="logo-robot" />
      <span>
        Code<span className="logo-acento">World</span>
      </span>
    </h1>
  )
}
