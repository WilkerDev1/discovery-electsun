"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FolderKanban,
    FileTemplate,
    Users,
    Newspaper,
    BookOpen,
    Sun,
    ChevronLeft,
    LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const navItems = [
    {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Proyectos",
        href: "/admin/projects",
        icon: FolderKanban,
    },
    {
        label: "Plantillas",
        href: "/admin/templates",
        icon: FileTemplate,
    },
    {
        label: "Usuarios",
        href: "/admin/users",
        icon: Users,
    },
    {
        label: "Feed",
        href: "/admin/feed",
        icon: Newspaper,
    },
    {
        label: "Recursos",
        href: "/admin/resources",
        icon: BookOpen,
    },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "flex h-screen flex-col border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950",
                    collapsed ? "w-[68px]" : "w-[260px]"
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center gap-3 px-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
                        <Sun className="h-5 w-5 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                                Discovery
                            </span>
                            <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">
                                Electsun
                            </span>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;

                        const linkContent = (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
                                    collapsed && "justify-center px-2"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "h-5 w-5 shrink-0",
                                        isActive
                                            ? "text-amber-600 dark:text-amber-400"
                                            : "text-zinc-400"
                                    )}
                                />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );

                        if (collapsed) {
                            return (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={8}>
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return linkContent;
                    })}
                </nav>

                <Separator />

                {/* Footer */}
                <div className="flex items-center justify-between p-3">
                    {!collapsed && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Salir
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="ml-auto h-8 w-8 text-zinc-400 hover:text-zinc-600"
                    >
                        <ChevronLeft
                            className={cn(
                                "h-4 w-4 transition-transform",
                                collapsed && "rotate-180"
                            )}
                        />
                    </Button>
                </div>
            </aside>
        </TooltipProvider>
    );
}
