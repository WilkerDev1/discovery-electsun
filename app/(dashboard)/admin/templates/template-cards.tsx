"use client";

import { useState, useEffect } from "react";
import { createTemplate, cloneTemplateFromProject, deleteTemplate, getProjectsForCloning } from "@/lib/actions/templates";
import { toast } from "sonner";
import { Plus, Copy, Trash2, Layers, FolderTree, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TemplateData = {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    categories: {
        id: string;
        name: string;
        order: number;
        _count: { requirements: number };
    }[];
};

type ProjectForClone = {
    id: string;
    name: string;
    clientName: string;
    status: string;
    _count: { categories: number; requirements: number };
};

export function TemplateCards({ initialTemplates }: { initialTemplates: TemplateData[] }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Clone state
    const [projects, setProjects] = useState<ProjectForClone[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [cloneName, setCloneName] = useState("");
    const [blankName, setBlankName] = useState("");
    const [blankDesc, setBlankDesc] = useState("");

    useEffect(() => {
        if (dialogOpen) {
            getProjectsForCloning().then(setProjects);
        }
    }, [dialogOpen]);

    async function handleCreateBlank() {
        if (!blankName.trim()) return;
        setIsCreating(true);
        const fd = new FormData();
        fd.append("name", blankName);
        fd.append("description", blankDesc);
        const result = await createTemplate(fd);
        setIsCreating(false);
        if (result.success) {
            toast.success("Plantilla creada exitosamente.");
            setDialogOpen(false);
            setBlankName("");
            setBlankDesc("");
        } else {
            toast.error("Error", { description: result.error });
        }
    }

    async function handleClone() {
        if (!selectedProjectId || !cloneName.trim()) return;
        setIsCreating(true);
        const result = await cloneTemplateFromProject(selectedProjectId, cloneName);
        setIsCreating(false);
        if (result.success) {
            toast.success("Plantilla clonada exitosamente.", { description: "Se copiaron todas las categorías y requisitos." });
            setDialogOpen(false);
            setCloneName("");
            setSelectedProjectId("");
        } else {
            toast.error("Error", { description: result.error });
        }
    }

    async function handleDelete(id: string) {
        setDeletingId(id);
        const result = await deleteTemplate(id);
        setDeletingId(null);
        if (result.success) {
            toast.success("Plantilla eliminada.");
        } else {
            toast.error("Error", { description: result.error });
        }
    }

    const totalRequirements = (t: TemplateData) =>
        t.categories.reduce((sum, c) => sum + c._count.requirements, 0);

    return (
        <div className="space-y-4">
            {/* Create button */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600">
                        <Plus className="mr-2 h-4 w-4" /> Nueva Plantilla
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Crear Plantilla</DialogTitle>
                        <DialogDescription>Crea una plantilla desde cero o clónala de un proyecto existente.</DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="blank" className="mt-2">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="blank" className="gap-2"><Layers className="h-3.5 w-3.5" /> Desde Cero</TabsTrigger>
                            <TabsTrigger value="clone" className="gap-2"><Copy className="h-3.5 w-3.5" /> Clonar Proyecto</TabsTrigger>
                        </TabsList>

                        <TabsContent value="blank" className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium">Nombre</label>
                                <Input value={blankName} onChange={(e) => setBlankName(e.target.value)} placeholder="Ej. Instalación Residencial 10kW" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Descripción (Opcional)</label>
                                <Input value={blankDesc} onChange={(e) => setBlankDesc(e.target.value)} placeholder="Descripción breve..." />
                            </div>
                            <Button onClick={handleCreateBlank} disabled={isCreating || !blankName.trim()} className="w-full">
                                {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</> : "Crear Plantilla"}
                            </Button>
                        </TabsContent>

                        <TabsContent value="clone" className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium">Proyecto Base</label>
                                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                    <SelectTrigger><SelectValue placeholder="Selecciona un proyecto..." /></SelectTrigger>
                                    <SelectContent>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                <div className="flex items-center gap-2">
                                                    <FolderTree className="h-3.5 w-3.5 text-zinc-400" />
                                                    <span>{p.name}</span>
                                                    <span className="text-xs text-zinc-400">({p._count.categories} cat, {p._count.requirements} req)</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Nombre de la Plantilla</label>
                                <Input value={cloneName} onChange={(e) => setCloneName(e.target.value)} placeholder="Nombre para la nueva plantilla..." />
                            </div>
                            <Button onClick={handleClone} disabled={isCreating || !selectedProjectId || !cloneName.trim()} className="w-full">
                                {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Clonando...</> : "Clonar como Plantilla"}
                            </Button>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Template Grid */}
            {initialTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-400 space-y-2">
                    <Layers className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No hay plantillas aún.</p>
                    <p className="text-xs">Crea una desde cero o clona de un proyecto existente.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {initialTemplates.map((t) => (
                        <div key={t.id} className="relative group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                    <Layers className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {deletingId === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
                                            <AlertDialogDescription>Se eliminará "{t.name}" y todos sus categorías y requisitos.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-1">{t.name}</h3>
                            {t.description && <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{t.description}</p>}

                            <div className="flex gap-2 flex-wrap mt-3">
                                <Badge variant="secondary" className="text-[10px]">{t.categories.length} categorías</Badge>
                                <Badge variant="secondary" className="text-[10px]">{totalRequirements(t)} requisitos</Badge>
                            </div>

                            {t.categories.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
                                    {t.categories.slice(0, 3).map((c) => (
                                        <div key={c.id} className="flex items-center justify-between text-xs text-zinc-500">
                                            <span className="truncate">{c.name}</span>
                                            <span className="text-zinc-400">{c._count.requirements} req</span>
                                        </div>
                                    ))}
                                    {t.categories.length > 3 && (
                                        <p className="text-[10px] text-zinc-400">+{t.categories.length - 3} más...</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
