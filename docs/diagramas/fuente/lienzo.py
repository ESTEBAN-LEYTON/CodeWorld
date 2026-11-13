"""Primitivas SVG de los diagramas de CodeWorld: lienzo 1920x1080 pensado para leerse en video."""
from html import escape

ANCHO, ALTO = 1920, 1080
FONDO = '#F7F8FC'
TINTA = '#1B2340'
SUAVE = '#5A6380'
LINEA = '#3D4663'

COLORES = {
    'nav': ('#EEF0FF', '#4F46E5'),      # navegador
    'srv': ('#FFF3E2', '#B45309'),      # servidor
    'bd': ('#E4F6EF', '#047857'),       # base de datos
    'ext': ('#EEF0F4', '#5A6380'),      # servicio externo o neutro
    'ok': ('#E3F6E8', '#15803D'),
    'mal': ('#FDEAEA', '#C62828'),
    'aviso': ('#FFF9DB', '#A16207'),
    'blanco': ('#FFFFFF', '#3D4663'),
}
MONO = "'Liberation Mono', monospace"
SANS = "'Noto Sans', sans-serif"


def texto(x, y, t, talla=20, peso=400, color=TINTA, ancla='middle', mono=False, caja=None):
    extra = f' data-caja="{caja[0]},{caja[1]},{caja[2]},{caja[3]}"' if caja else ''
    fam = MONO if mono else SANS
    espacios = ' xml:space="preserve" style="white-space:pre"' if mono else ''
    return (f'<text x="{x}" y="{y}" font-family="{fam}" font-size="{talla}" font-weight="{peso}" '
            f'fill="{color}" text-anchor="{ancla}"{espacios}{extra}>{escape(t)}</text>')


class Lienzo:
    def __init__(self, numero, titulo, subtitulo, pie=None):
        self.p = [f'<rect width="{ANCHO}" height="{ALTO}" fill="{FONDO}"/>']
        self.p.append(f'<rect x="0" y="0" width="14" height="{ALTO}" fill="#4F46E5"/>')
        self.p.append(texto(50, 68, f'{numero}. {titulo}', 42, 700, ancla='start'))
        self.p.append(texto(50, 108, subtitulo, 24, 400, SUAVE, ancla='start'))
        self.numero = numero
        if pie:
            self.p.append(texto(ANCHO - 40, ALTO - 16, pie, 18, 400, SUAVE, ancla='end', mono=True))
        self.flechas = []

    def zona(self, x, y, w, h, etiqueta, tipo='nav'):
        fondo, borde = COLORES[tipo]
        self.p.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="{fondo}" fill-opacity=".55" '
                      f'stroke="{borde}" stroke-width="2.5" stroke-dasharray="10 7"/>')
        self.p.append(texto(x + 20, y + 36, etiqueta, 24, 700, borde, ancla='start'))

    def caja(self, x, y, w, h, lineas, tipo='nav', radio=12):
        """lineas: '*negrita', '`código' o texto normal. Una tupla (texto, talla) cambia el tamaño."""
        fondo, borde = COLORES[tipo]
        self.p.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radio}" fill="{fondo}" stroke="{borde}" stroke-width="2.5"/>')
        filas = [self._fila(l) for l in lineas]
        alto = sum(f['talla'] * 1.32 for f in filas)
        cy = y + (h - alto) / 2
        for f in filas:
            cy += f['talla'] * 1.32
            self.p.append(texto(x + w / 2, round(cy - f['talla'] * .3), f['t'], f['talla'], f['peso'],
                                borde if f['peso'] == 700 and tipo not in ('blanco',) else TINTA,
                                mono=f['mono'], caja=(x, y, w, h)))

    def rombo(self, cx, cy, w, h, lineas, tipo='aviso'):
        fondo, borde = COLORES[tipo]
        pts = f'{cx},{cy - h / 2} {cx + w / 2},{cy} {cx},{cy + h / 2} {cx - w / 2},{cy}'
        self.p.append(f'<polygon points="{pts}" fill="{fondo}" stroke="{borde}" stroke-width="2.5"/>')
        filas = [self._fila(l) for l in lineas]
        alto = sum(f['talla'] * 1.3 for f in filas)
        y = cy - alto / 2
        for f in filas:
            y += f['talla'] * 1.3
            self.p.append(texto(cx, round(y - f['talla'] * .3), f['t'], f['talla'], f['peso'], mono=f['mono']))

    @staticmethod
    def _fila(l):
        talla = None
        if isinstance(l, tuple):
            l, talla = l
        if l.startswith('*'):
            return {'t': l[1:], 'peso': 700, 'mono': False, 'talla': talla or 24}
        if l.startswith('`'):
            return {'t': l[1:], 'peso': 400, 'mono': True, 'talla': talla or 20}
        return {'t': l, 'peso': 400, 'mono': False, 'talla': talla or 20}

    def flecha(self, puntos, etiqueta=None, pos=None, punteada=False, color=LINEA, grosor=2.5, ancla='middle', mono=False, talla=20):
        d = 'M' + ' L'.join(f'{x},{y}' for x, y in puntos)
        dash = ' stroke-dasharray="9 7"' if punteada else ''
        mid = {'#3D4663': 'p', '#C62828': 'r', '#15803D': 'v', '#4F46E5': 'n', '#B45309': 'a', '#047857': 'b'}[color]
        self.flechas.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{grosor}"{dash} marker-end="url(#f{mid})"/>')
        if etiqueta:
            if pos is None:
                (x1, y1), (x2, y2) = puntos[0], puntos[1]
                pos = ((x1 + x2) / 2, (y1 + y2) / 2 - 10)
            self.flechas.append(self._halo(pos[0], pos[1], etiqueta, talla, ancla, mono))

    def _halo(self, x, y, t, talla, ancla, mono):
        fam = MONO if mono else SANS
        return (f'<text x="{x}" y="{y}" font-family="{fam}" font-size="{talla}" fill="{TINTA}" text-anchor="{ancla}" '
                f'paint-order="stroke" stroke="{FONDO}" stroke-width="7" stroke-linejoin="round">{escape(t)}</text>')

    def nota(self, x, y, t, talla=20, peso=400, color=TINTA, ancla='start', mono=False):
        self.flechas.append(self._halo_color(x, y, t, talla, peso, color, ancla, mono))

    def _halo_color(self, x, y, t, talla, peso, color, ancla, mono):
        fam = MONO if mono else SANS
        return (f'<text x="{x}" y="{y}" font-family="{fam}" font-size="{talla}" font-weight="{peso}" fill="{color}" text-anchor="{ancla}" '
                f'paint-order="stroke" stroke="{FONDO}" stroke-width="6" stroke-linejoin="round">{escape(t)}</text>')

    def svg(self):
        def marca(i, c):
            return (f'<marker id="f{i}" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="11" markerHeight="11" '
                    f'markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L12,6 L0,12 z" fill="{c}"/></marker>')
        marcas = ''.join(marca(i, c) for i, c in [('p', LINEA), ('r', '#C62828'), ('v', '#15803D'), ('n', '#4F46E5'), ('a', '#B45309'), ('b', '#047857')])
        cuerpo = '\n'.join(self.p + self.flechas)
        return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{ANCHO}" height="{ALTO}" viewBox="0 0 {ANCHO} {ALTO}">'
                f'<defs>{marcas}</defs>\n{cuerpo}\n</svg>\n')


