import { useEffect, useRef, type RefObject } from 'react'
import * as Blockly from 'blockly/core'
import 'blockly/blocks'
import * as Es from 'blockly/msg/es'
import { BLOQUE_INICIO, toolboxPara } from '../game/blocks'

Blockly.setLocale(Es as unknown as Record<string, string>)

interface Props {
  /** Lista estable por desafío (viene de DESAFIOS); al cambiar se crea un workspace nuevo. */
  bloquesPermitidos: string[]
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>
}

export function BlocklyEditor({ bloquesPermitidos, workspaceRef }: Props) {
  const contenedor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contenedor.current) return
    const ws = Blockly.inject(contenedor.current, {
      toolbox: toolboxPara(bloquesPermitidos),
      trashcan: true,
      zoom: { controls: true, startScale: 1.1 },
      move: { scrollbars: true, drag: true, wheel: true },
      renderer: 'zelos',
    })
    const inicio = ws.newBlock(BLOQUE_INICIO)
    inicio.initSvg()
    inicio.render()
    inicio.moveBy(30, 30)
    workspaceRef.current = ws
    return () => {
      workspaceRef.current = null
      ws.dispose()
    }
  }, [bloquesPermitidos, workspaceRef])

  return <div ref={contenedor} className="editor" />
}
