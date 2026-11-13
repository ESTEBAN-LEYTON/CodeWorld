"""Genera los diagramas de CodeWorld. Uso: npm run diagramas (desde la raíz del repositorio)."""
from pathlib import Path
from lienzo import LINEA, Lienzo, Secuencia

SALIDA = Path(__file__).parent / 'svg'
ROJO, VERDE, INDIGO, AMBAR, BD = '#C62828', '#15803D', '#4F46E5', '#B45309', '#047857'


def mapa_general():
    l = Lienzo(1, 'Mapa general de CodeWorld', 'Tres capas: el navegador hace el trabajo del juego y el servidor solo autentica, entrega contenido y guarda el progreso')
    l.zona(36, 135, 964, 900, 'NAVEGADOR DEL ALUMNO O TUTOR  ·  frontend/src', 'nav')
    l.zona(1060, 135, 570, 900, 'SERVIDOR  ·  backend/src', 'srv')
    l.zona(1656, 135, 240, 620, 'DATOS', 'bd')

    l.caja(60, 190, 924, 110, ['*Interfaz web (React)', '`App.tsx · pantallas/Juego.tsx · MenuAlumno.tsx · PanelTutor.tsx'], 'nav')
    columnas = [
        (60, [('*Editor de bloques', 22), ('`BlocklyEditor.tsx', 18), ('`blocks.ts', 18), 'arma el programa']),
        (296, ['*Interpretador', ('`interpreter.ts', 18), 'lo ejecuta y', 'detecta errores']),
        (532, ['*MotorGuias', ('`motorGuias.ts', 18), 'elige la pista', 'correctiva']),
        (768, ['*GestorProgreso', ('`gestorProgreso.ts', 18), 'guarda el avance', 'y sincroniza']),
    ]
    for x, lineas in columnas:
        l.caja(x, 370, 216, 190, lineas, 'blanco')
        l.flecha([(x + 108, 300), (x + 108, 368)], color=INDIGO)

    l.caja(60, 630, 452, 130, ['*Service worker', '`public/sw.js', 'abre la app sin internet'], 'blanco')
    l.caja(532, 630, 216, 130, ['*AlmacenLocal', '`almacen.ts', 'localStorage'], 'blanco')
    l.caja(768, 630, 216, 130, ['*Cliente HTTP', '`api.ts', 'llamar()'], 'blanco')
    l.flecha([(820, 560), (680, 628)], color=INDIGO)
    l.flecha([(876, 560), (876, 628)], color=INDIGO)

    l.caja(60, 810, 924, 190, ['*La decisión central de la arquitectura', 'El programa del alumno se evalúa aquí, en su propio navegador.', 'Respuesta inmediata, sirve con mala conexión y equipos modestos,', 'y el servidor nunca ejecuta código escrito por el alumno.'], 'aviso')

    l.caja(1072, 190, 170, 820, ['*ApiGateway', '`app.ts', ' ', 'seguridad', 'CORS', 'límite de', 'peticiones', 'rutas'], 'srv')
    servicios = [
        (190, ['*ServicioContenido', '`contenido.ts', 'niveles, desafíos y guías']),
        (440, ['*ServicioProgreso', '`progreso.ts', 'avance, XP y panel del tutor']),
        (690, ['*ServicioAutenticacion', '`autenticacion.ts', 'tutor con 2FA, alumno y', 'consentimiento']),
    ]
    for y, lineas in servicios:
        l.caja(1282, y, 328, 190, lineas, 'blanco')
        l.flecha([(1242, y + 95), (1280, y + 95)], color=AMBAR)
    l.flecha([(984, 695), (1070, 695)], color=LINEA)
    l.nota(1030, 680, 'HTTP', 19, 700, ancla='middle')
    l.nota(1030, 722, 'JSON', 19, 700, ancla='middle')

    l.caja(1672, 190, 208, 545, ['*PostgreSQL', ' ', '`tutor', '`alumno', '`consentimiento', '`nivel', '`desafio', '`guia_correctiva', '`progreso', ' ', 'acceso con', 'Prisma'], 'bd')
    l.flecha([(1610, 285), (1670, 285)], color=BD)
    l.flecha([(1610, 535), (1670, 535)], color=BD)
    l.flecha([(1610, 725), (1670, 725)], color=BD)

    l.caja(1656, 800, 240, 170, ['*Brevo', 'servicio externo', 'de correo:', 'envía el código'], 'ext')
    l.flecha([(1610, 840), (1654, 880)], punteada=True)
    return l


