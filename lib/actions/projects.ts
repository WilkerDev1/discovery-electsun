"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { uploadFile, getFileProxyUrl } from "@/lib/minio";
import type { Role, RequirementType } from "@prisma/client";

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
        // Parse allowed roles
        let allowedRoles: Role[] = ["ADMIN"];
        try {
            const rolesRaw = formData.get("allowedRoles") as string;
            if (rolesRaw) allowedRoles = JSON.parse(rolesRaw) as Role[];
        } catch {
            // Fallback to default
        }

        // Handle cover file upload
        let coverUrl: string | undefined = undefined;
        const file = formData.get("coverFile") as File;

        if (file && file.size > 0) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                const ext = file.name.split('.').pop() || 'jpg';
                const key = `covers/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
                const bucket = process.env.MINIO_BUCKET_RESOURCES || "discovery-resources";

                await uploadFile(bucket, key, buffer, file.type);
                coverUrl = getFileProxyUrl(bucket, key);
            } catch (error) {
                console.error("[PROJECT CREATION ERROR]:", error);
                return { success: false, error: "Error subiendo la imagen de portada al servidor." };
            }
        }

        // Check if using a template
        const templateId = formData.get("templateId") as string;
        const validTemplateId = templateId && templateId !== "none" ? templateId : null;

        // Use a transaction to handle the template cloning
        await prisma.$transaction(async (tx) => {
            // 1. Create the project first
            const project = await tx.project.create({
                data: {
                    name: parsed.data.name,
                    clientName: parsed.data.clientName,
                    clientAddress: parsed.data.clientAddress,
                    estimatedEnd: parsed.data.estimatedEnd ? new Date(parsed.data.estimatedEnd) : null,
                    status: "PENDING",
                    completionPct: 0,
                    coverUrl,
                    templateId: validTemplateId,
                    allowedRoles,
                },
            });

            // 2. If template, clone its categories and requirements
            if (validTemplateId) {
                const template = await tx.template.findUnique({
                    where: { id: validTemplateId },
                    include: {
                        categories: {
                            include: { requirements: true },
                            orderBy: { order: "asc" },
                        },
                    },
                });

                if (template) {
                    for (const cat of template.categories) {
                        const newCat = await tx.projectCategory.create({
                            data: {
                                projectId: project.id,
                                name: cat.name,
                                order: cat.order,
                                allowedRoles: cat.allowedRoles,
                            },
                        });

                        if (cat.requirements.length > 0) {
                            await tx.requirement.createMany({
                                data: cat.requirements.map((req) => ({
                                    projectId: project.id,
                                    categoryId: newCat.id,
                                    name: req.name,
                                    description: req.description,
                                    type: req.type,
                                    isMandatory: req.isMandatory,
                                    order: req.order,
                                })),
                            });
                        }
                    }
                }
            }
        });

        revalidatePath("/admin/projects");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("[PROJECT CREATION ERROR]:", error);
        return { success: false, error: "Error interno del servidor" };
    }
}

export async function updateProjectStatus(projectId: string, newStatus: string) {
    try {
        await prisma.project.update({
            where: { id: projectId },
            data: { status: newStatus as any },
        });
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (e) {
        console.error("[PROJECT STATUS ERROR]:", e);
        return { success: false, error: "Error actualizando estado" };
    }
}

export async function deleteProject(projectId: string) {
    try {
        await prisma.project.delete({
            where: { id: projectId },
        });
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (e) {
        console.error("[PROJECT DELETE ERROR]:", e);
        return { success: false, error: "Error eliminando el proyecto" };
    }
}
