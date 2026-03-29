"use client";

import { useCallback, useRef } from "react";
import { X, ImagePlus, FileText, FileAudio, FileVideo, File as FileIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────

export interface FilePreview {
    file: File;
    previewUrl: string | null; // null for non-image files
}

export interface FileUploadZoneProps {
    files: FilePreview[];
    onFilesChange: (files: FilePreview[]) => void;
    accept?: string;
    multiple?: boolean;
    variant?: "default" | "compact";
    coverBadgeLabel?: string | null;
    maxFiles?: number;
    disabled?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────

function isImageFile(file: File): boolean {
    return file.type.startsWith("image/");
}

function getFileIcon(file: File) {
    if (file.type.startsWith("audio/")) return FileAudio;
    if (file.type.startsWith("video/")) return FileVideo;
    if (file.type === "application/pdf" || file.type.includes("document") || file.type.includes("text")) return FileText;
    return FileIcon;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Utility to create FilePreview from a File ───────────────

export function createFilePreview(file: File): FilePreview {
    return {
        file,
        previewUrl: isImageFile(file) ? URL.createObjectURL(file) : null,
    };
}

export function revokeFilePreviews(previews: FilePreview[]): void {
    previews.forEach((fp) => {
        if (fp.previewUrl) URL.revokeObjectURL(fp.previewUrl);
    });
}

// ─── Component ────────────────────────────────────────────────

export function FileUploadZone({
    files,
    onFilesChange,
    accept = "image/*",
    multiple = true,
    variant = "default",
    coverBadgeLabel = null,
    maxFiles = 20,
    disabled = false,
}: FileUploadZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFilesSelected = useCallback(
        (selectedFiles: FileList | null) => {
            if (!selectedFiles || disabled) return;

            const newPreviews: FilePreview[] = [];
            const remaining = maxFiles - files.length;

            Array.from(selectedFiles)
                .slice(0, multiple ? remaining : 1)
                .forEach((file) => {
                    newPreviews.push(createFilePreview(file));
                });

            if (!multiple) {
                // Single file mode: replace existing
                revokeFilePreviews(files);
                onFilesChange(newPreviews);
            } else {
                onFilesChange([...files, ...newPreviews]);
            }
        },
        [files, onFilesChange, maxFiles, multiple, disabled]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            handleFilesSelected(e.target.files);
            e.target.value = "";
        },
        [handleFilesSelected]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (disabled) return;
            handleFilesSelected(e.dataTransfer.files);
        },
        [handleFilesSelected, disabled]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const removeFile = useCallback(
        (index: number) => {
            if (disabled) return;
            const removed = files[index];
            if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
            onFilesChange(files.filter((_, i) => i !== index));
        },
        [files, onFilesChange, disabled]
    );

    // ─── Compact Variant (for chat) ──────────────────────────

    if (variant === "compact") {
        return (
            <div className="space-y-1">
                {files.length > 0 && (
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {files.map((fp, index) => (
                            <div
                                key={`${fp.file.name}-${index}`}
                                className="relative shrink-0 group"
                            >
                                {fp.previewUrl ? (
                                    <img
                                        src={fp.previewUrl}
                                        alt={fp.file.name}
                                        className="h-14 w-14 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700"
                                    />
                                ) : (
                                    <div className="h-14 w-14 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center">
                                        {(() => { const Icon = getFileIcon(fp.file); return <Icon className="h-5 w-5 text-zinc-400" />; })()}
                                        <span className="text-[8px] text-zinc-400 mt-0.5 max-w-[48px] truncate">{fp.file.name.split('.').pop()}</span>
                                    </div>
                                )}
                                {!disabled && (
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-2.5 w-2.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className="hidden"
                    onChange={handleInputChange}
                    disabled={disabled}
                />
            </div>
        );
    }

    // ─── Default Variant (full grid with dropzone) ───────────

    return (
        <div className="space-y-2">
            {files.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {files.map((fp, index) => (
                        <div
                            key={`${fp.file.name}-${index}`}
                            className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
                        >
                            {fp.previewUrl ? (
                                <img
                                    src={fp.previewUrl}
                                    alt={fp.file.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                                    {(() => { const Icon = getFileIcon(fp.file); return <Icon className="h-8 w-8 text-zinc-400" />; })()}
                                    <span className="mt-1 text-[9px] text-zinc-400 uppercase">{fp.file.name.split('.').pop()}</span>
                                    <span className="text-[8px] text-zinc-300">{formatFileSize(fp.file.size)}</span>
                                </div>
                            )}

                            {coverBadgeLabel && index === 0 && (
                                <span className="absolute bottom-1 left-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                                    {coverBadgeLabel}
                                </span>
                            )}

                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1">
                                <p className="truncate text-[9px] text-white/80">{fp.file.name}</p>
                            </div>
                        </div>
                    ))}

                    {/* Add more button */}
                    {multiple && files.length < maxFiles && !disabled && (
                        <label
                            className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 hover:border-amber-400 hover:bg-amber-50/50 dark:border-zinc-700 dark:hover:border-amber-500 dark:hover:bg-amber-950/20 transition-colors"
                        >
                            <ImagePlus className="h-5 w-5 text-zinc-400" />
                            <span className="mt-1 text-[10px] text-zinc-400">Añadir</span>
                            <input
                                type="file"
                                accept={accept}
                                multiple={multiple}
                                className="hidden"
                                onChange={handleInputChange}
                                disabled={disabled}
                            />
                        </label>
                    )}
                </div>
            )}

            {files.length === 0 && (
                <label
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-6 transition-colors ${
                        disabled
                            ? "border-zinc-200 bg-zinc-50 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900"
                            : "border-zinc-300 hover:border-amber-400 hover:bg-amber-50/50 dark:border-zinc-700 dark:hover:border-amber-500 dark:hover:bg-amber-950/20"
                    }`}
                >
                    <ImagePlus className="h-8 w-8 text-zinc-400" />
                    <span className="mt-2 text-xs text-zinc-500">
                        {disabled ? "Subiendo archivos..." : "Arrastra o haz clic para seleccionar"}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                        {accept === "*" ? "Cualquier tipo de archivo" : "JPG, PNG, WebP, PDF..."}
                    </span>
                    <input
                        type="file"
                        accept={accept}
                        multiple={multiple}
                        className="hidden"
                        onChange={handleInputChange}
                        disabled={disabled}
                    />
                </label>
            )}

            <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={handleInputChange} disabled={disabled} />
        </div>
    );
}
