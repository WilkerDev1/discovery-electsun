"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createProjectRequirement } from "@/lib/actions/requirements";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().optional(),
});

export function NewRequirementDialog({ projectId, categoryId }: { projectId: string; categoryId: string }) {
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", description: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const payload = { ...values, categoryId };
        const result = await createProjectRequirement(projectId, payload);

        if (result.success) {
            toast.success("Requisito añadido", { description: "Se ha agregado el requisito ad-hoc al proyecto." });
            setOpen(false);
            form.reset();
        } else {
            toast.error("Error", { description: result.error || "No se pudo añadir el requisito." });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
                    <Plus className="mr-2 h-4 w-4" /> Añadir Requisito
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Requisito Ad-Hoc</DialogTitle>
                    <DialogDescription>Agrega un requisito que solo aplicará a esta categoría.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre del Requisito *</FormLabel>
                                <FormControl><Input placeholder="Ej: Foto de la acometida exterior..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripción Opcional</FormLabel>
                                <FormControl><Textarea placeholder="Detalles de cómo debe enviarse la evidencia..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <Button type="submit" className="w-full">Guardar Requisito</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
