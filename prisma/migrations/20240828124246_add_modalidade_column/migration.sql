/*
  Warnings:

  - Added the required column `modalidade` to the `Trabalho` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trabalho" ADD COLUMN     "modalidade" TEXT NOT NULL;
