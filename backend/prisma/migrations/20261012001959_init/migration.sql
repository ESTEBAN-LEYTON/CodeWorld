-- CreateTable
CREATE TABLE "tutor" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT true,
    "contacto_verificado" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumno" (
    "id" UUID NOT NULL,
    "tutor_id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "anon_id" TEXT NOT NULL,
    "edad" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alumno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consentimiento" (
    "id" UUID NOT NULL,
    "tutor_id" UUID NOT NULL,
    "alumno_id" UUID NOT NULL,
    "otorgado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodo_verificacion" TEXT NOT NULL,

    CONSTRAINT "consentimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nivel" (
    "id" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "nivel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desafio" (
    "id" TEXT NOT NULL,
    "nivel_id" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "laberinto" JSONB NOT NULL,
    "bloques_permitidos" TEXT[],
    "bloques_optimos" INTEGER,
    "xp_recompensa" INTEGER NOT NULL,

    CONSTRAINT "desafio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guia_correctiva" (
    "id" UUID NOT NULL,
    "desafio_id" TEXT NOT NULL,
    "patron_error" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "guia_correctiva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progreso" (
    "id" UUID NOT NULL,
    "alumno_id" UUID NOT NULL,
    "desafio_id" TEXT NOT NULL,
    "completado_en" TIMESTAMP(3) NOT NULL,
    "xp_obtenido" INTEGER NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "progreso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tutor_username_key" ON "tutor"("username");

-- CreateIndex
CREATE UNIQUE INDEX "alumno_username_key" ON "alumno"("username");

-- CreateIndex
CREATE UNIQUE INDEX "alumno_anon_id_key" ON "alumno"("anon_id");

-- CreateIndex
CREATE UNIQUE INDEX "nivel_orden_key" ON "nivel"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "desafio_nivel_id_orden_key" ON "desafio"("nivel_id", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "progreso_alumno_id_desafio_id_key" ON "progreso"("alumno_id", "desafio_id");

-- AddForeignKey
ALTER TABLE "alumno" ADD CONSTRAINT "alumno_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consentimiento" ADD CONSTRAINT "consentimiento_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consentimiento" ADD CONSTRAINT "consentimiento_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desafio" ADD CONSTRAINT "desafio_nivel_id_fkey" FOREIGN KEY ("nivel_id") REFERENCES "nivel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guia_correctiva" ADD CONSTRAINT "guia_correctiva_desafio_id_fkey" FOREIGN KEY ("desafio_id") REFERENCES "desafio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso" ADD CONSTRAINT "progreso_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso" ADD CONSTRAINT "progreso_desafio_id_fkey" FOREIGN KEY ("desafio_id") REFERENCES "desafio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
