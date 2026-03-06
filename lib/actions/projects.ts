"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
        await prisma.project.create({
            data: {
                name: parsed.data.name,
                clientName: parsed.data.clientName,
                clientAddress: parsed.data.clientAddress,
                estimatedEnd: parsed.data.estimatedEnd ? new Date(parsed.data.estimatedEnd) : null,
                status: "PENDING",
                completionPct: 0,
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
