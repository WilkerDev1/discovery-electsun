import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "./kanban-board";

export default async function ProjectsKanbanPage() {
    const projects = await prisma.project.findMany({
        orderBy: { updatedAt: "desc" },
        include: { assignments: { include: { user: true } } }
    });

    return <KanbanBoard projects={projects} />;
}

