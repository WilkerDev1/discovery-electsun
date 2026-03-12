"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createProjectCategory } from "@/lib/actions/categories";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(1, "El nombre de la categoría es requerido"),
});

export function NewCategoryDialog({ projectId }: { projectId: string }) {
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const result = await createProjectCategory(projectId, values.name);

        if (result.success) {
            toast.success("Categoría añadida", { description: "Se ha creado la nueva categoría." });
            setOpen(false);
            form.reset();
        } else {
            toast.error("Error", { description: result.error || "No se pudo crear la categoría." });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900">
                    <Plus className="mr-2 h-4 w-4" /> Añadir Categoría
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nueva Categoría de Requisitos</DialogTitle>
                    <DialogDescription>Agrupa los requisitos en diferentes fases o tipos.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre de la Categoría *</FormLabel>
                                <FormControl><Input placeholder="Ej: Instalación, Inversor, Estructura..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <Button type="submit" className="w-full">Guardar Categoría</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
