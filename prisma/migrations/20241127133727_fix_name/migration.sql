/*
  Warnings:

  - You are about to drop the column `cooreientador` on the `Trabalho` table. All the data in the column will be lost.
  - Added the required column `coorientador` to the `Trabalho` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trabalho" DROP COLUMN "cooreientador",
ADD COLUMN     "coorientador" TEXT NOT NULL;
