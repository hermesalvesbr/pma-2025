/*
  Warnings:

  - Changed the type of `exercicio` on the `Despesa` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Despesa" DROP COLUMN "exercicio",
ADD COLUMN     "exercicio" INTEGER NOT NULL;
