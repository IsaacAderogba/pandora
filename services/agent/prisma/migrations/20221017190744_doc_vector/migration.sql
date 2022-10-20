-- AlterTable
ALTER TABLE "Doc" ADD COLUMN     "vector" TSVECTOR 
  GENERATED ALWAYS AS 
    (to_tsvector('english', coalesce(title, ''))) 
  STORED;

-- CreateIndex
CREATE INDEX "Doc_vector_idx" ON "Doc" USING GIN ("vector");
