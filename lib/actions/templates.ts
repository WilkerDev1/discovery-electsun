"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        throw new Error("UNAUTHORIZED");
    }
    return session.user;
}

export async function getAllTemplates() {
    await requireAdmin();
    return prisma.template.findMany({
        include: {
            categories: {
                include: {
                    _count: { select: { requirements: true } },
                },
                orderBy: { order: "asc" },
            },
        },
        orderBy: { updatedAt: "desc" },
    });
}

export async function createTemplate(formData: FormData) {
    try {
        await requireAdmin();
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;

        if (!name?.trim()) {
            return { success: false, error: "El nombre es requerido." };
        }

        const template = await prisma.template.create({
            data: { name, description: description || null },
        });

        revalidatePath("/admin/templates");
        return { success: true, template };
    } catch (error: any) {
        console.error("[CREATE TEMPLATE ERROR]:", error?.message);
        return { success: false, error: error?.message || "Error creando plantilla" };
    }
}

export async function cloneTemplateFromProject(projectId: string, templateName: string) {
    try {
        await requireAdmin();

        if (!templateName?.trim()) {
            return { success: false, error: "El nombre de la plantilla es requerido." };
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                categories: {
                    include: { requirements: true },
                    orderBy: { order: "asc" },
                },
            },
        });

        if (!project) {
            return { success: false, error: "Proyecto no encontrado." };
        }

        const template = await prisma.template.create({
            data: {
                name: templateName,
                description: `Clonada del proyecto: ${project.name}`,
                categories: {
                    create: project.categories.map((cat) => ({
                        name: cat.name,
                        order: cat.order,
                        allowedRoles: cat.allowedRoles,
                        requirements: {
                            create: cat.requirements.map((req) => ({
                                name: req.name,
                                description: req.description,
                                type: req.type,
                                isMandatory: req.isMandatory,
                                order: req.order,
                            })),
                        },
                    })),
                },
            },
        });

        revalidatePath("/admin/templates");
        return { success: true, template };
    } catch (error: any) {
        console.error("[CLONE TEMPLATE ERROR]:", error?.message);
        return { success: false, error: error?.message || "Error clonando plantilla" };
    }
}

export async function deleteTemplate(id: string) {
    try {
        await requireAdmin();
        await prisma.template.delete({ where: { id } });
        revalidatePath("/admin/templates");
        return { success: true };
    } catch (error: any) {
        console.error("[DELETE TEMPLATE ERROR]:", error?.message);
        return { success: false, error: error?.message || "Error eliminando plantilla" };
    }
}

export async function getProjectsForCloning() {
    await requireAdmin();
    return prisma.project.findMany({
        select: {
            id: true,
            name: true,
            clientName: true,
            status: true,
            _count: { select: { categories: true, requirements: true } },
        },
        orderBy: { updatedAt: "desc" },
    });
}
