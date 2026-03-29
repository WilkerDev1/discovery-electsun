"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createProjectComment } from "@/lib/actions/comments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon, BotMessageSquare, Paperclip, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { FileUploadZone, FilePreview, revokeFilePreviews, createFilePreview } from "@/components/shared/file-upload-zone";

type ChatComment = {
    id: string;
    body: string;
    createdAt: Date;
    author: {
        id: string;
        name: string;
    };
    fileUrl?: string | null;
    fileType?: string | null;
};

export function ProjectMiniChat({ projectId, currentUserId, initialComments }: { projectId: string, currentUserId: string, initialComments: ChatComment[] }) {
    const [message, setMessage] = useState("");
    const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [initialComments]);

    const resetAttachments = useCallback(() => {
        revokeFilePreviews(filePreviews);
        setFilePreviews([]);
    }, [filePreviews]);

    const handleAttachClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newPreviews = Array.from(e.target.files).map(createFilePreview);
        setFilePreviews((prev) => [...prev, ...newPreviews]);
        e.target.value = "";
    }, []);

    async function handleSend() {
        if (!message.trim() && filePreviews.length === 0) return;

        setIsSubmitting(true);

        // Send one comment per file (or one text-only comment)
        if (filePreviews.length === 0) {
            const formData = new FormData();
            formData.append("projectId", projectId);
            formData.append("authorId", currentUserId);
            formData.append("body", message);
            const result = await createProjectComment(formData);
            if (!result.success) {
                toast.error("Error al enviar", { description: result.error });
            }
        } else {
            for (let i = 0; i < filePreviews.length; i++) {
                const formData = new FormData();
                formData.append("projectId", projectId);
                formData.append("authorId", currentUserId);
                formData.append("body", i === 0 ? message : ""); // attach text only to first
                formData.append("file", filePreviews[i].file);
                const result = await createProjectComment(formData);
                if (!result.success) {
                    toast.error("Error al enviar", { description: result.error || `No se pudo enviar ${filePreviews[i].file.name}` });
                }
            }
        }

        setMessage("");
        resetAttachments();
        setIsSubmitting(false);
    }

    return (
        <div className="flex flex-col h-full max-h-[600px] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
            {/* Header */}
            <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <BotMessageSquare className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Discusión del Proyecto</h3>
                    <p className="text-xs text-zinc-500">Hilo interno de seguimiento</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {initialComments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 space-y-2">
                        <BotMessageSquare className="h-8 w-8 opacity-20" />
                        <p className="text-sm">No hay mensajes aún.</p>
                        <p className="text-xs">Sé el primero en iniciar la conversación.</p>
                    </div>
                ) : (
                    initialComments.map((comment) => {
                        const isMine = comment.author.id === currentUserId;
                        return (
                            <div key={comment.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[85%] ${isMine ? 'ml-auto' : 'mr-auto'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                        {isMine ? 'Tú' : comment.author.name}
                                    </span>
                                    <span className="text-[10px] text-zinc-400">
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                                    </span>
                                </div>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm break-words ${isMine
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
                                    }`}>
                                    {comment.body && <p>{comment.body}</p>}
                                    {comment.fileUrl && (
                                        <div className={`mt-2 ${isMine ? 'text-right' : 'text-left'}`}>
                                            {comment.fileType?.startsWith("image/") ? (
                                                <a href={comment.fileUrl} target="_blank" rel="noreferrer">
                                                    <img src={comment.fileUrl} alt="Attached" className="max-w-[200px] max-h-[200px] object-cover rounded shadow-sm inline-block" />
                                                </a>
                                            ) : comment.fileType?.startsWith("video/") ? (
                                                <video src={comment.fileUrl} controls className="max-w-[200px] max-h-[200px] rounded shadow-sm inline-block" />
                                            ) : comment.fileType?.startsWith("audio/") ? (
                                                <audio src={comment.fileUrl} controls className="max-w-[200px] inline-block" />
                                            ) : (
                                                <a href={comment.fileUrl} target="_blank" rel="noreferrer" className="text-xs underline inline-block">Descargar Archivo adjunto</a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800">
                {/* File preview strip using compact FileUploadZone */}
                {filePreviews.length > 0 && (
                    <div className="mb-2">
                        <FileUploadZone
                            files={filePreviews}
                            onFilesChange={setFilePreviews}
                            accept="*"
                            multiple
                            variant="compact"
                            disabled={isSubmitting}
                        />
                    </div>
                )}

                {/* Hidden file input for the clip button */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileInputChange}
                />

                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2 items-end"
                >
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAttachClick}
                        disabled={isSubmitting}
                        className="rounded-xl h-10 w-10 shrink-0 text-zinc-500"
                    >
                        <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                        placeholder="Escribe un mensaje..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500 rounded-xl"
                        disabled={isSubmitting}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={(!message.trim() && filePreviews.length === 0) || isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shrink-0 h-10 w-10"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
