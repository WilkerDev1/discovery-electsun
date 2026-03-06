import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NewRequirementDialog } from "./new-requirement-dialog";
import { ProjectMiniChat } from "./project-mini-chat";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileImage, CheckCircle2, Clock, MapPin, Building2, UserCircle2 } from "lucide-react";

type ProjectDetailsPageProps = {
    params: { id: string } | Promise<{ id: string }>;
};

export default async function ProjectDetailsPage(props: ProjectDetailsPageProps) {
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
        return <div>No autorizado</div>;
    }

    // Safely unwrap params for Next 14 and 15 compatibility
    const resolvedParams = await props.params;
    const id = resolvedParams?.id || (props.params as any).id;

    if (!id) {
        notFound();
    }

    const project = await prisma.project.findUnique({
        where: { id },

        include: {
            requirements: {
                orderBy: [{ category: 'asc' }, { order: 'asc' }],
                include: {
                    evidences: {
                        orderBy: { createdAt: 'desc' },
                        include: { uploadedBy: true }
                    }
                }
            },
            comments: {
                orderBy: { createdAt: 'asc' },
                include: { author: true }
            }
        }
    });

    if (!project) {
        notFound();
    }

    // Group requirements by category
    const groupedRequirements = project.requirements.reduce((acc: any, req: any) => {
        const cat = req.category || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(req);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className="flex-1 p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">

                {/* ─── LEFT PANEL (65% -> col-span-8) ─── */}
                <div className="lg:col-span-8 space-y-8 flex flex-col pt-1">
                    {/* Project Header Widget */}
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                        {project.coverUrl && (
                            <img src={project.coverUrl} alt="Cover" className="absolute top-0 right-0 w-1/3 h-full object-cover opacity-20 pointer-events-none [mask-image:linear-gradient(to_left,white,transparent)]" />
                        )}
                        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <Badge variant="secondary" className="mb-3 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                    {project.status.replace("_", " ")}
                                </Badge>
                                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white capitalize">
                                    {project.name.toLowerCase()}
                                </h2>
                                <p className="mt-2 text-zinc-500 max-w-2xl">{project.description}</p>

                                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4" /> <span>{project.clientName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> <span className="truncate max-w-[250px]">{project.clientAddress}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Requirements Section */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Lista de Requisitos</h3>
                                <p className="text-sm text-zinc-500">Evidencias fotográficas y documentales necesarias</p>
                            </div>
                            <NewRequirementDialog projectId={project.id} />
                        </div>

                        {/* Requirements List (Scrollable) */}
                        <div className="flex-1 overflow-y-auto pr-2 space-y-8 pb-8">
                            {Object.entries(groupedRequirements).length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500">
                                    <FileImage className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    No hay requisitos asignados a este proyecto.
                                </div>
                            ) : (
                                (Object.entries(groupedRequirements) as [string, any[]][]).map(([category, requirements]) => (
                                    <div key={category} className="space-y-4">
                                        <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                            {category}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {requirements.map((req) => {
                                                const hasEvidence = req.evidences.length > 0;
                                                const latestEvidence = hasEvidence ? req.evidences[0] : null;
                                                const isApproved = latestEvidence?.status === "APPROVED";

                                                return (
                                                    <Card key={req.id} className="border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                                                        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                                                            <div className="space-y-1">
                                                                <CardTitle className="text-sm font-medium leading-tight">
                                                                    {req.name}
                                                                </CardTitle>
                                                                {req.description && (
                                                                    <CardDescription className="text-xs line-clamp-2">
                                                                        {req.description}
                                                                    </CardDescription>
                                                                )}
                                                            </div>
                                                            {isApproved ? (
                                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 ml-2" />
                                                            ) : (
                                                                <Clock className="h-5 w-5 text-amber-500 shrink-0 ml-2" />
                                                            )}
                                                        </CardHeader>
                                                        <CardContent className="p-4 pt-2">
                                                            <div className="flex items-center justify-between mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
                                                                <div className="flex items-center gap-2">
                                                                    <UserCircle2 className="h-4 w-4 text-zinc-400" />
                                                                    <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[120px]">
                                                                        {latestEvidence ? latestEvidence.uploadedBy.name : "Sin evidencia"}
                                                                    </span>
                                                                </div>
                                                                <Badge variant="outline" className={`text-[10px] ${latestEvidence ? (isApproved ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800/50' : 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800/50') : 'border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400'}`}>
                                                                    {latestEvidence ? (isApproved ? "Aprobado" : "Pendiente Rev.") : "Pendiente"}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── RIGHT PANEL (35% -> col-span-4) ─── */}
                <div className="lg:col-span-4 lg:pl-4 mt-8 lg:mt-0 flex flex-col h-[calc(100vh-8rem)]">
                    <ProjectMiniChat
                        projectId={project.id}
                        currentUserId={currentUserId}
                        initialComments={project.comments}
                    />
                </div>

            </div>
        </div>
    );
}
