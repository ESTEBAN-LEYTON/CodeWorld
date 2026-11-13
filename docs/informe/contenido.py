"""Cuerpo del informe de CodeWorld. T(i) y filas(i) reutilizan el texto del informe anterior por su posición."""
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
DIAG = RAIZ / 'docs/diagramas'
CAP = RAIZ / 'docs/capturas'
TITULO = 'CODEWORLD: EMPODERANDO EL PENSAMIENTO LÓGICO EN JÓVENES MEDIANTE UNA EXPERIENCIA DE APRENDIZAJE PROGRAMÁTICO INTERACTIVO'


def gantt():
    """El Gantt sin el encabezado del diagrama para video: en el informe lo titula su pie de figura."""
    from tempfile import gettempdir
    from PIL import Image
    destino = Path(gettempdir()) / 'codeworld-informe/gantt.png'
    destino.parent.mkdir(parents=True, exist_ok=True)
    Image.open(DIAG / '12-cronograma.png').crop((40, 125, 1880, 1030)).save(destino)
    return destino


def resultados_carga():
    filas = []
    for linea in (RAIZ / 'docs/pruebas/resultados-carga.md').read_text(encoding='utf8').splitlines():
        c = [x.strip() for x in linea.strip('|').split('|')]
        if len(c) == 9 and c[1].isdigit():
            filas.append(c)
    return filas


def cuerpo(d, T, filas, img):
    capitulo1(d, T)
    capitulo2(d, T, filas, img)
    capitulo3(d, T, filas, img)
    capitulo4(d, T, filas, img)
    cierre(d)


def capitulo1(d, T):
    d.h1('CAPÍTULO I: INTRODUCCIÓN')
    d.h2('Contexto y motivación')
    for i in (140, 141, 142):
        d.p(T(i))
    d.h2('Importancia de resolver el problema de la deserción temprana en el aprendizaje de la programación')
    for i in (145, 147):
        d.p(T(i))
    d.h2('Breve discusión bibliográfica')
    for i in (149, 151, 153, 155, 157, 159):
        d.p(T(i))
    d.h2('Contribución del trabajo')
    for i in (161, 162):
        d.p(T(i))
    d.h2('Trabajo a realizar en el proyecto')
    d.p('El proyecto consiste en diseñar, construir y validar CodeWorld, una plataforma web utilizable desde el navegador de computadores, tabletas y celulares, que enseña programación a jóvenes de 9 a 15 años sin exigir escribir código. Se desarrolla un producto mínimo viable que integra el motor de bloques Google Blockly ejecutado localmente en el navegador, tres niveles con seis desafíos de secuencias, ciclos y condiciones, guías correctivas para todos los patrones de error de esos desafíos, un módulo de gamificación basado en experiencia y niveles, y un backend de autenticación, contenido y persistencia de progreso con acceso controlado por el tutor legal. El trabajo culmina con una validación con un grupo de control de al menos diez jóvenes del rango etario objetivo, para verificar las métricas de cada objetivo específico.')
    d.h2('Organización y presentación de este trabajo')
    d.p('El Capítulo II identifica el problema, presenta su análisis causal, define los objetivos bajo la metodología SMART, delimita alcances y limitaciones, revisa la normativa y expone la solución de alto nivel y el plan del proyecto. El Capítulo III desarrolla las metodologías de gestión y de desarrollo, la programación de los sprints, las herramientas, los controles, los planes de calidad y riesgos, el cronograma y el prototipo. El Capítulo IV presenta los resultados: la gestión ejecutada, el diseño con artefactos UML, la trazabilidad, la arquitectura, el modelo de datos, la construcción y las pruebas. Finalmente se exponen las conclusiones y recomendaciones, el glosario, las referencias y los anexos con los manuales y los diagramas de funcionamiento.')


