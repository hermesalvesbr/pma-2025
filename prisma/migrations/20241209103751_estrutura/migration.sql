-- AlterTable
ALTER TABLE "Folha" ADD COLUMN     "estruturaClasse" TEXT,
ADD COLUMN     "estruturaNivel" TEXT,
ALTER COLUMN "dataAdmissao" DROP NOT NULL;
