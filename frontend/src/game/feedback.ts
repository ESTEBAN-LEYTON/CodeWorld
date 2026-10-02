import type { Estado } from './types'

// Guías correctivas del nivel inicial (OE3). Explican la causa probable del error
// sin revelar la solución. Más adelante vendrán de la tabla GUIA_CORRECTIVA del backend.

const GUIAS: Record<Estado, string> = {
  exito: '¡Lo lograste! Tu robot llegó a la meta.',
  vacio: 'Tu programa está vacío. Arrastra bloques desde la izquierda y únelos debajo de "Al ejecutar".',
  choque:
    'Tu robot chocó con una pared. Mira hacia dónde apunta la flecha justo antes del choque: ¿necesitaba girar antes de avanzar?',
  incompleto:
    'Tu robot se detuvo antes de llegar a la meta. Cuenta cuántas casillas le faltan y agrega los pasos que faltan.',
  limite_pasos:
    'Tu programa se repite sin terminar nunca. Revisa los bloques "repetir": ¿el robot realmente se acerca a la meta en cada vuelta?',
}

export function guiaPara(estado: Estado): string {
  return GUIAS[estado]
}
