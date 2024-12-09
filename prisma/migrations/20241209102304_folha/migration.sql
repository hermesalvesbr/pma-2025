-- CreateTable
CREATE TABLE "Folha" (
    "id" TEXT NOT NULL,
    "unidadeGestoraCodigo" INTEGER NOT NULL,
    "unidadeGestoraNome" TEXT NOT NULL,
    "matriculaNumero" TEXT NOT NULL,
    "matriculaCpf" TEXT NOT NULL,
    "matriculaNome" TEXT NOT NULL,
    "dataAdmissao" TIMESTAMP(3) NOT NULL,
    "tipoContratacao" TEXT,
    "vinculo" TEXT NOT NULL,
    "localNome" TEXT NOT NULL,
    "cargoCodigo" TEXT NOT NULL,
    "cargoNome" TEXT NOT NULL,
    "funcaoNome" TEXT,
    "nrHorasSemanais" DOUBLE PRECISION NOT NULL,
    "salarioBase" DOUBLE PRECISION NOT NULL,
    "totalVantagens" DOUBLE PRECISION NOT NULL,
    "totalDescontos" DOUBLE PRECISION NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folha_pkey" PRIMARY KEY ("id")
);
