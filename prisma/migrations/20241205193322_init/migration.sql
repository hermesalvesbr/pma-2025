-- CreateTable
CREATE TABLE "Despesa" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "emissao" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "objetoResumido" TEXT NOT NULL,
    "classificacao" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "subfuncao" TEXT NOT NULL,
    "programa" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "categoriaEconomica" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,
    "modalidadeAplicacao" TEXT NOT NULL,
    "elemento" TEXT NOT NULL,
    "detalhamento" TEXT NOT NULL,
    "fonteRecurso" TEXT NOT NULL,
    "exercicio" TEXT NOT NULL,
    "unidadeOrcamentaria" TEXT NOT NULL,
    "unidadeGestora" TEXT NOT NULL,
    "fornecedor" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Despesa_pkey" PRIMARY KEY ("id")
);
