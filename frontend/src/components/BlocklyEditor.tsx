import { useEffect, useRef, type RefObject } from 'react'
import * as Blockly from 'blockly/core'
import 'blockly/blocks'
import * as Es from 'blockly/msg/es'
import { guardar, leer } from '../almacen'
import { BLOQUE_INICIO, toolboxPara } from '../game/blocks'

Blockly.setLocale(Es as unknown as Record<string, string>)

const ESCALA = 1.1
/** En celular los bloques van un poco más chicos para que la franja muestre todos los del desafío. */
const ESCALA_ANGOSTO = 0.85
const RADIO_ENCAJE = Blockly.config.snapRadius
const RADIO_CONEXION = Blockly.config.connectingSnapRadius

interface Props {
  /** Lista estable por desafío (viene de DESAFIOS); al cambiar se crea un workspace nuevo. */
  bloquesPermitidos: string[]
  /** Clave de localStorage donde se autoguarda el programa de este alumno y desafío (riesgo R2). */
  claveGuardado: string
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>
}

const POSICION_INICIO = { x: 30, y: 30 }

/**
 * «Al ejecutar» es el ancla del programa: siempre existe, no se puede borrar ni arrastrar y queda en la
 * misma esquina. Se aplica también a programas guardados antes de este cambio, que no traían esas marcas.
 */
function fijarInicio(ws: Blockly.WorkspaceSvg) {
  let inicio = ws.getBlocksByType(BLOQUE_INICIO, false)[0] as Blockly.BlockSvg | undefined
  if (!inicio) {
    inicio = ws.newBlock(BLOQUE_INICIO)
    inicio.initSvg()
    inicio.render()
  }
  inicio.setDeletable(false)
  inicio.setMovable(false)
  const { x, y } = inicio.getRelativeToSurfaceXY()
  if (x !== POSICION_INICIO.x || y !== POSICION_INICIO.y) inicio.moveBy(POSICION_INICIO.x - x, POSICION_INICIO.y - y)
}

function restaurar(ws: Blockly.WorkspaceSvg, clave: string) {
  const guardado = leer<object | null>(clave, null)
  try {
    if (guardado) Blockly.serialization.workspaces.load(guardado, ws)
  } catch {
    // Un programa guardado que ya no se puede leer no debe impedir jugar el desafío.
    ws.clear()
  }
  fijarInicio(ws)
}

export function BlocklyEditor({ bloquesPermitidos, claveGuardado, workspaceRef }: Props) {
  const contenedor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contenedor.current) return
    // En celular la caja de bloques va como franja arriba del lienzo: así el lienzo usa todo el ancho.
    const angosto = window.matchMedia('(max-width: 720px)').matches
    const escala = angosto ? ESCALA_ANGOSTO : ESCALA
    // El radio de encaje se mide en unidades del lienzo: se agranda al achicar los bloques, para que encajar
    // un bloque con el dedo sea igual de fácil que en un computador.
    Blockly.config.snapRadius = (RADIO_ENCAJE * ESCALA) / escala
    Blockly.config.connectingSnapRadius = (RADIO_CONEXION * ESCALA) / escala
    const ws = Blockly.inject(contenedor.current, {
      toolbox: toolboxPara(bloquesPermitidos),
      horizontalLayout: angosto,
      toolboxPosition: 'start',
      trashcan: true,
      zoom: { controls: true, startScale: escala },
      move: { scrollbars: true, drag: true, wheel: true },
      renderer: 'zelos',
      // Servidos por la propia aplicación: funcionan sin conexión y no se contacta a terceros.
      media: '/blockly-media/',
    })
    restaurar(ws, claveGuardado)
    ws.addChangeListener((e) => {
      // «Ordenar bloques» del menú contextual también lo movería: se devuelve a su esquina.
      if (e.type === Blockly.Events.BLOCK_MOVE) fijarInicio(ws)
      if (!e.isUiEvent) guardar(claveGuardado, Blockly.serialization.workspaces.save(ws))
    })
    workspaceRef.current = ws
    return () => {
      workspaceRef.current = null
      ws.dispose()
    }
  }, [bloquesPermitidos, claveGuardado, workspaceRef])

  return <div ref={contenedor} className="editor" />
}