def del_bloque_al_robot():
    l = Lienzo(2, 'Del bloque al robot', 'Qué ocurre al presionar «Ejecutar», con el ejemplo del desafío «Primeros pasos». Todo pasa dentro del navegador.', 'frontend/src/pantallas/Juego.tsx · ejecutarPrograma()')
    y, h = 150, 400
    l.caja(40, y, 330, h, [' '], 'nav')
    l.nota(205, 192, '1. El alumno une bloques', 24, 700, '#4F46E5', ancla='middle')
    l.nota(205, 490, 'Lo que ve en la pantalla', 20, ancla='middle')
    for i, (t, c) in enumerate([('▶ Al ejecutar', '#E0A526'), ('avanzar', '#2F9E77'), ('avanzar', '#2F9E77')]):
        by = 225 + i * 72
        l.p.append(f'<rect x="85" y="{by}" width="240" height="66" rx="10" fill="{c}"/>')
        l.p.append(f'<text x="205" y="{by + 42}" font-family="\'Noto Sans\'" font-size="26" font-weight="700" fill="#fff" text-anchor="middle">{t}</text>')

    l.caja(450, y, 330, h, ['*2. Se traduce a datos', '`compilarWorkspace(ws)', ' ', '`[                     ', "`  { tipo: 'avanzar' },", "`  { tipo: 'avanzar' } ", '`]                     ', ' ', 'Es una lista, no código:', 'no se usa eval()'], 'blanco')
    l.caja(860, y, 330, h, ['*3. Se ejecuta', '`ejecutar(programa, ', '`         laberinto)', ' ', 'Recorre la lista sobre', 'el laberinto, sin dibujar', 'nada todavía', ' ', 'Máximo: 200 pasos'], 'blanco')
    l.caja(1270, y, 610, h, ['*4. Devuelve el resultado', '`ResultadoEjecucion', ' ', "`estado:      'EXITO'".ljust(38), '`traza:       [inicio, paso 1, paso 2]', '`patronError: null'.ljust(38), '`pasos:       2'.ljust(38), ' ', 'La traza es el camino que seguirá la animación'], 'blanco')
    l.flecha([(370, 350), (448, 350)])
    l.flecha([(780, 350), (858, 350)])
    l.flecha([(1190, 350), (1268, 350)])

    l.flecha([(1575, 550), (1575, 600), (1020, 600), (1020, 628)])
    l.caja(760, 630, 520, 120, ['*5. Se anima al robot', 'Avanza un paso de la traza cada 350 ms'], 'nav')
    l.flecha([(1020, 750), (1020, 790)])
    l.rombo(1020, 860, 340, 140, ['*¿Llegó a la meta?', "`estado = 'EXITO'"])

    l.flecha([(850, 860), (700, 860)], color=ROJO)
    l.nota(775, 845, 'no', 22, 700, ROJO, ancla='middle')
    l.caja(40, 650, 660, 370, ['*Hay un error: el alumno recibe una pista', ' ', '`seleccionar(patronError, guias)', ' ', 'El MotorGuias busca la guía de ese error en ese desafío.', 'No revela la solución, no suma XP y solo cuenta el intento.', ' ', 'Evaluar y elegir la pista tardó 1 ms o menos en la prueba', 'PA-10, con la CPU 6 veces más lenta (meta: 300 ms o menos)'], 'mal')

    l.flecha([(1190, 860), (1330, 860)], color=VERDE)
    l.nota(1260, 845, 'sí', 22, 700, VERDE, ancla='middle')
    l.caja(1332, 650, 548, 370, ['*Lo logró: se registra el avance', ' ', '`gestor.registrarResultado(id, r)', ' ', 'Cuenta el intento y, solo la primera vez', 'que lo logra, guarda el progreso', 'en el navegador y suma XP.', ' ', 'Luego intenta sincronizar con el servidor'], 'ok')
    return l


