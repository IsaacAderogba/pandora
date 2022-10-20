/*
  Warnings:

  - You are about to drop the column `role` on the `Doc` table. All the data in the column will be lost.
  - Added the required column `type` to the `Doc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Doc" DROP COLUMN "role",
ADD COLUMN     "type" "DocType" NOT NULL;