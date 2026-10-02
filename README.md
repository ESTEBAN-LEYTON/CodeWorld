# CodeWorld

Plataforma web que enseña programación a jóvenes de 9 a 15 años mediante desafíos visuales con bloques
(Google Blockly), retroalimentación inmediata y gamificación.

Proyecto de título — Ingeniería en Computación e Informática, Universidad Andrés Bello.
Autor: Esteban Ignacio Leyton Miranda · Profesora guía: Alfonsina del Mar Linarez Castañeda.

## Estructura

```
CodeWorld/
├── docs/        Informe del proyecto de título
├── frontend/    React + Vite + TypeScript + Blockly (evaluación local en el navegador)
└── backend/     Node + Express + TypeScript + Prisma (PostgreSQL)
```

La decisión central de la arquitectura es que **los bloques se evalúan en el navegador del alumno**:
el backend solo autentica al tutor y persiste el progreso. Ver [`docs/arquitectura.md`](docs/arquitectura.md).

## Requisitos

- Node.js 24 o superior
- PostgreSQL (opcional para el frontend; para el backend se puede usar `npm run db:dev`, que levanta
  un Postgres local de Prisma sin instalar nada)

## Cómo ejecutar

```bash
npm run install:all        # instala frontend y backend

# Frontend: http://localhost:5173
npm run dev:frontend

# Backend: http://localhost:3000/api/health
cp backend/.env.example backend/.env   # y completar valores
npm run dev:backend
```

## Pruebas

```bash
npm test                   # frontend (intérprete y desafíos) + backend (API)
```

## Estado

| Módulo | Estado |
| --- | --- |
| Editor de bloques en español (avanzar, girar, repetir, repetir hasta la meta, si hay camino) | ✅ |
| Intérprete local con límite de pasos (`BlocklyInterpreter`) | ✅ |
| Guías correctivas del nivel inicial (OE3) | ✅ primera versión |
| 5 desafíos del nivel inicial, XP y progreso local (offline) | ✅ |
| API: health, CORS, rate limiting, cabeceras de seguridad | ✅ |
| Modelo de datos en Prisma (Figura 4) | ✅ |
| `AuthService` (JWT + 2FA del tutor) | ⏳ |
| `ChallengeService` / `ProgressService` y sincronización | ⏳ |
| Pantallas de login, registro y progreso del tutor | ⏳ |
