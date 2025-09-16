-- CreateEnum
CREATE TYPE "public"."TipoContribuicao" AS ENUM ('DIZIMO', 'OFERTA');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('TESOUREIRO', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."Movimento" (
    "id" SERIAL NOT NULL,
    "tipo" "public"."TipoContribuicao" NOT NULL,
    "nome" TEXT NOT NULL,
    "contato" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "tipoOferta" TEXT,
    "comprovante" TEXT,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" SERIAL NOT NULL,
    "usuario" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'TESOUREIRO',

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_usuario_key" ON "public"."Usuario"("usuario");
