import { AYUDA_BLOQUES } from '../game/ayudaBloques'
import type { Desafio, Nivel } from '../game/types'

// Menú principal del alumno: elige el nivel (la «clase») y el desafío que quiere jugar.

interface Props {
  username: string
  niveles: Nivel[]
  completados: string[]
  nuevos: Map<string, string[]>
  onJugar: (desafioId: string) => void
}

export function MenuAlumno({ username, niveles, completados, nuevos, onJugar }: Props) {
  const hecho = (d: Desafio) => completados.includes(d.id)
  const todos = niveles.flatMap((n) => n.desafios)
  const siguiente = todos.find((d) => !hecho(d))

  return (
    <main className="menu-alumno">
      <section className="saludo">
        <div>
          <h2>¡Hola, {username}! 👋</h2>
          <p className="subtitulo">
            {siguiente ? '¿Qué quieres aprender hoy? Elige un nivel o sigue donde quedaste.' : '¡Completaste todos los desafíos! Puedes repetir el que quieras.'}
          </p>
        </div>
        {siguiente && (
          <button className="primario grande" data-recorrido="continuar" onClick={() => onJugar(siguiente.id)}>
            {completados.length ? 'Continuar donde quedé' : 'Empezar a jugar'} →
          </button>
        )}
      </section>

      <div className="niveles-grid">
        {niveles.map((n) => {
          const listos = n.desafios.filter(hecho).length
          const bloques = n.desafios.flatMap((d) => nuevos.get(d.id) ?? [])
          const pendiente = n.desafios.find((d) => !hecho(d)) ?? n.desafios[0]
          return (
            <article key={n.id} className={`tarjeta-nivel ${listos === n.desafios.length ? 'completo' : ''}`}>
              <p className="etiqueta-nivel">Nivel {n.orden}</p>
              <h3>{n.titulo}</h3>
              <p className="subtitulo">{n.descripcion}</p>
              {bloques.length > 0 && (
                <p className="bloques-nivel">
                  Aprenderás:{' '}
                  {bloques.map((b) => (
                    <span key={b} className="chip-bloque">
                      {AYUDA_BLOQUES[b]?.nombre ?? b}
                    </span>
                  ))}
                </p>
              )}
              <div className="avance" title={`${listos} de ${n.desafios.length} desafíos`}>
                <div className="avance-relleno" style={{ width: `${(100 * listos) / n.desafios.length}%` }} />
                <span>
                  {listos}/{n.desafios.length}
                </span>
              </div>
              <ol className="lista-desafios">
                {n.desafios.map((d) => (
                  <li key={d.id}>
                    <button className={hecho(d) ? 'hecho' : ''} onClick={() => onJugar(d.id)}>
                      <span>{hecho(d) ? '✅' : '▶'}</span> {d.titulo}
                      <small>+{d.xpRecompensa} XP</small>
                    </button>
                  </li>
                ))}
              </ol>
              {pendiente && (
                <button className="primario" onClick={() => onJugar(pendiente.id)}>
                  {listos === n.desafios.length ? 'Repasar' : listos ? 'Continuar' : 'Empezar'}
                </button>
              )}
            </article>
          )
        })}
      </div>
    </main>
  )
}