def interpretador():
    l = Lienzo(3, 'Cómo piensa el Interpretador', 'La función correr() recorre las instrucciones una por una. Toda ejecución termina en uno de cinco finales.', 'frontend/src/game/interpreter.ts · ejecutar()')
    l.rombo(250, 215, 400, 120, ['*¿Programa vacío?'])
    l.flecha([(250, 275), (250, 298)])
    l.nota(268, 293, 'no', 22, 700)
    l.caja(70, 300, 360, 70, ['*Siguiente instrucción'], 'nav')
    l.flecha([(250, 370), (250, 408)])
    l.rombo(250, 470, 340, 120, ['*¿Ya está', '*en la meta?'])
    l.flecha([(250, 530), (250, 568)])
    l.nota(268, 556, 'no', 22, 700)
    l.caja(70, 570, 360, 80, ['*Contar un paso', '`contarPaso()'], 'nav')
    l.flecha([(250, 650), (250, 668)])
    l.rombo(250, 735, 340, 130, ['*¿Más de', '*200 pasos?'])

    l.flecha([(420, 735), (558, 735)])
    l.nota(490, 722, 'no', 22, 700, ancla='middle')

    l.zona(560, 150, 720, 620, '¿Qué instrucción es?  ·  switch (ins.tipo)', 'nav')
    filas = [
        (205, 'avanzar', '¿Hay camino adelante? Sí: mueve al robot y lo anota en la traza. No: choque.'),
        (315, 'girar', 'Cambia la dirección N, E, S, O y lo anota en la traza.'),
        (425, 'repetir', 'Corre el cuerpo N veces, salvo que llegue antes a la meta.'),
        (535, 'repetirHastaMeta', 'Corre el cuerpo mientras no esté en la meta. Cada vuelta cuenta un paso.'),
        (645, 'siCaminoAdelante', 'Mira adelante: corre «entonces» si hay camino, o «si no» si hay pared.'),
    ]
    for y, nombre, desc in filas:
        l.caja(580, y, 245, 100, ['`' + nombre], 'blanco')
        l.caja(825, y, 435, 100, _partir(desc, 40), 'blanco')
    l.flecha([(558, 335), (432, 335)], color=INDIGO)
    l.nota(495, 322, 'la siguiente', 19, 700, INDIGO, ancla='middle')

    finales = [
        (150, 'mal', "*ERROR · 'vacio'", 'No hay ningún bloque conectado'),
        (270, 'mal', "*ERROR · 'choque'", 'Intentó avanzar hacia una pared'),
        (390, 'mal', "*ERROR · 'limite_pasos'", 'Superó 200 pasos: ciclo sin fin'),
        (810, 'ok', '*EXITO', 'Llegó a la meta'),
        (925, 'aviso', "*REINTENTO · 'incompleto'", 'Terminó, pero no llegó a la meta'),
    ]
    for y, tipo, a, b in finales:
        l.caja(1360, y, 520, 108, [a, b], tipo)
    l.caja(1360, 535, 520, 235, ['*Los cinco finales', 'Cada uno se devuelve como un', '`ResultadoEjecucion', 'con su estado, la traza recorrida,', 'el patrón de error y los pasos usados.'], 'blanco')

    l.flecha([(450, 215), (510, 215), (510, 136), (1320, 136), (1320, 204), (1358, 204)], color=ROJO)
    l.nota(480, 202, 'sí', 22, 700, ROJO, ancla='middle')
    l.flecha([(1260, 255), (1300, 255), (1300, 324), (1358, 324)], color=ROJO)
    l.flecha([(250, 800), (1320, 800), (1320, 444), (1358, 444)], color=ROJO)
    l.nota(445, 792, 'sí: se lanza LimiteExcedido', 20, 700, ROJO)

    l.flecha([(70, 335), (32, 335), (32, 900), (638, 900)], color=VERDE)
    l.flecha([(80, 470), (34, 470)], color=VERDE)
    l.nota(58, 458, 'sí', 22, 700, VERDE, ancla='middle')
    l.nota(50, 888, 'en la meta, o no quedan más instrucciones', 20, 700, VERDE)
    l.rombo(870, 900, 460, 130, ['*¿Terminó en la meta?', '`enMeta()'])
    l.flecha([(1100, 900), (1300, 900), (1300, 864), (1358, 864)], color=VERDE)
    l.nota(1200, 887, 'sí', 22, 700, VERDE, ancla='middle')
    l.flecha([(870, 965), (870, 979), (1358, 979)], color=AMBAR)
    l.nota(1110, 967, 'no', 22, 700, AMBAR, ancla='middle')
    return l


def _partir(t, n):
    filas, actual = [], ''
    for p in t.split():
        if len(actual) + len(p) + 1 > n:
            filas.append(actual)
            actual = p
        else:
            actual = f'{actual} {p}'.strip()
    return filas + [actual]


def guias():
    l = Lienzo(4, 'El error se convierte en una pista', 'El Interpretador nombra el error y el MotorGuias entrega el mensaje de ese desafío, sin revelar la solución', 'frontend/src/game/motorGuias.ts · seleccionar() · backend/prisma/contenido.ts')
    columnas = [(40, 390, 'Qué hizo el alumno'), (440, 300, 'patronError'), (750, 1130, 'Guía genérica que recibe (cada desafío puede tener la suya)')]
    for x, w, t in columnas:
        l.caja(x, 145, w, 60, ['*' + t], 'ext')
    filas = [
        ("Ejecutó sin conectar bloques", 'vacio', 'mal', 'Tu programa está vacío. Arrastra bloques desde la izquierda y únelos debajo de «Al ejecutar».'),
        ("Avanzó contra una pared", 'choque', 'mal', 'Tu robot chocó con una pared. Mira hacia dónde apunta la flecha justo antes del choque: ¿necesitaba girar antes de avanzar?'),
        ("Se detuvo antes de la meta", 'incompleto', 'aviso', 'Tu robot se detuvo antes de llegar a la meta. Cuenta cuántas casillas le faltan y agrega los pasos que faltan.'),
        ("Armó un ciclo sin fin", 'limite_pasos', 'mal', 'Tu programa se repite sin terminar nunca. Revisa los bloques «repetir»: ¿el robot realmente se acerca a la meta en cada vuelta?'),
    ]
    y = 215
    for hizo, patron, tipo, guia in filas:
        l.caja(40, y, 390, 118, [hizo], 'blanco')
        l.caja(440, y, 300, 118, ['`' + patron], tipo)
        l.caja(750, y, 1130, 118, _partir(guia, 100), 'blanco')
        y += 128

    l.zona(40, 735, 1840, 305, 'Cómo elige la guía: seleccionar(patronError, guias)', 'nav')
    pasos = [
        (70, ['*1. Filtrar', 'Guías del desafío con', 'ese patrón de error']),
        (500, ['*2. Ordenar', 'Por el campo «orden»', 'de menor a mayor']),
        (930, ['*3. Usar la primera', 'Es la guía que ve', 'el alumno']),
        (1360, ['*Si no hay ninguna', 'Usa una guía de respaldo', 'incluida en el código']),
    ]
    for x, lineas in pasos:
        l.caja(x, 795, 390, 140, lineas, 'mal' if x == 1360 else 'blanco')
    for x in (460, 890):
        l.flecha([(x, 865), (x + 38, 865)], color=INDIGO)
    l.flecha([(1320, 865), (1358, 865)], punteada=True, color=ROJO)
    l.nota(960, 985, 'Corre en el navegador y no depende de la red. Los 6 desafíos tienen guía para los 4 patrones de error (prueba OE3).', 22, 700, ancla='middle')
    return l


