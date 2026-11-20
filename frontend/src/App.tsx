import { useCallback, useState } from 'react'
import { AccesoAlumno } from './pantallas/AccesoAlumno'
import { AccesoTutor } from './pantallas/AccesoTutor'
import { Inicio } from './pantallas/Inicio'
import { Juego } from './pantallas/Juego'
import { PanelTutor } from './pantallas/PanelTutor'
import { ResultadosValidacion } from './pantallas/ResultadosValidacion'
import { Validacion } from './pantallas/Validacion'
import { cerrarSesion, guardarSesion, leerSesion, type Sesion } from './sesion'

type Pantalla = 'inicio' | 'acceso-alumno' | 'acceso-tutor'

export default function App() {
  // TEMPORAL: validación con cliente simulado (docs/validacion.md). No usa ni toca la sesión del juego.
  const ruta = window.location.pathname.replace(/\/+$/, '')
  if (ruta === '/validacion') return <Validacion />
  if (ruta === '/validacion/resultados') return <ResultadosValidacion />
  return <AppJuego />
}

function AppJuego() {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion)
  const [pantalla, setPantalla] = useState<Pantalla>('inicio')

  const entrar = (s: Sesion) => {
    guardarSesion(s)
    setSesion(s)
  }
  const salir = useCallback(() => {
    cerrarSesion()
    setSesion(null)
    setPantalla('inicio')
  }, [])

  if (sesion?.rol === 'alumno') {
    return <Juego token={sesion.token} alumnoId={sesion.alumnoId} username={sesion.username} onSalir={salir} />
  }
  if (sesion?.rol === 'tutor') {
    return <PanelTutor token={sesion.token} username={sesion.username} onSalir={salir} />
  }
  if (pantalla === 'acceso-alumno') return <AccesoAlumno onSesion={entrar} onVolver={() => setPantalla('inicio')} />
  if (pantalla === 'acceso-tutor') return <AccesoTutor onSesion={entrar} onVolver={() => setPantalla('inicio')} />
  return <Inicio onAlumno={() => setPantalla('acceso-alumno')} onTutor={() => setPantalla('acceso-tutor')} />
}
