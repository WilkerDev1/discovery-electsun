import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Pin,
    Megaphone,
    Zap,
    BookOpen,
    Briefcase,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { NewAnnouncementDialog } from "./new-announcement-dialog";

type FeedItem = {
    id: string;
    title: string;
    body: string;
    author: string;
    date: string;
    createdAt: Date;
    isPinned: boolean;
    type: "announcement" | "system" | "resource" | "project";
    tags?: string[];
    projectId?: string;
    coverUrl?: string | null;
};

const typeConfig: Record<string, { icon: any, color: string, bgColor: string }> = {
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
    project: {
        icon: Briefcase,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
    }
};

export default async function FeedPage() {
    const session = await auth();
    const authorId = session?.user?.id || "";

    const dbAnnouncements = await prisma.announcement.findMany({
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        include: { author: true }
    });

    const dbProjects = await prisma.project.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" }
    });

    // Map Prisma models to the format expected by the UI
    const mappedAnnouncements: FeedItem[] = dbAnnouncements.map((a: any) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        author: a.author.name || "Usuario Desconocido",
        date: formatDistanceToNow(new Date(a.createdAt), { addSuffix: true, locale: es }),
        createdAt: new Date(a.createdAt),
        isPinned: a.isPinned,
        type: "announcement",
        tags: a.tags || [],
    }));

    const mappedProjects: FeedItem[] = dbProjects.map((p: any) => ({
        id: `proj-${p.id}`,
        title: p.name,
        body: p.description || "Nuevo proyecto pendiente de configuración.",
        author: p.clientName,
        date: formatDistanceToNow(new Date(p.createdAt), { addSuffix: true, locale: es }),
        createdAt: new Date(p.createdAt),
        isPinned: false,
        type: "project",
        projectId: p.id,
        coverUrl: p.coverUrl,
    }));

    const feedItems = [...mappedAnnouncements, ...mappedProjects].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
    });

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
                <NewAnnouncementDialog authorId={authorId} />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-zinc-100 dark:bg-zinc-800">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="announcements">Anuncios</TabsTrigger>
                    <TabsTrigger value="system">Sistema</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <div className="space-y-6">
                        {feedItems.map((item: FeedItem) => {
                            const config = typeConfig[item.type];
                            const TypeIcon = config.icon;

                            if (item.type === "project") {
                                return (
                                    <Card
                                        key={item.id}
                                        className="overflow-hidden border-zinc-200 transition-all hover:shadow-md dark:border-zinc-800"
                                    >
                                        {/* Placeholder Cover */}
                                        <div className="h-32 w-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 flex flex-col items-center justify-center p-6 relative">
                                            {item.coverUrl ? (
                                                <img src={item.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <Briefcase className="h-12 w-12 text-purple-400 opacity-50 mb-2" />
                                            )}
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="flex gap-4">
                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bgColor}`}>
                                                    <TypeIcon className={`h-5 w-5 ${config.color}`} />
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                                                            Nuevo Proyecto: {item.title}
                                                        </h3>
                                                        <span className="shrink-0 text-xs text-zinc-400">{item.date}</span>
                                                    </div>
                                                    <p className="text-sm text-zinc-600 leading-relaxed dark:text-zinc-400">
                                                        {item.body}
                                                    </p>
                                                    <div className="flex items-center justify-between pt-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-medium text-zinc-500">
                                                                Cliente: {item.author}
                                                            </span>
                                                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                                Pte. Asignación
                                                            </Badge>
                                                        </div>
                                                        <Link href={`/admin/projects/${item.projectId}`}>
                                                            <div className="text-xs flex items-center font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline">
                                                                Ir al Proyecto <ExternalLink className="ml-1 h-3 w-3" />
                                                            </div>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            }

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

                                                {/* Tags */}
                                                {item.tags && item.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 pt-1 border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-2">
                                                        {item.tags.map((tag) => (
                                                            <Badge key={tag} variant="outline" className="text-[10px] text-blue-600 border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800/50">
                                                                #{tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

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
                        {feedItems.length === 0 && (
                            <div className="p-8 text-center text-sm text-zinc-500">No hay contenido en el feed.</div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="announcements" className="mt-6">
                    <div className="space-y-6">
                        {feedItems
                            .filter((a: any) => a.type === "announcement")
                            .map((item: any) => {
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
                                                    {item.tags && item.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 pt-1 mt-1 mb-1">
                                                            {item.tags.map((tag: string) => (
                                                                <Badge key={tag} variant="outline" className="text-[10px] text-blue-600 border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800/50">
                                                                    #{tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
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
                    <div className="space-y-6">
                        {feedItems
                            .filter((a: any) => a.type === "system")
                            .map((item: any) => {
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
                                                    {item.tags && item.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 pt-1 mt-1 mb-1">
                                                            {item.tags.map((tag: string) => (
                                                                <Badge key={tag} variant="outline" className="text-[10px] text-blue-600 border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800/50">
                                                                    #{tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
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
