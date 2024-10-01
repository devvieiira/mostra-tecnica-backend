-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "avaliador" BOOLEAN NOT NULL,
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
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Trabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "trabalhoId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");

-- AddForeignKey
ALTER TABLE "Trabalho" ADD CONSTRAINT "Trabalho_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_trabalhoId_fkey" FOREIGN KEY ("trabalhoId") REFERENCES "Trabalho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
