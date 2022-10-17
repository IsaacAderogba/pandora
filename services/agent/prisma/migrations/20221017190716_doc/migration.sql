-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('DATABASE', 'PAGE', 'COMMENT');

-- CreateTable
CREATE TABLE "Doc" (
    "id" UUID NOT NULL,
    "role" "DocType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doc_pkey" PRIMARY KEY ("id")
);
