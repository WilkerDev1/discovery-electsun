"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProjectRequirement(projectId: string, data: { name: string, description?: string, category?: string }) {
    try {
        const lastOrder = await prisma.requirement.findFirst({
            where: { projectId },
            orderBy: { order: "desc" },
            select: { order: true },
        });

        const nextOrder = (lastOrder?.order ?? -1) + 1;

        await prisma.requirement.create({
            data: {
                projectId,
                name: data.name,
                description: data.description || null,
                category: data.category || "General",
                order: nextOrder,
            }
        });

        revalidatePath(`/admin/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Error creating requirement:", error);
        return { success: false, error: "Error al crear el requisito" };
    }
}
