/*
  Warnings:

  - You are about to drop the column `category` on the `template_requirements` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `template_requirements` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `template_requirements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'LEGAL';
ALTER TYPE "Role" ADD VALUE 'ACCOUNTING';
ALTER TYPE "Role" ADD VALUE 'MANAGER';

-- DropForeignKey
ALTER TABLE "template_requirements" DROP CONSTRAINT "template_requirements_templateId_fkey";

-- AlterTable
ALTER TABLE "project_categories" ADD COLUMN     "allowedRoles" "Role"[] DEFAULT ARRAY['ADMIN']::"Role"[];

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "allowedRoles" "Role"[] DEFAULT ARRAY['ADMIN']::"Role"[];

-- AlterTable
ALTER TABLE "template_requirements" DROP COLUMN "category",
DROP COLUMN "templateId",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "template_categories" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "allowedRoles" "Role"[] DEFAULT ARRAY['ADMIN']::"Role"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "template_categories_templateId_order_idx" ON "template_categories"("templateId", "order");

-- CreateIndex
CREATE INDEX "template_requirements_categoryId_order_idx" ON "template_requirements"("categoryId", "order");

-- AddForeignKey
ALTER TABLE "template_categories" ADD CONSTRAINT "template_categories_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_requirements" ADD CONSTRAINT "template_requirements_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "template_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
