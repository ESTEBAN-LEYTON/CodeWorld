"""Genera el informe sobre la plantilla Pantoja_J_Formato_de_Proyecto_Final_2026.docx.
No modifica ni la plantilla ni el informe anterior. Se corre dos veces por dentro: la segunda
escribe en los índices las páginas medidas en el PDF de LibreOffice.
Uso: python3 docs/informe/generar_informe.py"""
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

from lxml import etree

sys.path.insert(0, str(Path(__file__).parent))
import contenido as C
from motor import ANCHO_TEXTO, NS, Doc

RAIZ = Path(__file__).resolve().parents[2]
PLANTILLA = RAIZ / 'Pantoja_J_Formato_de_Proyecto_Final_2026.docx'
ANTERIOR = RAIZ / 'Formato_Portafolio_de_Proyecto_Final_2026.docx'
SALIDA = RAIZ / 'Leyton_E_Formato_de_Proyecto_Final_2026.docx'
WN = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W = '{%s}' % WN
TRAB = Path(tempfile.gettempdir()) / 'codeworld-informe'
AUTOR = 'Esteban Ignacio Leyton Miranda'


def parsear(xml):
    return list(etree.fromstring(f'<raiz {NS}>{xml}</raiz>'))


class Anterior:
    def __init__(self):
        self.z = zipfile.ZipFile(ANTERIOR)
        self.body = list(etree.fromstring(self.z.read('word/document.xml')).find(W + 'body'))
        self.tmp = TRAB / 'anterior'
        self.tmp.mkdir(parents=True, exist_ok=True)

    def T(self, i):
        partes = []
        for r in self.body[i].iter(W + 'r'):
            t = ''.join(x.text or '' for x in r.findall(W + 't'))
            if t:
                b = r.find(f'{W}rPr/{W}b')
                negrita = b is not None and b.get(W + 'val', '1') not in ('0', 'false')
                partes.append((negrita, t))
        out, previo = '', None
        for n, t in partes:
            if n and previo:
                out = out[:-2] + t + '**'
            elif n and t.strip():
                out += f'**{t}**'
            else:
                out += t
            previo = n and bool(t.strip())
        return re.sub(r'\s+', ' ', out).strip()

    def filas(self, i):
        salida = []
        for tr in self.body[i].iter(W + 'tr'):
            fila = []
            for tc in tr.findall(W + 'tc'):
                ps = [''.join(t.text or '' for t in p.iter(W + 't')) for p in tc.iter(W + 'p')]
                fila.append(re.sub(r'\s+', ' ', ' '.join(x for x in ps if x.strip())).strip())
            salida.append(fila)
        return salida

    def img(self, nombre):
        nombre = nombre.lstrip('/')
        candidatos = [nombre, f'word/{nombre}']
        for c in candidatos:
            if c in self.z.namelist():
                destino = self.tmp / Path(c).name
                destino.write_bytes(self.z.read(c))
                return destino
        raise FileNotFoundError(nombre)


def texto_de(e):
    return ''.join(t.text or '' for t in e.iter(W + 't'))


def poner_texto(p, t):
    """Deja el primer run con el texto indicado, sin resaltado, y borra los demás."""
    runs = list(p.iter(W + 'r'))
    for r in runs[1:]:
        r.getparent().remove(r)
    r = runs[0]
    for hijo in list(r):
        if hijo.tag != W + 'rPr':
            r.remove(hijo)
    tt = etree.SubElement(r, W + 't')
    tt.text = t
    tt.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')


def quitar_resaltado(e):
    for h in list(e.iter(W + 'highlight')):
        h.getparent().remove(h)


def entrada_indice(d, nivel, texto, marca, pagina, instr=None, ultima=False):
    pre = ''
    if instr:
        pre = f'<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> {instr} </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>'
    izq = (nivel - 1) * 240
    negrita = nivel == 1
    rpr = d.rpr(negrita, sz=22)
    from xml.sax.saxutils import escape
    return (f'<w:p><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="{ANCHO_TEXTO - 10}"/></w:tabs><w:spacing w:after="40" w:line="264" w:lineRule="auto"/>'
            f'<w:ind w:left="{izq + 360}" w:right="500" w:hanging="360"/><w:jc w:val="left"/></w:pPr>{pre}'
            f'<w:hyperlink w:anchor="{marca}" w:history="1"><w:r>{rpr}<w:t xml:space="preserve">{escape(texto)}</w:t></w:r><w:r>{rpr}<w:tab/></w:r>'
            f'<w:r>{rpr}<w:fldChar w:fldCharType="begin"/></w:r><w:r>{rpr}<w:instrText xml:space="preserve"> PAGEREF {marca} \\h </w:instrText></w:r><w:r>{rpr}<w:fldChar w:fldCharType="separate"/></w:r>'
            f'<w:r>{rpr}<w:t>{pagina}</w:t></w:r><w:r>{rpr}<w:fldChar w:fldCharType="end"/></w:r></w:hyperlink>'
            + ('<w:r><w:fldChar w:fldCharType="end"/></w:r>' if ultima else '') + '</w:p>')


