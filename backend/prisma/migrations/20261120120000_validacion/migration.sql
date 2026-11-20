-- TEMPORAL: respuestas de la validación con cliente simulado. Se elimina con DROP TABLE al terminar.
CREATE TABLE "validacion_respuesta" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datos" JSONB NOT NULL,

    CONSTRAINT "validacion_respuesta_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "validacion_respuesta_codigo_key" ON "validacion_respuesta"("codigo");
