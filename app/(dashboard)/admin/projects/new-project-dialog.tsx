"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createProject } from "@/lib/actions/projects";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    clientName: z.string().min(1, "El cliente es requerido"),
    clientAddress: z.string().min(1, "La dirección es requerida"),
    estimatedEnd: z.string().optional(),
});

export function NewProjectDialog() {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", clientName: "", clientAddress: "", estimatedEnd: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        Object.entries(values).forEach(([k, v]) => {
            formData.append(k, v || "");
        });
        if (file) {
            formData.append("coverFile", file);
        }

        // Server Action
        const result = await createProject(formData);

        if (result.success) {
            toast.success("Proyecto creado", { description: "El proyecto ha sido creado exitosamente." });
            setOpen(false);
            form.reset();
            setFile(null);
        } else {
            toast.error("Error al crear", { description: "No se pudo crear el proyecto." });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
                </Button>
            </DialogTrigger>
            <DialogContent>
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
                        <div className="space-y-2">
                            <FormLabel className="text-sm font-medium">Foto de Portada (Opcional)</FormLabel>
                            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        </div>
                        <Button type="submit" className="w-full">Crear Proyecto</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