def capitulo2(d, T, filas, img):
    d.h1('CAPÍTULO II: IDENTIFICACIÓN DEL PROBLEMA / OPORTUNIDAD')
    d.h2('Presentación y fundamentación del problema / oportunidad de mejora')
    for i in (170, 172):
        d.p(T(i))
    d.h2('Descripción de problemas / oportunidades de mejora')
    for i in (175, 176, 177, 178, 179, 180):
        d.p(T(i))
    d.h2('Identificación cuantitativa de problemas (ISHIKAWA / ARBOL DE OPORTUNIDADES)')
    d.figura(img('media/image3.png'), 'Diagrama de Ishikawa', cm_alto=10.5)
    d.tabla('Descripción de causas', filas(185), [17, 34, 25, 29])

    d.h2('Objetivo general')
    d.p('Desarrollar y validar, entre agosto y el 22 de noviembre de 2026, una plataforma web de programación con bloques visuales y retroalimentación inmediata, que permita que al menos el 80% de un grupo de control de 10 jóvenes de 9 a 15 años complete sin asistencia externa un ejercicio básico de lógica, para enfrentar la deserción temprana provocada por herramientas que asumen conocimientos previos y no orientan al estudiante cuando se equivoca.')
    d.h2('Objetivos específicos')
    d.p('Los objetivos se formularon con la metodología SMART (Doran, 1981): cada uno es específico, medible, alcanzable, relevante y tiene un plazo definido.')
    d.lista([
        '**OE1:** Diseñar una interfaz web responsiva en español para computador, tableta y celular, en la que toda opción principal esté a no más de 2 clics y al menos el 80% del grupo de control llegue a su primer desafío en 5 minutos o menos, verificado a más tardar el 15 de noviembre de 2026.',
        '**OE2:** Implementar, a más tardar el 13 de noviembre de 2026, un módulo de programación visual sobre Google Blockly con 3 niveles y 6 desafíos de secuencias, ciclos y condiciones, con al menos el 95% de sus funciones operativas en Chrome, Safari (iOS 16 o superior) y Android 12 o superior.',
        '**OE3:** Integrar, a más tardar el 13 de noviembre de 2026, un sistema de guías correctivas que cubra el 100% de los 4 patrones de error en los 6 desafíos y entregue la retroalimentación en 300 ms o menos.',
        '**OE4:** Evaluar la plataforma, a más tardar el 15 de noviembre de 2026, con un grupo de control de al menos 10 jóvenes de 9 a 15 años, y verificar que al menos el 80% complete un ejercicio básico de lógica sin asistencia externa.',
    ])
    d.tabla('Análisis SMART de los objetivos específicos', [
        ['OE', 'Específico', 'Medible', 'Alcanzable', 'Relevante', 'Temporal'],
        ['OE1', 'Interfaz web responsiva en español', 'Clics hasta cada opción; % que llega al primer desafío en 5 min', 'Usa React y tutoriales guiados; una sola base de código', 'Responde a la barrera de interfaces pensadas para adultos', '15-11-2026'],
        ['OE2', 'Módulo de bloques con 3 niveles y 6 desafíos', 'N.º de desafíos; % de funciones por navegador', 'Blockly es abierto y está probado; alcance acotado a 3 conceptos', 'Elimina la barrera sintáctica del código textual', '13-11-2026'],
        ['OE3', 'Guías por patrón de error y desafío', '% de combinaciones cubiertas (24); tiempo en ms', 'La evaluación es local y no depende de la red', 'Ataca la causa raíz: falta de guía ante el error', '13-11-2026'],
        ['OE4', 'Prueba con jóvenes de 9 a 15 años', '% que completa sin ayuda, sobre al menos 10', 'El autor enseña robótica y tiene acceso a jóvenes de esa edad', 'Valida el objetivo general con usuarios reales', '15-11-2026'],
    ], [7, 20, 23, 23, 23, 13])
    d.h2('Métricas de los Objetivos Específicos')
    d.tabla('Métricas cuantitativas de los objetivos específicos', [
        ['OE', 'Objetivo', 'Métrica', 'Criterio de éxito'],
        ['OE1', 'Diseñar la interfaz responsiva', 'Clics hasta las opciones principales; tiempo hasta el primer desafío', '2 clics o menos; al menos 80% del grupo en 5 minutos o menos'],
        ['OE2', 'Implementar el módulo de bloques', 'Desafíos operativos; funciones disponibles por navegador', '6 desafíos en 3 niveles; al menos 95% en Chrome, Safari (iOS 16+) y Android 12+'],
        ['OE3', 'Integrar las guías correctivas', 'Cobertura de patrones de error; tiempo de respuesta', '100% de 24 combinaciones; 300 ms o menos'],
        ['OE4', 'Evaluar con el grupo de control', 'Tasa de finalización autónoma de un ejercicio básico', 'Al menos 80% de un grupo de 10 o más jóvenes'],
    ], [6, 28, 34, 34])

    d.h2('Limitaciones y alcances del proyecto')
    d.p(T(204))
    d.lista([
        'Diseño de la experiencia de usuario de las pantallas de acceso, menú, área de programación, retroalimentación y progreso.',
        'Módulo de programación visual sobre Google Blockly con desafíos de secuencias, ciclos y condiciones, evaluados localmente en el navegador.',
        'Guías correctivas para el 100% de los patrones de error de los desafíos implementados.',
        'Módulo de gamificación: experiencia, niveles e indicadores de avance.',
        T(209),
        'Ejecución de pruebas unitarias, de integración, funcionales, de carga y de aceptación, y validación con un grupo de control de al menos diez jóvenes.',
    ])
    d.p('Queda fuera del alcance el desarrollo de aplicaciones móviles nativas, los bloques de orientación a objetos y de robótica, un panel institucional, la analítica avanzada, la publicación en tiendas de aplicaciones, la traducción a otros idiomas y la integración con sistemas de gestión escolar. Estas funcionalidades se documentan como trabajo futuro. Los bloques de orientación a objetos y de robótica se excluyeron mediante una solicitud de cambio, descrita en el Capítulo IV, para priorizar la calidad y la validación de los tres conceptos implementados. [[Confirmar esta decisión con la profesora.]]')
    d.p(T(212))
    d.lista([T(i) for i in (213, 214, 215, 216, 217)])

    d.h2('Normativa y leyes asociadas al proyecto')
    d.p(T(220))
    d.p(T(222))
    d.p('El registro y la autorización de acceso los realiza exclusivamente el tutor legal, que se autentica con doble factor mediante un código enviado a su correo. El sistema guarda un registro del consentimiento otorgado, disociado de la actividad lúdica del menor, que la propia base de datos impide modificar o eliminar. Además, se considera la Ley N.° 17.336 de Propiedad Intelectual para las bibliotecas de terceros y la Ley N.° 21.719, que moderniza la protección de datos personales en Chile, cuya entrada en vigencia está prevista para diciembre de 2026.')

    d.h2('Propuesta de solución de alto nivel (nivel macro)')
    d.p(T(227))
    d.lista([
        '**Bloque de aprendizaje:** desafíos organizados por dificultad creciente, desde secuencias simples hasta ciclos y condiciones, resueltos ensamblando bloques visuales.',
        T(229), T(230), T(231),
    ])
    d.p(T(232))

    d.h2('Plan de Proyecto')
    d.p('El plan organiza el desarrollo de CodeWorld en cinco fases sucesivas, cada una con un producto verificable y un criterio de término propios. El proyecto lo ejecuta un único desarrollador, por lo que cada fase depende de que la anterior haya cumplido su criterio. La Tabla 4 detalla el trabajo de cada fase y el Capítulo III programa sus sprints.')
    d.tabla('Plan del proyecto CodeWorld por fases', [
        ['Fase', 'Período (2026)', 'Trabajo del proyecto', 'Producto', 'Criterio de término'],
        ['1. Análisis', '3 ago – 23 ago', 'Levantar el problema, revisar literatura, definir requerimientos y alcance', 'Requerimientos, objetivos, alcance', 'Cada causa raíz tiene una capacidad y una métrica asociada'],
        ['2. Diseño', '24 ago – 13 sep', 'Definir arquitectura, modelo de datos, interfaces y prototipo', 'Artefactos UML, modelo relacional, prototipo', 'Diagramas coherentes entre sí y trazables a los requerimientos'],
        ['3. Construcción', '14 sep – 11 oct', 'Programar usuarios con 2FA, niveles, editor de bloques e intérprete', 'Producto mínimo ejecutable', 'Un alumno resuelve un desafío de principio a fin'],
        ['4. Integración', '12 oct – 1 nov', 'Integrar guías, gamificación, sincronización y ayudas', 'Sistema integrado', 'Frontend, backend y base de datos operan sin intervención manual'],
        ['5. Validación y cierre', '2 nov – 22 nov', 'Probar, desplegar, validar con usuarios y documentar', 'Evidencia de pruebas, informe y manuales', 'Métricas de OE1 a OE4 verificadas'],
    ], [18, 14, 30, 20, 26])


