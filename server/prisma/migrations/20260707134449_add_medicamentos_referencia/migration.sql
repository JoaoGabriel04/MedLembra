-- CreateTable
CREATE TABLE "medicamentos_referencia" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(200) NOT NULL,

    CONSTRAINT "medicamentos_referencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medicamentos_referencia_nome_idx" ON "medicamentos_referencia"("nome");
