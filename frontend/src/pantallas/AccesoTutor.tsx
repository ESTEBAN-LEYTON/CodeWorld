import { useState } from 'react'
import { llamar } from '../api'
import type { Sesion } from '../sesion'
import { texto } from './datosFormulario'
import { Campo, Formulario } from './Formulario'

// Caso de uso «Autenticarse (doble factor)»: contraseña y luego código enviado al contacto del tutor.

interface Props {
  onSesion: (s: Sesion) => void
  onVolver: () => void
}

type Paso = { tipo: 'login'; aviso?: string } | { tipo: 'registro' } | { tipo: 'codigo'; desafio2fa: string; enviadoA: string; username: string }

export function AccesoTutor({ onSesion, onVolver }: Props) {
  const [paso, setPaso] = useState<Paso>({ tipo: 'login' })

  const iniciar = async (d: FormData) => {
    const username = texto(d, 'username')
    const r = await llamar<{ desafio2fa: string; enviadoA: string }>('/auth/tutor/login', {
      metodo: 'POST',
      cuerpo: { username, password: String(d.get('password')) },
    })
    setPaso({ tipo: 'codigo', ...r, username })
  }

  const registrar = async (d: FormData) => {
    if (d.get('password') !== d.get('password2')) throw new Error('Las contraseñas no coinciden.')
    await llamar('/auth/tutor/registro', {
      metodo: 'POST',
      cuerpo: { username: texto(d, 'username'), password: String(d.get('password')), contacto: texto(d, 'contacto') },
    })
    setPaso({ tipo: 'login', aviso: 'Cuenta creada. Ahora inicia sesión.' })
  }

  if (paso.tipo === 'codigo') {
    const verificar = async (d: FormData) => {
      const r = await llamar<{ token: string; username: string }>('/auth/tutor/verificar', {
        metodo: 'POST',
        cuerpo: { desafio2fa: paso.desafio2fa, codigo: texto(d, 'codigo') },
      })
      onSesion({ rol: 'tutor', token: r.token, username: r.username })
    }
    return (
      <Formulario
        titulo="Verificación en dos pasos"
        subtitulo={`Enviamos un código de 6 dígitos a ${paso.enviadoA}. Vence en 10 minutos.`}
        boton="Verificar"
        onEnviar={verificar}
        onVolver={() => setPaso({ tipo: 'login' })}
      >
        <Campo label="Código" name="codigo" inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="one-time-code" required autoFocus />
      </Formulario>
    )
  }

  if (paso.tipo === 'registro') {
    return (
      <Formulario
        titulo="Crear cuenta de tutor"
        subtitulo="Solo el adulto responsable crea la cuenta. Del alumno no pedimos nombre real ni correo."
        boton="Crear cuenta"
        onEnviar={registrar}
        onVolver={() => setPaso({ tipo: 'login' })}
      >
        <Campo label="Usuario" name="username" autoComplete="username" required minLength={3} autoFocus />
        <Campo label="Correo (recibe el código de verificación)" name="contacto" type="email" autoComplete="email" required />
        <Campo label="Contraseña" name="password" type="password" autoComplete="new-password" required minLength={6} />
        <Campo label="Repite la contraseña" name="password2" type="password" autoComplete="new-password" required minLength={6} />
      </Formulario>
    )
  }

  return (
    <Formulario
      titulo="Acceso de tutores"
      subtitulo={paso.aviso}
      boton="Continuar"
      onEnviar={iniciar}
      onVolver={onVolver}
      pie={
        <p className="pie-form">
          ¿No tienes cuenta?{' '}
          <button type="button" className="enlace" onClick={() => setPaso({ tipo: 'registro' })}>
            Crear cuenta de tutor
          </button>
        </p>
      }
    >
      <Campo label="Usuario" name="username" autoComplete="username" required autoFocus />
      <Campo label="Contraseña" name="password" type="password" autoComplete="current-password" required />
    </Formulario>
  )
}