def capitulo3(d, T, filas, img):
    d.h1('CAPÍTULO III: METODOLOGÍA')
    d.h2('Metodología de desarrollo del proyecto')
    d.p('El proyecto se aborda en dos dimensiones: la gestión, que responde cómo se planifica y controla el trabajo, y el desarrollo, que responde cómo se construye el producto. Conviene precisar la naturaleza de cada referente: la guía PMBOK es un conjunto de buenas prácticas de gestión, Scrum es un marco de trabajo y Kanban es un método de gestión del flujo. Ninguno es por sí solo una metodología prescriptiva completa, por lo que este proyecto los combina en una **metodología híbrida** propia.')
    d.h3('Gestión del proyecto: guía PMBOK')
    d.p('La guía PMBOK, sexta edición (Project Management Institute, 2017), ordena la dirección de proyectos en 5 grupos de procesos y 10 áreas de conocimiento. Sus procesos no son fases que se ejecutan una sola vez: interactúan y se repiten durante todo el proyecto. Se aplicaron las áreas de integración, alcance, cronograma, calidad, comunicaciones, riesgos e interesados. La tabla siguiente resume cómo se aplicó cada grupo de procesos.')
    d.tabla('Grupos de procesos de la guía PMBOK y su aplicación', [
        ['Grupo', 'Qué establece', 'Aplicación en CodeWorld', 'Evidencia'],
        ['Inicio', 'Define el proyecto, autoriza su comienzo e identifica a los interesados', 'Problema y oportunidad definidos; interesados: estudiantes, tutores, docentes y profesora guía', 'Capítulos I y II'],
        ['Planificación', 'Fija alcance, objetivos y acciones; crea las líneas base', 'Objetivos SMART, plan por fases, línea base de cronograma, planes de calidad y riesgos', 'Tablas 2 a 4 y Capítulo III'],
        ['Ejecución', 'Realiza el trabajo para cumplir el plan', 'Construcción del producto mediante los sprints del marco híbrido', 'Repositorio del código'],
        ['Monitoreo y control', 'Compara avance y plan; gestiona cambios', 'Revisión semanal, riesgos actualizados y cambios evaluados por impacto', 'Capítulo IV'],
        ['Cierre', 'Formaliza el término y traspasa el producto', 'Validación, informe final, manuales y defensa', 'Anexos e informe'],
    ], [15, 30, 38, 17])
    d.tabla('Áreas de conocimiento de la guía PMBOK y su tratamiento', [
        ['Área', 'Qué gestiona', 'Tratamiento en CodeWorld'],
        ['Integración', 'Coordina todo el proyecto y sus cambios', 'Plan del proyecto y control integrado de cambios'],
        ['Alcance', 'Define lo que se hace y lo que no', 'Alcance, exclusiones y requerimientos trazados'],
        ['Cronograma', 'Programa actividades y plazos', 'Sprints, carta Gantt y ruta crítica'],
        ['Costos', 'Estima y controla el presupuesto', 'Simplificada: sin presupuesto; solo servicios gratuitos'],
        ['Calidad', 'Asegura que el producto cumpla los requisitos', 'Plan de pruebas con criterios medibles'],
        ['Recursos', 'Organiza personas y medios', 'Simplificada: desarrollador único'],
        ['Comunicaciones', 'Planifica la información del proyecto', 'Revisión semanal y entregas documentales'],
        ['Riesgos', 'Identifica y responde a riesgos', 'Matriz con mitigación y contingencia'],
        ['Adquisiciones', 'Gestiona compras y contratos', 'No aplica: no hay compras ni contratos'],
        ['Interesados', 'Identifica y gestiona a los involucrados', 'Estudiantes, tutores, docentes y profesora guía'],
    ], [19, 39, 42])
    d.h3('Desarrollo del producto: Scrum')
    d.p('Scrum es un marco de trabajo liviano para generar valor mediante soluciones adaptativas a problemas complejos (Schwaber y Sutherland, 2020). Se apoya en el empirismo y en tres pilares: transparencia, inspección y adaptación. El trabajo se organiza en sprints de duración fija que terminan en un incremento utilizable. La Tabla 7 define sus componentes y su adaptación a un equipo de una persona.')
    d.tabla('Componentes de Scrum y su adaptación en CodeWorld', [
        ['Componente', 'Definición', 'Adaptación en CodeWorld'],
        ['Product Owner', 'Maximiza el valor y ordena el Product Backlog', 'Lo asume el autor; la profesora guía aporta la retroalimentación externa'],
        ['Scrum Master', 'Vela por la eficacia del marco', 'Rol omitido: no hay equipo que facilitar'],
        ['Developers', 'Crean el incremento de cada sprint', 'El autor, como desarrollador único'],
        ['Sprint', 'Iteración de duración fija que contiene todo el trabajo', 'Sprints de 3 semanas; el Sprint 3 duró 4 por la entrega del Hito 2'],
        ['Sprint Planning', 'Define qué se hará y cómo', 'Selección de elementos del backlog al inicio de cada sprint'],
        ['Daily Scrum', 'Inspección diaria del avance del equipo', 'Sustituido por la revisión del tablero Kanban'],
        ['Sprint Review', 'Inspecciona el incremento con los interesados', 'Revisión con la profesora guía en los puntos de control'],
        ['Retrospectiva', 'Planifica cómo mejorar la forma de trabajar', 'Registro de ajustes como solicitudes de cambio'],
        ['Product Backlog', 'Lista ordenada de lo necesario para el producto', 'Requerimientos RF y RNF priorizados por valor educativo y técnico'],
        ['Sprint Backlog', 'Objetivo y elementos elegidos para el sprint', 'Actividades de la Tabla 10'],
        ['Incremento', 'Avance utilizable que cumple la definición de terminado', 'Terminado: compila, pasa sus pruebas y queda en el repositorio'],
    ], [17, 40, 43])
    d.h3('Flujo de trabajo: Kanban')
    d.p('Kanban es un método para gestionar y mejorar el flujo de trabajo de forma evolutiva, sin imponer roles ni iteraciones (Anderson, 2010). Se aplicó para dar visibilidad diaria al avance, algo que Scrum obtiene con el equipo y que un desarrollador único debe conseguir de otra forma. La tabla siguiente presenta sus prácticas generales. [[Si tienes una captura de tu tablero, agrégala aquí como evidencia.]]')
    d.tabla('Prácticas de Kanban y su aplicación en CodeWorld', [
        ['Práctica', 'Definición', 'Aplicación en CodeWorld'],
        ['Visualizar el flujo', 'Hacer visible el trabajo y su estado', 'Tablero con las tareas del sprint: por hacer, en curso y hecho'],
        ['Limitar el trabajo en curso', 'Restringir las tareas simultáneas', 'Terminar una tarea antes de empezar otra'],
        ['Gestionar el flujo', 'Medir y mejorar el paso del trabajo', 'Detectar tareas detenidas en la revisión semanal'],
        ['Explicitar las políticas', 'Dejar claras las reglas del proceso', 'La definición de terminado es condición para pasar a «hecho»'],
        ['Ciclos de retroalimentación', 'Revisar con regularidad', 'Revisión semanal con la profesora guía'],
        ['Mejorar de forma evolutiva', 'Cambiar de a poco, según lo observado', 'Ajustes tratados como solicitudes de cambio'],
    ], [27, 33, 40])
    d.h3('Comparación y selección')
    tabla3 = filas(260)
    tabla3.insert(1, ['Tipo', 'Marco de trabajo', 'Método de gestión del flujo', 'Metodología híbrida propia'])
    d.tabla('Cuadro comparativo de metodologías', tabla3, [17, 26, 26, 31])
    d.p('Se seleccionó la metodología híbrida porque los hitos académicos son restricciones predictivas que exigen línea base y control formal, mientras que el diseño de la experiencia y de las guías requiere adaptación iterativa. Un enfoque predictivo puro sería rígido; uno ágil puro dejaría sin cubrir los planes de gestión y sus roles no aplican a una sola persona. El PMBOK gobierna el proyecto, Scrum da el ritmo y Kanban da la visibilidad diaria. El ciclo resultante, que se repite en cada sprint, es el siguiente:')
    d.lista_num([
        '**Planificar:** elegir del Product Backlog, ordenado por valor, los elementos del sprint.',
        '**Ejecutar:** mover cada tarea por el tablero Kanban, una a la vez, hasta cumplir la definición de terminado.',
        '**Controlar:** en la revisión semanal, comparar el avance con la línea base y actualizar los riesgos.',
        '**Revisar:** al cierre, inspeccionar el incremento con la profesora guía según el control del sprint.',
        '**Adaptar:** evaluar cada solicitud de cambio por su impacto y reflejarla en el backlog, el informe y los diagramas.',
    ])

    d.h2('Plan de proyecto')
    d.p('La programación de las etapas de gestión, desarrollo y control se ejecuta en cinco sprints. La gestión corre en paralelo a todos ellos con revisión semanal, y el control se aplica al cierre de cada sprint con el criterio de la última columna.')
    d.tabla('Programación de los sprints', [
        ['Sprint', 'Fechas (2026)', 'Backlog del sprint', 'Control de cierre'],
        ['1. Investigación y análisis', '3 ago – 23 ago', 'Requerimientos, investigación bibliográfica, objetivos, alcance y diseño conceptual', 'Requerimientos trazados a causas'],
        ['2. Diseño del sistema', '24 ago – 13 sep', 'Arquitectura, base de datos, interfaces y prototipos', 'Diseño técnico aprobado'],
        ['3. Funcionalidades principales', '14 sep – 11 oct', 'Sistema de usuarios, sistema de niveles y editor visual de programación', 'Motor de bloques funcional'],
        ['4. Integración y optimización', '12 oct – 1 nov', 'Retroalimentación, gamificación e integración de módulos', 'Sistema integrado'],
        ['5. Validación y cierre', '2 nov – 22 nov', 'Pruebas, despliegue, corrección de errores, validación y documentación', 'Métricas verificadas'],
    ], [27, 15, 40, 20])

    d.h2('Herramientas y ambiente de desarrollo')
    d.p(T(294))
    tabla4 = filas(296)
    for f in tabla4:
        if f[1].startswith('Google Blockly'):
            f[1] = 'Google Blockly 13'
            f[2] = 'Biblioteca abierta de programación visual. Los bloques se traducen a una lista de instrucciones que el Interpretador recorre en el navegador, sin generar ni evaluar código.'
    tabla4.append(['Pruebas', 'Vitest, Supertest, Playwright, Autocannon', 'Pruebas unitarias y de integración, aceptación en navegador real y carga de la API.'])
    tabla4.append(['Control de versiones', 'Git y GitHub', 'Gestión de la configuración: historial de cambios y ramas por entrega.'])
    d.tabla('Stack tecnológico de CodeWorld', tabla4, [21, 22, 57])
    d.figura(img('/media/image7.png'), 'Diagrama de arquitectura técnica de CodeWorld', cm_alto=9.5)

    d.h2('Descripción general de la propuesta de solución')
    d.p(T(302))
    d.p('La **capa cliente** es la aplicación web, que corre en el navegador del estudiante. Allí residen el editor de bloques, el Interpretador, el MotorGuias y el GestorProgreso. Esta es la decisión más importante: al evaluar localmente se elimina la latencia de red, se evita ejecutar código del estudiante en el servidor y se puede seguir operando sin conexión. La **capa backend** comprende un ApiGateway y tres servicios: ServicioAutenticacion, ServicioContenido y ServicioProgreso. La **capa de persistencia** usa PostgreSQL en un servidor separado del de aplicación.')

    d.h2('Propuesta de controles y evidencia a implementar en los flujos de la propuesta de solución')
    d.tabla('Controles y evidencia por flujo', [
        ['Flujo', 'Control', 'Evidencia'],
        ['Acceso del tutor', 'Contraseña con hash scrypt, código 2FA de 10 minutos y límite de intentos por IP', 'Pruebas PA-01 y de la API'],
        ['Registro del alumno', 'Solo con sesión de tutor; datos validados; alumno y consentimiento en una transacción', 'Prueba PA-02; registro en CONSENTIMIENTO'],
        ['Consentimiento', 'Trigger de base de datos que impide modificarlo o eliminarlo', 'Prueba de integración RF03'],
        ['Ejecución del programa', 'Sin evaluar código; límite de 200 pasos', 'Prueba PA-11 y unitarias'],
        ['Progreso y XP', 'Sincronización idempotente; el servidor fija el XP', 'Pruebas PA-08 y de la API'],
        ['Consulta del tutor', 'JWT con rol; cada tutor ve solo a sus alumnos', 'Pruebas de permisos de la API'],
    ], [20, 52, 28])

    d.h2('Plan de gestión/proyecto (calidad y Testing)')
    d.p('La calidad se gestiona con pruebas automatizadas que se pueden repetir en cada cambio y con validación manual en lo que requiere dispositivos o personas reales.')
    d.tabla('Plan de pruebas', [
        ['Tipo', 'Qué verifica', 'Herramienta', 'Criterio'],
        ['Unitarias', 'Interpretador, guías, progreso, seguridad', 'Vitest', 'Todas pasan'],
        ['Integración', 'API contra PostgreSQL real', 'Vitest y Supertest', 'Todas pasan'],
        ['Funcionales y aceptación', 'Cada RF y RNF en navegador real', 'Playwright', 'Todos los casos pasan'],
        ['Carga', 'API con 10, 50 y 100 conexiones', 'Autocannon', 'p97,5 de 1000 ms o menos; 0 errores'],
        ['Compatibilidad', 'Safari iOS, Android y gama baja', 'Manual', 'Al menos 95% de funciones'],
        ['Usabilidad', 'Grupo de al menos 10 jóvenes', 'Observación', 'Al menos 80% sin ayuda'],
    ], [25, 35, 18, 26])

    d.h2('Plan de riesgos')
    d.p(T(325))
    d.tabla('Matriz de riesgos técnicos de CodeWorld', [
        ['ID', 'Riesgo', 'P', 'I', 'Nivel', 'Mitigación preventiva', 'Contingencia'],
        ['R1', 'Rendimiento: degradación en equipos de gama baja', 'Alta', 'Alto', 'Crítico', 'Evaluación local y límite de 200 pasos. Métrica: 300 ms o menos', 'Reducir animaciones con prefers-reduced-motion'],
        ['R2', 'Persistencia: pérdida de progreso por desconexión', 'Alta', 'Alto', 'Crítico', 'Autoguardado en cada cambio; progreso local; service worker', 'Sincronización automática al volver la conexión; estado visible'],
        ['R3', 'Seguridad: exposición de datos de menores', 'Alta', 'Alto', 'Crítico', 'Modelo Zero-Data, id anónimo, permisos por rol', 'Aviso al tutor; desactivar cuentas y rotar el secreto JWT'],
        ['R4', 'Compatibilidad entre navegadores', 'Alta', 'Bajo', 'Medio', 'Pruebas en tres perfiles y en dispositivos reales. Métrica: 95%', 'Indicar navegador recomendado'],
        ['R5', 'Usabilidad: OE4 bajo 80%', 'Media', 'Medio', 'Medio', 'Tutorial guiado de 3 pasos y ayuda animada de bloques', 'Rediseñar el flujo y repetir con un subgrupo'],
        ['R6', 'Fallo del 2FA: el tutor no puede entrar', 'Media', 'Alto', 'Crítico', 'Código de 10 minutos; pruebas del flujo', 'Error claro y nuevo código al reintentar el login'],
        ['R7', 'Caída del backend durante una clase', 'Baja', 'Alto', 'Medio', 'Backend sin estado; juego local', 'Modo sin conexión y sincronización posterior'],
    ], [5, 23, 8, 7, 9, 27, 26], sz=18)
    d.p('Los riesgos críticos son consecuencias directas del contexto de uso: hardware de gama baja, conectividad inestable y usuarios menores de edad. Ejecutar los bloques en el navegador mitiga a la vez R1, R2 y R7.')

    d.h2('Cronograma del Proyecto (Gantt/ProductBacklog/Visual story Mapping/Product Roadmap)')
    d.p('La Figura 3 muestra la metodología de gestión y la de desarrollo en una misma línea de tiempo de 16 semanas. La ruta crítica (RC) incluye todos los sprints y la validación con usuarios, porque esta solo puede ejecutarse con el sistema integrado y desplegado.')
    d.figura(gantt(), 'Carta Gantt de CodeWorld')

    d.h2('Prototipo')
    d.p('El prototipo evolucionó desde las primeras pantallas hasta un prototipo funcional que se usa en el navegador: acceso, registro, menú, selección de niveles, área de programación, panel de retroalimentación y progreso. Permitió probar tempranamente la navegación antes de cerrar el diseño. Sus pantallas actuales se presentan en el Capítulo IV. [[Si conservas los mockups de Figma, agrégalos aquí: la plantilla los pide y no están en el repositorio.]]')


