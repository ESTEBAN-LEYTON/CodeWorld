import { llamar } from '../api'
import type { Sesion } from '../sesion'
import { texto } from './datosFormulario'
import { Campo, Formulario } from './Formulario'

interface Props {
  onSesion: (s: Sesion) => void
  onVolver: () => void
}

export function AccesoAlumno({ onSesion, onVolver }: Props) {
  const entrar = async (d: FormData) => {
    const r = await llamar<{ token: string; alumno: { id: string; username: string } }>('/auth/alumno/login', {
      metodo: 'POST',
      cuerpo: { username: texto(d, 'username'), password: String(d.get('password')) },
    })
    onSesion({ rol: 'alumno', token: r.token, alumnoId: r.alumno.id, username: r.alumno.username })
  }

  return (
    <Formulario titulo="¡Hola!" subtitulo="Escribe tu usuario y tu clave." boton="Entrar a jugar" onEnviar={entrar} onVolver={onVolver}>
      <Campo label="Usuario" name="username" autoComplete="username" required autoFocus />
      <Campo label="Clave" name="password" type="password" autoComplete="current-password" required />
    </Formulario>
  )
}
