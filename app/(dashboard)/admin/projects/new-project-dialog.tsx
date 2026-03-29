"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createProject } from "@/lib/actions/projects";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Loader2, Layers } from "lucide-react";
import { FileUploadZone, FilePreview, revokeFilePreviews } from "@/components/shared/file-upload-zone";

const ALL_ROLES = [
    { value: "ADMIN", label: "Administrador" },
    { value: "TECHNICIAN", label: "Técnico" },
    { value: "MANAGER", label: "Gerente" },
    { value: "LEGAL", label: "Legal" },
    { value: "ACCOUNTING", label: "Contabilidad" },
] as const;

const formSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    clientName: z.string().min(1, "El cliente es requerido"),
    clientAddress: z.string().min(1, "La dirección es requerida"),
    estimatedEnd: z.string().optional(),
});

type TemplateOption = {
    id: string;
    name: string;
    categories: { name: string; _count: { requirements: number } }[];
};

export function NewProjectDialog({ templates }: { templates: TemplateOption[] }) {
    const [open, setOpen] = useState(false);
    const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
    const [selectedRoles, setSelectedRoles] = useState<string[]>(["ADMIN"]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", clientName: "", clientAddress: "", estimatedEnd: "" },
    });

    const resetForm = useCallback(() => {
        revokeFilePreviews(filePreviews);
        setFilePreviews([]);
        setSelectedTemplateId("");
        setSelectedRoles(["ADMIN"]);
        form.reset();
    }, [filePreviews, form]);

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

    function toggleRole(role: string) {
        setSelectedRoles((prev) =>
            prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
        );
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);

        const formData = new FormData();
        Object.entries(values).forEach(([k, v]) => {
            formData.append(k, v || "");
        });

        if (selectedTemplateId) {
            formData.append("templateId", selectedTemplateId);
        }
        formData.append("allowedRoles", JSON.stringify(selectedRoles));

        if (filePreviews.length > 0) {
            formData.append("coverFile", filePreviews[0].file);
        }
        filePreviews.slice(1).forEach((fp, i) => {
            formData.append(`additionalFile_${i}`, fp.file);
        });

        const result = await createProject(formData);

        if (result.success) {
            toast.success("Proyecto creado", { description: "El proyecto ha sido creado exitosamente." });
            setOpen(false);
            resetForm();
        } else {
            const errorMessage = typeof result.error === "string" ? result.error : "Verifica los datos del formulario.";
            toast.error("Error al crear", { description: errorMessage });
        }

        setIsSubmitting(false);
    }

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Proyecto</DialogTitle>
                    <DialogDescription>Genera una nueva instalación desde cero o desde una plantilla.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre del Proyecto</FormLabel><FormControl><Input placeholder="Ej. Instalación Solar 10kW..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="clientName" render={({ field }) => (
                            <FormItem><FormLabel>Cliente</FormLabel><FormControl><Input placeholder="Nombre del cliente..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="clientAddress" render={({ field }) => (
                            <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Ubicación de la instalación..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="estimatedEnd" render={({ field }) => (
                            <FormItem><FormLabel>Fecha Límite (Opcional)</FormLabel><FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                        )} />

                        {/* Template Selector */}
                        <div className="space-y-1">
                            <FormLabel className="text-sm font-medium">Plantilla Base (Opcional)</FormLabel>
                            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sin plantilla — proyecto vacío" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Sin plantilla</SelectItem>
                                    {templates.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            <div className="flex items-center gap-2">
                                                <Layers className="h-3.5 w-3.5 text-amber-500" />
                                                <span>{t.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedTemplate && (
                                <p className="text-xs text-zinc-500 mt-1">
                                    Se crearán {selectedTemplate.categories.length} categoría(s) automáticamente.
                                </p>
                            )}
                        </div>

                        {/* Allowed Roles */}
                        <div className="space-y-2">
                            <FormLabel className="text-sm font-medium">Roles con Acceso</FormLabel>
                            <p className="text-xs text-zinc-500">Define qué roles pueden ver este proyecto.</p>
                            <div className="flex flex-wrap gap-3">
                                {ALL_ROLES.map((role) => (
                                    <label key={role.value} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <Checkbox
                                            checked={selectedRoles.includes(role.value)}
                                            onCheckedChange={() => toggleRole(role.value)}
                                            disabled={role.value === "ADMIN"}
                                        />
                                        <span className={role.value === "ADMIN" ? "text-zinc-400" : ""}>{role.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-1">
                            <FormLabel className="text-sm font-medium">Imágenes del Proyecto</FormLabel>
                            <p className="text-xs text-zinc-500">La primera imagen será la portada. Puedes adjuntar varias.</p>
                            <FileUploadZone
                                files={filePreviews}
                                onFilesChange={setFilePreviews}
                                accept="image/*"
                                multiple
                                coverBadgeLabel="Portada"
                                disabled={isSubmitting}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</> : "Crear Proyecto"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