def capitulo4(d, T, filas, img):
    d.h1('CAPÍTULO IV: DISCUSIÓN DE RESULTADOS')
    d.h2('Gestión de proyecto')
    d.p('La gestión se ejecutó según el enfoque híbrido del Capítulo III. La Tabla 15 resume el estado de cada sprint frente a lo planificado, a la fecha de este informe.')
    d.tabla('Estado de avance por sprint', [
        ['Sprint', 'Alcance planificado', 'Estado', 'Evidencia'],
        ['1. Investigación y análisis', 'Requerimientos, bibliografía, objetivos y alcance', 'Completado', 'Capítulos I y II'],
        ['2. Diseño del sistema', 'Arquitectura, base de datos, interfaces y prototipos', 'Completado', 'Figuras 4 a 10 y tablas de este capítulo'],
        ['3. Funcionalidades principales', 'Usuarios, niveles y editor visual', 'Completado', 'Repositorio: 2FA, alumnos con consentimiento, 3 niveles y 6 desafíos, intérprete local'],
        ['4. Integración y optimización', 'Retroalimentación, gamificación e integración', 'Completado', 'Repositorio: guías, XP, sincronización, autoguardado, tutoriales'],
        ['5. Validación y cierre', 'Pruebas, despliegue, validación y documentación', 'En curso', 'Pruebas automatizadas ejecutadas; [[despliegue y prueba con usuarios pendientes]]'],
    ], [24, 27, 15, 34])
    d.p('En el monitoreo y control, la retroalimentación de la profesora y los hallazgos de las pruebas se trataron como solicitudes de cambio, evaluando su impacto en alcance, cronograma y riesgos. Dieron lugar a estos ajustes: una arquitectura única para todos los diagramas; el registro del progreso por desafío; el reemplazo de la aplicación nativa por una web responsiva; la exclusión de los bloques de orientación a objetos y de robótica; el 2FA solo por correo, porque el envío por SMS no se implementó; y la simplificación de medidas de la matriz de riesgos que no resultaron necesarias o no se implementaron.')

    d.h2('Diseño de los componentes funcionales de la propuesta de solución')
    d.h3('Del levantamiento del problema a los requerimientos')
    d.p(T(370).replace('La Tabla 8 presenta', 'La tabla siguiente presenta').replace('(Figura 1 y Tabla 1)', '(Figura 1 y Tabla 1)').replace('(Tabla 2)', '(Tabla 3)').replace('(Tabla 5)', '(la matriz de riesgos)'))
    tabla8 = filas(371)
    for f in tabla8:
        if f[0] == 'RF01':
            f[1] = 'El tutor legal se autentica con usuario, contraseña y un segundo factor enviado a su correo.'
    d.tabla('Requerimientos funcionales (RF) y no funcionales (RNF) de CodeWorld', tabla8, [10, 62, 28])
    d.p(T(374))
    d.lista([T(i).replace('(Tabla 5)', '') for i in (376, 377, 378, 379)])
    d.h3('Diagrama de casos de uso')
    d.p(T(382))
    d.p(T(384).replace('Figuras 4 y 5', 'Figuras 5 y 6'))
    d.figura(img('/media/image8.png'), 'Diagrama de casos de uso de CodeWorld', cm_alto=10)
    d.tabla('Descripción del caso de uso «Resolver desafío con bloques»', filas(390), [22, 78])
    d.h3('Diseño del proceso: diagrama de actividades')
    d.p(T(394))
    d.figura(img('/media/image9.png'), 'Diagrama de actividades de «Resolver desafío con bloques»', cm_alto=13.5)
    d.h3('Diagrama de secuencia')
    d.p(T(400).replace('Figura 7', 'Figura 8'))
    d.figura(img('/media/imagea.png'), 'Diagrama de secuencia del caso de uso «Resolver desafío con bloques»', cm_alto=13)

    d.h2('Matriz de trazabilidad de Requerimientos')
    d.p('La matriz identifica, para cada requerimiento, el caso de uso que lo expresa, el componente que lo implementa, los datos que persiste, la figura que lo documenta y la prueba que lo verifica (ver el plan de pruebas).')
    pruebas = {'RF01': 'PA-01', 'RF02': 'PA-02', 'RF03': 'PA-02', 'RF04': 'PA-03', 'RF05': 'PA-04', 'RF06': 'PA-05', 'RF07': 'PA-05', 'RF08': 'PA-06', 'RF09': 'PA-05',
               'RF10': 'PA-08', 'RF11': 'PA-07', 'RNF01': 'PA-10', 'RNF02': 'PA-13, PM-02, PM-03', 'RNF03': 'PA-10, PM-04', 'RNF04': 'PA-02, PA-14', 'RNF05': 'PA-11', 'RNF06': 'PA-12'}
    figuras = {'3': '4', '4': '5', '5': '6', '6': '7', '7': '8', '8': '9', '9': '10', '2': '2'}
    t10 = filas(407)
    salida = [['Req.', 'Caso de uso', 'Componente / clase', 'Datos', 'Figura', 'Prueba']]
    for f in t10[1:]:
        fig = ', '.join(figuras.get(x.strip(), x.strip()) for x in f[4].split(',')) if f[4][0].isdigit() else f[4]
        salida.append([f[0], f[1], f[2], f[3], fig, pruebas.get(f[0], '')])
    d.tabla('Matriz de trazabilidad de requerimientos', salida, [8, 15, 28, 23, 11, 15], sz=18)

    d.h2('Arquitectura de software a implementar')
    d.p(T(411).replace('(Tabla 1)', '(Tabla 1)').replace('La Figura 6 detalla', 'la Figura 7 detalla').replace('La Figura 2 resume las capas y la Figura 6 detalla los componentes.', 'La Figura 2 resume las capas y la Figura 7 detalla los componentes.'))
    d.p(T(413))
    d.figura(img('/media/imageb.png'), 'Diagrama de componentes de CodeWorld', cm_alto=13)
    d.p('La arquitectura se documenta con el modelo de vistas 4+1 (Kruchten, 1995).')
    t11 = filas(419)
    mapa = {'Figura 3; Tabla 9': 'Figura 4 y descripción del caso de uso', 'Figura 7': 'Figura 8', 'Figuras 4 y 5': 'Figuras 5 y 6', 'Figura 6': 'Figura 7', 'Figura 9': 'Figura 10'}
    for f in t11[1:]:
        f[2] = mapa.get(f[2], f[2])
    d.tabla('Vistas del modelo 4+1 de CodeWorld', t11, [18, 52, 30])
    d.p('Los planes de gestión que acompañan a esta arquitectura son los siguientes:')
    d.tabla('Planes de gestión del proyecto', [
        ['Plan', 'Contenido', 'Ubicación'],
        ['Calidad y pruebas', 'Tipos de prueba, herramientas, criterios y resultados', 'Capítulos III y IV'],
        ['Gestión de cambios', 'Toda solicitud se registra en el backlog, se evalúa su impacto, se aprueba o rechaza en la revisión semanal y se refleja en informe y diagramas', 'Gestión de proyecto, Capítulo IV'],
        ['Comunicaciones', 'Revisión semanal con la profesora guía y entrega documental en cada hito', 'Capítulo III'],
        ['Gestión del alcance', 'Alcance, exclusiones y limitaciones', 'Capítulo II'],
        ['Gestión del cronograma', 'Sprints, carta Gantt y ruta crítica', 'Capítulo III'],
        ['Gestión de riesgos', 'Matriz con mitigación y contingencia', 'Capítulo III'],
    ], [24, 54, 22])

    d.h2('Modelo de base de datos y/o clases si corresponde al usar orientación a objetos')
    d.h3('Diagrama de clases lógicas')
    d.p(T(430))
    d.p(T(432))
    d.figura(img('/media/imagec.png'), 'Diagrama de clases lógicas de CodeWorld', cm_alto=13)
    d.h3('Modelo de datos relacional')
    d.p(T(438))
    d.p(T(440))
    d.figura(img('/media/imaged.png'), 'Modelo relacional de la base de datos de CodeWorld', cm_alto=12.5)
    t13 = filas(446)
    for f in t13:
        if f[0] == 'CONSENTIMIENTO':
            f[3] = 'Inmutable: un trigger rechaza UPDATE y DELETE; guarda fecha y método de verificación'
        if f[0] == 'TUTOR':
            f[3] = 'username único; solo se guarda password_hash; correo obligatorio para el 2FA'
    d.tabla('Diccionario resumido de la estructura de datos', t13, [26, 23, 19, 32])

    d.h2('Diseño y construcción del producto de software de su proyecto de título, desarrollando los diseños de los módulos o sprint')
    d.p('El diseño del software y de la base de datos se presentó en las secciones anteriores. Esta sección define la plataforma de operación, con servidores separados de aplicación y de base de datos, y presenta el producto construido y sus pruebas.')
    d.h3('Diseño de la plataforma de operación')
    d.p(T(453))
    d.p(T(455))
    d.figura(img('/media/imagee.png'), 'Diagrama de despliegue de CodeWorld', cm_alto=13)
    d.p('Los nombres de la Figura 10 son lógicos. La tabla siguiente indica a qué archivo real del repositorio corresponde cada uno.')
    d.tabla('Correspondencia entre el diseño y el código', [
        ['Elemento del diseño', 'Archivo real'],
        ['codeworld-spa.js, InterfazWeb', 'frontend/src/App.tsx y pantallas/; Vite genera dist/assets/'],
        ['EditorBloques', 'frontend/src/components/BlocklyEditor.tsx y game/blocks.ts'],
        ['Interpretador, MotorGuias', 'frontend/src/game/interpreter.ts y game/motorGuias.ts'],
        ['GestorProgreso, AlmacenLocal', 'frontend/src/game/gestorProgreso.ts y almacen.ts'],
        ['api-gateway.js', 'backend/src/app.ts'],
        ['auth-service.js', 'backend/src/servicios/autenticacion.ts y seguridad/'],
        ['contenido-service.js, progreso-service.js', 'backend/src/servicios/contenido.ts y progreso.ts'],
        ['codeworld.sql', 'backend/prisma/schema.prisma y migrations/'],
    ], [42, 58])
    d.h3('Pantallazos del sistema')
    d.p('Las siguientes capturas se obtuvieron del sistema en ejecución. Muestran el tutorial guiado, el menú, la guía correctiva, el desafío resuelto y el panel del tutor.')
    d.figura(CAP / '04-menu.png', 'Menú principal del alumno', cm_alto=7.5)
    d.figura(CAP / '06-guia-correctiva.png', 'Guía correctiva ante un programa vacío', cm_alto=7.5)
    d.figura(CAP / '07-exito.png', 'Desafío resuelto, con el XP obtenido y el tiempo de evaluación', cm_alto=7.5)
    d.figura(CAP / '08-panel-tutor.png', 'Panel del tutor con el progreso de un alumno', cm_alto=7.5)
    d.h3('Procedimientos operativos')
    d.p('El tutor crea su cuenta, entra con doble factor, registra al alumno y le entrega su usuario y clave. El alumno entra y resuelve desafíos; su avance se guarda solo. Los pasos detallados y la instalación están en los anexos A y B.')
    d.h3('Resultados de las pruebas')
    d.p('Las pruebas se ejecutaron en un computador local el 5 de noviembre de 2026. Las pruebas funcionales y de aceptación se ejecutan en un navegador real, sobre el build de producción y una base de datos real.')
    d.tabla('Resumen de resultados de las pruebas', [
        ['Tipo', 'Alcance', 'Resultado'],
        ['Unitarias e integración', 'Frontend 35 y backend 29', '64 de 64 pasan'],
        ['Funcionales y aceptación', '15 casos en computador, tableta y celular', '43 pasan, 2 omitidas, 0 fallan'],
        ['Carga', '4 endpoints con 10, 50 y 100 conexiones', 'Última corrida: 12 de 12 cumplen; 1 falla intermitente'],
        ['Compatibilidad en dispositivos reales', 'Safari iOS, Android, equipo de gama baja', '[[Pendiente]]'],
        ['Usabilidad (OE4)', 'Al menos 10 jóvenes de 9 a 15 años', '[[Pendiente]]'],
    ], [34, 38, 28])
    d.p('Las dos pruebas omitidas requieren arrastrar bloques con el dedo en un celular y se verifican de forma manual. Las pruebas permitieron corregir defectos reales antes de la validación con usuarios: el service worker no abría la aplicación sin conexión, Blockly contactaba a un servidor externo y el panel del tutor se desbordaba en celulares.')
    d.tabla('Casos de prueba de aceptación automatizados', [
        ['ID', 'Req.', 'Criterio de aceptación', 'Resultado'],
        ['PA-01', 'RF01', 'Entra con contraseña y 2FA; un código incorrecto no da acceso', 'Pasa'],
        ['PA-02', 'RF02, RF03, RNF04', 'Registro solo con consentimiento y sin datos personales', 'Pasa'],
        ['PA-03', 'RF04', 'El alumno entra con su clave; una incorrecta no da acceso', 'Pasa'],
        ['PA-04', 'RF05', 'Se ven 3 niveles y 6 desafíos ordenados', 'Pasa'],
        ['PA-05', 'RF06, RF07, RF09', 'Arma el programa, el robot llega y recibe XP', 'Pasa (omitida en celular)'],
        ['PA-06', 'RF08', 'El error muestra una guía sin dar XP', 'Pasa'],
        ['PA-07', 'RF11', 'El tutor ve el progreso de su alumno', 'Pasa'],
        ['PA-08', 'RF10, R2, R7', 'Sin internet abre, juega y sincroniza al volver', 'Pasa'],
        ['PA-09', 'R2', 'El programa sobrevive a recargar la página', 'Pasa (omitida en celular)'],
        ['PA-10', 'RNF01, RNF03', 'Retroalimentación en 300 ms o menos con CPU 6 veces más lenta', 'Pasa (1 ms o menos)'],
        ['PA-11', 'RNF05', 'Un ciclo infinito se detiene a los 200 pasos', 'Pasa'],
        ['PA-12', 'RNF06', 'En español; un clic del menú al desafío', 'Pasa'],
        ['PA-13', 'RNF02', 'Sin desplazamiento horizontal en ningún perfil', 'Pasa'],
        ['PA-13b', 'RNF02', 'El panel del tutor no se desborda con nombres largos', 'Pasa'],
        ['PA-14', 'RNF04', 'El navegador del alumno no contacta a terceros', 'Pasa'],
    ], [9, 19, 52, 20], sz=18)
    d.tabla('Resultados de la prueba de carga con 100 conexiones simultáneas', [
        ['Escenario', 'Pet./s', 'p50 (ms)', 'p97,5 (ms)', 'Máx. (ms)', 'Errores'],
        *[[c[0], c[2], c[3], c[4], c[6], c[7]] for c in resultados_carga() if c[1] == '100'],
    ], [40, 12, 12, 13, 12, 11])
    d.p('Estos valores corresponden a un computador de 16 núcleos, con la API, la base de datos y el generador de carga en la misma máquina, por lo que no representan la capacidad del hosting definitivo. El login es el más lento porque el hash de contraseñas es costoso a propósito. En 1 de 3 corridas completas, la sincronización con 100 conexiones sobre un mismo alumno entregó 5460 respuestas con error; no se repitió en las demás corridas y su causa no se pudo determinar. Se mantiene como riesgo abierto.')
    d.h3('Validación con usuarios')
    d.p('[[Pendiente. Completar tras la prueba con al menos 10 jóvenes: fecha y lugar, número de participantes y edades, cuántos completaron el ejercicio sin ayuda y qué porcentaje representa, tiempo hasta el primer desafío (OE1), resultados en dispositivos reales (OE2), principales dificultades observadas y ajustes realizados.]]')


