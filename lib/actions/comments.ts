"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProjectComment(projectId: string, authorId: string, body: string) {
    try {
        await prisma.comment.create({
            data: {
                projectId,
                authorId,
                body,
            }
        });

        revalidatePath(`/admin/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Error creating comment:", error);
        return { success: false, error: "Error al enviar el mensaje" };
    }
}
