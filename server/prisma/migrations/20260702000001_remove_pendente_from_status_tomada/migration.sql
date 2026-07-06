-- AlterEnum: remove PENDENTE from StatusTomada
-- Postgres does not support DROP VALUE on enums; we must recreate the type.

ALTER TYPE "StatusTomada" RENAME TO "StatusTomada_old";

CREATE TYPE "StatusTomada" AS ENUM ('TOMADO', 'PULADO');

ALTER TABLE "RegistroTomada"
  ALTER COLUMN "status" TYPE "StatusTomada"
  USING "status"::text::"StatusTomada";

DROP TYPE "StatusTomada_old";
