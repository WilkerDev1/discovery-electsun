"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Sun, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Credenciales incorrectas. Verifica tu email y contraseña.");
                return;
            }

            router.push("/admin/dashboard");
            router.refresh();
        } catch {
            setError("Error interno del servidor. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="border-zinc-700 bg-zinc-900/80 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
                    <Sun className="h-8 w-8 text-white" />
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold text-white">
                        Discovery
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Electsun — Gestión de Evidencias
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-zinc-300">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@electsun.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-zinc-300">
                            Contraseña
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </Button>
                    <p className="text-center text-xs text-zinc-500">
                        Credenciales de prueba: admin@electsun.com / Admin123!
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}
