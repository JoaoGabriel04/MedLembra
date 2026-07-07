-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "email_verificado" BOOLEAN NOT NULL DEFAULT false;

-- Existing users are already verified — grandfather them in
UPDATE "Usuario" SET "email_verificado" = true;

-- CreateTable
CREATE TABLE "codigos_verificacao" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "codigo" VARCHAR(6) NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "usado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codigos_verificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "codigos_verificacao_usuario_id_idx" ON "codigos_verificacao"("usuario_id");

-- AddForeignKey
ALTER TABLE "codigos_verificacao" ADD CONSTRAINT "codigos_verificacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
