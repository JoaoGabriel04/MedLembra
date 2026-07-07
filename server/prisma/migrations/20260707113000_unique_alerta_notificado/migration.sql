-- Remove any existing index (regular or unique) and re-create as proper UNIQUE CONSTRAINT
DROP INDEX IF EXISTS "alertas_notificados_medicamento_id_tipo_idx";
DROP INDEX IF EXISTS "alertas_notificados_medicamento_id_tipo_key";
ALTER TABLE "alertas_notificados" DROP CONSTRAINT IF EXISTS "alertas_notificados_medicamento_id_tipo_key";

ALTER TABLE "alertas_notificados"
  ADD CONSTRAINT "alertas_notificados_medicamento_id_tipo_key" UNIQUE ("medicamento_id", "tipo");
