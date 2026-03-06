import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Pin,
    Plus,
    MessageSquare,
    ExternalLink,
    Megaphone,
    Zap,
    BookOpen,
} from "lucide-react";

const announcements = [
    {
        id: "1",
        title: "🎉 Bienvenidos a Discovery",
        body: "La nueva plataforma de gestión de evidencias de Electsun ya está en marcha. Técnicos: documenten sus instalaciones desde la app. Administradores: auditen las evidencias en tiempo real.",
        author: "Administrador Electsun",
        date: "Hace 2 horas",
        isPinned: true,
        type: "announcement" as const,
    },
    {
        id: "2",
        title: "📋 Nuevo protocolo de fotografías",
        body: "A partir de hoy, todas las instalaciones requieren una foto panorámica del techo ANTES de iniciar los trabajos. Esta evidencia es obligatoria para el reporte final del cliente.",
        author: "Administrador Electsun",
        date: "Hace 1 día",
        isPinned: false,
        type: "announcement" as const,
    },
    {
        id: "3",
        title: "⚡ Proyecto Hotel Caribeño completado",
        body: "El equipo completó exitosamente la instalación de 25kW en el Resort Caribeño. Felicitaciones a todos los técnicos involucrados.",
        author: "Administrador Electsun",
        date: "Hace 3 días",
        isPinned: false,
        type: "system" as const,
    },
];

const typeConfig = {
    announcement: {
        icon: Megaphone,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
    },
    system: {
        icon: Zap,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
    },
    resource: {
        icon: BookOpen,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
    },
};

export default function FeedPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Feed
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Anuncios institucionales y notificaciones del sistema
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Anuncio
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-zinc-100 dark:bg-zinc-800">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="announcements">Anuncios</TabsTrigger>
                    <TabsTrigger value="system">Sistema</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <div className="space-y-4">
                        {announcements.map((item) => {
                            const config = typeConfig[item.type];
                            const TypeIcon = config.icon;
                            return (
                                <Card
                                    key={item.id}
                                    className="border-zinc-200 transition-all hover:shadow-md dark:border-zinc-800"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex gap-4">
                                            {/* Icon */}
                                            <div
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bgColor}`}
                                            >
                                                <TypeIcon className={`h-5 w-5 ${config.color}`} />
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                                                            {item.title}
                                                        </h3>
                                                        {item.isPinned && (
                                                            <Pin className="h-3.5 w-3.5 text-amber-500" />
                                                        )}
                                                    </div>
                                                    <span className="shrink-0 text-xs text-zinc-400">
                                                        {item.date}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-zinc-600 leading-relaxed dark:text-zinc-400">
                                                    {item.body}
                                                </p>

                                                <div className="flex items-center gap-3 pt-1">
                                                    <span className="text-xs font-medium text-zinc-500">
                                                        {item.author}
                                                    </span>
                                                    <span className="text-zinc-200 dark:text-zinc-700">
                                                        •
                                                    </span>
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] px-2 py-0.5"
                                                    >
                                                        {item.type === "announcement"
                                                            ? "Anuncio"
                                                            : "Sistema"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="announcements" className="mt-6">
                    <div className="space-y-4">
                        {announcements
                            .filter((a) => a.type === "announcement")
                            .map((item) => {
                                const config = typeConfig[item.type];
                                const TypeIcon = config.icon;
                                return (
                                    <Card
                                        key={item.id}
                                        className="border-zinc-200 transition-all hover:shadow-md dark:border-zinc-800"
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex gap-4">
                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bgColor}`}
                                                >
                                                    <TypeIcon className={`h-5 w-5 ${config.color}`} />
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        {item.body}
                                                    </p>
                                                    <span className="text-xs text-zinc-400">
                                                        {item.author} · {item.date}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                    </div>
                </TabsContent>

                <TabsContent value="system" className="mt-6">
                    <div className="space-y-4">
                        {announcements
                            .filter((a) => a.type === "system")
                            .map((item) => {
                                const config = typeConfig[item.type];
                                const TypeIcon = config.icon;
                                return (
                                    <Card
                                        key={item.id}
                                        className="border-zinc-200 transition-all hover:shadow-md dark:border-zinc-800"
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex gap-4">
                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bgColor}`}
                                                >
                                                    <TypeIcon className={`h-5 w-5 ${config.color}`} />
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        {item.body}
                                                    </p>
                                                    <span className="text-xs text-zinc-400">
                                                        {item.author} · {item.date}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
