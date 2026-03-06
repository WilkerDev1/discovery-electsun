"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createAnnouncementSchema = z.object({
    title: z.string().min(1, "El título es requerido"),
    body: z.string().min(1, "El contenido es requerido"),
    isPinned: z.string().optional(), // from checkbox
});

export async function createAnnouncement(formData: FormData, authorId: string) {
    const data = Object.fromEntries(formData.entries());

    const parsed = createAnnouncementSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.flatten().fieldErrors };
    }

    try {
        await prisma.announcement.create({
            data: {
                title: parsed.data.title,
                body: parsed.data.body,
                isPinned: parsed.data.isPinned === "on",
                authorId: authorId,
            }
        });

        revalidatePath("/admin/feed");
        return { success: true };
    } catch (error) {
        console.error("Error creating announcement:", error);
        return { success: false, error: "Error interno del servidor" };
    }
}
