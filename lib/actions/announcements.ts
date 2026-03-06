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
        // Extract hashtags from the body safely
        const hashtagRegex = /#(\w+)/g;
        const matchedTags = [...parsed.data.body.matchAll(hashtagRegex)].map(m => m[1]);
        const tags = Array.from(new Set(matchedTags)); // Deduplicate

        await prisma.announcement.create({
            data: {
                title: parsed.data.title,
                body: parsed.data.body,
                isPinned: parsed.data.isPinned === "on",
                authorId: authorId,
                tags: tags,
            }
        });

        revalidatePath("/admin/feed");
        return { success: true };
    } catch (error) {
        console.error("[ACTION ERROR - createAnnouncement]:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error interno del servidor" };
    }
}
