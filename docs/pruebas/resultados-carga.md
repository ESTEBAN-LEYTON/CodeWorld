# Resultados de la prueba de carga

Generado por `npm run test:carga` el 2026-11-05.

- **Entorno:** computador local, 16 núcleos, 31 GB de RAM. API (Node.js), PostgreSQL 17 y generador de carga en la misma máquina. **No mide el hosting definitivo.**
- **Duración:** 15 s por combinación.
- **Criterio:** percentil 97,5 de 1000 ms o menos y 0 errores.

| Escenario | Conexiones | Pet./s | p50 (ms) | p97,5 (ms) | p99 (ms) | Máx. (ms) | Errores | Resultado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GET /api/health | 10 | 8527 | 1 | 2 | 2 | 23 | 0 | Cumple |
| GET /api/health | 50 | 9490 | 4 | 7 | 7 | 18 | 0 | Cumple |
| GET /api/health | 100 | 9173 | 10 | 14 | 14 | 31 | 0 | Cumple |
| GET /api/niveles (contenido) | 10 | 2910 | 3 | 6 | 6 | 35 | 0 | Cumple |
| GET /api/niveles (contenido) | 50 | 2894 | 16 | 22 | 23 | 28 | 0 | Cumple |
| GET /api/niveles (contenido) | 100 | 2848 | 34 | 42 | 46 | 143 | 0 | Cumple |
| POST /api/auth/alumno/login | 10 | 175 | 57 | 65 | 68 | 247 | 0 | Cumple |
| POST /api/auth/alumno/login | 50 | 174 | 283 | 297 | 300 | 3142 | 0 | Cumple |
| POST /api/auth/alumno/login | 100 | 171 | 563 | 585 | 709 | 7105 | 0 | Cumple |
| POST /api/progreso/sincronizar | 10 | 665 | 9 | 58 | 75 | 596 | 0 | Cumple |
| POST /api/progreso/sincronizar | 50 | 631 | 73 | 124 | 137 | 208 | 0 | Cumple |
| POST /api/progreso/sincronizar | 100 | 622 | 152 | 230 | 245 | 307 | 0 | Cumple |
