/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `Trabalho` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Trabalho" DROP CONSTRAINT "Trabalho_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Trabalho" DROP COLUMN "usuarioId";

-- CreateTable
CREATE TABLE "_TrabalhoToUsuario" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TrabalhoToUsuario_AB_unique" ON "_TrabalhoToUsuario"("A", "B");

-- CreateIndex
CREATE INDEX "_TrabalhoToUsuario_B_index" ON "_TrabalhoToUsuario"("B");

-- AddForeignKey
ALTER TABLE "_TrabalhoToUsuario" ADD CONSTRAINT "_TrabalhoToUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "Trabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrabalhoToUsuario" ADD CONSTRAINT "_TrabalhoToUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
