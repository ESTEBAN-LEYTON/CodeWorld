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

function colocarInicio(ws: Blockly.WorkspaceSvg) {
  const inicio = ws.newBlock(BLOQUE_INICIO)
  inicio.initSvg()
  inicio.render()
  inicio.moveBy(30, 30)
}

function restaurar(ws: Blockly.WorkspaceSvg, clave: string) {
  const guardado = leer<object | null>(clave, null)
  if (!guardado) return colocarInicio(ws)
  try {
    Blockly.serialization.workspaces.load(guardado, ws)
  } catch {
    // Un programa guardado que ya no se puede leer no debe impedir jugar el desafío.
    ws.clear()
    colocarInicio(ws)
  }
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
