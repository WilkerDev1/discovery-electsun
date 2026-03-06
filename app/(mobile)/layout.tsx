"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FolderKanban, Newspaper, BookOpen, UserCircle, Sun } from "lucide-react";

const bottomNavItems = [
    { label: "Proyectos", href: "/technician/dashboard", icon: FolderKanban },
    { label: "Feed", href: "/technician/feed", icon: Newspaper },
    { label: "Recursos", href: "/technician/resources", icon: BookOpen },
    { label: "Perfil", href: "/technician/profile", icon: UserCircle },
];

export default function MobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
            {/* Top Header */}
            <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                        <Sun className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        Discovery
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 dark:bg-emerald-500/10">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            En línea
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 py-4">{children}</main>

            {/* Bottom Navigation */}
            <nav className="sticky bottom-0 z-50 flex items-center justify-around border-t border-zinc-200 bg-white/80 pb-safe backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
                {bottomNavItems.map((item) => {
                    const isActive =
                        pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-0.5 px-3 py-2.5 text-[10px] font-medium transition-colors",
                                isActive
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "h-5 w-5",
                                    isActive && "text-amber-600 dark:text-amber-400"
                                )}
                            />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
