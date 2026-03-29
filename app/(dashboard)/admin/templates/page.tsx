import { getAllTemplates } from "@/lib/actions/templates";
import { TemplateCards } from "./template-cards";

export default async function TemplatesPage() {
    const templates = await getAllTemplates();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Motor de Plantillas
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Crea y gestiona plantillas reutilizables para proyectos.
                    </p>
                </div>
            </div>
            <TemplateCards initialTemplates={templates} />
        </div>
    );
}