def progreso():
    l = Lienzo(5, 'El progreso se guarda aunque no haya internet', 'Primero queda en el navegador y después se envía por lotes. Reenviar el mismo lote nunca duplica el XP.', 'frontend/src/game/gestorProgreso.ts · backend/src/servicios/progreso.ts')
    s = Secuencia(l, [
        ('juego', 190, 280, ['*Juego.tsx', 'pantalla del alumno'], 'nav'),
        ('gestor', 590, 280, ['*GestorProgreso', 'en el navegador'], 'nav'),
        ('local', 950, 240, ['*localStorage', 'del dispositivo'], 'nav'),
        ('serv', 1340, 280, ['*ServicioProgreso', 'en el servidor'], 'srv'),
        ('bd', 1720, 240, ['*PostgreSQL', 'tabla progreso'], 'bd'),
    ])
    s.msg('juego', 'gestor', 262, 'registrarResultado(id, resultado)', mono=False)
    s.msg('gestor', 'local', 318, 'guarda completado y pendiente')
    s.msg('gestor', 'juego', 374, 'Progreso nuevo: suma XP en pantalla', retorno=True)
    s.msg('juego', 'gestor', 430, 'sincronizar()')

    s.marco(40, 462, 1840, 228, 'CON CONEXIÓN', 'ok')
    s.msg('gestor', 'serv', 528, 'POST /api/progreso/sincronizar  (lote de pendientes)')
    s.msg('serv', 'bd', 584, 'upsert por (alumno, desafío)')
    s.msg('serv', 'gestor', 640, 'XP total y registros: el XP lo fija el servidor', retorno=True)
    s.propio('gestor', 668, 'borra de pendientes lo que se envió')

    s.marco(40, 708, 1840, 200, 'SIN CONEXIÓN', 'mal')
    s.msg('gestor', 'serv', 776, 'la petición falla', mal=True)
    s.msg('gestor', 'juego', 832, 'estado: «Sin conexión · 1 por guardar»', retorno=True)
    s.propio('gestor', 868, 'los pendientes siguen en localStorage')

    s.marco(40, 926, 1840, 110, 'AL VOLVER LA CONEXIÓN', 'aviso')
    s.msg('juego', 'gestor', 1000, 'evento «online»: sincronizar()')
    l.nota(1000, 1006, 'Se repite el flujo de «con conexión» y el lote se envía solo', 22, 700)
    return l


def login_tutor():
    l = Lienzo(6, 'Inicio de sesión del tutor con doble factor', 'Primero la contraseña y luego un código de 6 dígitos que llega al correo. Sin el código no hay sesión.', 'backend/src/servicios/autenticacion.ts · seguridad/tokens.ts · seguridad/contrasenas.ts')
    s = Secuencia(l, [
        ('tutor', 170, 240, ['*Tutor', 'en el navegador'], 'nav'),
        ('auth', 660, 320, ['*ServicioAutenticacion', 'en el servidor'], 'srv'),
        ('tokens', 1140, 240, ['*Tokens', 'JWT y HMAC'], 'srv'),
        ('bd', 1480, 220, ['*PostgreSQL', 'tabla tutor'], 'bd'),
        ('correo', 1770, 200, ['*Brevo', 'correo'], 'ext'),
    ])
    s.marco(40, 225, 1840, 410, 'PASO 1: LA CONTRASEÑA', 'nav')
    s.msg('tutor', 'auth', 295, 'POST /auth/tutor/login')
    s.msg('auth', 'bd', 345, 'busca al tutor por username')
    s.propio('auth', 390, 'verificar(): compara con el hash scrypt')
    s.msg('auth', 'tokens', 450, 'crearDesafio2fa()')
    s.msg('tokens', 'auth', 500, 'código y token de 10 min', retorno=True)
    s.msg('auth', 'correo', 550, 'envía el código al correo del tutor')
    s.msg('auth', 'tutor', 600, '{ desafio2fa, enviadoA: «tu*******cl» }', retorno=True)

    s.marco(40, 650, 1840, 250, 'PASO 2: EL CÓDIGO', 'ok')
    s.msg('tutor', 'auth', 720, 'POST /auth/tutor/verificar  { desafio2fa, codigo }')
    s.msg('auth', 'tokens', 770, 'verificarDesafio2fa()')
    s.msg('auth', 'tokens', 820, 'firmarSesion({ sub, rol: tutor })')
    s.msg('auth', 'tutor', 870, 'JWT de sesión, válido 8 horas', retorno=True)

    l.caja(40, 915, 590, 120, ['*El token guarda solo un HMAC', 'El código no va en claro dentro del token', 'y tampoco se guarda en la base de datos'], 'blanco')
    l.caja(665, 915, 590, 120, ['*Errores que no revelan nada', 'Contraseña mala o usuario inexistente', 'dan la misma respuesta: 401'], 'mal')
    l.caja(1290, 915, 590, 120, ['*Si el correo falla', 'Responde 503, pide reintentar', 'y no entrega ninguna sesión'], 'aviso')
    return l


