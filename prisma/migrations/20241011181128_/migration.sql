-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('ADMIN', 'AVALIADOR', 'NORMAL');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Roles" NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "senha" TEXT,
    "hashSenha" TEXT,
    "formacao" TEXT,
    "interesse" TEXT,
    "disponilidade" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trabalho" (
    "id" TEXT NOT NULL,
    "titulo_trabalho" TEXT NOT NULL,
    "instituicao" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,
    "nivel_ensino" TEXT NOT NULL,
    "area" TEXT NOT NULL,

    CONSTRAINT "Trabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "trabalhoId" TEXT NOT NULL,
    "nota" DOUBLE PRECISION NOT NULL,
    "inclusao" BOOLEAN,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TrabalhoToUsuario" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "_TrabalhoToUsuario_AB_unique" ON "_TrabalhoToUsuario"("A", "B");

-- CreateIndex
CREATE INDEX "_TrabalhoToUsuario_B_index" ON "_TrabalhoToUsuario"("B");

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_trabalhoId_fkey" FOREIGN KEY ("trabalhoId") REFERENCES "Trabalho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrabalhoToUsuario" ADD CONSTRAINT "_TrabalhoToUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "Trabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrabalhoToUsuario" ADD CONSTRAINT "_TrabalhoToUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
