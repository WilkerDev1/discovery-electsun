"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function auditEvidence(
    evidenceId: string,
    action: "APPROVE" | "REJECT",
    feedback: string,
    authorId: string,
    projectId: string
) {
    try {
        await prisma.$transaction(async (tx: any) => {
            // Update the evidence status
            const status = action === "APPROVE" ? "APPROVED" : "REJECTED";
            await tx.evidence.update({
                where: { id: evidenceId },
                data: {
                    status,
                    approvedAt: action === "APPROVE" ? new Date() : null,
                    rejectedAt: action === "REJECT" ? new Date() : null,
                }
            });

            // Create a feedback comment linked to the evidence
            if (feedback.trim()) {
                await tx.comment.create({
                    data: {
                        body: feedback.trim(),
                        authorId,
                        projectId, // also link to project for the mini-chat context
                        evidenceId,
                    }
                });
            }
        });

        revalidatePath(`/admin/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("[ACTION ERROR - auditEvidence]:", error);
        return { success: false, error: "Error al auditar la evidencia" };
    }
}
