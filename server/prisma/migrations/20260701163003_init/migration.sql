/*
  Warnings:

  - You are about to drop the `horarios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `medicamentos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `registros_tomada` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "StatusTomada" ADD VALUE 'PENDENTE';

-- DropForeignKey
ALTER TABLE "horarios" DROP CONSTRAINT "horarios_medicamento_id_fkey";

-- DropForeignKey
ALTER TABLE "medicamentos" DROP CONSTRAINT "medicamentos_idoso_id_fkey";

-- DropForeignKey
ALTER TABLE "registros_tomada" DROP CONSTRAINT "registros_tomada_medicamento_id_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_cuidador_id_fkey";

-- DropTable
DROP TABLE "horarios";

-- DropTable
DROP TABLE "medicamentos";

-- DropTable
DROP TABLE "registros_tomada";

-- DropTable
DROP TABLE "usuarios";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipo" "TipoUsuario" NOT NULL,
    "cuidadorId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicamento" (
    "id" SERIAL NOT NULL,
    "idosoId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "dosagem" TEXT NOT NULL,
    "frequenciaDiaria" INTEGER NOT NULL,
    "estoqueAtual" INTEGER NOT NULL,
    "dataValidade" DATE NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Horario" (
    "id" SERIAL NOT NULL,
    "medicamentoId" INTEGER NOT NULL,
    "hora" TEXT NOT NULL,

    CONSTRAINT "Horario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroTomada" (
    "id" SERIAL NOT NULL,
    "medicamentoId" INTEGER NOT NULL,
    "horarioId" INTEGER,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusTomada" NOT NULL,

    CONSTRAINT "RegistroTomada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_cuidadorId_fkey" FOREIGN KEY ("cuidadorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicamento" ADD CONSTRAINT "Medicamento_idosoId_fkey" FOREIGN KEY ("idosoId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroTomada" ADD CONSTRAINT "RegistroTomada_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroTomada" ADD CONSTRAINT "RegistroTomada_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "Horario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
