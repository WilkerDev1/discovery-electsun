"use client";

import { useState, useCallback } from "react";
import { uploadEvidenceAdmin } from "@/lib/actions/evidences";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UploadCloud, Loader2 } from "lucide-react";
import { FileUploadZone, FilePreview, revokeFilePreviews } from "@/components/shared/file-upload-zone";

export function UploadEvidenceDialog({ projectId, requirementId, currentUserId }: { projectId: string; requirementId: string; currentUserId: string }) {
    const [open, setOpen] = useState(false);
    const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetFiles = useCallback(() => {
        revokeFilePreviews(filePreviews);
        setFilePreviews([]);
    }, [filePreviews]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (filePreviews.length === 0) return;

        setIsSubmitting(true);
        let successCount = 0;
        let failCount = 0;

        for (const fp of filePreviews) {
            const formData = new FormData();
            formData.append("projectId", projectId);
            formData.append("requirementId", requirementId);
            formData.append("authorId", currentUserId);
            formData.append("file", fp.file);

            const result = await uploadEvidenceAdmin(formData);
            if (result.success) {
                successCount++;
            } else {
                failCount++;
                console.error(`[EVIDENCE UPLOAD UI] Failed for ${fp.file.name}:`, result.error);
            }
        }

        setIsSubmitting(false);

        if (failCount > 0) {
            toast.error("Error parcial", { description: `${failCount} archivo(s) no se pudieron subir. ${successCount} subido(s) correctamente.` });
        }
        if (successCount > 0) {
            toast.success("Evidencia subida", { description: `${successCount} archivo(s) adjuntado(s) y auto-aprobado(s) exitosamente.` });
        }

        setOpen(false);
        resetFiles();
    }

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetFiles(); }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
                    <UploadCloud className="mr-2 h-4 w-4" /> Subir Evidencia
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Subir Evidencia (Admin)</DialogTitle>
                    <DialogDescription>Adjunte archivos referenciales o evidencia omitida por el técnico. Puedes subir varios de golpe.</DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <FileUploadZone
                        files={filePreviews}
                        onFilesChange={setFilePreviews}
                        accept="*"
                        multiple
                        coverBadgeLabel={null}
                        disabled={isSubmitting}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting || filePreviews.length === 0}>
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo {filePreviews.length} archivo(s)...</> : `Subir ${filePreviews.length > 0 ? filePreviews.length : ""} Archivo${filePreviews.length !== 1 ? "s" : ""}`}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
