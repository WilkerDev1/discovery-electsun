"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createProject } from "@/lib/actions/projects";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, X, ImagePlus } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    clientName: z.string().min(1, "El cliente es requerido"),
    clientAddress: z.string().min(1, "La dirección es requerida"),
    estimatedEnd: z.string().optional(),
});

interface FilePreview {
    file: File;
    previewUrl: string;
}

export function NewProjectDialog() {
    const [open, setOpen] = useState(false);
    const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", clientName: "", clientAddress: "", estimatedEnd: "" },
    });

    const handleFilesSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles) return;

        const newPreviews: FilePreview[] = [];
        Array.from(selectedFiles).forEach((file) => {
            if (!file.type.startsWith("image/")) {
                toast.error("Archivo no soportado", { description: `"${file.name}" no es una imagen.` });
                return;
            }
            newPreviews.push({ file, previewUrl: URL.createObjectURL(file) });
        });

        setFilePreviews((prev) => [...prev, ...newPreviews]);
        // Reset input value so re-selecting the same file works
        e.target.value = "";
    }, []);

    const removeFile = useCallback((index: number) => {
        setFilePreviews((prev) => {
            const removed = prev[index];
            if (removed) URL.revokeObjectURL(removed.previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    const resetForm = useCallback(() => {
        filePreviews.forEach((fp) => URL.revokeObjectURL(fp.previewUrl));
        setFilePreviews([]);
        form.reset();
    }, [filePreviews, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);

        const formData = new FormData();
        Object.entries(values).forEach(([k, v]) => {
            formData.append(k, v || "");
        });

        // Append the first image as the cover, and the rest as additional files
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
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Proyecto</DialogTitle>
                    <DialogDescription>Genera una nueva instalación desde cero.</DialogDescription>
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

                        {/* Multi-file upload with preview */}
                        <div className="space-y-2">
                            <FormLabel className="text-sm font-medium">Imágenes del Proyecto</FormLabel>
                            <p className="text-xs text-zinc-500">La primera imagen será la portada. Puedes adjuntar varias.</p>

                            {filePreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {filePreviews.map((fp, index) => (
                                        <div key={fp.previewUrl} className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                                            <img
                                                src={fp.previewUrl}
                                                alt={fp.file.name}
                                                className="h-full w-full object-cover"
                                            />
                                            {index === 0 && (
                                                <span className="absolute bottom-1 left-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                                                    Portada
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1">
                                                <p className="truncate text-[9px] text-white/80">{fp.file.name}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add more button */}
                                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 hover:border-amber-400 hover:bg-amber-50/50 dark:border-zinc-700 dark:hover:border-amber-500 dark:hover:bg-amber-950/20 transition-colors">
                                        <ImagePlus className="h-5 w-5 text-zinc-400" />
                                        <span className="mt-1 text-[10px] text-zinc-400">Añadir</span>
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} />
                                    </label>
                                </div>
                            )}

                            {filePreviews.length === 0 && (
                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 py-6 hover:border-amber-400 hover:bg-amber-50/50 dark:border-zinc-700 dark:hover:border-amber-500 dark:hover:bg-amber-950/20 transition-colors">
                                    <ImagePlus className="h-8 w-8 text-zinc-400" />
                                    <span className="mt-2 text-xs text-zinc-500">Haz clic para seleccionar imágenes</span>
                                    <span className="text-[10px] text-zinc-400">JPG, PNG, WebP</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} />
                                </label>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Creando..." : "Crear Proyecto"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
