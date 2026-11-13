import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ErrorApi, llamar, mensajeDeError } from '../api'
import { useAyudaVista } from '../ayudaVista'
import { Recorrido, type PasoRecorrido } from '../components/Recorrido'
import { Logo } from '../components/Robot'
import { cargarNiveles } from '../game/contenido'
import type { Nivel, Progreso } from '../game/types'
import { texto } from './datosFormulario'
import { Campo } from './Formulario'

// Panel del tutor: «Registrar alumno» (incluye «Otorgar consentimiento») y «Consultar progreso».

const RECORRIDO_TUTOR: PasoRecorrido[] = [
  {
    selector: '[data-recorrido="registrar"]',
    titulo: 'Registra a tu alumno',
    texto: 'Crea su cuenta con un usuario, una clave y su edad. Por privacidad no pedimos su nombre real ni su correo.',
  },
  {
    selector: '[data-recorrido="alumnos"]',
    titulo: 'Sigue su avance',
    texto: 'Aquí verás a cada alumno con su avance y su experiencia. Con «Ver progreso» revisas qué desafíos resolvió y en cuántos intentos.',
  },
  {
    selector: '[data-recorrido="ayuda-tutor"]',
    titulo: '¿Dudas?',
    texto: 'Puedes volver a ver esta guía cuando quieras desde aquí.',
  },
]

interface AlumnoResumen {
  id: string
  username: string
  edad: number
  xpTotal: number
  desafiosCompletados: number
  totalDesafios: number
}

interface Detalle {
  alumno: { id: string; username: string; edad: number }
  xpTotal: number
  nivelesCompletados: string[]
  registros: (Progreso & { xpObtenido: number })[]
}

interface Props {
  token: string
  username: string
  onSalir: () => void
}