def cierre(d):
    d.h1('CONCLUSIONES Y RECOMENDACIONES')
    d.h2('Conclusiones')
    d.p('Este proyecto abordó la deserción temprana en el aprendizaje de la programación con una plataforma que evalúa el programa del alumno en su propio navegador y convierte cada error en una pista. La construcción demostró que ese enfoque es viable técnicamente: el producto mínimo opera de principio a fin con 3 niveles, 6 desafíos, autenticación del tutor, progreso sincronizado y funcionamiento sin conexión.')
    d.p('**OE3 se cumple.** Los 6 desafíos cubren el 100% de los 4 patrones de error, y evaluar el programa y elegir la guía tardó 1 ms o menos con la CPU 6 veces más lenta, muy por debajo de los 300 ms comprometidos. Esta evidencia corresponde a un equipo emulado.')
    d.p('**OE2 se cumple parcialmente.** El módulo y sus 6 desafíos están operativos, y los casos de aceptación pasan en perfiles de computador, tableta y celular sobre Chromium. [[Falta verificar Safari y dispositivos físicos para confirmar el 95%.]]')
    d.p('**OE1 se cumple parcialmente.** Las opciones principales están a 2 clics o menos y la interfaz se adapta a los tres tamaños de pantalla. [[Falta medir con el grupo de control el tiempo hasta el primer desafío.]]')
    d.p('**OE4 y objetivo general.** [[Completar con los resultados de la prueba. Sin estos datos no se puede afirmar que el objetivo general se cumplió.]]')
    d.p('Respecto de la gestión, el enfoque híbrido permitió cumplir las fechas fijas de la asignatura y a la vez incorporar cambios. Las pruebas automatizadas fueron especialmente valiosas: detectaron defectos que una revisión manual no habría encontrado, como el contacto con un servidor externo desde el navegador de un menor.')
    d.h2('Recomendaciones')
    d.lista([
        '**Validar con más usuarios y durante más tiempo.** Una prueba con 10 jóvenes evalúa la usabilidad, pero no demuestra por sí sola un aprendizaje sostenido. Se recomienda un estudio con evaluación antes y después.',
        '**Ampliar el contenido.** Agregar más desafíos por nivel y evaluar los bloques de orientación a objetos y de robótica excluidos de este alcance.',
        '**Repetir la prueba de carga en el hosting definitivo** e investigar la falla intermitente observada en la sincronización.',
        '**Revisar el tratamiento de datos bajo la Ley N.° 21.719**, en particular la solicitud de eliminación de datos de un menor frente a un consentimiento que hoy es inmutable.',
        '**Reforzar el doble factor** con un tope de intentos por código y un reenvío con tiempo de espera.',
    ])

    d.h1('GLOSARIO')
    for termino, definicion in [
        ('API', 'interfaz que permite que dos programas se comuniquen; aquí, entre el navegador y el servidor.'),
        ('Blockly', 'biblioteca de Google para programar uniendo bloques visuales.'),
        ('Doble factor (2FA)', 'verificación que exige, además de la contraseña, un código enviado al usuario.'),
        ('Gamificación', 'uso de mecánicas de juego, como puntos y niveles, en contextos de aprendizaje.'),
        ('Hash', 'transformación irreversible de un dato; permite verificar una contraseña sin guardarla.'),
        ('Idempotente', 'operación que, repetida varias veces, produce el mismo resultado que una sola vez.'),
        ('JWT', 'token firmado que identifica una sesión sin guardarla en el servidor.'),
        ('Kanban', 'método para visualizar y gestionar el flujo de trabajo.'),
        ('localStorage', 'almacenamiento del navegador que conserva datos en el dispositivo.'),
        ('Pensamiento computacional', 'habilidad de descomponer problemas y expresar soluciones como pasos (Wing, 2006).'),
        ('PMBOK', 'guía de buenas prácticas de dirección de proyectos del Project Management Institute.'),
        ('Producto mínimo viable', 'versión de un producto con lo mínimo necesario para validarlo con usuarios.'),
        ('Rate limiting', 'límite de peticiones por minuto que protege a un servidor de abusos.'),
        ('Scrum', 'marco de trabajo ágil basado en iteraciones llamadas sprints.'),
        ('Service worker', 'programa del navegador que permite abrir una aplicación web sin conexión.'),
        ('SMART', 'criterios para formular objetivos: específicos, medibles, alcanzables, relevantes y con plazo.'),
        ('Zero-Data', 'principio de este proyecto: guardar solo los datos mínimos de los menores.'),
    ]:
        d.p(f'**{termino}:** {definicion}', despues=80)

    d.h1('REFERENCIAS BIBLIOGRÁFICAS')
    for r in [
        'Anderson, D. J. (2010). Kanban: Successful evolutionary change for your technology business. Blue Hole Press.',
        'Avello-Sáez, D., Lucero-González, N., & Villagrán, I. (2024). Desarrollo de una declaración de uso de inteligencia artificial con una perspectiva de integridad académica en educación médica y ciencias de la salud. Revista Médica Clínica Las Condes, 35(5–6), 412–420. https://doi.org/10.1016/j.rmclc.2024.06.003',
        'Brennan, K., & Resnick, M. (2012). New frameworks for studying and assessing the development of computational thinking. Proceedings of the 2012 Annual Meeting of the American Educational Research Association, 1–25.',
        'Dicheva, D., Dichev, C., Agre, G., & Angelova, G. (2015). Gamification in education: A systematic mapping study. Journal of Educational Technology & Society, 18(3), 75–88. https://www.jstor.org/stable/jeductechsoci.18.3.75',
        "Doran, G. T. (1981). There's a S.M.A.R.T. way to write management's goals and objectives. Management Review, 70(11), 35–36.",
        'Google Developers. (2023). Blockly developer documentation. Google LLC. https://developers.google.com/blockly',
        'Kruchten, P. (1995). Architectural blueprints: The “4+1” view model of software architecture. IEEE Software, 12(6), 42–50. https://doi.org/10.1109/52.469759',
        'Ley N.° 17.336. (1970). Sobre propiedad intelectual. Biblioteca del Congreso Nacional de Chile. https://www.bcn.cl/leychile',
        'Ley N.° 19.628. (1999). Sobre protección de la vida privada. Biblioteca del Congreso Nacional de Chile. https://www.bcn.cl/leychile',
        'Ley N.° 21.719. (2024). Regula la protección y el tratamiento de los datos personales y crea la Agencia de Protección de Datos Personales. Biblioteca del Congreso Nacional de Chile. https://www.bcn.cl/leychile',
        'Palladino, E. (2014). Administración y gestión de proyectos. Espacio Editorial.',
        'Pressman, R. S. (2010). Ingeniería del software: Un enfoque práctico (7.ª ed.). McGraw-Hill.',
        'Project Management Institute. (2017). Guía de los fundamentos para la dirección de proyectos (Guía del PMBOK) (6.ª ed.). Project Management Institute.',
        'Sáez López, J. M. (2019). Programación y robótica en Educación Infantil, Primaria y Secundaria. Editorial UNED.',
        'Schwaber, K., & Sutherland, J. (2020). La Guía de Scrum. https://scrumguides.org',
        'Soler Vila, M. del M. (2020). La robótica, la programación y el pensamiento computacional en la educación infantil. Revista de Educación a Distancia (RED), 20(63), 1–18. https://doi.org/10.6018/red.410061',
        'Wing, J. M. (2006). Computational thinking. Communications of the ACM, 49(3), 33–35. https://doi.org/10.1145/1118178.1118215',
    ]:
        d.p(r, jc='left', sangria=426, despues=100)

    d.h1('ANEXOS')
    d.h2('Anexo A: Manual de usuario')
    d.h3('Tutor')
    d.lista_num([
        'En la pantalla de inicio, elige **Soy tutor** y luego **Crear cuenta de tutor**. Ingresa usuario, correo y contraseña.',
        'Inicia sesión. Recibirás un código de 6 dígitos en tu correo, válido por 10 minutos.',
        'En el panel, presiona **+ Registrar alumno**. Ingresa usuario, clave y edad (de 9 a 15 años) y marca el consentimiento. No uses el nombre real del menor.',
        'Entrega el usuario y la clave al alumno. Para revisar su avance, presiona **Ver progreso**.',
    ])
    d.h3('Alumno')
    d.lista_num([
        'En la pantalla de inicio, elige **Soy alumno** y entra con tu usuario y clave.',
        'La primera vez verás un tutorial. Después, elige un nivel o presiona **Empezar a jugar**.',
        'Arrastra los bloques desde la columna gris y encájalos debajo de **Al ejecutar**.',
        'Presiona **Ejecutar**. Si el robot no llega a la estrella, lee la pista, corrige y vuelve a intentar.',
        'Tu avance se guarda solo, incluso sin internet. Se enviará al servidor cuando vuelva la conexión.',
    ])
    d.figura(CAP / '09-celular.png', 'La aplicación en un celular', cm_alto=9)
    d.h2('Anexo B: Manual de instalación')
    d.p('Requisitos: Node.js 24 o superior y PostgreSQL 17, que se puede levantar con Docker o Podman. Comandos, desde la raíz del repositorio:')
    for c in ['npm run install:all', 'docker compose up -d', 'cp backend/.env.example backend/.env', 'npm run db:setup', 'npm run dev:backend', 'npm run dev:frontend']:
        d.p(f'{c}', jc='left', linea=276, despues=20, sz=20)
    d.p('La aplicación queda en http://localhost:5173 y la API en http://localhost:3000/api. Sin BREVO_API_KEY, el código 2FA se muestra en la consola del servidor. Las pruebas se ejecutan con npm test, npm run test:e2e y npm run test:carga. El despliegue en producción se detalla en docs/despliegue.md del repositorio. [[Agregar aquí la URL de la aplicación desplegada.]]', antes=120)
    d.h2('Anexo C: Diagramas de funcionamiento')
    d.p('Estos diagramas explican el funcionamiento del código con los nombres reales de sus funciones y archivos.')
    return


