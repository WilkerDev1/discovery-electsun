import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email("Ingresa un email válido"),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const RegisterSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Ingresa un email válido"),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres"),
    role: z.enum(["ADMIN", "TECHNICIAN"]).default("TECHNICIAN"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
