import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ChevronRight,
    MapPin,
    Calendar,
    Camera,
} from "lucide-react";

const assignedProjects = [
    {
        id: "p1",
        name: "Instalación Solar — Familia Rodríguez",
        clientAddress: "Calle Las Palmas #42, Santo Domingo",
        status: "IN_PROGRESS" as const,
        completionPct: 50,
        pendingPhotos: 2,
        dueDate: "15 Mar 2026",
    },
];

const statusLabel = {
    IN_PROGRESS: "En Progreso",
    PENDING: "Pendiente",
    COMPLETED: "Completado",
};

export default function TechnicianDashboardPage() {
    return (
        <div className="space-y-6">
            {/* Greeting */}
            <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Hola, Carlos 👋
                </h1>
                <p className="text-sm text-zinc-500">
                    Tienes{" "}
                    <span className="font-semibold text-amber-600">
                        {assignedProjects.length} proyecto
                    </span>{" "}
                    asignado
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardContent className="flex flex-col items-center p-4 text-center">
                        <Camera className="mb-1 h-6 w-6 text-amber-500" />
                        <span className="text-xl font-bold text-zinc-900 dark:text-white">
                            2
                        </span>
                        <span className="text-[11px] text-zinc-500">Fotos pendientes</span>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardContent className="flex flex-col items-center p-4 text-center">
                        <Calendar className="mb-1 h-6 w-6 text-blue-500" />
                        <span className="text-xl font-bold text-zinc-900 dark:text-white">
                            50%
                        </span>
                        <span className="text-[11px] text-zinc-500">Completitud</span>
                    </CardContent>
                </Card>
            </div>

            {/* Assigned Projects List */}
            <div className="space-y-3">
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Mis Proyectos Asignados
                </h2>
                {assignedProjects.map((project) => (
                    <Card
                        key={project.id}
                        className="cursor-pointer border-zinc-200 transition-all active:scale-[0.98] hover:shadow-md dark:border-zinc-800"
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-blue-100 text-blue-700 text-[10px] hover:bg-blue-100">
                                            {statusLabel[project.status]}
                                        </Badge>
                                        {project.pendingPhotos > 0 && (
                                            <Badge
                                                variant="outline"
                                                className="border-amber-300 text-amber-600 text-[10px]"
                                            >
                                                {project.pendingPhotos} fotos
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                                        {project.name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                                        <MapPin className="h-3 w-3" />
                                        {project.clientAddress}
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] text-zinc-400">
                                            <span>Progreso</span>
                                            <span>{project.completionPct}%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                                                style={{ width: `${project.completionPct}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-zinc-300" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
