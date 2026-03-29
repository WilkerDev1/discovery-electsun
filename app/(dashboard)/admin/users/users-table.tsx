"use client";

import { useState } from "react";
import { updateUserRole, toggleUserActive, deleteUser } from "@/lib/actions/users";
import { toast } from "sonner";
import { Shield, ShieldCheck, ShieldAlert, Briefcase, Scale, Calculator, Trash2, Loader2 } from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Shield; color: string }> = {
    ADMIN: { label: "Administrador", icon: ShieldAlert, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    TECHNICIAN: { label: "Técnico", icon: ShieldCheck, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    MANAGER: { label: "Gerente", icon: Briefcase, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    LEGAL: { label: "Legal", icon: Scale, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    ACCOUNTING: { label: "Contabilidad", icon: Calculator, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

type UserRow = {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    _count: { assignments: number };
};

export function UsersTable({ initialUsers }: { initialUsers: UserRow[] }) {
    const [loadingRoleId, setLoadingRoleId] = useState<string | null>(null);
    const [loadingToggleId, setLoadingToggleId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    async function handleRoleChange(userId: string, newRole: string) {
        setLoadingRoleId(userId);
        const result = await updateUserRole(userId, newRole);
        setLoadingRoleId(null);
        if (result.success) {
            toast.success("Rol actualizado correctamente.");
        } else {
            toast.error("Error", { description: result.error });
        }
    }

    async function handleToggleActive(userId: string) {
        setLoadingToggleId(userId);
        const result = await toggleUserActive(userId);
        setLoadingToggleId(null);
        if (result.success) {
            toast.success(result.isActive ? "Usuario activado." : "Usuario desactivado.");
        } else {
            toast.error("Error", { description: result.error });
        }
    }

    async function handleDelete(userId: string) {
        setDeletingId(userId);
        const result = await deleteUser(userId);
        setDeletingId(null);
        if (result.success) {
            toast.success("Usuario eliminado.");
        } else {
            toast.error("Error", { description: result.error });
        }
    }

    return (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-zinc-50 dark:bg-zinc-900">
                        <TableHead className="font-semibold">Usuario</TableHead>
                        <TableHead className="font-semibold">Rol</TableHead>
                        <TableHead className="font-semibold text-center">Proyectos</TableHead>
                        <TableHead className="font-semibold text-center">Estado</TableHead>
                        <TableHead className="font-semibold text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialUsers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-10 text-zinc-400">
                                No hay usuarios registrados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        initialUsers.map((user) => {
                            const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.TECHNICIAN;
                            const RoleIcon = roleConfig.icon;

                            return (
                                <TableRow key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-zinc-900 dark:text-white">{user.name}</span>
                                            <span className="text-xs text-zinc-500">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={user.role}
                                            onValueChange={(val) => handleRoleChange(user.id, val)}
                                            disabled={loadingRoleId === user.id}
                                        >
                                            <SelectTrigger className="w-[160px] h-8 text-xs">
                                                {loadingRoleId === user.id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <SelectValue />
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                                                    <SelectItem key={key} value={key}>
                                                        <div className="flex items-center gap-2">
                                                            <config.icon className="h-3.5 w-3.5" />
                                                            {config.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="text-xs">{user._count.assignments}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <button
                                            onClick={() => handleToggleActive(user.id)}
                                            disabled={loadingToggleId === user.id}
                                            className="inline-flex items-center"
                                        >
                                            {loadingToggleId === user.id ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <Badge className={user.isActive
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 cursor-pointer"
                                                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 cursor-pointer"
                                                }>
                                                    {user.isActive ? "Activo" : "Inactivo"}
                                                </Badge>
                                            )}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-400 hover:text-red-600"
                                                    disabled={deletingId === user.id}
                                                >
                                                    {deletingId === user.id
                                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                                        : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción eliminará permanentemente a <strong>{user.name}</strong> ({user.email}).
                                                        Esta acción no se puede deshacer.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(user.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Eliminar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
