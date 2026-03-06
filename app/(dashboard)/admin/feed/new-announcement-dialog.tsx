"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createAnnouncement } from "@/lib/actions/announcements";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const formSchema = z.object({
    title: z.string().min(1, "El título es requerido"),
    body: z.string().min(1, "El contenido es requerido"),
    isPinned: z.boolean().optional(),
});

export function NewAnnouncementDialog({ authorId }: { authorId: string }) {
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: "", body: "", isPinned: false },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("body", values.body);
        if (values.isPinned) formData.append("isPinned", "on");

        const result = await createAnnouncement(formData, authorId);

        if (result.success) {
            toast.success("Anuncio creado", { description: "El anuncio ha sido publicado exitosamente." });
            setOpen(false);
            form.reset();
        } else {
            toast.error("Error al publicar", { description: "No se pudo crear el anuncio." });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Anuncio
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Publicar Nuevo Anuncio</DialogTitle>
                    <DialogDescription>Crea un comunicado para el Feed de la plataforma.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Título</FormLabel><FormControl><Input placeholder="Título del anuncio..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="body" render={({ field }) => (
                            <FormItem><FormLabel>Contenido</FormLabel><FormControl><Textarea placeholder="Mensaje principal..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="isPinned" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <div className="space-y-1 leading-none"><FormLabel>Fijar Anuncio</FormLabel><DialogDescription>Aparecerá destacado con un icono de pin.</DialogDescription></div>
                            </FormItem>
                        )} />
                        <Button type="submit" className="w-full">Publicar Anuncio</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
