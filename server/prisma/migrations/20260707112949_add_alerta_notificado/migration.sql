-- CreateEnum
CREATE TYPE "TipoAlerta" AS ENUM ('ESTOQUE_BAIXO', 'VALIDADE_PROXIMA');

-- CreateTable
CREATE TABLE "alertas_notificados" (
    "id" SERIAL NOT NULL,
    "medicamento_id" INTEGER NOT NULL,
    "tipo" "TipoAlerta" NOT NULL,
    "notificado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_notificados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alertas_notificados_medicamento_id_tipo_idx" ON "alertas_notificados"("medicamento_id", "tipo");

-- AddForeignKey
ALTER TABLE "alertas_notificados" ADD CONSTRAINT "alertas_notificados_medicamento_id_fkey" FOREIGN KEY ("medicamento_id") REFERENCES "Medicamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
