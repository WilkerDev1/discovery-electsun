"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/minio";

export async function createProjectComment(formData: FormData) {
    try {
        const projectId = formData.get("projectId") as string;
        const authorId = formData.get("authorId") as string;
        const body = formData.get("body") as string || "";
        const file = formData.get("file") as File | null;

        if (!projectId || !authorId) return { success: false, error: "Datos incompletos" };
        if (!body.trim() && (!file || file.size === 0)) return { success: false, error: "Mensaje vacío" };

        let fileUrl: string | undefined = undefined;
        let fileType: string | undefined = undefined;

        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const ext = file.name.split('.').pop() || 'tmp';
            const key = `chat/${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            const bucket = process.env.MINIO_BUCKET_RESOURCES || "discovery-resources";

            await uploadFile(bucket, key, buffer, file.type);
            fileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucket}/${key}`;
            fileType = file.type;
        }

        await prisma.comment.create({
            data: {
                projectId,
                authorId,
                body,
                fileUrl,
                fileType,
            }
        });

        revalidatePath(`/admin/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Error creating comment:", error);
        return { success: false, error: "Error al enviar el mensaje" };
    }
}
