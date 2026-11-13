"""Genera el resumen de artículo para EXPOTIC sobre «Plantilla de Artículo - resumen.docx».
Formato de la plantilla: 1 página, Arial 12, interlineado sencillo, justificado, resumen y palabras clave en dos idiomas.
Uso: python3 docs/expotic/generar_resumen.py  (deja el .docx y el .pdf en docs/expotic)"""
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / 'docs/informe'))
from motor import NS, Doc  # noqa: E402

PLANTILLA = RAIZ / 'Plantilla de Artículo - resumen.docx'
AQUI = Path(__file__).parent
NOMBRE = 'E_Leyton_Miranda_202620'
AUTOR = 'Esteban Ignacio Leyton Miranda'
ANCHO = 8838  # DXA: carta con márgenes laterales de 3 cm, como la plantilla
TRAB = Path(tempfile.gettempdir()) / 'codeworld-expotic'

TITULO = 'CodeWorld: empoderando el pensamiento lógico en jóvenes mediante una experiencia de aprendizaje programático interactivo'

RESUMEN = (
    'Muchos jóvenes abandonan pronto la programación porque las herramientas asumen conocimientos previos '
    'y no los orientan cuando se equivocan. Este proyecto desarrolló CodeWorld, una plataforma web de programación con bloques visuales para '
    'jóvenes de 9 a 15 años, orientada al pensamiento computacional, con el objetivo de que al menos el 80% de un grupo de control '
    'complete sin ayuda un ejercicio básico de lógica. La gestión siguió la guía PMBOK y el desarrollo, un marco híbrido de Scrum y Kanban. '
    'El producto mínimo viable, construido sobre Google Blockly, evalúa el programa en el navegador del alumno y ofrece 3 niveles y 12 desafíos '
    'de secuencias, ciclos y condiciones, guías correctivas para los 4 patrones de error, tutor con doble factor, funcionamiento '
    'sin conexión y datos mínimos de los menores (Ley N.° 19.628). Se aprobaron 89 de 89 pruebas unitarias y de integración y '
    '15 de 15 casos de aceptación, con una retroalimentación de 1 ms o menos frente a una meta de 300 ms. '
    '[[Completar: X% de N jóvenes completó el ejercicio sin ayuda.]] Evaluar en el navegador resultó viable con infraestructura '
    'escolar limitada; se recomienda medir el aprendizaje con un estudio antes y después.'
)

ABSTRACT = (
    'Many young learners soon abandon programming because tools assume prior knowledge and do not guide them '
    'when they make mistakes. This project developed CodeWorld, a block-based visual programming web platform for learners aged 9 to 15, '
    'focused on computational thinking, aiming for at least 80% of a control group to complete a basic logic exercise without '
    'help. Management followed the PMBOK guide and development a hybrid Scrum and Kanban framework. The minimum viable product, built on '
    'Google Blockly, evaluates the program in the learner’s browser and offers 3 levels and 12 challenges on sequences, loops and conditions, '
    'corrective guidance for the 4 error patterns, two-factor tutor login, offline operation '
    'and minimal data on minors (Chilean Law No. 19,628). All 89 unit and integration tests and all 15 acceptance cases passed, with feedback in 1 ms or '
    'less against a 300 ms target. [[Add: X% of N learners completed the exercise without help.]] Browser-side evaluation proved '
    'viable with limited school infrastructure; a pre- and post-test study is recommended to measure learning.'
)

