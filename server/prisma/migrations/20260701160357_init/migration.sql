-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('IDOSO', 'CUIDADOR');

-- CreateEnum
CREATE TYPE "StatusTomada" AS ENUM ('TOMADO', 'PULADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "tipo" "TipoUsuario" NOT NULL,
    "cuidador_id" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicamentos" (
    "id" SERIAL NOT NULL,
    "idoso_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "dosagem" TEXT NOT NULL,
    "frequencia_diaria" INTEGER NOT NULL,
    "estoque_atual" INTEGER NOT NULL,
    "data_validade" DATE NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios" (
    "id" SERIAL NOT NULL,
    "medicamento_id" INTEGER NOT NULL,
    "hora" TEXT NOT NULL,

    CONSTRAINT "horarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_tomada" (
    "id" SERIAL NOT NULL,
    "medicamento_id" INTEGER NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL,
    "status" "StatusTomada" NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_tomada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_cuidador_id_idx" ON "usuarios"("cuidador_id");

-- CreateIndex
CREATE INDEX "medicamentos_idoso_id_idx" ON "medicamentos"("idoso_id");

-- CreateIndex
CREATE INDEX "horarios_medicamento_id_idx" ON "horarios"("medicamento_id");

-- CreateIndex
CREATE UNIQUE INDEX "horarios_medicamento_id_hora_key" ON "horarios"("medicamento_id", "hora");

-- CreateIndex
CREATE INDEX "registros_tomada_medicamento_id_data_hora_idx" ON "registros_tomada"("medicamento_id", "data_hora");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_cuidador_id_fkey" FOREIGN KEY ("cuidador_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicamentos" ADD CONSTRAINT "medicamentos_idoso_id_fkey" FOREIGN KEY ("idoso_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios" ADD CONSTRAINT "horarios_medicamento_id_fkey" FOREIGN KEY ("medicamento_id") REFERENCES "medicamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_tomada" ADD CONSTRAINT "registros_tomada_medicamento_id_fkey" FOREIGN KEY ("medicamento_id") REFERENCES "medicamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
