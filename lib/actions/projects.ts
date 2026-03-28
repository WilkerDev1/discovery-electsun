"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { uploadFile } from "@/lib/minio";

const createProjectSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    clientName: z.string().min(1, "El cliente es requerido"),
    clientAddress: z.string().min(1, "La dirección es requerida"),
    estimatedEnd: z.string().optional(),
});

export async function createProject(formData: FormData) {
    const data = Object.fromEntries(formData.entries());

    const parsed = createProjectSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.flatten().fieldErrors };
    }

    try {
        let coverUrl: string | undefined = undefined;
        const file = formData.get("coverFile") as File;

        if (file && file.size > 0) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                const ext = file.name.split('.').pop() || 'jpg';
                const key = `covers/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
                const bucket = process.env.MINIO_BUCKET_RESOURCES || "discovery-resources";

                await uploadFile(bucket, key, buffer, file.type);
                coverUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucket}/${key}`;
            } catch (error) {
                console.error("[PROJECT CREATION ERROR]:", error);
                return { success: false, error: "Error subiendo la imagen de portada al servidor." };
            }
        }

        await prisma.project.create({
            data: {
                name: parsed.data.name,
                clientName: parsed.data.clientName,
                clientAddress: parsed.data.clientAddress,
                estimatedEnd: parsed.data.estimatedEnd ? new Date(parsed.data.estimatedEnd) : null,
                status: "PENDING",
                completionPct: 0,
                coverUrl: coverUrl,
            }
        });

        revalidatePath("/admin/projects");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error creating project:", error);
        return { success: false, error: "Error interno del servidor" };
    }
}

export async function updateProjectStatus(projectId: string, newStatus: any) {
    try {
        await prisma.project.update({
            where: { id: projectId },
            data: { status: newStatus }
        });
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (e) {
        console.error("Failed to update status", e);
        return { success: false, error: "Error actualizando estado" };
    }
}

export async function deleteProject(projectId: string) {
    try {
        await prisma.project.delete({
            where: { id: projectId }
        });
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (e) {
        console.error("Failed to delete project", e);
        return { success: false, error: "Error eliminando el proyecto" };
    }
}
