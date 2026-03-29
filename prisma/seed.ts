import "dotenv/config";
import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://postgres:password@localhost:5432/discovery";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const hashedPassword = await bcrypt.hash("Admin123!", 12);

    const admin = await prisma.user.upsert({
        where: { email: "admin@electsun.com" },
        update: {},
        create: {
            name: "Administrador Electsun",
            email: "admin@electsun.com",
            password: hashedPassword,
            role: "ADMIN",
            isActive: true,
        },
    });

    console.log("✅ Admin user seeded:", admin.email);

    // Create a sample technician
    const techPassword = await bcrypt.hash("Tecnico123!", 12);
    const technician = await prisma.user.upsert({
        where: { email: "tecnico@electsun.com" },
        update: {},
        create: {
            name: "Carlos Técnico",
            email: "tecnico@electsun.com",
            password: techPassword,
            role: "TECHNICIAN",
            isActive: true,
        },
    });

    console.log("✅ Technician user seeded:", technician.email);

    // Create a sample template with categories and requirements
    const template = await prisma.template.create({
        data: {
            name: "Instalación Residencial 5kW",
            description:
                "Plantilla estándar para instalaciones residenciales de 5kW con inversor y paneles solares.",
            categories: {
                create: [
                    {
                        name: "Documentación Previa",
                        order: 0,
                        allowedRoles: ["ADMIN", "TECHNICIAN"],
                        requirements: {
                            create: [
                                {
                                    name: "Foto Techo Antes",
                                    description: "Fotografía panorámica del techo antes de la instalación",
                                    type: "PHOTO",
                                    isMandatory: true,
                                    order: 1,
                                },
                                {
                                    name: "Foto Paneles Instalados",
                                    description: "Vista general de los paneles ya montados en el techo",
                                    type: "PHOTO",
                                    isMandatory: true,
                                    order: 2,
                                },
                            ],
                        },
                    },
                    {
                        name: "Equipos e Instalación",
                        order: 1,
                        allowedRoles: ["ADMIN", "TECHNICIAN"],
                        requirements: {
                            create: [
                                {
                                    name: "Foto Inversor",
                                    description: "Fotografía del inversor instalado y conectado",
                                    type: "PHOTO",
                                    isMandatory: true,
                                    order: 1,
                                },
                                {
                                    name: "Foto Medidor",
                                    description: "Lectura del medidor de energía bidireccional",
                                    type: "PHOTO",
                                    isMandatory: true,
                                    order: 2,
                                },
                            ],
                        },
                    },
                    {
                        name: "Datos Técnicos",
                        order: 2,
                        allowedRoles: ["ADMIN", "TECHNICIAN", "MANAGER"],
                        requirements: {
                            create: [
                                {
                                    name: "Potencia Instalada (kW)",
                                    description: "Valor numérico de la potencia total instalada",
                                    type: "NUMBER",
                                    isMandatory: true,
                                    order: 1,
                                },
                                {
                                    name: "Observaciones",
                                    description: "Notas adicionales del técnico sobre la instalación",
                                    type: "TEXT",
                                    isMandatory: false,
                                    order: 2,
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });

    console.log("✅ Template seeded:", template.name);

    // Create sample projects
    const projects = await Promise.all([
        prisma.project.create({
            data: {
                name: "Instalación Solar — Familia Rodríguez",
                clientName: "Juan Rodríguez",
                clientAddress: "Calle Las Palmas #42, Santo Domingo",
                clientPhone: "+1 (809) 555-0101",
                description: "Instalación residencial de 5kW con 12 paneles solares",
                status: "IN_PROGRESS",
                completionPct: 50,
                templateId: template.id,
                allowedRoles: ["ADMIN", "TECHNICIAN", "MANAGER"],
                estimatedStart: new Date("2026-03-01"),
                estimatedEnd: new Date("2026-03-15"),
                assignments: {
                    create: { userId: technician.id },
                },
            },
        }),
        prisma.project.create({
            data: {
                name: "Sistema Solar — Comercio Pérez",
                clientName: "María Pérez",
                clientAddress: "Av. Winston Churchill #156, Santiago",
                clientPhone: "+1 (809) 555-0202",
                description: "Instalación comercial de 10kW con 24 paneles",
                status: "PENDING",
                completionPct: 0,
                allowedRoles: ["ADMIN", "MANAGER"],
                estimatedStart: new Date("2026-03-20"),
                estimatedEnd: new Date("2026-04-05"),
            },
        }),
        prisma.project.create({
            data: {
                name: "Paneles Solares — Hotel Caribeño",
                clientName: "Resort Caribeño S.R.L.",
                clientAddress: "Playa Bávaro, Punta Cana",
                clientPhone: "+1 (809) 555-0303",
                description: "Instalación hotelera de 25kW",
                status: "COMPLETED",
                completionPct: 100,
                allowedRoles: ["ADMIN", "TECHNICIAN", "MANAGER", "ACCOUNTING"],
                completedAt: new Date("2026-02-28"),
                estimatedStart: new Date("2026-02-01"),
                estimatedEnd: new Date("2026-02-28"),
            },
        }),
        prisma.project.create({
            data: {
                name: "Instalación — Clínica Santa María",
                clientName: "Clínica Santa María",
                clientAddress: "Calle El Conde #88, Zona Colonial",
                description: "Sistema de 8kW para clínica médica",
                status: "ARCHIVED",
                completionPct: 100,
                allowedRoles: ["ADMIN"],
                completedAt: new Date("2026-01-15"),
                estimatedStart: new Date("2025-12-01"),
                estimatedEnd: new Date("2026-01-15"),
            },
        }),
    ]);

    console.log(`✅ ${projects.length} projects seeded`);

    // Create sample announcements
    await prisma.announcement.createMany({
        data: [
            {
                title: "🎉 Bienvenidos a Discovery",
                body: "La nueva plataforma de gestión de evidencias de Electsun ya está en marcha. Técnicos: documenten sus instalaciones desde la app. Administradores: auditen las evidencias en tiempo real.",
                authorId: admin.id,
                isPinned: true,
            },
            {
                title: "📋 Nuevo protocolo de fotografías",
                body: "A partir de hoy, todas las instalaciones requieren una foto panorámica del techo ANTES de iniciar los trabajos. Esta evidencia es obligatoria para el reporte final del cliente.",
                authorId: admin.id,
            },
            {
                title: "⚡ Proyecto Hotel Caribeño completado",
                body: "El equipo completó exitosamente la instalación de 25kW en el Resort Caribeño. Felicitaciones a todos los técnicos involucrados.",
                authorId: admin.id,
            },
        ],
    });

    console.log("✅ Announcements seeded");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Seed error:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
