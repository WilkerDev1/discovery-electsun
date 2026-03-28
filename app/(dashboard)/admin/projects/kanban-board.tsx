"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, GripVertical, Trash2 } from "lucide-react";
import { NewProjectDialog } from "./new-project-dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { updateProjectStatus, deleteProject } from "@/lib/actions/projects";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type ProjectStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

const columns: { status: ProjectStatus; label: string; color: string }[] = [
    { status: "PENDING", label: "Pendiente", color: "bg-zinc-400" },
    { status: "IN_PROGRESS", label: "En Progreso", color: "bg-blue-500" },
    { status: "COMPLETED", label: "Completado", color: "bg-emerald-500" },
    { status: "ARCHIVED", label: "Archivado", color: "bg-zinc-300" },
];

export function KanbanBoard({ projects: initialProjects }: { projects: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [projects, setProjects] = useState(initialProjects);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fix hydration mismatch between server and client for DnD
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
        setProjects(initialProjects);
    }, [initialProjects]);

    const filtered = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped = columns.reduce((acc, col) => {
        acc[col.status] = filtered.filter(p => p.status === col.status).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return acc;
    }, {} as Record<ProjectStatus, any[]>);

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const newStatus = destination.droppableId as ProjectStatus;

        // Optimistic update
        setProjects(prev => prev.map(p => p.id === draggableId ? { ...p, status: newStatus } : p));

        const res = await updateProjectStatus(draggableId, newStatus);
        if (!res.success) {
            toast.error("Error", { description: "No se pudo actualizar el estado" });
            // Revert changes on error by syncing with initialProjects
            setProjects(initialProjects);
        } else {
            toast.success("Estado actualizado");
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault(); // Prevent navigating to project details
        e.stopPropagation();
        setProjectToDelete(id);
    };

    const confirmDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!projectToDelete) return;
        
        setIsDeleting(true);
        const res = await deleteProject(projectToDelete);
        
        if (!res.success) {
            toast.error("Error al eliminar", { description: res.error });
            setProjects(initialProjects); // revert
        } else {
            toast.success("Proyecto eliminado", { description: "El proyecto ha sido borrado de la base de datos." });
            setProjects(prev => prev.filter(p => p.id !== projectToDelete));
        }
        
        setIsDeleting(false);
        setProjectToDelete(null);
    };

    if (!isMounted) return <div className="p-8 text-center text-zinc-500">Cargando tablero...</div>;

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

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 items-start">
                    {columns.map((column) => {
                        const colProjects = grouped[column.status] ?? [];
                        return (
                            <div key={column.status} className="space-y-3 flex flex-col h-full min-w-0">
                                <div className="flex items-center gap-2 px-1">
                                    <div className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
                                    <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{column.label}</h2>
                                    <Badge variant="secondary" className="ml-auto bg-zinc-100 text-zinc-500 text-xs dark:bg-zinc-800">{colProjects.length}</Badge>
                                </div>

                                <Droppable droppableId={column.status}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`flex-1 space-y-3 rounded-xl p-3 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-zinc-200/50 dark:bg-zinc-800/80 ring-2 ring-indigo-500/20' : 'bg-zinc-100/50 dark:bg-zinc-900/50'}`}
                                        >
                                            {colProjects.map((project, index) => (
                                                <Draggable key={project.id} draggableId={project.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={snapshot.isDragging ? 'opacity-80' : ''}
                                                            style={provided.draggableProps.style}
                                                        >
                                                            <Link href={`/admin/projects/${project.id}`} className="block group">
                                                                <Card className="relative overflow-hidden cursor-grab active:cursor-grabbing border-zinc-200 bg-white transition-all hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">

                                                                    {/* Cover Image Placeholder or Real Image */}
                                                                    {project.coverUrl ? (
                                                                        <div className="h-24 w-full overflow-hidden bg-zinc-100 border-b border-zinc-100 dark:border-zinc-900">
                                                                            <img src={project.coverUrl} alt="Cover" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="h-2 bg-gradient-to-r from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900" />
                                                                    )}

                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="absolute top-2 right-2 h-7 w-7 bg-white/50 backdrop-blur-sm hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                                                                        onClick={(e) => handleDeleteClick(e, project.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>

                                                                    <CardContent className="p-4 space-y-3">
                                                                        <div className="space-y-1 pr-6">
                                                                            <h3 className="text-sm font-semibold text-zinc-900 leading-tight dark:text-white line-clamp-1">{project.name}</h3>
                                                                            <p className="text-xs text-zinc-500 line-clamp-1">{project.clientName} — {project.clientAddress}</p>
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
                                                                                                className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-zinc-400 to-zinc-500 text-[8px] font-bold text-white dark:border-zinc-900"
                                                                                                title={assignment.user.name}
                                                                                            >
                                                                                                {assignment.user.name.split(" ").map((w: string) => w[0]).join("")}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className="text-[10px] text-zinc-300">Asignar</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            </Link>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            {colProjects.length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-8 text-center pointer-events-none">
                                                    <div className="text-zinc-300 dark:text-zinc-700">
                                                        <GripVertical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                        <p className="text-xs">Soltar aquí</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            <AlertDialog open={!!projectToDelete} onOpenChange={(open: boolean) => !open && !isDeleting && setProjectToDelete(null)}>
                <AlertDialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el proyecto y todas sus dependencias incluidas fotografías de evidencias.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting} onClick={(e: React.MouseEvent) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white">
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
