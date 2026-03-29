import { getAllUsers } from "@/lib/actions/users";
import { UsersTable } from "./users-table";

export default async function UsersPage() {
    const users = await getAllUsers();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Gestión de Usuarios
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Administra roles, permisos y accesos del equipo.
                </p>
            </div>
            <UsersTable initialUsers={users} />
        </div>
    );
}