export function PanelTutor({ token, username, onSalir }: Props) {
  const [alumnos, setAlumnos] = useState<AlumnoResumen[] | null>(null)
  const [niveles, setNiveles] = useState<Nivel[]>([])
  const [error, setError] = useState('')
  const [detalle, setDetalle] = useState<Detalle | null>(null)
  const [formAbierto, setFormAbierto] = useState(false)
  const [ayuda, marcarAyuda] = useAyudaVista(`tutor.${username}`)
  const [verRecorrido, setVerRecorrido] = useState(false)

  const manejarError = useCallback(
    (e: unknown) => {
      if (e instanceof ErrorApi && e.status === 401) return onSalir()
      setError(mensajeDeError(e))
    },
    [onSalir],
  )

  const recargar = useCallback(() => {
    llamar<AlumnoResumen[]>('/tutor/alumnos', { token })
      .then((a) => {
        setAlumnos(a)
        setError('')
      })
      .catch(manejarError)
  }, [token, manejarError])

  useEffect(() => {
    recargar()
    cargarNiveles()
      .then((c) => setNiveles(c.niveles))
      .catch(() => setNiveles([]))
  }, [recargar])

  const verProgreso = (id: string) =>
    llamar<Detalle>(`/tutor/alumnos/${id}/progreso`, { token }).then(setDetalle).catch(manejarError)

  return (
    <div className="pagina">
      <header className="barra">
        <Logo />
        <span className="rol">Panel del tutor</span>
        <span className="usuario">🛡️ {username}</span>
        <button data-recorrido="ayuda-tutor" onClick={() => setVerRecorrido(true)}>
          Ayuda
        </button>
        <button onClick={onSalir}>Cerrar sesión</button>
      </header>

      <main className="panel-tutor">
        <section className="tarjeta" data-recorrido="alumnos">
          <div className="titulo-seccion">
            <h2>Mis alumnos</h2>
            <button className="primario" data-recorrido="registrar" onClick={() => setFormAbierto((v) => !v)}>
              {formAbierto ? 'Cancelar' : '+ Registrar alumno'}
            </button>
          </div>

          {formAbierto && (
            <RegistroAlumno
              token={token}
              onRegistrado={() => {
                setFormAbierto(false)
                recargar()
              }}
            />
          )}

          {error && <p className="error-form">{error}</p>}
          {alumnos === null && !error && <p>Cargando…</p>}
          {alumnos?.length === 0 && !formAbierto && (
            <div className="como-empezar">
              <h3>Cómo empezar</h3>
              <ol>
                <li>
                  Presiona <strong>+ Registrar alumno</strong> y crea su usuario y clave.
                </li>
                <li>
                  Entrégale esos datos: el alumno entra en CodeWorld con <strong>Soy alumno</strong>.
                </li>
                <li>
                  Vuelve a este panel para ver su avance con <strong>Ver progreso</strong>.
                </li>
              </ol>
            </div>
          )}
          {alumnos && alumnos.length > 0 && (
            <table className="tabla">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Edad</th>
                  <th>Avance</th>
                  <th>XP</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {alumnos.map((a) => (
                  <tr key={a.id} className={detalle?.alumno.id === a.id ? 'seleccionado' : ''}>
                    <td>{a.username}</td>
                    <td>{a.edad}</td>
                    <td>
                      <BarraAvance valor={a.desafiosCompletados} total={a.totalDesafios} />
                    </td>
                    <td>⭐ {a.xpTotal}</td>
                    <td>
                      <button onClick={() => verProgreso(a.id)}>Ver progreso</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {detalle && <DetalleProgreso detalle={detalle} niveles={niveles} onCerrar={() => setDetalle(null)} />}
      </main>
      {(verRecorrido || !ayuda.tutor) && (
        <Recorrido
          pasos={RECORRIDO_TUTOR}
          onTerminar={() => {
            setVerRecorrido(false)
            marcarAyuda({ tutor: true })
          }}
        />
      )}
    </div>
  )
}

function BarraAvance({ valor, total }: { valor: number; total: number }) {
  return (
    <div className="avance" title={`${valor} de ${total} desafíos`}>
      <div className="avance-relleno" style={{ width: `${total ? (100 * valor) / total : 0}%` }} />
      <span>
        {valor}/{total}
      </span>
    </div>
  )
}

function RegistroAlumno({ token, onRegistrado }: { token: string; onRegistrado: () => void }) {
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = new FormData(e.currentTarget)
    setEnviando(true)
    setError('')
    try {
      await llamar('/alumnos', {
        metodo: 'POST',
        token,
        cuerpo: {
          username: texto(d, 'username'),
          password: String(d.get('password')),
          edad: Number(d.get('edad')),
          consentimiento: d.get('consentimiento') === 'on',
        },
      })
      onRegistrado()
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="registro-alumno" onSubmit={enviar}>
      <p className="subtitulo">
        Por privacidad no pedimos el nombre real ni el correo del alumno: solo un usuario, una clave y su edad.
      </p>
      <div className="fila-campos">
        <Campo label="Usuario del alumno" name="username" required minLength={3} placeholder="p. ej. gato_rapido" />
        <Campo label="Clave" name="password" type="password" required minLength={6} autoComplete="new-password" />
        <Campo label="Edad" name="edad" type="number" min={9} max={15} required />
      </div>
      <label className="consentimiento">
        <input type="checkbox" name="consentimiento" required />
        <span>
          Soy el tutor legal de este alumno y autorizo su uso de CodeWorld. Entiendo que se registrará su progreso
          asociado a un identificador anónimo, conforme a la Ley N.º 19.628.
        </span>
      </label>
      {error && <p className="error-form">{error}</p>}
      <button className="primario" disabled={enviando}>
        {enviando ? 'Registrando…' : 'Registrar alumno'}
      </button>
    </form>
  )
}

function DetalleProgreso({ detalle, niveles, onCerrar }: { detalle: Detalle; niveles: Nivel[]; onCerrar: () => void }) {
  const hechos = new Map(detalle.registros.map((r) => [r.desafioId, r]))
  return (
    <section className="tarjeta">
      <div className="titulo-seccion">
        <h2>Progreso de {detalle.alumno.username}</h2>
        <button onClick={onCerrar}>Cerrar</button>
      </div>
      <p>
        ⭐ <strong>{detalle.xpTotal} XP</strong> · {detalle.registros.length} desafíos completados ·{' '}
        {detalle.nivelesCompletados.length} niveles completos
      </p>
      {niveles.map((n) => (
        <div key={n.id} className="nivel-detalle">
          <h3>
            {detalle.nivelesCompletados.includes(n.id) ? '✅' : '⏳'} Nivel {n.orden}: {n.titulo}
          </h3>
          <ul>
            {n.desafios.map((d) => {
              const r = hechos.get(d.id)
              return (
                <li key={d.id} className={r ? 'hecho' : ''}>
                  <span>{d.titulo}</span>
                  <span className="dato">
                    {r
                      ? `+${r.xpObtenido} XP · ${r.intentos} ${r.intentos === 1 ? 'intento' : 'intentos'} · ${new Date(r.completadoEn).toLocaleDateString('es-CL')}`
                      : 'pendiente'}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}
