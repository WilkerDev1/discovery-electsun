"use client";

import { useState, useRef, useEffect } from "react";
import { createProjectComment } from "@/lib/actions/comments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon, BotMessageSquare } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

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
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom when comments change or at initial load
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [initialComments]);

    async function handleSend() {
        if (!message.trim() && !file) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("projectId", projectId);
        formData.append("authorId", currentUserId);
        formData.append("body", message);
        if (file) {
            formData.append("file", file);
        }

        const result = await createProjectComment(formData);
        setIsSubmitting(false);

        if (result.success) {
            setMessage("");
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
            toast.error("Error al enviar", { description: result.error });
        }
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
                {file && (
                    <div className="mb-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-xs flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                        <span className="truncate max-w-[200px]">Adjunto: {file.name}</span>
                        <button type="button" onClick={() => setFile(null)} className="text-red-500 font-bold ml-2">X</button>
                    </div>
                )}
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2 items-end"
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl h-10 w-10 shrink-0 text-zinc-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
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
                        disabled={(!message.trim() && !file) || isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shrink-0 h-10 w-10"
                    >
                        <SendIcon className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