ANEXO_C = [
    ('01-mapa-general', 'Mapa general de CodeWorld'),
    ('02-del-bloque-al-robot', 'Del bloque al robot'),
    ('03-interpretador', 'Funcionamiento del Interpretador'),
    ('04-guias-correctivas', 'Guías correctivas por patrón de error'),
    ('05-progreso-sin-conexion', 'Progreso y sincronización sin conexión'),
    ('06-login-tutor-2fa', 'Inicio de sesión del tutor con doble factor'),
    ('07-registro-alumno', 'Registro del alumno y consentimiento'),
    ('08-modelo-de-datos', 'Modelo de datos implementado'),
    ('09-apertura-sin-internet', 'Apertura de la aplicación sin internet'),
    ('10-peticion-api', 'Camino de una petición por la API'),
]

RESUMEN = [
    'Enseñar programación a jóvenes sigue siendo difícil: las herramientas disponibles asumen conocimientos previos, usan interfaces pensadas para adultos y no corrigen al estudiante cuando se equivoca. El efecto es frustración temprana y abandono. Este proyecto se pregunta si una plataforma visual, con retroalimentación inmediata, permite comprender la lógica de programación de forma autónoma, sin esa deserción.',
    'El objetivo fue desarrollar y validar CodeWorld, una plataforma web para jóvenes de 9 a 15 años, de modo que al menos el 80% de un grupo de control complete un ejercicio básico sin ayuda. La gestión siguió la guía PMBOK y el desarrollo, un marco híbrido de Scrum y Kanban. El problema se levantó mediante observación en terreno, revisión bibliográfica y un diagrama de Ishikawa.',
    'Se construyó un producto mínimo viable sobre Google Blockly, que evalúa los bloques en el navegador del alumno. Ofrece 3 niveles y 6 desafíos, guías correctivas para los 4 patrones de error, tutor con doble factor, datos mínimos de los menores conforme a la Ley N.° 19.628 y funcionamiento sin conexión. Se aprobaron 64 de 64 pruebas unitarias y de integración, y los 15 casos de aceptación automatizados, con una retroalimentación de 1 ms o menos frente a una meta de 300 ms. [[Agregar el resultado de la prueba con el grupo de control.]]',
    'Se concluye que evaluar en el navegador es técnicamente viable para establecimientos con infraestructura limitada. [[Completar con la conclusión de la validación con usuarios.]] Se recomienda repetir las pruebas en el hosting definitivo y ampliar el contenido.',
]
CLAVES = 'pensamiento computacional, programación visual, gamificación, aprendizaje interactivo, Blockly.'
ABSTRACT = [
    'Teaching programming to young learners remains difficult: available tools assume prior knowledge, use interfaces designed for adults and do not correct students when they make mistakes. The effect is early frustration and dropout. This project asks whether a visual platform with immediate feedback allows programming logic to be understood autonomously, without that dropout.',
    'The objective was to develop and validate CodeWorld, a web platform for young people aged 9 to 15, so that at least 80% of a control group completes a basic exercise without help. Management followed the PMBOK guide and development followed a hybrid Scrum and Kanban framework. The problem was identified through field observation, a literature review and an Ishikawa diagram.',
    'A minimum viable product was built on Google Blockly, which evaluates blocks in the learner’s browser. It offers 3 levels and 6 challenges, corrective guidance for the 4 error patterns, a tutor account with two-factor authentication, minimal data on minors in line with Chilean Law No. 19,628, and offline operation. All 64 unit and integration tests and the 15 automated acceptance cases passed, with feedback in 1 ms or less against a 300 ms target. [[Add the result of the control group test.]]',
    'Evaluating in the browser is technically viable for schools with limited infrastructure. [[Complete with the conclusion of the user validation.]] Repeating the tests on the final hosting and expanding the content are recommended.',
]
CLAVES_EN = 'computational thinking, visual programming, gamification, interactive learning, Blockly.'
