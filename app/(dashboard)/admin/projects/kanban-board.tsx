"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Calendar, MoreVertical, GripVertical } from "lucide-react";
import { NewProjectDialog } from "./new-project-dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type ProjectStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

const columns: { status: ProjectStatus; label: string; color: string }[] = [
    { status: "PENDING", label: "Pendiente", color: "bg-zinc-400" },
    { status: "IN_PROGRESS", label: "En Progreso", color: "bg-blue-500" },
    { status: "COMPLETED", label: "Completado", color: "bg-emerald-500" },
    { status: "ARCHIVED", label: "Archivado", color: "bg-zinc-300" },
];

export function KanbanBoard({ projects }: { projects: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped = columns.reduce((acc, col) => {
        acc[col.status] = filtered.filter(p => p.status === col.status);
        return acc;
    }, {} as Record<ProjectStatus, any[]>);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Proyectos</h1>
                    <p className="mt-1 text-sm text-zinc-500">Gestión Kanban del flujo de instalaciones</p>
                </div>
                <NewProjectDialog />
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                    placeholder="Buscar proyectos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-zinc-200 dark:border-zinc-800"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {columns.map((column) => {
                    const colProjects = grouped[column.status] ?? [];
                    return (
                        <div key={column.status} className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <div className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
                                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{column.label}</h2>
                                <Badge variant="secondary" className="ml-auto bg-zinc-100 text-zinc-500 text-xs dark:bg-zinc-800">{colProjects.length}</Badge>
                            </div>
                            <div className="space-y-3 rounded-xl bg-zinc-100/50 p-3 min-h-[200px] dark:bg-zinc-900/50">
                                {colProjects.map((project) => (
                                    <Link href={`/admin/projects/${project.id}`} key={project.id} className="block group">
                                        <Card className="cursor-pointer border-zinc-200 bg-white transition-all hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="text-sm font-semibold text-zinc-900 leading-tight dark:text-white">{project.name}</h3>
                                                        <MoreVertical className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    <p className="text-xs text-zinc-500 line-clamp-2">{project.clientName} — {project.clientAddress}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-zinc-400">
                                                        <span>Progreso</span>
                                                        <span className="font-medium">{Math.round(project.completionPct)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                                                        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" style={{ width: `${project.completionPct}%` }} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-1">
                                                    <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                                                        <Calendar className="h-3 w-3" />
                                                        {project.estimatedEnd ? format(new Date(project.estimatedEnd), "dd MMM yy", { locale: es }) : "Sin fecha"}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {project.assignments && project.assignments.length > 0 ? (
                                                            <div className="flex -space-x-1.5">
                                                                {project.assignments.map((assignment: any, i: number) => (
                                                                    <div
                                                                        key={i}
                                                                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-zinc-400 to-zinc-500 text-[9px] font-bold text-white dark:border-zinc-900"
                                                                        title={assignment.user.name}
                                                                    >
                                                                        {assignment.user.name.split(" ").map((w: string) => w[0]).join("")}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-zinc-300">Sin asignar</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                                {colProjects.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="text-zinc-300 dark:text-zinc-700">
                                            <GripVertical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-xs">Sin proyectos</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