def indice(d, entradas, instr, paginas):
    out = []
    for k, (nivel, texto, marca) in enumerate(entradas):
        out.append(entrada_indice(d, nivel, texto, marca, paginas.get(marca, '0'), instr if k == 0 else None, k == len(entradas) - 1))
    return ''.join(out)


def titulo_prelim(d, t, salto=True):
    d.p(f'**{t}**', jc='center', salto=salto, despues=240)


def construir(paginas):
    a = Anterior()
    raiz = etree.fromstring(zipfile.ZipFile(PLANTILLA).read('word/document.xml'))
    body = raiz.find(W + 'body')
    orig = list(body)

    # Portada
    poner_texto(orig[8], f'“{C.TITULO}”')
    quitar_resaltado(orig[8])
    jc = etree.SubElement(orig[8].find(W + 'pPr'), W + 'jc')
    jc.set(W + 'val', 'center')
    ppr = orig[8].find(W + 'pPr')
    ppr.remove(jc)
    ppr.insert(list(ppr).index(ppr.find(W + 'rPr')), jc)
    body.remove(orig[9])
    poner_texto(orig[16], AUTOR)
    poner_texto(orig[19], 'Alfonsina del Mar Linarez Castañeda')
    for i in range(0, 47):
        quitar_resaltado(orig[i])

    # Declaración de originalidad y uso de IA
    d0 = Doc()
    herr = 'Claude Code, modelo Claude Opus 5.5 (Anthropic), octubre y noviembre de 2026'
    tabla_ia = orig[42]
    usos = {'Revisión de la Redacción': herr, 'Generación de Códigos': herr, 'Generación de recursos multimediales': herr}
    for tr in tabla_ia.iter(W + 'tr'):
        celdas = tr.findall(W + 'tc')
        if len(celdas) < 3:
            continue
        nombre = texto_de(celdas[0]).strip()
        if nombre in usos or nombre == 'Otras finalidades':
            p = celdas[2].find(W + 'p')
            for x in list(p):
                if x.tag != W + 'pPr':
                    p.remove(x)
            for x in parsear(d0.runs(usos.get(nombre, herr) + ' [[Confirmar y agregar otras herramientas usadas.]]', sz=18)):
                p.append(x)
        if nombre == 'Otras finalidades':
            p = celdas[1].find(W + 'p')
            for x in list(p):
                if x.tag != W + 'pPr':
                    p.remove(x)
            for x in parsear(d0.runs('Se utilizó IA para redactar borradores de secciones del informe, revisados y corregidos por el autor.', sz=18)):
                p.append(x)
    tabla_autor = orig[45]
    for tr in tabla_autor.iter(W + 'tr'):
        cs = tr.findall(W + 'tc')
        t = texto_de(tr)
        if t.startswith('Título del trabajo'):
            p = cs[0].find(W + 'p')
            for x in parsear(d0.runs(' ' + C.TITULO, sz=20)):
                p.append(x)
    filas_autor = [tr for tr in tabla_autor.iter(W + 'tr') if len(tr.findall(W + 'tc')) == 2]
    p = filas_autor[1].findall(W + 'tc')[0].find(W + 'p')
    for x in parsear(d0.runs(AUTOR, sz=20)):
        p.append(x)

    # Páginas preliminares: dedicatoria, agradecimientos, índices, resumen y abstract
    previa = Doc()
    titulo_prelim(previa, 'DEDICATORIA', salto=False)
    for i in (47, 48, 49, 50, 51):
        previa.p(a.T(i), jc='right', despues=0)
    titulo_prelim(previa, 'AGRADECIMIENTOS')
    previa.p('Agradezco a mi profesora guía, Alfonsina del Mar Linarez Castañeda, por su orientación y su retroalimentación durante el desarrollo de este proyecto.')
    previa.p('[[Completar con tus agradecimientos personales: la plantilla traía texto de ejemplo («Dr. XXXX», «pasantía en Europa») que se eliminó. Si corresponde, agradece aquí a los jóvenes y tutores que participen en la validación.]]')

    # El cuerpo se escribe primero para conocer sus títulos, tablas y figuras
    cuerpo = Doc()
    C.cuerpo(cuerpo, a.T, a.filas, a.img)
    # Portrait hasta el Anexo C; sus diagramas van apaisados para que se lean
    sect_vertical = ('<w:sectPr><w:footerReference w:type="default" r:id="rId13"/><w:pgSz w:w="12240" w:h="15840" w:code="1"/>'
                     '<w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="1418" w:header="709" w:footer="709" w:gutter="0"/><w:pgNumType w:start="1"/><w:cols w:space="708"/><w:docGrid w:linePitch="360"/></w:sectPr>')
    cuerpo.fin_seccion(sect_vertical)
    for nombre, titulo in C.ANEXO_C:
        cuerpo.figura(C.DIAG / f'{nombre}.png', titulo, cm_ancho=22.5)

    titulo_prelim(previa, 'TABLA DE CONTENIDOS')
    previa.xml.append(indice(previa, cuerpo.indice, 'TOC \\o "1-3" \\h \\z \\u', paginas))
    titulo_prelim(previa, 'ÍNDICE DE TABLAS')
    previa.xml.append(indice(previa, [(2, t, m) for t, m in cuerpo.tablas], 'TOC \\h \\z \\c "Tabla"', paginas))
    titulo_prelim(previa, 'ÍNDICE DE FIGURAS')
    previa.xml.append(indice(previa, [(2, t, m) for t, m in cuerpo.figuras], 'TOC \\h \\z \\c "Figura"', paginas))
    titulo_prelim(previa, 'RESUMEN EJECUTIVO')
    for t in C.RESUMEN:
        previa.p(t, linea=300)
    previa.p(f'**Palabras clave:** {C.CLAVES}', linea=300, antes=120)
    titulo_prelim(previa, 'ABSTRACT')
    for t in C.ABSTRACT:
        previa.p(t, linea=300)
    previa.p(f'**Key Words:** {C.CLAVES_EN}', linea=300, antes=120)

    # Se reemplaza todo lo que hay entre las secciones de la plantilla
    fin_prelim = orig[313]
    for e in orig[48:313]:
        body.remove(e)
    pos = list(body).index(fin_prelim)
    for k, e in enumerate(parsear(''.join(previa.xml))):
        body.insert(pos + k, e)
    for e in orig[314:]:
        body.remove(e)
    for e in parsear(''.join(cuerpo.xml)):
        body.append(e)

    # Numeración corrida: la plantilla reiniciaba la numeración en cada sección
    fin_prelim.find(f'.//{W}sectPr').find(W + 'pgNumType').attrib.pop(W + 'start', None)

    # Sección final apaisada para el Anexo C: continúa la numeración
    body.append(parsear('<w:sectPr><w:pgSz w:w="15840" w:h="12240" w:orient="landscape" w:code="1"/><w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="1418" w:header="709" w:footer="709" w:gutter="0"/><w:cols w:space="708"/><w:docGrid w:linePitch="360"/></w:sectPr>')[0])

    return raiz, cuerpo, previa


