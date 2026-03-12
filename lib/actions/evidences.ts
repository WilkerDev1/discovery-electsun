"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/minio";

export async function uploadEvidenceAdmin(formData: FormData) {
    try {
        const projectId = formData.get("projectId") as string;
        const requirementId = formData.get("requirementId") as string;
        const authorId = formData.get("authorId") as string;
        const file = formData.get("file") as File | null;

        if (!projectId || !authorId || !requirementId || !file || file.size === 0) {
            return { success: false, error: "Faltan datos requeridos o archivo vacío." };
        }

        let fileUrl: string;
        let fileType: string;
        let fileKey: string;

        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const ext = file.name.split('.').pop() || 'tmp';
            fileKey = `evidences/${projectId}/${requirementId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            const bucket = process.env.MINIO_BUCKET_RESOURCES || "discovery-resources";
            
            await uploadFile(bucket, fileKey, buffer, file.type);
            fileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucket}/${fileKey}`;
            fileType = file.type;
        } catch (minioError) {
            console.error("[MINIO UPLOAD ERROR EVIDENCES]: ", minioError);
            return { success: false, error: "Error subiendo archivo al almacenamiento." };
        }

        const evidence = await prisma.evidence.create({
            data: {
                requirementId,
                fileUrl,
                fileKey,
                fileName: file.name,
                fileSizeBytes: file.size,
                mimeType: fileType,
                status: "APPROVED", // Auto-approved since an Admin is uploading it.
                uploadedById: authorId,
                approvedAt: new Date(),
            }
        });

        revalidatePath(`/admin/projects/${projectId}`);
        return { success: true, evidence };
    } catch (error) {
        console.error("Error creating admin evidence:", error);
        return { success: false, error: "Error al crear la evidencia" };
    }
}
