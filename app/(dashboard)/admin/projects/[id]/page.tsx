import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface ProjectDetailsPageProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
    const { id } = await params;
    const project = await prisma.project.findUnique({
        where: { id },
    });

    if (!project) {
        notFound();
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Detalles del Proyecto</h2>
            </div>
            <div className="border rounded-md p-8">
                <h3 className="text-xl font-semibold mb-4">{project.name}</h3>
                <p className="text-muted-foreground">{project.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium">Cliente:</span> {project.clientName}
                    </div>
                    <div>
                        <span className="font-medium">Estado:</span> {project.status}
                    </div>
                    <div>
                        <span className="font-medium">Ubicación:</span> {project.location || "No especificada"}
                    </div>
                    <div>
                        <span className="font-medium">Progreso:</span> {project.progress}%
                    </div>
                </div>
            </div>
        </div>
    );
}
