"""Primitivas para escribir el informe en WordprocessingML con el formato de la plantilla:
Arial 12, interlineado 1,5, texto justificado y tablas en Arial 10. **negrita** y [[pendiente]] (amarillo)."""
import re
import struct
from xml.sax.saxutils import escape

NS = ('xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
      'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" '
      'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
      'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"')
ANCHO_TEXTO = 9404  # DXA: carta con márgenes de 2,5 cm
MAX_EMU = 5971540


class Doc:
    def __init__(self):
        self.xml = []
        self.indice = []  # (nivel, texto, marcador)
        self.tablas = []
        self.figuras = []
        self.imagenes = []  # (rId, ruta)
        self.nums = 0
        self.marca = 5000
        self.ntab = 0
        self.nfig = 0

    # Texto
    @staticmethod
    def rpr(b=False, i=False, hl=False, sz=24, mono=False):
        f = 'Courier New' if mono else 'Arial'
        return (f'<w:rPr><w:rFonts w:ascii="{f}" w:hAnsi="{f}" w:cs="{f}"/>' + ('<w:b/><w:bCs/>' if b else '') + ('<w:i/><w:iCs/>' if i else '')
                + (f'<w:highlight w:val="yellow"/>' if hl else '') + f'<w:sz w:val="{sz}"/><w:szCs w:val="{sz}"/></w:rPr>')

    def runs(self, t, b=False, i=False, sz=24):
        out = []
        for parte in re.split(r'(\*\*.+?\*\*|\[\[.+?\]\])', t):
            if not parte:
                continue
            if parte.startswith('**'):
                out.append(self._r(parte[2:-2], True, i, False, sz))
            elif parte.startswith('[['):
                out.append(self._r(parte[2:-2], b, i, True, sz))
            else:
                out.append(self._r(parte, b, i, False, sz))
        return ''.join(out)

    def _r(self, t, b, i, hl, sz):
        return f'<w:r>{self.rpr(b, i, hl, sz)}<w:t xml:space="preserve">{escape(t)}</w:t></w:r>'

    def p(self, t='', jc='both', linea=360, antes=0, despues=120, b=False, i=False, sz=24, salto=False, sigue=False, sangria=None):
        ppr = ('<w:keepNext/>' if sigue else '') + ('<w:pageBreakBefore/>' if salto else '')
        ppr += f'<w:spacing w:before="{antes}" w:after="{despues}" w:line="{linea}" w:lineRule="auto"/>'
        if sangria:
            ppr += f'<w:ind w:left="{sangria}" w:hanging="{sangria}"/>'
        ppr += f'<w:jc w:val="{jc}"/>'
        self.xml.append(f'<w:p><w:pPr>{ppr}</w:pPr>{self.runs(t, b, i, sz)}</w:p>')

    def lista(self, items, num=None):
        n = num or 900
        for t in items:
            self.xml.append(
                f'<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="{n}"/></w:numPr>'
                f'<w:spacing w:after="80" w:line="360" w:lineRule="auto"/><w:ind w:left="426" w:hanging="284"/><w:jc w:val="both"/></w:pPr>{self.runs(t)}</w:p>')

    def lista_num(self, items):
        self.nums += 1
        self.lista(items, 910 + self.nums)

    # Títulos
    def _marca(self):
        self.marca += 1
        return self.marca, f'_Toc77{self.marca}'

    def h1(self, t):
        i, m = self._marca()
        self.indice.append((1, t, m))
        self.xml.append(f'<w:p><w:pPr><w:pStyle w:val="Ttulo1"/><w:pageBreakBefore/><w:spacing w:before="0" w:after="120" w:line="360" w:lineRule="auto"/><w:jc w:val="left"/></w:pPr>'
                        f'<w:bookmarkStart w:id="{i}" w:name="{m}"/><w:r>{self.rpr(True)}<w:t>{escape(t)}</w:t></w:r><w:bookmarkEnd w:id="{i}"/></w:p>')

    def h2(self, t):
        i, m = self._marca()
        self.indice.append((2, t, m))
        self.xml.append(f'<w:p><w:pPr><w:pStyle w:val="Ttulo2"/><w:keepNext/><w:spacing w:before="200" w:after="120" w:afterAutospacing="0" w:line="360" w:lineRule="auto"/></w:pPr>'
                        f'<w:bookmarkStart w:id="{i}" w:name="{m}"/><w:r>{self.rpr(True)}<w:t>{escape(t)}</w:t></w:r><w:bookmarkEnd w:id="{i}"/></w:p>')

    def h3(self, t):
        i, m = self._marca()
        self.indice.append((3, t, m))
        self.xml.append(f'<w:p><w:pPr><w:pStyle w:val="Ttulo3"/><w:keepNext/><w:spacing w:before="160" w:after="80" w:line="360" w:lineRule="auto"/></w:pPr>'
                        f'<w:bookmarkStart w:id="{i}" w:name="{m}"/><w:r>{self.rpr(True, True)}<w:t>{escape(t)}</w:t></w:r><w:bookmarkEnd w:id="{i}"/></w:p>')

    # Títulos de tablas y figuras con campo SEQ, para que Word pueda regenerar los índices
    def _titulo(self, tipo, n, t, lista, sigue):
        i, m = self._marca()
        lista.append((f'{tipo} {n}. {t}', m))
        seq = (f'<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> SEQ {tipo} \\* ARABIC </w:instrText></w:r>'
               f'<w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r>{self.rpr(True, sz=20)}<w:t>{n}</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r>')
        self.xml.append(f'<w:p><w:pPr><w:pStyle w:val="Descripcin"/>' + ('<w:keepNext/>' if sigue else '') + f'<w:spacing w:before="120" w:after="80"/><w:jc w:val="center"/></w:pPr>'
                        f'<w:bookmarkStart w:id="{i}" w:name="{m}"/><w:r>{self.rpr(True, sz=20)}<w:t xml:space="preserve">{tipo} </w:t></w:r>{seq}'
                        f'<w:r>{self.rpr(True, sz=20)}<w:t xml:space="preserve">. {escape(t)}</w:t></w:r><w:bookmarkEnd w:id="{i}"/></w:p>')

    def tabla(self, titulo, filas, anchos, sz=20):
        self.ntab += 1
        self._titulo('Tabla', self.ntab, titulo, self.tablas, True)
        total = sum(anchos)
        anchos = [round(a * ANCHO_TEXTO / total) for a in anchos]
        anchos[-1] += ANCHO_TEXTO - sum(anchos)
        borde = ''.join(f'<w:{b} w:val="single" w:sz="4" w:space="0" w:color="7F7F7F"/>' for b in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'))
        out = [f'<w:tbl><w:tblPr><w:tblW w:w="{ANCHO_TEXTO}" w:type="dxa"/><w:tblBorders>{borde}</w:tblBorders><w:tblLayout w:type="fixed"/>'
               f'<w:tblCellMar><w:left w:w="70" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>'
               + ''.join(f'<w:gridCol w:w="{a}"/>' for a in anchos) + '</w:tblGrid>']
        for k, fila in enumerate(filas):
            enc = k == 0
            out.append('<w:tr><w:trPr><w:cantSplit/>' + ('<w:tblHeader/>' if enc else '') + '</w:trPr>')
            for a, c in zip(anchos, fila):
                sombra = '<w:shd w:val="clear" w:color="auto" w:fill="D9E2F3"/>' if enc else ''
                out.append(f'<w:tc><w:tcPr><w:tcW w:w="{a}" w:type="dxa"/>{sombra}</w:tcPr><w:p><w:pPr><w:spacing w:before="20" w:after="20" w:line="240" w:lineRule="auto"/><w:jc w:val="left"/></w:pPr>'
                           f'{self.runs(c, b=enc, sz=sz)}</w:p></w:tc>')
            out.append('</w:tr>')
        out.append('</w:tbl>')
        self.xml.append(''.join(out))
        self.xml.append('<w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>')

    # Imágenes
    @staticmethod
    def _tam(ruta):
        with open(ruta, 'rb') as f:
            d = f.read(24)
        return struct.unpack('>II', d[16:24])

    def _dibujo(self, ruta, cm_ancho=None, cm_alto=None):
        rid = f'rId9{len(self.imagenes):03d}'
        self.imagenes.append((rid, ruta))
        w, h = self._tam(ruta)
        cx = int(cm_ancho * 360000) if cm_ancho else MAX_EMU
        cy = int(cx * h / w)
        if cm_alto and cy > cm_alto * 360000:
            cy = int(cm_alto * 360000)
            cx = int(cy * w / h)
        n = len(self.imagenes) + 100
        return (f'<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="{cx}" cy="{cy}"/><wp:docPr id="{n}" name="Imagen {n}"/>'
                f'<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="{n}" name="Imagen {n}"/><pic:cNvPicPr/></pic:nvPicPr>'
                f'<pic:blipFill><a:blip r:embed="{rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
                f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>')

    def figura(self, ruta, titulo, cm_ancho=None, cm_alto=None):
        self.xml.append(f'<w:p><w:pPr><w:keepNext/><w:spacing w:before="120" w:after="40"/><w:jc w:val="center"/></w:pPr>{self._dibujo(ruta, cm_ancho, cm_alto)}</w:p>')
        self.nfig += 1
        self._titulo('Figura', self.nfig, titulo, self.figuras, False)

    def fin_seccion(self, sect):
        self.xml.append(f'<w:p><w:pPr>{sect}</w:pPr></w:p>')
