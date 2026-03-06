"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Plus,
    Calendar,
    User,
    MapPin,
    MoreVertical,
    GripVertical,
} from "lucide-react";

type ProjectStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

interface KanbanProject {
    id: string;
    name: string;
    clientName: string;
    clientAddress: string;
    completionPct: number;
    estimatedEnd: string;
    technicians: string[];
    requirementsCount: number;
    tags: string[];
}

const columns: { status: ProjectStatus; label: string; color: string }[] = [
    { status: "PENDING", label: "Pendiente", color: "bg-zinc-400" },
    { status: "IN_PROGRESS", label: "En Progreso", color: "bg-blue-500" },
    { status: "COMPLETED", label: "Completado", color: "bg-emerald-500" },
    { status: "ARCHIVED", label: "Archivado", color: "bg-zinc-300" },
];

const sampleProjects: Record<ProjectStatus, KanbanProject[]> = {
    PENDING: [
        {
            id: "p2",
            name: "Sistema Solar — Comercio Pérez",
            clientName: "María Pérez",
            clientAddress: "Av. Winston Churchill #156, Santiago",
            completionPct: 0,
            estimatedEnd: "05 Abr 2026",
            technicians: [],
            requirementsCount: 2,
            tags: ["Comercial", "10kW"],
        },
        {
            id: "p5",
            name: "Residencia López — 3kW",
            clientName: "Pedro López",
            clientAddress: "Calle Duarte #23, La Vega",
            completionPct: 0,
            estimatedEnd: "20 Abr 2026",
            technicians: [],
            requirementsCount: 4,
            tags: ["Residencial", "3kW"],
        },
    ],
    IN_PROGRESS: [
        {
            id: "p1",
            name: "Instalación Solar — Familia Rodríguez",
            clientName: "Juan Rodríguez",
            clientAddress: "Calle Las Palmas #42, Santo Domingo",
            completionPct: 50,
            estimatedEnd: "15 Mar 2026",
            technicians: ["Carlos Técnico"],
            requirementsCount: 4,
            tags: ["Residencial", "5kW"],
        },
    ],
    COMPLETED: [
        {
            id: "p3",
            name: "Paneles Solares — Hotel Caribeño",
            clientName: "Resort Caribeño S.R.L.",
            clientAddress: "Playa Bávaro, Punta Cana",
            completionPct: 100,
            estimatedEnd: "28 Feb 2026",
            technicians: ["Carlos Técnico", "Ana López"],
            requirementsCount: 1,
            tags: ["Hotelero", "25kW"],
        },
    ],
    ARCHIVED: [
        {
            id: "p4",
            name: "Instalación — Clínica Santa María",
            clientName: "Clínica Santa María",
            clientAddress: "Calle El Conde #88, Zona Colonial",
            completionPct: 100,
            estimatedEnd: "15 Ene 2026",
            technicians: ["Carlos Técnico"],
            requirementsCount: 1,
            tags: ["Comercial", "8kW"],
        },
    ],
};

function ProjectCard({ project }: { project: KanbanProject }) {
    return (
        <Card className="group cursor-pointer border-zinc-200 bg-white transition-all hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
            <CardContent className="p-4 space-y-3">
                {/* Tags Row */}
                <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-amber-50 text-amber-700 text-[10px] font-medium px-2 py-0.5 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400"
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>

                {/* Title */}
                <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-zinc-900 leading-tight dark:text-white">
                            {project.name}
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <MoreVertical className="h-3.5 w-3.5 text-zinc-400" />
                        </Button>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2">
                        {project.clientName} — {project.clientAddress}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>Progreso</span>
                        <span className="font-medium">{project.completionPct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                            style={{ width: `${project.completionPct}%` }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                        <Calendar className="h-3 w-3" />
                        {project.estimatedEnd}
                    </div>
                    <div className="flex items-center gap-1">
                        {project.technicians.length > 0 ? (
                            <div className="flex -space-x-1.5">
                                {project.technicians.map((tech, i) => (
                                    <div
                                        key={i}
                                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-zinc-400 to-zinc-500 text-[9px] font-bold text-white dark:border-zinc-900"
                                        title={tech}
                                    >
                                        {tech
                                            .split(" ")
                                            .map((w) => w[0])
                                            .join("")}
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
    );
}

export default function ProjectsKanbanPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Proyectos
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Gestión Kanban del flujo de instalaciones
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Proyecto
                </Button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                    placeholder="Buscar proyectos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-zinc-200 dark:border-zinc-800"
                />
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {columns.map((column) => {
                    const projects = sampleProjects[column.status] ?? [];
                    return (
                        <div key={column.status} className="space-y-3">
                            {/* Column Header */}
                            <div className="flex items-center gap-2 px-1">
                                <div className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
                                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                    {column.label}
                                </h2>
                                <Badge
                                    variant="secondary"
                                    className="ml-auto bg-zinc-100 text-zinc-500 text-xs dark:bg-zinc-800"
                                >
                                    {projects.length}
                                </Badge>
                            </div>

                            {/* Column Content */}
                            <div className="space-y-3 rounded-xl bg-zinc-100/50 p-3 min-h-[200px] dark:bg-zinc-900/50">
                                {projects.map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}

                                {projects.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="text-zinc-300 dark:text-zinc-700">
                                            <GripVertical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-xs">
                                                Sin proyectos en este estado
                                            </p>
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
