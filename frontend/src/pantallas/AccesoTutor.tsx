import { useEffect, useState } from 'react'
import { ErrorApi, llamar, mensajeDeError } from '../api'
import type { Sesion } from '../sesion'
import { texto } from './datosFormulario'
import { Campo, Formulario } from './Formulario'

// Caso de uso «Autenticarse (doble factor)»: contraseña y luego código enviado al contacto del tutor.

interface Props {
  onSesion: (s: Sesion) => void
  onVolver: () => void
}

interface Desafio2fa {
  desafio2fa: string
  enviadoA: string
  /** Segundos que hay que esperar para pedir otro código. */
  esperaReenvio: number
}

type Paso = { tipo: 'login'; aviso?: string } | { tipo: 'registro' } | ({ tipo: 'codigo'; username: string; aviso?: string } & Desafio2fa)

/** El servidor pide volver a iniciar sesión cuando el código se agotó, venció o ya se usó. */
const hayQueReiniciar = (e: unknown) => e instanceof ErrorApi && e.datos.reiniciar === true

export function AccesoTutor({ onSesion, onVolver }: Props) {
  const [paso, setPaso] = useState<Paso>({ tipo: 'login' })

  const iniciar = async (d: FormData) => {
    const username = texto(d, 'username')
    const r = await llamar<Desafio2fa>('/auth/tutor/login', {
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
      try {
        const r = await llamar<{ token: string; username: string }>('/auth/tutor/verificar', {
          metodo: 'POST',
          cuerpo: { desafio2fa: paso.desafio2fa, codigo: texto(d, 'codigo') },
        })
        onSesion({ rol: 'tutor', token: r.token, username: r.username })
      } catch (e) {
        if (!hayQueReiniciar(e)) throw e
        setPaso({ tipo: 'login', aviso: mensajeDeError(e) })
      }
    }
    return (
      <Formulario
        key={paso.desafio2fa}
        titulo="Verificación en dos pasos"
        subtitulo={paso.aviso ?? `Enviamos un código de 6 dígitos a ${paso.enviadoA}. Vence en 10 minutos.`}
        boton="Verificar"
        onEnviar={verificar}
        onVolver={() => setPaso({ tipo: 'login' })}
        pie={
          <ReenviarCodigo
            key={paso.desafio2fa}
            desafio2fa={paso.desafio2fa}
            espera={paso.esperaReenvio}
            onNuevo={(r) => setPaso({ ...paso, ...r, aviso: `Te enviamos un código nuevo a ${r.enviadoA}. El anterior ya no sirve.` })}
            onReiniciar={(aviso) => setPaso({ tipo: 'login', aviso })}
          />
        }
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

/** Botón «Reenviar código» con cuenta regresiva (riesgo R6). */
function ReenviarCodigo({
  desafio2fa,
  espera,
  onNuevo,
  onReiniciar,
}: {
  desafio2fa: string
  espera: number
  onNuevo: (r: Desafio2fa) => void
  onReiniciar: (aviso: string) => void
}) {
  const [listoEn, setListoEn] = useState(() => Date.now() + espera * 1000)
  const [ahora, setAhora] = useState(() => Date.now())
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const falta = Math.max(0, Math.ceil((listoEn - ahora) / 1000))

  useEffect(() => {
    if (falta === 0) return
    const t = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(t)
  }, [falta])

  const reenviar = async () => {
    setError('')
    setEnviando(true)
    try {
      onNuevo(await llamar<Desafio2fa>('/auth/tutor/reenviar', { metodo: 'POST', cuerpo: { desafio2fa } }))
    } catch (e) {
      if (hayQueReiniciar(e)) return onReiniciar(mensajeDeError(e))
      const segundos = e instanceof ErrorApi ? Number(e.datos.esperaReenvio) : NaN
      if (segundos > 0) {
        setAhora(Date.now())
        setListoEn(Date.now() + segundos * 1000)
      }
      setError(mensajeDeError(e))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="pie-form reenviar">
      ¿No te llegó?{' '}
      <button type="button" className="enlace" onClick={reenviar} disabled={falta > 0 || enviando}>
        {falta > 0 ? `Reenviar código en ${falta} s` : enviando ? 'Enviando…' : 'Reenviar código'}
      </button>
      {error && (
        <p className="error-form" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
