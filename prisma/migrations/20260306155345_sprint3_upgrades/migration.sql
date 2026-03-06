-- AlterTable
ALTER TABLE "announcements" ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "projectId" TEXT,
ALTER COLUMN "evidenceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "coverUrl" TEXT;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
