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

export async function getAllUsers() {
    await requireAdmin();
    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            _count: { select: { assignments: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function updateUserRole(userId: string, newRole: string) {
    try {
        const admin = await requireAdmin();
        if (admin.id === userId) {
            return { success: false, error: "No puedes cambiar tu propio rol." };
        }
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole as any },
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("[UPDATE USER ROLE ERROR]:", error?.message);
        return { success: false, error: error?.message || "Error actualizando rol" };
    }
}

export async function toggleUserActive(userId: string) {
    try {
        const admin = await requireAdmin();
        if (admin.id === userId) {
            return { success: false, error: "No puedes desactivarte a ti mismo." };
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, error: "Usuario no encontrado." };

        await prisma.user.update({
            where: { id: userId },
            data: { isActive: !user.isActive },
        });
        revalidatePath("/admin/users");
        return { success: true, isActive: !user.isActive };
    } catch (error: any) {
        console.error("[TOGGLE USER ACTIVE ERROR]:", error?.message);
        return { success: false, error: error?.message || "Error cambiando estado" };
    }
}

export async function deleteUser(userId: string) {
    try {
        const admin = await requireAdmin();
        if (admin.id === userId) {
            return { success: false, error: "No puedes eliminarte a ti mismo." };
        }
        await prisma.user.delete({ where: { id: userId } });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("[DELETE USER ERROR]:", error?.message);
        return { success: false, error: error?.message || "Error eliminando usuario" };
    }
}
