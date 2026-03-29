import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { KanbanBoard } from "./kanban-board";
import { NewProjectDialog } from "./new-project-dialog";

export default async function ProjectsKanbanPage() {
    const session = await auth();
    const userRole = session?.user?.role || "TECHNICIAN";
    const isAdmin = userRole === "ADMIN";

    const projects = await prisma.project.findMany({
        where: isAdmin ? {} : { allowedRoles: { has: userRole as any } },
        orderBy: { updatedAt: "desc" },
        include: { assignments: { include: { user: true } } },
    });

    // Fetch templates for the dialog (admin only)
    const templates = isAdmin
        ? await prisma.template.findMany({
              where: { isActive: true },
              include: {
                  categories: {
                      include: { _count: { select: { requirements: true } } },
                      orderBy: { order: "asc" },
                  },
              },
              orderBy: { name: "asc" },
          })
        : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Proyectos
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Gestiona el ciclo de vida de las instalaciones.
                    </p>
                </div>
                {isAdmin && <NewProjectDialog templates={templates} />}
            </div>
            <KanbanBoard projects={projects} />
        </div>
    );
}
