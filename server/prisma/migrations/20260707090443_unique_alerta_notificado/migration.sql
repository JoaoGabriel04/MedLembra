-- AlterTable
ALTER TABLE "alertas_notificados" DROP CONSTRAINT "alertas_notificados_medicamento_id_tipo_key", ADD CONSTRAINT "alertas_notificados_medicamento_id_tipo_key" UNIQUE ("medicamento_id", "tipo");
