import type { Direccion, Laberinto, Posicion } from '../game/types'

const ROTACION: Record<Direccion, number> = { N: -90, E: 0, S: 90, O: 180 }

interface Props {
  laberinto: Laberinto
  robot: Posicion
  chocado: boolean
}

export function MazeView({ laberinto, robot, chocado }: Props) {
  const columnas = laberinto.celdas[0].length
  return (
    <div
      className="laberinto"
      style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}
      role="img"
      aria-label="Laberinto del desafío"
    >
      {laberinto.celdas.flatMap((fila, f) =>
        [...fila].map((c, col) => {
          const esRobot = robot.fila === f && robot.col === col
          return (
            <div key={`${f}-${col}`} className={`celda ${c === '#' ? 'pared' : 'camino'}`}>
              {c === 'M' && !esRobot && <span className="meta">★</span>}
              {esRobot && (
                <span
                  className={`robot ${chocado ? 'chocado' : ''}`}
                  style={{ transform: `rotate(${ROTACION[robot.dir]}deg)` }}
                >
                  ➤
                </span>
              )}
            </div>
          )
        }),
      )}
    </div>
  )
}
