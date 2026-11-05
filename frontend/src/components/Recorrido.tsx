import { useEffect, useState, type CSSProperties } from 'react'

// Tutorial guiado: oscurece la pantalla, resalta un elemento y explica para qué sirve.

export interface PasoRecorrido {
  /** Selector CSS del elemento a resaltar; si no existe, la explicación se muestra al centro. */
  selector: string
  titulo: string
  texto: string
}

interface Props {
  pasos: PasoRecorrido[]
  onTerminar: () => void
}

const MARGEN = 8
const ALTO_TARJETA = 230
const ANCHO_TARJETA = 352

function posicionTarjeta(rect: DOMRect | null): CSSProperties {
  if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  const left = Math.max(12, Math.min(rect.left, window.innerWidth - ANCHO_TARJETA))
  if (rect.bottom + ALTO_TARJETA < window.innerHeight) return { top: rect.bottom + MARGEN + 10, left }
  if (rect.top - ALTO_TARJETA > 0) return { bottom: window.innerHeight - rect.top + MARGEN + 10, left }
  // El elemento ocupa casi toda la pantalla: la explicación va dentro de él, en la esquina inferior derecha.
  return {
    bottom: Math.max(window.innerHeight - rect.bottom, 0) + 24,
    left: Math.max(12, Math.min(rect.right, window.innerWidth) - ANCHO_TARJETA - 24),
  }
}

export function Recorrido({ pasos, onTerminar }: Props) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const paso = pasos[i]

  useEffect(() => {
    const el = document.querySelector(paso.selector)
    const medir = () => setRect(el ? el.getBoundingClientRect() : null)
    el?.scrollIntoView({ block: 'nearest' })
    const id = requestAnimationFrame(medir)
    // Si la página se desplaza o cambia de tamaño, el resaltado sigue al elemento.
    window.addEventListener('resize', medir)
    window.addEventListener('scroll', medir, true)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', medir)
      window.removeEventListener('scroll', medir, true)
    }
  }, [paso])

  const ultimo = i === pasos.length - 1

  return (
    <div className="recorrido" role="dialog" aria-modal="true" aria-label={paso.titulo}>
      {rect ? (
        <div
          className="foco"
          style={{ top: rect.top - MARGEN, left: rect.left - MARGEN, width: rect.width + 2 * MARGEN, height: rect.height + 2 * MARGEN }}
        />
      ) : (
        <div className="foco-vacio" />
      )}
      <div className="tarjeta-recorrido" style={posicionTarjeta(rect)}>
        <p className="contador">
          Paso {i + 1} de {pasos.length}
        </p>
        <h3>{paso.titulo}</h3>
        <p>{paso.texto}</p>
        <div className="acciones">
          {!ultimo && (
            <button className="enlace" onClick={onTerminar}>
              Saltar
            </button>
          )}
          <span className="espacio" />
          {i > 0 && <button onClick={() => setI(i - 1)}>Anterior</button>}
          <button className="primario" onClick={() => (ultimo ? onTerminar() : setI(i + 1))} autoFocus>
            {ultimo ? '¡Entendido!' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}
