/*
  Warnings:

  - Added the required column `cooreientador` to the `Trabalho` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orientador` to the `Trabalho` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trabalho" ADD COLUMN     "cooreientador" TEXT NOT NULL,
ADD COLUMN     "orientador" TEXT NOT NULL;
