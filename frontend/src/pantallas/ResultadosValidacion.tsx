import { useState } from 'react'
import { Campo, Formulario } from './Formulario'
import { ABIERTAS, LIKERT } from './Validacion'

// TEMPORAL (validación con cliente simulado). Se abre en /validacion/resultados con VALIDACION_CLAVE.
// Calcula las métricas de la planilla de resultados y descarga las respuestas en CSV.

interface Respuesta {
  codigo: string
  creadoEn: string
  perfil: { rol: string; experiencia: string; trabajaConNinos: boolean; dispositivo: string; navegador: string }
  desafios: {
    id: string
    titulo: string
    resuelto: boolean
    intentos: number
    patrones: string[]
    msHastaPrimeraEjecucion: number | null
    msHastaResolver: number | null
  }[]
  msTotal: number
  ayudaExterna: 'no' | 'una' | 'varias'
  likert: Record<string, number | null>
  abiertas: Record<string, string>
}

const CINCO_MIN = 5 * 60_000

const pct = (n: number, d: number) => (d ? `${Math.round((100 * n) / d)}% (${n} de ${d})` : '—')
const minutos = (ms: number | null) => (ms === null ? '' : (ms / 60_000).toFixed(1).replace('.', ','))

function mediana(valores: number[]) {
  if (!valores.length) return null
  const v = [...valores].sort((a, b) => a - b)
  const m = Math.floor(v.length / 2)
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2
}

function promedio(valores: number[]) {
  return valores.length ? (valores.reduce((s, x) => s + x, 0) / valores.length).toFixed(1).replace('.', ',') : '—'
}

function metricas(rs: Respuesta[]) {
  const n = rs.length
  const primero = rs.map((r) => r.desafios[0])
  const conError = rs.flatMap((r) => r.desafios.filter((d) => d.patrones.length > 0))
  const enMovil = rs.filter((r) => r.perfil.dispositivo !== 'computador')
  return [
    {
      metrica: 'Empieza a programar el primer desafío en 5 min o menos (OE1)',
      calculo: 'Primera ejecución del desafío 1, contada desde que acepta el consentimiento',
      criterio: '80% o más',
      resultado: pct(primero.filter((d) => d.msHastaPrimeraEjecucion !== null && d.msHastaPrimeraEjecucion <= CINCO_MIN).length, n),
    },
    {
      metrica: 'Resuelve el primer desafío sin ayuda externa (OE4, proxy)',
      calculo: 'Desafío 1 resuelto y respondió que nadie lo ayudó',
      criterio: '80% o más',
      resultado: pct(rs.filter((r) => r.desafios[0].resuelto && r.ayudaExterna === 'no').length, n),
    },
    {
      metrica: 'Resuelve los 3 desafíos sin ayuda externa',
      calculo: 'Todos los desafíos resueltos y nadie lo ayudó',
      criterio: 'Sin criterio',
      resultado: pct(rs.filter((r) => r.desafios.every((d) => d.resuelto) && r.ayudaExterna === 'no').length, n),
    },
    {
      metrica: 'Corrige después de una pista (OE3)',
      calculo: 'Desafíos con al menos un error que terminaron resueltos',
      criterio: '80% o más',
      resultado: pct(conError.filter((d) => d.resuelto).length, conError.length),
    },
    {
      metrica: 'Resuelve el primer desafío en celular o tableta (OE2)',
      calculo: 'Entre quienes usaron celular o tableta',
      criterio: '95% o más',
      resultado: pct(enMovil.filter((r) => r.desafios[0].resuelto).length, enMovil.length),
    },
    {
      metrica: 'Tiempo mediano hasta la primera ejecución del desafío 1',
      calculo: 'Mediana, en minutos',
      criterio: 'Sin criterio',
      resultado: minutos(mediana(primero.map((d) => d.msHastaPrimeraEjecucion).filter((x): x is number => x !== null))) || '—',
    },
  ]
}