def empaquetar(raiz, docs, destino):
    z = zipfile.ZipFile(PLANTILLA)
    salida = zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED)
    imagenes = [im for d in docs for im in d.imagenes]
    for it in z.infolist():
        datos = z.read(it.filename)
        if it.filename == 'word/document.xml':
            datos = etree.tostring(raiz, xml_declaration=True, encoding='UTF-8', standalone=True)
        elif it.filename == 'word/_rels/document.xml.rels':
            rels = datos.decode('utf8')
            nuevos = ''.join(f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/cw_{rid}.png"/>' for rid, _ in imagenes)
            datos = rels.replace('</Relationships>', nuevos + '</Relationships>').encode('utf8')
        elif it.filename == 'word/numbering.xml':
            datos = numeracion(datos.decode('utf8')).encode('utf8')
        elif it.filename == 'word/settings.xml':
            datos = ajustes(datos.decode('utf8')).encode('utf8')
        elif it.filename == 'docProps/core.xml':
            s = datos.decode('utf8')
            s = re.sub(r'<dc:creator>.*?</dc:creator>', f'<dc:creator>{AUTOR}</dc:creator>', s)
            s = re.sub(r'<cp:lastModifiedBy>.*?</cp:lastModifiedBy>', f'<cp:lastModifiedBy>{AUTOR}</cp:lastModifiedBy>', s)
            s = re.sub(r'<dc:title>.*?</dc:title>|<dc:title/>', '<dc:title>CodeWorld: proyecto de título</dc:title>', s)
            datos = s.encode('utf8')
        salida.writestr(it, datos)
    for rid, ruta in imagenes:
        salida.write(ruta, f'word/media/cw_{rid}.png')
    salida.close()


def numeracion(s):
    vineta = ('<w:abstractNum w:abstractNumId="900"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="&#xF0B7;"/><w:lvlJc w:val="left"/>'
              '<w:pPr><w:ind w:left="426" w:hanging="284"/></w:pPr><w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol" w:hint="default"/></w:rPr></w:lvl></w:abstractNum>')
    decimal = ('<w:abstractNum w:abstractNumId="901"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/>'
               '<w:pPr><w:ind w:left="426" w:hanging="284"/></w:pPr></w:lvl></w:abstractNum>')
    primero = s.index('<w:num ')
    s = s[:primero] + vineta + decimal + s[primero:]
    nums = '<w:num w:numId="900"><w:abstractNumId w:val="900"/></w:num>'
    for k in range(1, 6):
        nums += f'<w:num w:numId="{910 + k}"><w:abstractNumId w:val="901"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>'
    return s.replace('</w:numbering>', nums + '</w:numbering>')


def ajustes(s):
    """Word recalcula índices y paginación al abrir, porque su paginación difiere de la de LibreOffice."""
    if 'updateFields' in s:
        return s
    for marca in ('<w:hdrShapeDefaults', '<w:footnotePr', '<w:endnotePr', '<w:compat>', '<w:compat '):
        if marca in s:
            return s.replace(marca, '<w:updateFields w:val="true"/>' + marca, 1)
    return s


LO = ['flatpak', 'run', f'--filesystem={tempfile.gettempdir()}', 'org.libreoffice.LibreOffice', '--headless', '--convert-to', 'pdf', '--outdir']


def a_pdf(docx):
    subprocess.run(LO + [str(TRAB), str(docx)], check=True, capture_output=True, timeout=240)
    return TRAB / (docx.stem + '.pdf')


def paginas_pdf(pdf):
    txt = subprocess.run(['pdftotext', '-layout', str(pdf), '-'], capture_output=True, text=True, check=True).stdout
    return [re.sub(r'\s+', ' ', p) for p in txt.split('\f')]


def medir(pdf, cuerpo):
    pags = paginas_pdf(pdf)
    inicio = max(i for i, p in enumerate(pags) if re.search(r'CAPÍTULO I: INTRODUCCIÓN Contexto', p))
    res = {}
    cursor = inicio
    for nivel, t, m in cuerpo.indice:
        clave = re.sub(r'\s+', ' ', t)[:45]
        for i in range(cursor, len(pags)):
            if clave in pags[i]:
                res[m] = str(i - inicio + 1)
                cursor = i
                break
    for lista in (cuerpo.tablas, cuerpo.figuras):
        cursor = inicio
        for t, m in lista:
            clave = re.sub(r'\s+', ' ', t)[:40]
            for i in range(cursor, len(pags)):
                if clave in pags[i]:
                    res[m] = str(i - inicio + 1)
                    cursor = i
                    break
    return res, inicio, len(pags)


def main():
    TRAB.mkdir(parents=True, exist_ok=True)
    paginas = {}
    for vuelta in (1, 2):
        raiz, cuerpo, previa = construir(paginas)
        tmp = TRAB / 'borrador.docx'
        empaquetar(raiz, [cuerpo, previa], tmp)
        pdf = a_pdf(tmp)
        paginas, inicio, total = medir(pdf, cuerpo)
    shutil.copy(tmp, SALIDA)
    shutil.copy(pdf, TRAB / 'final.pdf')
    faltan = [t for _, t, m in cuerpo.indice if m not in paginas] + [t for t, m in cuerpo.tablas + cuerpo.figuras if m not in paginas]
    print('Páginas PDF:', total, '· cuerpo desde', inicio + 1)
    h1 = [(t, int(paginas[m])) for n, t, m in cuerpo.indice if n == 1]
    for (t, p), sig in zip(h1, h1[1:] + [('', None)]):
        print(f'  {t[:45]:45} pág {p:3} largo {(sig[1] - p) if sig[1] else "-"}')
    print('Tablas', len(cuerpo.tablas), 'Figuras', len(cuerpo.figuras))
    if faltan:
        print('SIN PÁGINA:', faltan)


if __name__ == '__main__':
    main()
