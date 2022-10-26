-- AlterTable
ALTER TABLE "Doc" ADD COLUMN     "parentId" UUID;

-- AddForeignKey
ALTER TABLE "Doc" ADD CONSTRAINT "Doc_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Doc"("id") ON DELETE CASCADE ON UPDATE CASCADE;