def construir():
    d = Doc()
    sencillo = dict(linea=240, despues=0)

    # Encabezado: título a la izquierda y logo a la derecha, en una tabla sin bordes
    logo = d._dibujo(AQUI / 'logo-unab.png', cm_ancho=2.3)
    izq, der = ANCHO - 1400, 1400
    celda = '<w:tc><w:tcPr><w:tcW w:w="{}" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>{}</w:tc>'
    titulo = f'<w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="left"/></w:pPr>{d.runs(TITULO, b=True, sz=26)}</w:p>'
    imagen = f'<w:p><w:pPr><w:spacing w:after="0"/><w:jc w:val="right"/></w:pPr>{logo}</w:p>'
    d.xml.append(f'<w:tbl><w:tblPr><w:tblW w:w="{ANCHO}" w:type="dxa"/><w:tblLayout w:type="fixed"/>'
                 '<w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr>'
                 f'<w:tblGrid><w:gridCol w:w="{izq}"/><w:gridCol w:w="{der}"/></w:tblGrid>'
                 f'<w:tr>{celda.format(izq, titulo)}{celda.format(der, imagen)}</w:tr></w:tbl>')

    d.p('Leyton Miranda, Esteban Ignacio; Linarez Castañeda, Alfonsina del Mar', jc='left', antes=200, **sencillo)
    d.p('Universidad Andrés Bello – Facultad de Ingeniería', jc='left', **sencillo)
    d.p('Ingeniería en Computación e Informática', jc='left', **sencillo)
    d.p('Santiago de Chile, noviembre de 2026', jc='left', linea=240, despues=160)

    d.p(f'**Resumen:** {RESUMEN}', linea=240, despues=120)
    d.p('**Palabras clave:** pensamiento computacional, programación visual, retroalimentación inmediata, gamificación, Blockly.', jc='left', linea=240, despues=160)
    d.p(f'**Abstract:** {ABSTRACT}', linea=240, despues=120)
    d.p('**Keywords:** computational thinking, visual programming, immediate feedback, gamification, Blockly.', jc='left', linea=240, despues=160)


    sect = ('<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1417" w:right="1701" w:bottom="1417" w:left="1701" '
            'w:header="708" w:footer="708" w:gutter="0"/><w:cols w:space="708"/><w:docGrid w:linePitch="360"/></w:sectPr>')
    cuerpo = ''.join(d.xml)
    return d, f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document {NS}><w:body>{cuerpo}{sect}</w:body></w:document>'


def empaquetar(d, xml, destino):
    z = zipfile.ZipFile(PLANTILLA)
    salida = zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED)
    for it in z.infolist():
        if it.filename.endswith('/') or it.filename == 'word/media/image1.png':
            continue  # la imagen de ejemplo de la plantilla no se usa
        datos = z.read(it.filename)
        if it.filename == 'word/document.xml':
            datos = xml.encode('utf8')
        elif it.filename == 'word/_rels/document.xml.rels':
            rels = datos.decode('utf8')
            rels = re.sub(r'<Relationship Id="rId[56]"[^>]*/>', '', rels)
            nuevos = ''.join(f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/cw_{rid}.png"/>'
                             for rid, _ in d.imagenes)
            datos = rels.replace('</Relationships>', nuevos + '</Relationships>').encode('utf8')
        elif it.filename == 'docProps/core.xml':
            s = datos.decode('utf8')
            s = re.sub(r'<dc:creator>.*?</dc:creator>', f'<dc:creator>{AUTOR}</dc:creator>', s)
            s = re.sub(r'<cp:lastModifiedBy>.*?</cp:lastModifiedBy>', f'<cp:lastModifiedBy>{AUTOR}</cp:lastModifiedBy>', s)
            s = re.sub(r'<dc:title>.*?</dc:title>|<dc:title/>', '<dc:title>CodeWorld: resumen de artículo</dc:title>', s)
            datos = s.encode('utf8')
        salida.writestr(it, datos)
    for rid, ruta in d.imagenes:
        salida.write(ruta, f'word/media/cw_{rid}.png')
    salida.close()


def main():
    TRAB.mkdir(parents=True, exist_ok=True)
    d, xml = construir()
    docx = AQUI / f'{NOMBRE}.docx'
    empaquetar(d, xml, docx)
    lo = ['flatpak', 'run', f'--filesystem={TRAB}', f'--filesystem={AQUI}', 'org.libreoffice.LibreOffice',
          '--headless', '--convert-to', 'pdf', '--outdir', str(TRAB), str(docx)]
    subprocess.run(lo, check=True, capture_output=True, timeout=240)
    pdf = AQUI / f'{NOMBRE}.pdf'
    shutil.copy(TRAB / f'{NOMBRE}.pdf', pdf)
    info = subprocess.run(['pdfinfo', str(pdf)], capture_output=True, text=True).stdout
    paginas = re.search(r'Pages:\s+(\d+)', info).group(1)
    palabras = len(re.sub(r'\[\[.*?\]\]', '', RESUMEN).split())
    print(f'{docx.name} y {pdf.name}: {paginas} página(s); resumen de {palabras} palabras (máximo 300)')
    if paginas != '1':
        print('ATENCIÓN: la plantilla exige 1 página como máximo')


if __name__ == '__main__':
    main()
