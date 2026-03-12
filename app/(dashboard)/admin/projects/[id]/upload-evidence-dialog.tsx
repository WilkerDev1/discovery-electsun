"use client";

import { useState } from "react";
import { uploadEvidenceAdmin } from "@/lib/actions/evidences";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";

export function UploadEvidenceDialog({ projectId, requirementId, currentUserId }: { projectId: string; requirementId: string; currentUserId: string }) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("projectId", projectId);
        formData.append("requirementId", requirementId);
        formData.append("authorId", currentUserId);
        formData.append("file", file);

        const result = await uploadEvidenceAdmin(formData);
        
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Evidencia subida", { description: "Se ha adjuntado la evidencia y auto-aprobado exitosamente." });
            setOpen(false);
            setFile(null);
        } else {
            toast.error("Error", { description: result.error || "No se pudo subir la evidencia." });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
                    <UploadCloud className="mr-2 h-4 w-4" /> Subir Evidencia
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Subir Evidencia (Admin)</DialogTitle>
                    <DialogDescription>Adjunte un archivo referencial o evidencia omitida por el técnico.</DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Archivo *</label>
                        <Input 
                            type="file" 
                            required 
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting || !file}>
                        {isSubmitting ? "Subiendo..." : "Subir Archivo"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
