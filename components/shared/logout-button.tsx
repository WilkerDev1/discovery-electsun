"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton({ collapsed }: { collapsed?: boolean }) {
    return (
        <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className="text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
            onClick={() => signOut({ callbackUrl: "/login" })}
        >
            <LogOut className={collapsed ? "h-4 w-4" : "mr-2 h-4 w-4"} />
            {!collapsed && "Salir"}
        </Button>
    );
}
