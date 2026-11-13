import { MazeView } from '../components/MazeView'
import { Logo } from '../components/Robot'
import type { Laberinto } from '../game/types'

// Portada: presenta el juego con un laberinto de ejemplo y separa la entrada del alumno y la del tutor.

const EJEMPLO: Laberinto = { celdas: ['#####', '#I..#', '###.#', '#M..#', '#####'], dirInicial: 'E' }

interface Props {
  onAlumno: () => void
  onTutor: () => void
}

export function Inicio({ onAlumno, onTutor }: Props) {
  return (
    <main className="centrado portada-fondo">
      <div className="portada">
        <div className="portada-texto">
          <Logo grande />
          <p className="lema">
            Aprende a programar <strong>jugando</strong>: arma programas con bloques y guía al robot hasta la estrella.
          </p>
          <ul className="ventajas">
            <li>🧩 Sin escribir código</li>
            <li>💡 Pistas cuando te equivocas</li>
            <li>📴 Funciona sin internet</li>
          </ul>
        </div>
        <div className="portada-dibujo" aria-hidden>
          <MazeView laberinto={EJEMPLO} robot={{ fila: 1, col: 1, dir: 'E' }} chocado={false} mini />
        </div>
        <div className="opciones">
          <button className="opcion opcion-alumno" onClick={onAlumno}>
            <span className="icono" aria-hidden>🎮</span>
            <strong>Soy alumno</strong>
            <small>Entra con el usuario que te dio tu tutor</small>
          </button>
          <button className="opcion" onClick={onTutor}>
            <span className="icono" aria-hidden>🛡️</span>
            <strong>Soy tutor</strong>
            <small>Registra alumnos y revisa su progreso</small>
          </button>
        </div>
      </div>
    </main>
  )
}
