import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { mensajeDeError } from '../api'

// Formulario con estado de envío y mensaje de error común a todas las pantallas de acceso.

interface Props {
  titulo: string
  subtitulo?: string
  boton: string
  onEnviar: (datos: FormData) => Promise<void>
  onVolver?: () => void
  children: ReactNode
  pie?: ReactNode
}

export function Formulario({ titulo, subtitulo, boton, onEnviar, onVolver, children, pie }: Props) {
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await onEnviar(new FormData(e.currentTarget))
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="centrado">
      <form className="tarjeta formulario" onSubmit={enviar}>
        {onVolver && (
          <button type="button" className="enlace volver" onClick={onVolver}>
            ← Volver
          </button>
        )}
        <h1>{titulo}</h1>
        {subtitulo && <p className="subtitulo">{subtitulo}</p>}
        {children}
        {error && (
          <p className="error-form" role="alert">
            {error}
          </p>
        )}
        <button className="primario" type="submit" disabled={enviando}>
          {enviando ? 'Un momento…' : boton}
        </button>
        {pie}
      </form>
    </main>
  )
}

export function Campo({ label, ...input }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="campo">
      <span>{label}</span>
      <input {...input} />
    </label>
  )
}
