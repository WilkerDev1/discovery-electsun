/*
  Warnings:

  - You are about to drop the column `category` on the `requirements` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "requirements" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "project_categories" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_categories_projectId_order_idx" ON "project_categories"("projectId", "order");

-- CreateIndex
CREATE INDEX "requirements_categoryId_idx" ON "requirements"("categoryId");

-- AddForeignKey
ALTER TABLE "project_categories" ADD CONSTRAINT "project_categories_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "project_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
