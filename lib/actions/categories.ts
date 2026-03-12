"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProjectCategory(projectId: string, name: string) {
    try {
        const lastOrder = await prisma.projectCategory.findFirst({
            where: { projectId },
            orderBy: { order: "desc" },
            select: { order: true },
        });

        const nextOrder = (lastOrder?.order ?? -1) + 1;

        const category = await prisma.projectCategory.create({
            data: {
                projectId,
                name,
                order: nextOrder,
            }
        });

        revalidatePath(`/admin/projects/${projectId}`);
        return { success: true, category };
    } catch (error) {
        console.error("Error creating category:", error);
        return { success: false, error: "Error al crear la categoría" };
    }
}
