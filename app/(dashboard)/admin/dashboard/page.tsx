import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    FolderKanban,
    AlertTriangle,
    ImageIcon,
    TrendingUp,
    ArrowUpRight,
    Clock,
    CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig = {
    PENDING: { label: "Pendiente", variant: "outline" as const, className: "border-zinc-300 text-zinc-600" },
    IN_PROGRESS: { label: "En Progreso", variant: "default" as const, className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
    COMPLETED: { label: "Completado", variant: "default" as const, className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
    ARCHIVED: { label: "Archivado", variant: "secondary" as const, className: "bg-zinc-200 text-zinc-600" },
};

export default async function AdminDashboardPage() {
    const session = await auth();
    const userRole = session?.user?.role || "TECHNICIAN";
    const isAdmin = userRole === "ADMIN";
    const roleFilter = isAdmin ? {} : { allowedRoles: { has: userRole as any } };

    // 1. Fetch metrics
    const activeProjectsCount = await prisma.project.count({
        where: { status: "IN_PROGRESS", ...roleFilter }
    });

    // Projects in risk: estimated end within next 3 days and not completed
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const inRiskCount = await prisma.project.count({
        where: {
            status: { in: ["PENDING", "IN_PROGRESS"] },
            estimatedEnd: { lte: threeDaysFromNow },
            ...roleFilter,
        }
    });

    const pendingEvidencesCount = await prisma.evidence.count({
        where: { status: "PENDING" }
    });

    const avgCompletionResult = await prisma.project.aggregate({
        _avg: { completionPct: true },
        where: { status: { not: "ARCHIVED" }, ...roleFilter }
    });
    const avgCompletion = Math.round(avgCompletionResult._avg.completionPct || 0);

    const metricsData = [
        {
            title: "Proyectos Activos",
            value: activeProjectsCount.toString(),
            change: "En progreso actual",
            icon: FolderKanban,
            gradient: "from-blue-500 to-indigo-600",
            shadowColor: "shadow-blue-500/20",
        },
        {
            title: "En Riesgo",
            value: inRiskCount.toString(),
            change: "Vence en < 3 días",
            icon: AlertTriangle,
            gradient: "from-red-500 to-rose-600",
            shadowColor: "shadow-red-500/20",
        },
        {
            title: "Evidencias Pendientes",
            value: pendingEvidencesCount.toString(),
            change: "Esperando revisión",
            icon: ImageIcon,
            gradient: "from-amber-500 to-orange-600",
            shadowColor: "shadow-amber-500/20",
        },
        {
            title: "Completitud Promedio",
            value: `${avgCompletion}%`,
            change: "De proyectos no archivados",
            icon: TrendingUp,
            gradient: "from-emerald-500 to-green-600",
            shadowColor: "shadow-emerald-500/20",
        },
    ];

    // 2. Fetch recent projects (RBAC filtered)
    const recentProjects = await prisma.project.findMany({
        where: roleFilter,
        orderBy: { updatedAt: "desc" },
        take: 5,
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Resumen general de proyectos y evidencias de Electsun
                </p>
            </div>

            {/* Bento Grid — Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metricsData.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <Card
                            key={metric.title}
                            className="group relative overflow-hidden border-zinc-200 transition-all hover:shadow-lg dark:border-zinc-800"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-zinc-500">
                                            {metric.title}
                                        </p>
                                        <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                            {metric.value}
                                        </p>
                                        <p className="flex items-center gap-1 text-xs text-zinc-400">
                                            <ArrowUpRight className="h-3 w-3" />
                                            {metric.change}
                                        </p>
                                    </div>
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${metric.gradient} shadow-lg ${metric.shadowColor}`}
                                    >
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                            <div
                                className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${metric.gradient} opacity-0 transition-opacity group-hover:opacity-100`}
                            />
                        </Card>
                    );
                })}
            </div>

            {/* Recent Projects Table */}
            <Card className="border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg">Proyectos Recientes</CardTitle>
                    <CardDescription>
                        Últimos proyectos actualizados en la plataforma
                    </CardDescription>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-y border-zinc-200 text-left text-zinc-500 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                                <th className="py-3 px-4 font-medium">Proyecto</th>
                                <th className="py-3 px-4 font-medium">Cliente</th>
                                <th className="py-3 px-4 font-medium">Estado</th>
                                <th className="py-3 px-4 font-medium">Completitud</th>
                                <th className="py-3 px-4 font-medium">Fecha Límite</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {recentProjects.map((project) => {
                                const config = statusConfig[project.status];
                                const dueDate = project.estimatedEnd
                                    ? format(new Date(project.estimatedEnd), "dd MMM yyyy", { locale: es })
                                    : "Sin fecha";

                                return (
                                    <tr
                                        key={project.id}
                                        className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 group"
                                    >
                                        <td className="p-0">
                                            <Link href={`/admin/projects/${project.id}`} className="block py-4 px-4 font-medium text-zinc-900 dark:text-white hover:underline">
                                                {project.name}
                                            </Link>
                                        </td>
                                        <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400">
                                            {project.clientName}
                                        </td>
                                        <td className="py-4 px-4">
                                            <Badge
                                                variant={config.variant}
                                                className={config.className}
                                            >
                                                {config.label}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                                                        style={{ width: `${project.completionPct}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-zinc-500">
                                                    {project.completionPct}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1.5 text-zinc-500">
                                                {project.status === "COMPLETED" ? (
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                ) : (
                                                    <Clock className="h-3.5 w-3.5" />
                                                )}
                                                {dueDate}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {recentProjects.length === 0 && (
                        <div className="p-8 text-center text-sm text-zinc-500">No hay proyectos recientes.</div>
                    )}
                </div>
            </Card>
        </div>
    );
}