function aCsv(rs: Respuesta[]) {
  const max = Math.max(0, ...rs.map((r) => r.desafios.length))
  const cab = ['codigo', 'fecha', 'rol', 'experiencia', 'trabaja_con_ninos', 'dispositivo', 'navegador', 'minutos_total', 'ayuda_externa']
  for (let i = 1; i <= max; i++)
    cab.push(`d${i}_id`, `d${i}_resuelto`, `d${i}_intentos`, `d${i}_patrones`, `d${i}_min_primera_ejecucion`, `d${i}_min_resolver`)
  cab.push(...LIKERT.map((l) => l.id), ...ABIERTAS.map((a) => a.id))
  const celda = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const filas = rs.map((r) => {
    const f: unknown[] = [r.codigo, r.creadoEn, r.perfil.rol, r.perfil.experiencia, r.perfil.trabajaConNinos ? 'si' : 'no', r.perfil.dispositivo, r.perfil.navegador, minutos(r.msTotal), r.ayudaExterna]
    for (let i = 0; i < max; i++) {
      const d = r.desafios[i]
      f.push(d?.id, d ? (d.resuelto ? 'si' : 'no') : '', d?.intentos, d?.patrones.join(' '), minutos(d?.msHastaPrimeraEjecucion ?? null), minutos(d?.msHastaResolver ?? null))
    }
    f.push(...LIKERT.map((l) => r.likert[l.id] ?? ''), ...ABIERTAS.map((a) => r.abiertas[a.id] ?? ''))
    return f.map(celda).join(';')
  })
  return [cab.join(';'), ...filas].join('\n')
}

function descargar(rs: Respuesta[]) {
  const blob = new Blob(['﻿' + aCsv(rs)], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `validacion-codeworld-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export function ResultadosValidacion() {
  const [respuestas, setRespuestas] = useState<Respuesta[] | null>(null)

  if (!respuestas) {
    return (
      <Formulario
        titulo="Resultados de la validación"
        boton="Ver resultados"
        onEnviar={async (d) => {
          let res: Response
          try {
            res = await fetch(`${import.meta.env.VITE_API_URL ?? '/api'}/validacion/resultados`, { headers: { 'x-clave-validacion': String(d.get('clave')) } })
          } catch {
            throw new Error('No hay conexión con el servidor.')
          }
          if (res.status === 404) throw new Error('La validación no está activada en este servidor (falta VALIDACION_CLAVE).')
          if (!res.ok) throw new Error(res.status === 401 ? 'Clave incorrecta.' : `Error ${res.status}`)
          setRespuestas(await res.json())
        }}
      >
        <Campo label="Clave" name="clave" type="password" required autoComplete="off" />
      </Formulario>
    )
  }

  const porObjetivo = [...new Set(LIKERT.map((l) => l.objetivo))].map((objetivo) => ({
    objetivo,
    promedio: promedio(
      respuestas.flatMap((r) => LIKERT.filter((l) => l.objetivo === objetivo).map((l) => r.likert[l.id])).filter((x): x is number => typeof x === 'number'),
    ),
  }))

  return (
    <main className="pagina resultados-validacion">
      <h1>Resultados de la validación</h1>
      <p>
        {respuestas.length} participantes. Las cifras se informan tal como salen, cumplan o no el criterio.{' '}
        <button className="primario" onClick={() => descargar(respuestas)} disabled={!respuestas.length}>
          Descargar CSV
        </button>
      </p>
      <table className="tabla">
        <thead>
          <tr>
            <th>Métrica</th>
            <th>Cómo se calcula</th>
            <th>Criterio</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          {metricas(respuestas).map((m) => (
            <tr key={m.metrica}>
              <td>{m.metrica}</td>
              <td>{m.calculo}</td>
              <td>{m.criterio}</td>
              <td>{m.resultado}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Percepción por objetivo (promedio de 1 a 5; criterio: 4,0 o más)</h2>
      <table className="tabla">
        <tbody>
          {porObjetivo.map((o) => (
            <tr key={o.objetivo}>
              <td>{o.objetivo}</td>
              <td>{o.promedio}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Comentarios</h2>
      {ABIERTAS.map((a) => (
        <section key={a.id}>
          <h3>{a.texto}</h3>
          <ul>
            {respuestas
              .filter((r) => r.abiertas[a.id])
              .map((r) => (
                <li key={r.codigo}>
                  <strong>{r.codigo}:</strong> {r.abiertas[a.id]}
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