class Secuencia:
    """Diagrama de secuencia: participantes con línea de vida y mensajes numerados."""

    def __init__(self, lienzo, participantes, y0=135, y1=1045, alto=74):
        self.l, self.y1 = lienzo, y1
        self.x = {}
        for clave, x, w, lineas, tipo in participantes:
            self.x[clave] = x
            lienzo.p.append(f'<line x1="{x}" y1="{y0 + alto}" x2="{x}" y2="{y1}" stroke="#9AA3BD" stroke-width="2" stroke-dasharray="4 6"/>')
            lienzo.caja(x - w / 2, y0, w, alto, lineas, tipo)
        self.n = 0

    def msg(self, de, a, y, t, retorno=False, mal=False, mono=False):
        self.n += 1
        x1, x2 = self.x[de], self.x[a]
        color = '#C62828' if mal else LINEA
        etiqueta = f'{self.n}. {t}'
        self.l.flecha([(x1, y), (x2, y)], etiqueta, ((x1 + x2) / 2, y - 9), punteada=retorno, color=color, mono=mono)

    def propio(self, de, y, t, ancla='start', mono=False):
        self.n += 1
        x = self.x[de]
        self.l.flecha([(x, y - 11), (x + 44, y - 11), (x + 44, y + 11), (x + 3, y + 11)])
        self.l.flechas.append(self.l._halo(x + 54, y + 7, f'{self.n}. {t}', 20, 'start', mono))

    def marco(self, x, y, w, h, etiqueta, tipo='ext'):
        fondo, borde = COLORES[tipo]
        self.l.p.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{fondo}" fill-opacity=".45" stroke="{borde}" stroke-width="2"/>')
        self.l.p.append(texto(x + 12, y + 26, etiqueta, 20, 700, borde, ancla='start'))