def registro_alumno():
    l = Lienzo(7, 'Registro del alumno: datos mínimos y consentimiento', 'Solo el tutor puede registrar. El alumno y su consentimiento se guardan juntos o no se guarda ninguno.', 'backend/src/servicios/autenticacion.ts · POST /api/alumnos')
    pasos = [
        (140, 'nav', ['*1. El tutor completa el formulario', 'usuario, clave, edad y consentimiento']),
        (280, 'srv', ['*2. ¿Tiene sesión de tutor?', '`tokens.exigir("tutor")']),
        (420, 'srv', ['*3. ¿Los datos son válidos?', '`validar(z.object(...))', 'edad de 9 a 15 · consentimiento = true']),
        (580, 'srv', ['*4. ¿El usuario está libre?', '`db.alumno.findUnique()']),
        (720, 'srv', ['*5. Hash de la clave', '`hashear(password) con scrypt']),
    ]
    for y, tipo, lineas in pasos:
        l.caja(60, y, 660, 120 if y != 420 else 140, lineas, tipo)
    for y1, y2 in [(260, 278), (400, 418), (560, 578), (700, 718), (840, 858)]:
        l.flecha([(390, y1), (390, y2)])
    errores = [(280, '401 / 403', 'sin sesión de tutor'), (420, '400', 'datos inválidos'), (580, '409', 'usuario repetido')]
    for y, codigo, t in errores:
        l.caja(800, y + 15, 230, 90, [f'*{codigo}', t], 'mal')
        l.flecha([(720, y + 60), (798, y + 60)], color=ROJO)

    l.zona(60, 860, 970, 180, 'Una sola transacción: db.$transaction() · responde 201', 'bd')
    l.caja(80, 912, 440, 108, ['`alumno.create', 'identificador anónimo incluido'], 'blanco')
    l.caja(570, 912, 440, 108, ['`consentimiento.create', 'método: login_2fa_tutor'], 'blanco')
    l.flecha([(520, 966), (568, 966)], color=BD)

    l.zona(1090, 140, 790, 420, 'Lo que se guarda del alumno', 'ok')
    guardados = ['`id · anon_id', '`username', '`password_hash', '`edad', '`tutor_id', '`created_at']
    for i, g in enumerate(guardados):
        x = 1115 + (i % 2) * 380
        y = 195 + (i // 2) * 115
        l.caja(x, y, 360, 100, [g], 'blanco')

    l.zona(1090, 585, 790, 195, 'Lo que NO se guarda del alumno (Zero-Data, Ley 19.628)', 'mal')
    for i, t in enumerate(['Nombre real', 'Correo', 'Biometría']):
        l.caja(1115 + i * 252, 640, 235, 110, ['*' + t], 'blanco')

    l.caja(1090, 805, 790, 235, ['*Consentimiento inmutable', ' ', 'Un trigger de PostgreSQL rechaza cualquier UPDATE o DELETE:', '`consentimiento_inmutable', ' ', 'Lo garantiza la propia base de datos, no solo la aplicación.'], 'aviso')
    return l


def modelo_datos():
    l = Lienzo(8, 'Modelo de datos', 'Siete tablas en PostgreSQL. El progreso se registra por desafío y un nivel completo se calcula, no se almacena.', 'backend/prisma/schema.prisma')

    def tabla(x, y, w, nombre, filas, tipo):
        l.caja(x, y, w, 56, ['*' + nombre], tipo)
        alto = 12 + len(filas) * 33
        l.caja(x, y + 56, w, alto, [('`' + f, 20) for f in filas], 'blanco', radio=6)
        return y + 56 + alto

    tabla(50, 150, 400, 'TUTOR', ['id  PK', 'username  UNIQUE', 'password_hash', 'two_factor_enabled', 'contacto_verificado', 'created_at'], 'srv')
    tabla(50, 560, 400, 'ALUMNO', ['id  PK', 'tutor_id  FK', 'username  UNIQUE', 'password_hash', 'anon_id  UNIQUE', 'edad', 'created_at'], 'nav')
    tabla(620, 150, 400, 'CONSENTIMIENTO', ['id  PK', 'tutor_id  FK', 'alumno_id  FK', 'otorgado_en', 'metodo_verificacion'], 'aviso')
    tabla(620, 620, 400, 'PROGRESO', ['id  PK', 'alumno_id  FK', 'desafio_id  FK', 'completado_en', 'xp_obtenido', 'intentos', 'UNIQUE (alumno, desafio)'], 'ok')
    tabla(1190, 620, 330, 'DESAFIO', ['id  PK', 'nivel_id  FK', 'orden, titulo', 'enunciado', 'laberinto  JSON', 'bloques_permitidos', 'bloques_optimos', 'xp_recompensa'], 'bd')
    tabla(1590, 620, 290, 'GUIA_CORRECTIVA', ['id  PK', 'desafio_id  FK', 'patron_error', 'mensaje', 'orden'], 'bd')
    tabla(1190, 240, 330, 'NIVEL', ['id  PK', 'orden  UNIQUE', 'titulo', 'descripcion'], 'bd')

    def rel(pts, a, b, pa, pb, color='#3D4663'):
        l.flecha(pts, color=color)
        l.nota(pa[0], pa[1], a, 22, 700, ancla='middle')
        l.nota(pb[0], pb[1], b, 22, 700, ancla='middle')

    rel([(250, 418), (250, 558)], '1', '0..*', (270, 448), (290, 545))
    rel([(450, 240), (618, 240)], '1', '0..*', (470, 228), (585, 228))
    rel([(450, 660), (535, 660), (535, 340), (618, 340)], '1', '1..*', (470, 648), (585, 328))
    rel([(450, 800), (618, 800)], '1', '0..*', (470, 788), (585, 788))
    rel([(1188, 800), (1022, 800)], '1', '0..*', (1168, 788), (1050, 788))
    rel([(1355, 442), (1355, 618)], '1', '1..*', (1375, 472), (1385, 605))
    rel([(1520, 780), (1588, 780)], '1', '1..*', (1536, 768), (1553, 808))

    l.nota(50, 985, 'PK: clave primaria   ·   FK: clave foránea   ·   1..*: uno o más   ·   0..*: cero o más', 22, ancla='start')
    l.caja(1560, 150, 320, 410, ['*Reglas clave', ' ', 'El XP lo fija el servidor', 'desde xp_recompensa', ' ', 'Sincronizar dos veces', 'no duplica: UNIQUE', '(alumno, desafio)', ' ', 'Consentimiento solo', 'se puede insertar'], 'aviso')
    return l


def sin_conexion():
    l = Lienzo(9, 'Cómo abre la aplicación sin internet', 'El service worker intercepta las peticiones de archivos y localStorage conserva los datos del alumno', 'frontend/public/sw.js · frontend/src/main.tsx')
    l.zona(40, 140, 1110, 895, 'El service worker decide de dónde sale cada archivo', 'nav')
    l.caja(70, 195, 1050, 110, ['*Al instalarse: precargar()', 'Guarda en caché la página, los archivos de la app y los recursos de Blockly'], 'blanco')
    l.flecha([(595, 305), (595, 345)], color=INDIGO)
    l.caja(350, 347, 490, 70, ['*Llega una petición: evento fetch'], 'nav')
    l.flecha([(595, 417), (595, 450)], color=INDIGO)
    l.rombo(595, 520, 420, 136, ['*¿Es GET y del mismo', '*origen, sin ser /api?'])
    l.flecha([(385, 520), (235, 520), (235, 618)])
    l.nota(310, 506, 'no', 22, 700, ancla='middle')
    l.caja(70, 620, 330, 140, ['*No interviene', 'Las peticiones a /api', 'van directo a la red'], 'ext')
    l.flecha([(805, 520), (870, 520), (870, 595), (790, 595), (790, 618)])
    l.nota(840, 506, 'sí', 22, 700, ancla='middle')
    l.rombo(790, 690, 360, 140, ['*¿Es abrir', '*una página?'])
    l.flecha([(610, 690), (500, 690), (500, 835)])
    l.nota(555, 677, 'sí', 22, 700, ancla='middle')
    l.flecha([(970, 690), (1040, 690), (1040, 835)])
    l.nota(1005, 677, 'no', 22, 700, ancla='middle')
    l.caja(70, 837, 520, 175, ['*La página: red primero', '`paginaRedPrimero()', 'Pide la versión nueva y guarda una copia.', 'Si no hay red, entrega la copia guardada.'], 'ok')
    l.caja(610, 837, 520, 175, ['*Los archivos: caché primero', '`archivoCachePrimero()', 'Si ya está guardado, lo entrega de inmediato.', 'Si no, lo descarga y lo guarda.'], 'ok')

    l.zona(1190, 140, 690, 895, 'Lo que el alumno conserva sin internet', 'bd')
    datos = [
        ('Su sesión', 'codeworld.sesion'),
        ('Niveles y desafíos', 'codeworld.contenido'),
        ('El programa a medio armar', 'codeworld.programa.<alumno>.<desafío>'),
        ('Progreso y pendientes', 'codeworld.progreso.<alumno>'),
        ('Tutoriales ya vistos', 'codeworld.ayuda.<usuario>'),
    ]
    y = 195
    for titulo, clave in datos:
        l.caja(1215, y, 640, 110, ['*' + titulo, '`' + clave], 'blanco')
        y += 125
    l.caja(1215, 825, 640, 190, ['*Verificado en la prueba PA-08', 'Sin red: recarga, juega y gana XP.', 'El servidor sigue en 0 XP.', 'Vuelve la red: el servidor recibe los 10 XP.'], 'ok')
    return l


def peticion_api():
    l = Lienzo(10, 'El camino de una petición por la API', 'Los filtros corren en orden; exigir y validar, solo en las rutas que los usan. Si uno falla, responde un error en JSON.', 'backend/src/app.ts · servicios/validacion.ts · seguridad/tokens.ts')
    pasos = [
        (['*helmet()', 'cabeceras de', 'seguridad'], None),
        (['*cors()', 'solo el origen', 'de la app'], None),
        (['*express.json()', 'cuerpo de hasta', '100 KB'], ('400', 'JSON mal formado')),
        (['*rateLimit()', '300 por minuto;', 'login: 20'], ('429', 'demasiadas peticiones')),
        (['*Ruta', '¿existe', 'el endpoint?'], ('404', 'ruta no encontrada')),
        (['*exigir(rol)', '¿JWT válido y', 'rol correcto?'], ('401 / 403', 'sin sesión o sin permiso')),
        (['*validar()', 'esquema Zod', 'del cuerpo'], ('400', 'dato inválido')),
    ]
    ancho, sep = 232, 26
    x = 40
    y = 180
    for i, (lineas, error) in enumerate(pasos):
        l.caja(x, y, ancho, 190, lineas, 'srv')
        if i < len(pasos) - 1:
            l.flecha([(x + ancho, y + 95), (x + ancho + sep - 2, y + 95)])
        if error:
            l.flecha([(x + ancho / 2, y + 190), (x + ancho / 2, 468)], color=ROJO)
            l.caja(x, 470, ancho, 120, ['*' + error[0], *_partir(error[1], 22)], 'mal')
        x += ancho + sep

    l.flecha([(1820, 275), (1865, 275), (1865, 660), (1500, 660)])
    l.caja(1020, 620, 478, 110, ['*Servicio', 'ejecuta la operación (handler)'], 'nav')
    l.flecha([(1020, 675), (800, 675)], color=BD)
    l.caja(320, 620, 478, 110, ['*Prisma y PostgreSQL', 'consultas parametrizadas: evita inyección SQL'], 'bd')

    l.caja(800, 760, 330, 100, ['*Respuesta 200 o 201', 'en JSON'], 'ok')
    l.flecha([(1075, 730), (1075, 758)], color=VERDE)
    l.caja(1290, 760, 590, 100, ['*Cualquier otro fallo: 500', 'mensaje genérico, sin detalles internos'], 'mal')
    l.flecha([(1400, 730), (1400, 758)], color=ROJO)

    l.caja(40, 890, 1840, 145, ['*Lo que el servidor nunca hace', 'No ejecuta el programa del alumno. Si el navegador envía un progreso con un desafío inexistente, lo descarta,', 'y el XP siempre sale de la base de datos, no de lo que diga el navegador.'], 'aviso')
    return l


def estado():
    l = Lienzo(11, 'Estado del software', 'Qué está construido y probado, qué falta por verificar y qué sigue pendiente (5 de noviembre de 2026)')
    columnas = [
        (40, 'ok', 'Construido y probado', [
            'Editor de bloques en español',
            'Interpretador local con límite de 200 pasos',
            'Guías correctivas: 6 desafíos, 4 errores',
            '3 niveles y 6 desafíos desde PostgreSQL',
            'Tutor con 2FA, alumno y consentimiento',
            'XP, progreso y panel del tutor',
            'Sincronización e inicio sin conexión',
            'Autoguardado del programa',
            'Tutoriales y ayuda animada de bloques',
            'Interfaz para computador, tableta y celular',
        ]),
        (660, 'aviso', 'Hecho, falta verificar en real', [
            'Correo 2FA con Brevo: probado con simulador',
            'Arrastre táctil en celular y tableta',
            'Safari en iOS y Android físicos',
            'Equipo escolar de 2 GB de RAM',
            'Carga en el hosting definitivo',
        ]),
        (1280, 'mal', 'Pendiente', [
            'Despliegue en hosting',
            'Prueba con 10 jóvenes (OE4)',
            'Más desafíos por nivel',
            'Decidir POO y robótica',
            'Revisar falla intermitente de carga',
        ]),
    ]
    for x, tipo, titulo, filas in columnas:
        l.caja(x, 145, 600, 70, ['*' + titulo], tipo)
        y = 225
        alto = 58
        for f in filas:
            l.caja(x, y, 600, alto - 6, [f], 'blanco', radio=8)
            y += alto
    l.zona(40, 830 - 10, 1840, 215, 'Evidencia de las pruebas (corridas locales)', 'nav')
    numeros = [
        (70, '64 de 64', 'unitarias e integración'),
        (520, '43 pasan', '2 omitidas, 0 fallan: aceptación'),
        (970, '100 conexiones', 'última corrida de carga cumple'),
        (1420, '≤ 1 ms', 'retroalimentación con CPU lenta'),
    ]
    for x, n, t in numeros:
        l.caja(x, 870, 430, 150, [('*' + n, 40), t], 'blanco')
    return l


def cronograma():
    l = Lienzo(12, 'Cronograma del proyecto', 'Gestión (PMBOK) y desarrollo (sprints), semana a semana, del 3 de agosto al 22 de noviembre de 2026.  RC: ruta crítica')
    x0, ancho_col, y0, alto = 650, 76, 135, 50
    meses = [('Agosto', 0, 4), ('Septiembre', 4, 4), ('Octubre', 8, 5), ('Noviembre', 13, 3)]
    for t, a, n in meses:
        l.caja(x0 + a * ancho_col, y0, n * ancho_col, 40, [('*' + t, 24)], 'ext', radio=2)
    for s in range(16):
        l.caja(x0 + s * ancho_col, y0 + 40, ancho_col, 40, [(f'*{s + 1}', 22)], 'blanco', radio=2)
    filas = [
        ('t', 'GESTIÓN DEL PROYECTO (PMBOK)'),
        ('Inicio', 1, 2, 'srv', False),
        ('Planificación y línea base', 2, 6, 'srv', False),
        ('Ejecución y monitoreo y control', 7, 16, 'srv', False),
        ('Cierre e informe final', 15, 16, 'srv', True),
        ('t', 'DESARROLLO DEL PRODUCTO (SPRINTS)'),
        ('Sprint 1: investigación y análisis', 1, 3, 'nav', True),
        ('Sprint 2: diseño del sistema', 4, 6, 'nav', True),
        ('Sprint 3: funcionalidades principales', 7, 10, 'nav', True),
        ('Sprint 4: integración y optimización', 11, 13, 'nav', True),
        ('Sprint 5: validación y cierre', 14, 16, 'nav', True),
        ('t', 'VALIDACIÓN'),
        ('Pruebas funcionales, integración, carga', 14, 14, 'bd', True),
        ('Despliegue en hosting', 15, 15, 'bd', False),
        ('Prueba con grupo de control (OE4)', 15, 15, 'bd', True),
        ('Análisis y ajustes posteriores', 16, 16, 'bd', False),
    ]
    y = y0 + 84
    for f in filas:
        if f[0] == 't':
            l.caja(50, y, x0 - 50 + 16 * ancho_col, alto - 2, [('*' + f[1], 26)], 'ext', radio=2)
            y += alto
            continue
        nombre, a, b, tipo, rc = f
        l.caja(50, y, x0 - 50, alto - 2, [(nombre + ('   · RC' if rc else ''), 26)], 'blanco', radio=2)
        for s in range(16):
            l.p.append(f'<rect x="{x0 + s * ancho_col}" y="{y}" width="{ancho_col}" height="{alto - 2}" fill="#FFFFFF" stroke="#C9CEDB"/>')
        relleno = {'srv': '#D98A2B', 'nav': '#4F46E5', 'bd': '#047857'}[tipo]
        l.p.append(f'<rect x="{x0 + (a - 1) * ancho_col + 3}" y="{y + 7}" width="{(b - a + 1) * ancho_col - 6}" height="{alto - 16}" rx="6" fill="{relleno}"/>')
        y += alto
    return l


DIAGRAMAS = [
    ('01-mapa-general', mapa_general),
    ('02-del-bloque-al-robot', del_bloque_al_robot),
    ('03-interpretador', interpretador),
    ('04-guias-correctivas', guias),
    ('05-progreso-sin-conexion', progreso),
    ('06-login-tutor-2fa', login_tutor),
    ('07-registro-alumno', registro_alumno),
    ('08-modelo-de-datos', modelo_datos),
    ('09-apertura-sin-internet', sin_conexion),
    ('10-peticion-api', peticion_api),
    ('11-estado-del-software', estado),
    ('12-cronograma', cronograma),
]

if __name__ == '__main__':
    SALIDA.mkdir(exist_ok=True)
    for nombre, f in DIAGRAMAS:
        (SALIDA / f'{nombre}.svg').write_text(f().svg(), encoding='utf-8')
