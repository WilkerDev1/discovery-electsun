"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Clock, XCircle, UserCircle2, Send, FileImage } from "lucide-react";
import { auditEvidence } from "@/lib/actions/audit";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { NewRequirementDialog } from "./new-requirement-dialog";
import { UploadEvidenceDialog } from "./upload-evidence-dialog";

export function RequirementAccordion({
    categories,
    projectId,
    currentUserId
}: {
    categories: any[];
    projectId: string;
    currentUserId: string;
}) {
    return (
        <Accordion type="multiple" className="w-full space-y-6">
            {categories.map((category) => (
                <div key={category.id} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            {category.name}
                        </h4>
                        <NewRequirementDialog projectId={projectId} categoryId={category.id} />
                    </div>
                    {category.requirements.length === 0 && (
                        <p className="text-sm text-zinc-500 py-2 italic text-center">Sin requisitos en esta categoría.</p>
                    )}
                    {category.requirements.map((req: any) => (
                        <RequirementItem
                            key={req.id}
                            req={req}
                            projectId={projectId}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            ))}
        </Accordion>
    );
}

function RequirementItem({ req, projectId, currentUserId }: { req: any, projectId: string, currentUserId: string }) {
    const hasEvidence = req.evidences && req.evidences.length > 0;
    const latestEvidence = hasEvidence ? req.evidences[0] : null;
    const isApproved = latestEvidence?.status === "APPROVED";
    const isRejected = latestEvidence?.status === "REJECTED";
    const isPending = latestEvidence?.status === "PENDING";

    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAudit = async (action: "APPROVE" | "REJECT") => {
        if (!latestEvidence) return;

        if (action === "REJECT" && !feedback.trim()) {
            toast.error("Feedback requerido", { description: "Por favor, explique por qué necesita arreglo." });
            return;
        }

        setIsSubmitting(true);
        const res = await auditEvidence(latestEvidence.id, action, feedback, currentUserId, projectId);
        setIsSubmitting(false);

        if (res.success) {
            toast.success(action === "APPROVE" ? "Evidencia aprobada" : "Evidencia rechazada");
            setFeedback("");
        } else {
            toast.error("Error", { description: res.error });
        }
    };

    return (
        <AccordionItem value={req.id} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg shadow-sm px-4 data-[state=open]:ring-2 data-[state=open]:ring-indigo-500/20 transition-all overflow-hidden mb-3">
            <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-1 items-center justify-between text-left pr-4">
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold leading-none text-zinc-900 dark:text-zinc-100">{req.name}</h4>
                        {req.description && <p className="text-xs text-zinc-500 line-clamp-1">{req.description}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                        {latestEvidence ? (
                            isApproved ? (
                                <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/10 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Aprobado
                                </Badge>
                            ) : isRejected ? (
                                <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50 dark:bg-red-900/10 dark:text-red-400">
                                    <XCircle className="w-3 h-3 mr-1" /> Necesita Arreglo
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-900/10 dark:text-amber-400">
                                    <Clock className="w-3 h-3 mr-1" /> Rev. Pendiente
                                </Badge>
                            )
                        ) : (
                            <Badge variant="outline" className="border-zinc-200 text-zinc-500 dark:border-zinc-800">
                                Sin evidencia
                            </Badge>
                        )}
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-4">
                    {latestEvidence ? (
                        <>
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Preview Area */}
                                <div className="w-full sm:w-48 h-32 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                    {latestEvidence.fileUrl ? (
                                        <img src={latestEvidence.fileUrl} alt="Evidence" className="w-full h-full object-cover" />
                                    ) : (
                                        <FileImage className="w-8 h-8 text-zinc-300" />
                                    )}
                                </div>

                                {/* Details & Actions */}
                                <div className="flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Subido por</p>
                                        <div className="flex items-center gap-2">
                                            <UserCircle2 className="w-4 h-4 text-zinc-400" />
                                            <span className="text-sm font-medium text-zinc-900 dark:text-white">{latestEvidence.uploadedBy?.name || "Desconocido"}</span>
                                        </div>
                                        <p className="text-xs text-zinc-400">
                                            {format(new Date(latestEvidence.createdAt), "PPP 'a las' p", { locale: es })}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    {isPending && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200"
                                                onClick={() => handleAudit("APPROVE")}
                                                disabled={isSubmitting}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar Completado
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                                onClick={() => handleAudit("REJECT")}
                                                disabled={isSubmitting}
                                            >
                                                <XCircle className="w-4 h-4 mr-2" /> Necesita Arreglo
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Feedback Input (Visible if interacting or after rejecting) */}
                            <div className="flex items-center gap-2 pt-2">
                                <Input
                                    placeholder="Añadir comentario o razón de rechazo..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="h-9 text-sm"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-between text-sm text-zinc-500 italic py-4">
                            <span>El técnico aún no ha subido evidencias para este requisito.</span>
                            <UploadEvidenceDialog projectId={projectId} requirementId={req.id} currentUserId={currentUserId} />
                        </div>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
