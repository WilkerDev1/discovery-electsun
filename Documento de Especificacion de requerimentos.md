E L E C T S U N
Instalación de Paneles Solares
DISCOVERY
Plataforma de Gestión de Evidencias y Proyectos
Especificación de Requisitos de Software (SRS)
Versión 2.0 — Edición Completa

Empresa Electsun S.R.L.

Proyecto Discovery PWA

Versión 2.

Estado Aprobado para Desarrollo

Fecha 2025

Clasificación Confidencial — Uso Interno
Tabla de Contenidos
1. Visión General del Proyecto
"Discovery" es una Aplicación Web Progresiva (PWA) diseñada para Electsun S.R.L., empresa
dedicada a la instalación de paneles solares en la República Dominicana. Su propósito es eliminar
por completo la recopilación manual de evidencias fotográficas durante el proceso de instalación,
reemplazando el flujo de trabajo basado en WhatsApp y hojas de cálculo por una plataforma
centralizada, auditable y offline-first.
1.1 Problemática que Resuelve
Actualmente, los técnicos de campo documentan cada instalación mediante fotografías enviadas
por mensajería instantánea. Este proceso carece de trazabilidad, genera pérdida de evidencias,
imposibilita la auditoría en tiempo real y dificulta la generación de reportes finales profesionales.
Discovery resuelve cada uno de estos puntos de dolor de forma sistemática.
1.2 Propuesta de Valor

    Técnicos en campo: Pueden documentar instalaciones incluso sin conexión a internet. Las

evidencias se sincronizan automáticamente al recuperar la señal.

    Administradores: Acceden a un dashboard en tiempo real para auditar evidencias, dejar

comentarios y aprobar o rechazar fotografías sin depender de terceros.

    Clientes finales de Electsun: Reciben un reporte PDF profesional con todas las evidencias

de su instalación organizado por categoría.
1.3 Alcance del Sistema
El sistema abarca cinco dominios funcionales principales: gestión de proyectos y plantillas,
recopilación de evidencias por técnicos, auditoría y comentarios por administradores, generación
de reportes PDF y una base de conocimiento institucional con feed de noticias. Todo el
procesamiento y almacenamiento de datos ocurre en infraestructura local propiedad de Electsun
(soberanía total de datos).
1.4 Definiciones y Acrónimos

Término Definición

SRS Software Requirements Specification — este documento

PWA Progressive Web Application — app web instalable con capacidades nativas

RBAC Role-Based Access Control — control de acceso por roles

ORM Object-Relational Mapping — capa de abstracción sobre la base de datos

S3 Simple Storage Service — protocolo estándar de almacenamiento de objetos

IndexedDB Base de datos integrada en el navegador para persistencia offline

JWT JSON Web Token — token de autenticación sin estado

Término Definición

Admin Usuario con rol de Administrador en el sistema

Técnico Usuario con rol de Técnico de campo

Evidencia Fotografía o archivo subido por un técnico para satisfacer un requisito

Plantilla Conjunto predefinido de requisitos reutilizable para proyectos similares

REQ Prefijo para identificar un requisito funcional individual
2. Stack Tecnológico Aprobado
El stack fue seleccionado para maximizar la velocidad de desarrollo asistido por IA (vibe coding), el
tipado estricto de extremo a extremo y la soberanía total sobre los datos. Todas las herramientas
son open-source o de licencia permisiva para uso empresarial.
2.1 Tabla de Tecnologías

Categoría Tecnología Versión
mínima

Justificación

Framework Core Next.js (App
Router)

15.x SSR, RSC, Server Actions, routing file-
based

Lenguaje TypeScript 5.x (strict) Tipado estricto end-to-end; reduce
errores en generación IA

Base de Datos PostgreSQL 16.x ACID, relacional, soporte JSONB para
metadatos flexibles

ORM Prisma 5.x Migrations automáticas, cliente tipado,
introspección de BD

Autenticación Auth.js (NextAuth
v5)

5.x Integración nativa Next.js, sesiones en
PostgreSQL

Almacenamiento MinIO RELEASE.
024

Compatible S3, self-hosted, UI de
administración integrada

UI Components shadcn/ui + Radix
UI

latest Accesible, sin dependencia de runtime
CSS-in-JS

Estilos Tailwind CSS 3.x Utility-first, purging automático, bundle
mínimo

Iconos Lucide React latest 1,400+ íconos SVG consistentes

PWA / Offline Serwist 9.x Service Workers con Workbox, caching
estratégico

Estado global Zustand + persist 4.x Persistencia IndexedDB para modo
offline

Formularios React Hook Form 7.x Rendimiento, integración Zod, sin re-
renders innecesarios

Validación Zod 3.x Schemas compartidos cliente/servidor

Data fetching TanStack Query 5.x Cache, invalidación, mutations optimistas

Tablas TanStack Table 8.x Filtros, paginación, sorting headless

Compresión imgs. browser-image-
compression

2.x Reduce 5-10MB a <500KB en el
navegador

Reportes PDF @react-pdf/
renderer

3.x Genera PDF con React en servidor
Next.js

Categoría Tecnología Versión
mínima

Justificación

Contenedor BD Docker + Docker
Compose

25.x PostgreSQL y MinIO orquestados
localmente

Linting ESLint + Prettier latest Código consistente, compatible con
reglas IA

2.2 Decisiones de Arquitectura Clave
2.2.1 App Router vs Pages Router
Se utiliza exclusivamente el App Router de Next.js 15. Esto habilita React Server Components
(RSC) para cargas iniciales ultrarrápidas, layouts anidados para rutas de admin y móvil con sus
propios headers, y Server Actions para mutaciones sin necesidad de API routes adicionales. El
Pages Router queda completamente descartado.
2.2.2 Self-Hosted vs Cloud
Toda la infraestructura corre localmente en los servidores de Electsun. PostgreSQL se levanta
mediante Docker Compose. MinIO provee almacenamiento de objetos compatible con S3 sin
dependencia de AWS. Esto garantiza soberanía total de datos, cumplimiento con políticas internas
y eliminación de costos variables por almacenamiento en la nube.
2.2.3 Offline-First Architecture
Serwist implementa una estrategia de cache StaleWhileRevalidate para recursos estáticos y
NetworkFirst para datos dinámicos. Zustand con middleware persist almacena en IndexedDB las
evidencias pendientes de sincronización. Un Background Sync Service Worker intenta reenviar las
evidencias cuando la conexión se recupera, sin intervención del usuario.
3. Roles y Permisos del Sistema (RBAC)
El sistema implementa un modelo de Control de Acceso Basado en Roles con dos roles definidos.
La sesión se gestiona mediante Auth.js y el campo role se almacena en la tabla User de
PostgreSQL. El middleware de Next.js verifica el rol en cada petición protegida antes de ejecutar
cualquier lógica de negocio.
3.1 Administrador (ADMIN)
El Administrador es el rol de máximo privilegio dentro de la plataforma. Sus capacidades abarcan
la gestión completa del sistema.

Módulo Permiso Descripción

Plantillas CREATE / READ / UPDATE
/ DELETE

Crear y gestionar plantillas de recopilación

Proyectos CREATE / READ / UPDATE
/ DELETE

Crear proyectos, asignar técnicos, cambiar
estado

Evidencias READ / APPROVE /
REJECT

Ver todas las evidencias y cambiar su estado

Comentarios CREATE / READ / DELETE
(own)

Añadir y ver hilos de comentarios en
evidencias

Reportes PDF GENERATE / DOWNLOAD Exportar reporte final de un proyecto completo

Feed CREATE / READ / UPDATE
/ DELETE

Publicar y gestionar anuncios institucionales

Recursos CREATE / READ / UPDATE
/ DELETE

Subir y organizar manuales y guías técnicas

Usuarios CREATE / READ /
DEACTIVATE

Registrar nuevos técnicos y desactivar
cuentas

Dashboard READ Ver métricas globales de proyectos activos

3.2 Técnico (TECHNICIAN)
El Técnico es el usuario de campo. Accede a la plataforma exclusivamente desde la PWA en su
dispositivo móvil. Sus permisos están deliberadamente restringidos para garantizar la integridad de
las evidencias.

Módulo Permiso Descripción

Proyectos READ (assigned) Solo ve proyectos que le han sido asignados

Evidencias CREATE / READ (own) Subir sus propias evidencias; no puede
eliminarlas

Comentarios READ Lee comentarios del Admin; no puede
publicar nuevos

Módulo Permiso Descripción

Feed READ Ve anuncios institucionales publicados por el
Admin

Recursos READ / DOWNLOAD Descarga manuales y guías técnicas para
consulta offline

Perfil READ / UPDATE (own) Actualiza su contraseña y foto de perfil

3.3 Reglas de Acceso en Next.js Middleware
El archivo middleware.ts en la raíz del proyecto intercepta todas las peticiones a rutas protegidas.
La lógica de protección sigue este orden de verificación:
1. Si no existe sesión activa → redirect a /login
2. Si la sesión existe pero el rol es TECHNICIAN y la ruta comienza por /admin → redirect a
/technician/dashboard
3. Si la sesión existe pero el rol es ADMIN y la ruta comienza por /technician → redirigir a
/admin/dashboard
4. Si el rol coincide con la ruta solicitada → permitir el paso y continuar
4. Requisitos Funcionales
Cada requisito se identifica con un código único (REQ-X.Y), una prioridad (Alta / Media / Baja) y el
rol al que aplica. Los requisitos de alta prioridad son bloqueantes para el lanzamiento de la versión
1.0.
4.1 Gestión de Proyectos y Plantillas

ID Requisito Prioridad Rol

REQ-1.1 El sistema debe permitir crear Plantillas de Recopilación
con nombre, descripción y lista de requisitos (nombre,
descripción, tipo: foto/texto/número, obligatorio: sí/no).

Alta Admin

REQ-1.2 Las plantillas deben poder editarse y versionarse; los
cambios no afectan proyectos ya creados a partir de
ellas.

Alta Admin

REQ-1.3 El Admin puede crear un nuevo proyecto instanciando
una plantilla (clonando todos sus requisitos) o
añadiendo requisitos manualmente desde cero.

Alta Admin

REQ-1.4 Un proyecto debe tener: nombre, cliente, dirección,
fecha estimada de inicio, fecha estimada de fin, estado
(Pendiente / En Progreso / Completado / Archivado).

Alta Admin

REQ-1.5 Un proyecto puede asignarse a uno o múltiples
técnicos. Los técnicos asignados reciben una
notificación en el feed.

Alta Admin

REQ-1.6 El Admin puede desasignar técnicos de un proyecto en
cualquier momento. Las evidencias ya subidas por ese
técnico se conservan.

Media Admin

REQ-1.7 El sistema debe calcular y mostrar el porcentaje de
completitud de un proyecto: (evidencias aprobadas /
total de requisitos obligatorios) * 100.

Alta Sistema

REQ-1.8 Un proyecto pasa automáticamente a estado
Completado cuando su porcentaje de completitud llega
al 100%.

Alta Sistema

4.2 Recopilación de Evidencias (Técnicos)

ID Requisito Prioridad Rol

REQ-2.1 Los técnicos deben visualizar un checklist de evidencias
requeridas por proyecto, agrupadas por categoría, con
indicador visual de estado (Pendiente / Enviada /
Aprobada / Rechazada).

Alta Técnico

REQ-2.2 Al subir una evidencia fotográfica, la imagen debe
comprimirse en el cliente usando browser-image-
compression hasta un máximo de 500KB antes de
transmitirse al servidor.

Alta Técnico

ID Requisito Prioridad Rol

REQ-2.3 El sistema debe registrar automáticamente: userId del
técnico, timestamp de subida (UTC), coordenadas GPS
si el usuario concedió permiso de ubicación.

Alta Sistema

REQ-2.4 Si el dispositivo no tiene conexión, la evidencia (imagen
comprimida + metadatos) debe guardarse en
IndexedDB y mostrarse como 'Pendiente de
sincronización' con un ícono naranja.

Alta Sistema

REQ-2.5 Al recuperar la conexión, el Service Worker debe
intentar sincronizar todas las evidencias pendientes en
orden FIFO. El técnico debe ver el progreso de
sincronización.

Alta Sistema

REQ-2.6 Un técnico solo puede subir evidencias de proyectos
que le han sido explícitamente asignados.

Alta Sistema

REQ-2.7 Si una evidencia es Rechazada, el técnico debe poder
subir una nueva fotografía para el mismo requisito, la
cual queda como nueva versión pendiente de
aprobación.

Alta Técnico

REQ-2.8 El sistema debe soportar archivos de tipo image/jpeg,
image/png y image/webp. Máximo 10MB en el cliente
antes de la compresión.

Media Sistema

4.3 Auditoría y Comentarios (Administradores)

ID Requisito Prioridad Rol

REQ-3.1 El Admin debe tener un dashboard con: total de
proyectos activos, proyectos en riesgo (fecha de fin < 3
días), evidencias pendientes de revisión y porcentaje
promedio de completitud.

Alta Admin

REQ-3.2 Cada evidencia subida puede marcarse como Aprobada
o Rechazada mediante botones de acción. El cambio de
estado debe ser reversible.

Alta Admin

REQ-3.3 El sistema debe permitir hilos de comentarios por cada
evidencia. Cada comentario registra: autor, timestamp y
texto. Los comentarios no pueden eliminarse para
preservar la auditoría.

Alta Admin

REQ-3.4 El Admin puede acceder a un historial completo de
todas las versiones de una evidencia (foto original,
rechazada, nueva foto enviada).

Media Admin

REQ-3.5 Las evidencias deben visualizarse en una galería
Lightbox con zoom, navegación por teclado (flechas) y
panel lateral para comentarios y cambio de estado.

Alta Admin

REQ-3.6 El Admin puede filtrar el listado de evidencias por:
estado, técnico responsable, rango de fechas y

Media Admin

ID Requisito Prioridad Rol

proyecto.

4.4 Generación de Reportes PDF

ID Requisito Prioridad Rol

REQ-4.1 El botón de exportar PDF solo es visible y funcional
cuando el proyecto tiene un 100% de evidencias
aprobadas.

Alta Admin

REQ-4.2 El reporte PDF debe generarse en el servidor (API
Route Next.js) usando @react-pdf/renderer para evitar
timeouts en el cliente.

Alta Sistema

REQ-4.3 El PDF debe incluir: (1) Portada con logo Electsun,
nombre del proyecto, cliente, fecha; (2) Índice; (3)
Información del proyecto y datos del cliente; (4) Tabla
de componentes instalados; (5) Tabla de técnicos
asignados; (6) Anexo fotográfico organizado por
categoría de requisito.

Alta Admin

REQ-4.4 Cada fotografía en el anexo debe incluir: nombre del
requisito, nombre del técnico que la subió, fecha y hora
de captura, coordenadas GPS si disponibles.

Alta Sistema

REQ-4.5 El Admin debe poder previsualizar el PDF en un visor
integrado (iframe) antes de descargarlo.

Media Admin

REQ-4.6 El PDF generado debe almacenarse en MinIO y ser
descargable mediante una URL firmada con expiración
de 24 horas.

Media Sistema

4.5 Feed Institucional y Base de Conocimiento

ID Requisito Prioridad Rol

REQ-5.1 Existirá un Feed institucional tipo muro donde el Admin
puede publicar anuncios con título, cuerpo de texto,
imagen opcional y enlace externo opcional.

Media Admin

REQ-5.2 El sistema debe publicar automáticamente en el Feed
cuando: un proyecto cambia a Completado, se asigna
un técnico a un nuevo proyecto.

Baja Sistema

REQ-5.3 Existirá una sección de Recursos categorizada donde el
Admin sube archivos PDF (manuales, normativas, guías
técnicas) con título, descripción y categoría.

Alta Admin

REQ-5.4 Los técnicos pueden buscar recursos por nombre o
categoría y descargarlos para consulta offline. Los
archivos se cachean en el Service Worker.

Alta Técnico

ID Requisito Prioridad Rol

REQ-5.5 Los recursos descargados offline están disponibles
incluso sin conexión mediante el Cache API del Service
Worker.

Media Sistema

5. Requisitos No Funcionales
5.1 Rendimiento

ID Requisito Métrica Objetivo

RNF-1.1 Compresión de imágenes en cliente 5-10MB → <500KB en <3 segundos
en dispositivos mid-range (4 cores,
3GB RAM)

RNF-1.2 Tiempo de carga inicial de la PWA (con caché
activo)

<1.5 segundos en conexión 3G (
Mbps simulado)

RNF-1.3 Tiempo de respuesta de API Routes para listados <400ms para listas de hasta 1,
registros

RNF-1.4 Generación del PDF del reporte en servidor <10 segundos para proyectos con
hasta 50 evidencias fotográficas

RNF-1.5 Paginación de tablas en el dashboard del Admin Máximo 25 registros por página;
cursor-based pagination en la API

5.2 Disponibilidad y Modo Offline

ID Requisito Detalle

RNF-2.1 Offline-First para técnicos La PWA debe ser 100% funcional para visualizar
proyectos asignados y subir evidencias sin conexión a
internet

RNF-2.2 Estrategia de caché de Serwist StaleWhileRevalidate para assets estáticos;
NetworkFirst (fallback a caché) para datos de
proyectos y requisitos

RNF-2.3 Sincronización en background Background Sync API para reenviar evidencias
pendientes automáticamente al recuperar la conexión

RNF-2.4 Indicador de estado de conexión Banner siempre visible en el header de la PWA: verde
(online) / naranja (offline - X evidencias pendientes)

RNF-2.5 Persistencia de datos offline Zustand con middleware persist guarda en
IndexedDB: lista de proyectos asignados, requisitos y
evidencias pendientes

5.3 Seguridad

ID Requisito Implementación

RNF-3.1 Protección de rutas mediante
middleware

middleware.ts verifica sesión Auth.js en TODAS las
rutas privadas antes de ejecutar cualquier lógica

RNF-3.2 Verificación de rol en Server
Actions

Cada Server Action llama a getServerSession() y
verifica role antes de ejecutar la mutación

ID Requisito Implementación

RNF-3.3 Protección de archivos en
MinIO

Las imágenes de evidencias NO son públicas; se sirven
mediante URLs pre-firmadas con expiración de 1 hora

RNF-3.4 Contraseñas hasheadas Todas las contraseñas se almacenan con bcrypt (salt
rounds: 12) mediante Auth.js Credentials Provider

RNF-3.5 Variables de entorno Las claves de BD, MinIO y Auth.js se gestionan
exclusivamente en .env.local; nunca en el repositorio git

RNF-3.6 Headers de seguridad HTTP next.config.ts configura: X-Frame-Options, X-Content-
Type-Options, Referrer-Policy, CSP básico

RNF-3.7 Rate limiting en API de login Máximo 5 intentos de login fallidos por IP en 15 minutos;
implementado con upstash/ratelimit o middleware
custom

5.4 Soberanía de Datos
Todo el almacenamiento de datos ocurre en infraestructura controlada por Electsun. No se utiliza
ningún servicio de nube externo para datos críticos. PostgreSQL almacena todos los metadatos,
sesiones, usuarios y relaciones. MinIO almacena todos los archivos binarios (evidencias
fotográficas, recursos PDF, reportes generados). No se envía ningún dato fuera de la red local de
Electsun.
5.5 Mantenibilidad y Escalabilidad

ID Requisito Criterio

RNF-5.1 Cobertura de tipos TypeScript El proyecto debe compilar con tsc --noEmit sin
errores en modo strict

RNF-5.2 Estructura de carpetas consistente Seguir la convención de App Router definida en
la Sección 7; no mezclar patterns

RNF-5.3 Migrations de base de datos Todos los cambios de esquema deben hacerse
mediante prisma migrate dev; nunca SQL directo

RNF-5.4 Variables de entorno documentadas El archivo .env.example debe mantenerse
actualizado con todas las variables necesarias

6. Esquema Completo de Base de Datos (Prisma)
El siguiente esquema define todas las entidades del sistema, sus relaciones y las restricciones de
integridad. Está escrito en Prisma Schema Language y es compatible con PostgreSQL 16.
6.1 Diagrama de Entidades (ER)
Las entidades principales y sus relaciones son las siguientes:

    User tiene muchos Project (como técnico asignado) a través de ProjectAssignment
    User tiene muchas Evidence (como uploader)
    Template tiene muchos TemplateRequirement
    Project se basa en una Template (nullable, si se creó desde cero)
    Project tiene muchos Requirement (clonados de la plantilla o creados manualmente)
    Requirement tiene muchas Evidence
    Evidence tiene muchos Comment
    Evidence tiene muchos EvidenceVersion (historial de versiones)
    User (Admin) tiene muchos Announcement y Resource

6.2 Esquema Prisma Completo

// prisma/schema.prisma
// Generador y configuración de datasource

generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

// ─── ENUMS ────────────────────────────────────────────────────

enum Role {
ADMIN
TECHNICIAN
}

enum ProjectStatus {
PENDING // Creado pero sin técnicos asignados
IN_PROGRESS // Técnicos trabajando activamente
COMPLETED // 100% evidencias aprobadas
ARCHIVED // Histórico, solo lectura
}

enum EvidenceStatus {
PENDING // Subida, esperando revisión del Admin

APPROVED // Aprobada por el Admin
REJECTED // Rechazada; el técnico debe subir nueva versión
}

enum RequirementType {
PHOTO // Requiere fotografía
TEXT // Requiere texto descriptivo
NUMBER // Requiere valor numérico (ej. potencia en kW)
}

enum ResourceCategory {
MANUAL
REGULATION
GUIDE
OTHER
}

// ─── MODELOS ──────────────────────────────────────────────────

/// Auth.js gestiona las tablas Account, Session y VerificationToken.
/// User es el modelo central extendido con campos de dominio.
model User {
id String @id @default(cuid())
name String
email String @unique
emailVerified DateTime?
image String? // URL de avatar en MinIO
password String? // Hash bcrypt (nullable para OAuth futuro)
role Role @default(TECHNICIAN)
isActive Boolean @default(true)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relaciones
accounts Account[]
sessions Session[]
assignments ProjectAssignment[]
evidences Evidence[]
comments Comment[]
announcements Announcement[]
resources Resource[]

@@map("users")
}

model Account {
id String @id @default(cuid())
userId String
type String
provider String
providerAccountId String
refresh_token String? @db.Text
access_token String? @db.Text
expires_at Int?
token_type String?

scope String?
id_token String? @db.Text
session_state String?
user User @relation(fields: [userId], references: [id],
onDelete: Cascade)

@@unique([provider, providerAccountId])
@@map("accounts")
}

model Session {
id String @id @default(cuid())
sessionToken String @unique
userId String
expires DateTime
user User @relation(fields: [userId], references: [id], onDelete:
Cascade)

@@map("sessions")
}

model VerificationToken {
identifier String
token String @unique
expires DateTime

@@unique([identifier, token])
@@map("verification_tokens")
}

model Template {
id String @id @default(cuid())
name String // Ej: 'Instalación Residencial 5kW'
description String?
isActive Boolean @default(true)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

requirements TemplateRequirement[]
projects Project[]

@@map("templates")
}

model TemplateRequirement {
id String @id @default(cuid())
templateId String
name String // Ej: 'Foto Inversor'
description String?
type RequirementType @default(PHOTO)
isMandatory Boolean @default(true)
order Int @default(0)
category String? // Agrupación visual en el checklist
createdAt DateTime @default(now())

template Template @relation(fields: [templateId], references: [id],
onDelete: Cascade)

@@map("template_requirements")
}

model Project {
id String @id @default(cuid())
name String
clientName String
clientAddress String
clientPhone String?
description String?
status ProjectStatus @default(PENDING)
completionPct Float @default(0)
templateId String? // Nullable: proyecto desde cero
estimatedStart DateTime?
estimatedEnd DateTime?
completedAt DateTime?
reportUrl String? // URL MinIO del PDF generado
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

template Template? @relation(fields: [templateId], references:
[id])
assignments ProjectAssignment[]
requirements Requirement[]

@@map("projects")
}

model ProjectAssignment {
id String @id @default(cuid())
projectId String
userId String
assignedAt DateTime @default(now())

project Project @relation(fields: [projectId], references: [id], onDelete:
Cascade)
user User @relation(fields: [userId], references: [id], onDelete:
Cascade)

@@unique([projectId, userId])
@@map("project_assignments")
}

model Requirement {
id String @id @default(cuid())
projectId String
name String
description String?
type RequirementType @default(PHOTO)
isMandatory Boolean @default(true)
order Int @default(0)

category String?
createdAt DateTime @default(now())

project Project @relation(fields: [projectId], references: [id],
onDelete: Cascade)
evidences Evidence[]

@@map("requirements")
}

model Evidence {
id String @id @default(cuid())
requirementId String
uploadedById String
status EvidenceStatus @default(PENDING)
fileUrl String // URL objeto en MinIO
fileKey String // Key del objeto en MinIO (para signed URLs)
fileName String
fileSizeBytes Int
mimeType String
latitude Float? // GPS al momento de la subida
longitude Float?
capturedAt DateTime @default(now())
approvedAt DateTime?
rejectedAt DateTime?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

requirement Requirement @relation(fields: [requirementId], references:
[id], onDelete: Cascade)
uploadedBy User @relation(fields: [uploadedById], references: [id])
comments Comment[]
versions EvidenceVersion[]

@@map("evidences")
}

/// Historial de versiones de una evidencia (foto original + re-subidas después de
rechazo)
model EvidenceVersion {
id String @id @default(cuid())
evidenceId String
versionNum Int
fileUrl String
fileKey String
fileSizeBytes Int
createdAt DateTime @default(now())

evidence Evidence @relation(fields: [evidenceId], references: [id],
onDelete: Cascade)

@@map("evidence_versions")
}

model Comment {

id String @id @default(cuid())
evidenceId String
authorId String
body String @db.Text
createdAt DateTime @default(now())

evidence Evidence @relation(fields: [evidenceId], references: [id], onDelete:
Cascade)
author User @relation(fields: [authorId], references: [id])

@@map("comments")
}

model Announcement {
id String @id @default(cuid())
title String
body String @db.Text
imageUrl String?
externalUrl String?
authorId String
isPinned Boolean @default(false)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

author User @relation(fields: [authorId], references: [id])

@@map("announcements")
}

model Resource {
id String @id @default(cuid())
title String
description String?
category ResourceCategory @default(OTHER)
fileUrl String // URL objeto en MinIO
fileKey String
fileName String
fileSizeBytes Int
uploadedById String
downloadCount Int @default(0)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

uploadedBy User @relation(fields: [uploadedById], references: [id])

@@map("resources")
}

6.3 Índices Recomendados
Para garantizar el rendimiento de las consultas más frecuentes, se deben crear los siguientes
índices adicionales mediante una migración Prisma:

// Añadir dentro de cada modelo según corresponda:

// En Evidence: filtros por estado y por proyecto (via requirement)
@@index([status])
@@index([uploadedById])
@@index([requirementId, status])

// En Requirement: ordenamiento dentro de un proyecto
@@index([projectId, order])

// En ProjectAssignment: búsqueda de proyectos de un técnico
@@index([userId])

// En Announcement: feed ordenado por fecha descendente
@@index([createdAt(sort: Desc)])

// En Resource: búsqueda por categoría
@@index([category])
7. Flujo de Autenticación Paso a Paso
La autenticación se implementa con Auth.js v5 (NextAuth) usando el Credentials Provider para
login con email y contraseña. Las sesiones se persisten en PostgreSQL mediante el
PrismaAdapter.
7.1 Configuración de Auth.js

// lib/auth.ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { LoginSchema } from '@/lib/validations/auth'

export const { handlers, signIn, signOut, auth } = NextAuth({
adapter: PrismaAdapter(prisma),
session: { strategy: 'jwt' }, // JWT para compatibilidad con middleware
pages: {
signIn: '/login',
error: '/login',
},
providers: [
CredentialsProvider({
name: 'credentials',
credentials: {
email: { label: 'Email', type: 'email' },
password: { label: 'Contraseña', type: 'password' },
},
async authorize(credentials) {
// 1. Validar schema con Zod
const parsed = LoginSchema.safeParse(credentials)
if (!parsed.success) return null

// 2. Buscar usuario en BD
const user = await prisma.user.findUnique({
where: { email: parsed.data.email },
})
if (!user || !user.password) return null
if (!user.isActive) throw new Error('ACCOUNT_DISABLED')

// 3. Verificar contraseña
const isValid = await bcrypt.compare(parsed.data.password, user.password)
if (!isValid) return null

// 4. Retornar objeto de usuario (sin password)
return { id: user.id, email: user.email, name: user.name, role:
user.role }
},
}),
],
callbacks: {

async jwt({ token, user }) {
if (user) {
token.role = user.role
token.id = user.id
}
return token
},
async session({ session, token }) {
if (token && session.user) {
session.user.role = token.role as string
session.user.id = token.id as string
}
return session
},
},
})

7.2 Diagrama de Flujo: Login
El siguiente diagrama describe el flujo completo de autenticación desde que el usuario ingresa sus
credenciales hasta que obtiene acceso a la ruta correspondiente a su rol:

Pas
o

Actor Acción Resultado

1 Usuario Ingresa email y contraseña en
/login

Formulario React Hook Form + Zod valida
formato en cliente

2 Cliente Llama a signIn('credentials',
{email, password})

Auth.js invoca el authorize() del Credentials
Provider

3 Auth.js Llama a
LoginSchema.safeParse() con
Zod

Si falla → retorna null → error
'CredentialsSignIn'

4 Auth.js prisma.user.findUnique({ where:
{ email } })

Si no existe → null → error de login genérico

5 Auth.js Verifica user.isActive === true Si false → lanza
Error('ACCOUNT_DISABLED')

6 Auth.js bcrypt.compare(password,
user.password)

Si no coincide → null → error de login
genérico

7 Auth.js Retorna { id, email, name, role } Callback jwt() añade role e id al token JWT

8 Auth.js Callback session() expone role e
id en session.user

El token se firma y se guarda como cookie
HTTP-only

9 Middlewar
e

Lee el token de la cookie en
cada request

Redirige según el rol: ADMIN →
/admin/dashboard, TECHNICIAN →
/technician/dashboard

10 Usuario Accede a su dashboard
correspondiente

La sesión es válida durante 30 días
(configurable)

7.3 Middleware de Protección de Rutas

// middleware.ts (raíz del proyecto)
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
const { nextUrl, auth: session } = req
const isLoggedIn = !!session
const role = session?.user?.role

const isAdminRoute = nextUrl.pathname.startsWith('/admin')
const isTechnicianRoute = nextUrl.pathname.startsWith('/technician')
const isAuthRoute = ['/login', '/register'].includes(nextUrl.pathname)

// Redirigir usuarios ya autenticados fuera de las rutas de auth
if (isLoggedIn && isAuthRoute) {
const destination = role === 'ADMIN'? '/admin/dashboard' :
'/technician/dashboard'
return NextResponse.redirect(new URL(destination, nextUrl))
}

// Proteger rutas privadas
if (!isLoggedIn && (isAdminRoute || isTechnicianRoute)) {
return NextResponse.redirect(new URL('/login', nextUrl))
}

// Verificar rol correcto para la ruta
if (isLoggedIn && isAdminRoute && role !== 'ADMIN') {
return NextResponse.redirect(new URL('/technician/dashboard', nextUrl))
}

if (isLoggedIn && isTechnicianRoute && role !== 'TECHNICIAN') {
return NextResponse.redirect(new URL('/admin/dashboard', nextUrl))
}

return NextResponse.next()
})

export const config = {
matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

7.4 Flujo de Registro de Nuevos Usuarios
El registro de nuevos técnicos lo realiza exclusivamente un Administrador desde el panel de
gestión de usuarios. No existe registro público. El flujo es el siguiente:
5. Admin navega a /admin/users → hace clic en 'Agregar Técnico'
6. Completa el formulario: nombre, email, contraseña temporal
7. El Server Action createUser() hashea la contraseña con bcrypt (12 rounds) y crea el registro
en PostgreSQL con role: TECHNICIAN
8. Se publica un anuncio automático en el Feed: 'Bienvenido [nombre] al equipo Electsun'
9. El técnico recibe sus credenciales por el canal de comunicación interna de Electsun
10.En su primer login, el sistema le solicita cambiar la contraseña temporal
8. Manejo de Errores
8.1 Errores en Login y Registro

Código de Error Causa Mensaje al Usuario Comportamiento del
Sistema

CREDENTIALS_IN
VALID

Email no existe o
contraseña
incorrecta

"Credenciales
incorrectas. Verifica tu
email y contraseña."

No se especifica cuál campo
es incorrecto (seguridad)

ACCOUNT_DISAB
LED

user.isActive ===
false

"Tu cuenta ha sido
desactivada. Contacta al
administrador."

Se muestra un banner de
error en el formulario de login

RATE_LIMIT_EXC
EEDED

+5 intentos fallidos
en 15 minutos

"Demasiados intentos.
Espera 15 minutos antes
de intentar de nuevo."

El endpoint bloquea la IP por
15 minutos

VALIDATION_ERR
OR

Email sin formato
válido o password
< 8 caracteres

Mensajes inline en cada
campo del formulario

Zod valida en cliente; no se
hace request al servidor

SERVER_ERROR Error inesperado
en BD o servidor

"Ocurrió un error
inesperado. Por favor
intenta de nuevo."

Error logueado en consola
del servidor; no se expone el
stack trace

8.2 Errores en Subida de Evidencias

Escenario Causa Respuesta al Usuario Acción del Sistema

Archivo muy
grande

Imagen > 10MB
antes de
compresión

Banner naranja: 'La imagen
es muy grande. Máximo
10MB antes de comprimir.'

Bloquea la subida; no
inicia la compresión

Tipo de archivo
inválido

Archivo no es
image/jpeg, png o
webp

Banner naranja: 'Solo se
aceptan imágenes JPG,
PNG o WEBP.'

Bloquea la subida

Sin conexión navigator.onLine
=== false

Banner naranja persistente:
'Sin conexión — Guardando
evidencia localmente'

Guarda en IndexedDB;
intenta sincronizar al
volver a estar online

Error en MinIO MinIO no
disponible o error
500

Banner rojo: 'Error al
guardar la foto.
Reintentando...'

3 reintentos automáticos
con backoff exponencial
(1s, 2s, 4s)

Sesión expirada JWT expirado
durante la subida

Modal: 'Tu sesión expiró.
Inicia sesión de nuevo. No
se perdieron tus fotos.'

La evidencia se guarda
en IndexedDB; tras login
se sincroniza

Compresión falla browser-image-
compression lanza
excepción

Banner rojo: 'Error al
procesar la imagen. Intenta
con otra foto.'

Captura el error, lo
loguea, no continúa la
subida

8.3 Errores en Generación de PDF

Escenario Causa Respuesta al Usuario

Proyecto incompleto completionPct < 100% Botón deshabilitado con tooltip: 'El proyecto
debe tener 100% de evidencias aprobadas'

Timeout en servidor Más de 30 segundos
generando el PDF

Toast de error: 'El reporte tardó demasiado.
Intenta de nuevo.'

Imagen no disponible
en MinIO

URL de evidencia rota o
eliminada

PDF se genera con placeholder: 'Imagen no
disponible' en lugar de la foto

Error de permisos Admin no tiene rol correcto
en la sesión

Redirect a /login con mensaje de sesión
inválida

8.4 Estrategia General de Manejo de Errores
8.4.1 En Server Actions

// Patrón estándar para todos los Server Actions
export async function createEvidence(formData: FormData) {
try {
const session = await auth()
if (!session) return { error: 'No autorizado' }

// Lógica de negocio...
return { success: true, data: result }

} catch (error) {
console.error('[createEvidence]', error)
return { error: 'Error interno del servidor' }
}
}

8.4.2 En el Cliente

// TanStack Query maneja reintentos y estados de error
const mutation = useMutation({
mutationFn: createEvidence,
retry: 3,
retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
onError: (error) => {
toast.error('Error al guardar evidencia. Guardando localmente...')
saveToIndexedDB(pendingEvidence) // Fallback offline
},
onSuccess: () => {
toast.success('Evidencia guardada correctamente')
queryClient.invalidateQueries({ queryKey: ['project', projectId] })
},
})

9. Estructura de Carpetas (App Router)
La estructura siguiente es mandatoria para mantener la coherencia del código y facilitar la
generación asistida por IA. Cada ruta de la App Router corresponde a un grupo de rutas (route
groups) que permiten layouts separados para admin y móvil.

discovery/
├── .env.local # Variables de entorno (NO commitear)
├── .env.example # Plantilla de variables (sí commitear)
├── docker-compose.yml # PostgreSQL + MinIO
├── next.config.ts # Config Next.js + headers seguridad
├── middleware.ts # Protección global de rutas Auth.js
├── tailwind.config.ts
├── prisma/
│ ├── schema.prisma # Esquema de BD
│ └── migrations/ # Historial de migraciones
│
├── app/
│ ├── layout.tsx # Root layout (fuentes, providers globales)
│ ├── (auth)/
│ │ ├── login/page.tsx # Página de login
│ │ └── layout.tsx # Layout sin nav para páginas auth
│ │
│ ├── (dashboard)/ # Grupo de rutas para Admin (desktop)
│ │ ├── layout.tsx # Layout admin: sidebar + header
│ │ └── admin/
│ │ ├── dashboard/page.tsx
│ │ ├── projects/
│ │ │ ├── page.tsx # Lista de proyectos
│ │ │ ├── [id]/page.tsx # Detalle + auditoría
│ │ │ └── [id]/evidence/[evidenceId]/page.tsx
│ │ ├── templates/
│ │ │ ├── page.tsx
│ │ │ └── [id]/page.tsx
│ │ ├── users/page.tsx
│ │ ├── feed/page.tsx
│ │ └── resources/page.tsx
│ │
│ ├── (mobile)/ # Grupo de rutas para Técnico (PWA)
│ │ ├── layout.tsx # Layout móvil: bottom nav + header offline
│ │ └── technician/
│ │ ├── dashboard/page.tsx
│ │ ├── projects/
│ │ │ ├── page.tsx # Lista proyectos asignados
│ │ │ └── [id]/
│ │ │ ├── page.tsx # Checklist del proyecto
│ │ │ └── evidence/[reqId]/page.tsx # Wizard subida
│ │ ├── feed/page.tsx
│ │ └── resources/page.tsx
│ │
│ └── api/
│ ├── auth/[...nextauth]/route.ts # Handler Auth.js
│ ├── pdf/[projectId]/route.ts # Generación PDF servidor
│ └── storage/signed-url/route.ts # URLs firmadas MinIO
│

├── components/
│ ├── ui/ # Componentes shadcn/ui (generados)
│ ├── shared/ # Componentes reutilizables custom
│ │ ├── OfflineBanner.tsx
│ │ ├── ImageLightbox.tsx
│ │ ├── EvidenceUploader.tsx
│ │ ├── ProjectProgress.tsx
│ │ └── CommentThread.tsx
│ ├── admin/ # Componentes exclusivos del dashboard Admin
│ └── mobile/ # Componentes exclusivos de la PWA Técnico
│
├── lib/
│ ├── auth.ts # Configuración Auth.js
│ ├── prisma.ts # Singleton Prisma Client
│ ├── minio.ts # Cliente MinIO + helpers
│ ├── actions/ # Server Actions organizados por dominio
│ │ ├── projects.ts
│ │ ├── evidences.ts
│ │ ├── templates.ts
│ │ ├── users.ts
│ │ ├── feed.ts
│ │ └── resources.ts
│ └── validations/ # Schemas Zod compartidos cliente/servidor
│ ├── auth.ts
│ ├── project.ts
│ └── evidence.ts
│
├── hooks/ # Custom React Hooks
│ ├── useOnlineStatus.ts # Detecta conexión en tiempo real
│ ├── usePendingSync.ts # Gestiona evidencias en IndexedDB
│ └── useCompressImage.ts # Wrapper browser-image-compression
│
├── store/ # Zustand stores
│ ├── offlineStore.ts # Evidencias pendientes de sync
│ └── uiStore.ts # Estado UI global (modales, sidebar)
│
└── types/
├── next-auth.d.ts # Extensión de tipos de Auth.js
└── index.ts # Tipos globales del dominio
10. Especificación de Interfaz y Experiencia de Usuario
10.1 Interfaz Móvil — PWA para Técnicos
La PWA está diseñada para condiciones extremas de campo: luz solar directa en techos, guantes,
manos sucias y conexión inestable. Cada decisión de diseño prioriza la funcionalidad sobre la
estética.

Principio Implementación Específica

Alto Contraste Solar Tema claro forzado (nunca dark mode): fondo #FFFFFF, texto #111827,
botones primarios en #1B5E20. Sin gradientes ni sombras que reduzcan el
contraste.

Fat-Finger Friendly Todos los botones de acción tienen min-height: 48px (Tailwind: h-12).
Botones principales de captura y guardado: h-16 (64px). Spacing entre
elementos táctiles: mínimo 8px.

Wizard por Pasos El flujo de subida de evidencias se divide en 3 pasos: (1) Seleccionar
requisito, (2) Capturar o seleccionar foto, (3) Confirmar y enviar. Stepper
visual en la parte superior.

Captura Nativa El dropzone tiene accept='image/*' capture='environment' para abrir la
cámara trasera del celular directamente. Área táctil mínima de 200x200px
con ícono de cámara prominente.

Indicador Offline Header fijo con badge de estado: verde 'En línea' / naranja 'Sin conexión —
X fotos pendientes'. El badge pulsa con animación CSS cuando hay
evidencias pendientes.

Navegación Bottom Bottom Navigation Bar con 4 tabs: Proyectos, Feed, Recursos, Perfil.
Siempre visible, sin scroll. Tab activo resaltado en verde primario.

Feedback de Carga Skeleton screens durante la carga inicial. Spinner con mensaje
'Comprimiendo imagen...' durante el procesamiento. Progress bar durante
la subida.

10.2 Interfaz de Escritorio — Dashboard Admin

Componente Especificación

Layout Split-View Panel izquierdo (30% / 320px min): lista de proyectos con búsqueda y
filtros. Panel derecho (70%): detalle completo del proyecto seleccionado.
Divisor drag-to-resize.

Dashboard Métricas 4 cards en la parte superior: Total proyectos activos, En riesgo (fecha < 3
días), Evidencias pendientes de revisión, Porcentaje promedio de
completitud.

Galería Lightbox Al hacer clic en una evidencia se abre un modal fullscreen: imagen a la
izquierda, panel de auditoría a la derecha (estado, comentarios, botones
Aprobar/Rechazar).

Tablas TanStack Columnas configurables, ordenamiento por clic en header, filtros inline por
columna, paginación con 25 registros por página, export a CSV.

Componente Especificación

Visor PDF Integrado iframe dentro de un modal para previsualizar el PDF antes de descargar.
Botón de descarga directa una vez generado.

Notificaciones Toast Toasts no intrusivos (shadcn/ui Sonner) en esquina superior derecha para
confirmaciones de acciones: aprobación, rechazo, comentario enviado.

Navegación Sidebar Sidebar colapsable con íconos y labels: Dashboard, Proyectos, Plantillas,
Usuarios, Feed, Recursos. Logo Electsun en la parte superior.
11. Guía de Implementación e Instrucciones de Setup
11.1 Prerrequisitos del Entorno

Herramienta Versión mínima Verificación

Node.js 20.x LTS node --version

npm 10.x npm --version

Docker 25.x docker --version

Docker Compose 2.x docker compose version

Git 2.40.x git --version

11.2 Setup Inicial del Proyecto
Paso 1: Clonar el repositorio e instalar dependencias

git clone <URL_REPO> discovery
cd discovery
npm install

Paso 2: Configurar variables de entorno

cp .env.example .env.local
# Editar .env.local con los valores reales:

# .env.local — NUNCA commitear este archivo

# Base de Datos PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/discovery"

# Auth.js
NEXTAUTH_SECRET="genera-con: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# MinIO
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET_EVIDENCES="discovery-evidences"
MINIO_BUCKET_RESOURCES="discovery-resources"
MINIO_BUCKET_REPORTS="discovery-reports"
MINIO_USE_SSL="false"

Paso 3: Levantar infraestructura con Docker Compose

# docker-compose.yml
services:
postgres:
image: postgres:16-alpine
environment:
POSTGRES_DB: discovery
POSTGRES_USER: postgres
POSTGRES_PASSWORD: password
ports:

    '5432:5432'
    volumes:
    pgdata:/var/lib/postgresql/data

minio:
image: minio/minio:latest
command: server /data --console-address ':9001'
environment:
MINIO_ROOT_USER: minioadmin
MINIO_ROOT_PASSWORD: minioadmin
ports:

    '9000:9000' # API S3
    '9001:9001' # Consola web
    volumes:
    miniodata:/data

volumes:
pgdata:
miniodata:

docker compose up -d
# Verificar: docker compose ps

Paso 4: Ejecutar migraciones de Prisma y seed inicial

# Aplicar todas las migraciones al esquema de BD
npx prisma migrate dev --name init

# Generar el cliente tipado de Prisma
npx prisma generate

# Crear usuario Admin inicial (ejecutar script de seed)
npx ts-node prisma/seed.ts
# Credenciales por defecto: admin@electsun.com / Admin123!
# CAMBIAR INMEDIATAMENTE en producción

Paso 5: Crear buckets en MinIO

# Usando MinIO Client (mc) instalado localmente:

mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/discovery-evidences
mc mb local/discovery-resources
mc mb local/discovery-reports

# O desde la consola web en http://localhost:9001

Paso 6: Iniciar el servidor de desarrollo

npm run dev
# Abrir http://localhost:3000
# Login admin: admin@electsun.com / Admin123!

11.3 Flujo de Trabajo con Git (Reglas para IA y Desarrolladores)

Regla Descripción Ejemplo

main es sagrado Nunca hacer commits directos a main.
Solo merge via PR desde dev con review.

git push origin main →
BLOQUEADO por branch
protection

dev es la base Todo desarrollo parte de dev. main solo
recibe merges de dev cuando hay un
release.

git checkout dev → git pull origin
dev

Feature branches Cada funcionalidad en su propia rama
semántica partiendo de dev.

git checkout -b feature/setup-
authjs dev

Commits semánticos Usar Conventional Commits: feat:, fix:,
docs:, refactor:, test:

feat(auth): add credentials
provider with bcrypt

PR obligatorio Toda rama debe hacerse merge via Pull
Request con al menos 1 aprobación.

Crear PR en GitHub/GitLab de
feature/* → dev

11.4 Comandos de Desarrollo Frecuentes

# Desarrollo
npm run dev # Servidor Next.js con hot reload
npm run build # Build de producción
npm run start # Servidor de producción

# Base de Datos
npx prisma migrate dev # Nueva migración (desarrollo)
npx prisma migrate deploy # Aplicar migraciones (producción)
npx prisma studio # GUI de base de datos en el navegador
npx prisma db seed # Ejecutar seed de datos iniciales

# Calidad de Código
npm run lint # ESLint

npm run type-check # tsc --noEmit
npm run format # Prettier
Infraestructura

docker compose up -d # Iniciar PostgreSQL + MinIO
docker compose down # Detener servicios
docker compose logs -f postgres # Ver logs de la BD
12. Configuración Detallada de Componentes Clave
12.1 Prisma Client Singleton

// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
prisma: PrismaClient | undefined
}

export const prisma =
globalForPrisma.prisma ??
new PrismaClient({
log: process.env.NODE_ENV === 'development'? ['query', 'error', 'warn'] :
['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

12.2 MinIO Client

// lib/minio.ts
import * as Minio from 'minio'

export const minioClient = new Minio.Client({
endPoint: process.env.MINIO_ENDPOINT!,
port: parseInt(process.env.MINIO_PORT!),
useSSL: process.env.MINIO_USE_SSL === 'true',
accessKey: process.env.MINIO_ACCESS_KEY!,
secretKey: process.env.MINIO_SECRET_KEY!,
})

export async function getSignedUrl(bucket: string, key: string, expiry = 3600) {
return minioClient.presignedGetObject(bucket, key, expiry)
}

export async function uploadFile(
bucket: string,
key: string,
buffer: Buffer,
contentType: string
) {
await minioClient.putObject(bucket, key, buffer, buffer.length, {
'Content-Type': contentType,
})
return key
}

12.3 Configuración de Serwist (PWA)

// next.config.ts
import withSerwist from '@serwist/next'

const withPWA = withSerwist({
swSrc: 'app/sw.ts',
swDest: 'public/sw.js',
disable: process.env.NODE_ENV === 'development',
})

export default withPWA({
// ... resto de la config Next.js
})

// app/sw.ts — Service Worker
import { defaultCache } from '@serwist/next/worker'
import { Serwist } from 'serwist'

const serwist = new Serwist({
precacheEntries: self.__SW_MANIFEST,
skipWaiting: true,
clientsClaim: true,
navigationPreload: true,
runtimeCaching: [
{
// Cache de recursos estáticos
matcher: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2)$/i,
handler: 'CacheFirst',
options: { cacheName: 'static-assets', expiration: { maxAgeSeconds: 30 * 24
* 60 * 60 } }
},
{
// Datos de proyectos: NetworkFirst con fallback a caché
matcher: /\/api\/projects/,
handler: 'NetworkFirst',
options: { cacheName: 'api-projects', networkTimeoutSeconds: 5 }
},
...defaultCache,
],
})

serwist.addEventListeners()

12.4 Store Zustand para Modo Offline

// store/offlineStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface PendingEvidence {
id: string // ID temporal local

requirementId: string
projectId: string
imageData: string // Base64 de la imagen comprimida
fileName: string
latitude?: number
longitude?: number
capturedAt: string
}

interface OfflineStore {
pendingEvidences: PendingEvidence[]
addPending: (evidence: PendingEvidence) => void
removePending: (id: string) => void
clearAll: () => void
}

// persist guarda en IndexedDB via idb-keyval
export const useOfflineStore = create()(persist(
(set) => ({
pendingEvidences: [],
addPending: (e) => set((s) => ({ pendingEvidences: [...s.pendingEvidences,
e] })),
removePending: (id) => set((s) => ({ pendingEvidences:
s.pendingEvidences.filter(e => e.id !== id) })),
clearAll: () => set({ pendingEvidences: [] }),
}),
{ name: 'discovery-offline', storage: createJSONStorage(() => localStorage) }
))
13. Reglas de Flujo de Trabajo Git
Estas reglas son mandatorias tanto para desarrolladores humanos como para el asistente de IA
(Antigravity). Garantizan la integridad del código fuente y la trazabilidad de los cambios.

Regla Descripción Detallada

Protección de main La rama main representa producción. Tiene protección de rama activa: no
se permiten push directos, se requiere al menos 1 aprobación en PR y que
pasen los checks de CI (lint + type-check).

Rama base: dev Todo desarrollo activo ocurre en dev o en ramas que parten de dev. La
rama dev se despliega automáticamente al entorno de staging.

Convención de
nombres de ramas

feature/nombre-descriptivo para nuevas funcionalidades. fix/nombre-del-
bug para correcciones. refactor/nombre para reestructuraciones.
chore/nombre para tareas de mantenimiento.

Commits semánticos Usar Conventional Commits. Formato: tipo(scope): descripción. Tipos
válidos: feat, fix, docs, style, refactor, test, chore. Ejemplo: feat(auth):
implement rate limiting on login endpoint

Pull Requests Cada feature branch debe mergearse a dev mediante un PR. El título del
PR sigue la misma convención de commits. Se incluye una descripción de
los cambios y, si aplica, capturas de pantalla.

Release a main Solo se mergea dev en main cuando hay un release planificado. El merge
crea un tag semántico: v1.0.0, v1.1.0. Nunca se hacen hotfixes
directamente en main.

13.1 Ejemplos de Ramas por Funcionalidad

feature/setup-authjs # Configuración inicial de Auth.js
feature/prisma-schema # Definición del esquema de BD
feature/admin-dashboard # Dashboard de métricas del Admin
feature/mobile-wizard # Wizard de subida de evidencias
feature/pdf-report # Generación de reportes PDF
feature/offline-sync # Modo offline con IndexedDB
feature/feed-announcements # Feed institucional
feature/knowledge-base # Sección de Recursos
fix/image-compression # Corrección en el compresor de imágenes
fix/auth-redirect-loop # Fix de loop en redirección del middleware
refactor/server-actions # Reorganización de Server Actions
chore/docker-compose-setup # Configuración de infraestructura local

14. Apéndice
14.1 Checklist de Verificación antes del Lanzamiento

# Ítem Estado

1 docker compose up -d levanta PostgreSQL y MinIO sin errores [ ]

2 npx prisma migrate dev aplica el esquema completo sin errores [ ]

3 El usuario Admin inicial puede hacer login en /login [ ]

4 El middleware redirige correctamente según el rol [ ]

5 Un Técnico puede subir una evidencia offline y sincronizarla [ ]

6 La compresión reduce imágenes de 5MB a <500KB en el cliente [ ]

7 El Admin puede aprobar y rechazar evidencias [ ]

8 Los comentarios se persisten y son visibles para el Admin [ ]

9 El PDF se genera correctamente para un proyecto 100% completado [ ]

10 El banner offline aparece cuando el dispositivo pierde conexión [ ]

11 La PWA es instalable (muestra el prompt de instalación en móvil) [ ]

12 Los recursos se pueden descargar offline desde la sección de Recursos [ ]

13 tsc --noEmit pasa sin errores en modo strict [ ]

14 npm run lint pasa sin errores ni warnings [ ]

15 Las URLs de MinIO son pre-firmadas y expiran en 1 hora [ ]

16 Los headers de seguridad HTTP están configurados en next.config.ts [ ]

14.2 Variables de Entorno Requeridas (.env.example)

# COPIA ESTE ARCHIVO A .env.local Y COMPLETA LOS VALORES REALES

# ── Base de Datos ─────────────────────────────────────────────
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/discovery

# ── Auth.js ───────────────────────────────────────────────────
NEXTAUTH_SECRET= # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# ── MinIO ─────────────────────────────────────────────────────
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET_EVIDENCES=discovery-evidences
MINIO_BUCKET_RESOURCES=discovery-resources

MINIO_BUCKET_REPORTS=discovery-reports
MINIO_USE_SSL=false

# ── App ───────────────────────────────────────────────────────
NEXT_PUBLIC_APP_NAME=Discovery
NEXT_PUBLIC_APP_URL=http://localhost:3000

14.3 Glosario de Estados del Sistema

Entidad Estado Descripción

Project PENDING Proyecto creado; sin técnicos asignados o sin evidencias
subidas

Project IN_PROGRESS Al menos un técnico asignado y al menos una evidencia
subida

Project COMPLETED 100% de requisitos obligatorios con evidencia
APPROVED

Project ARCHIVED Proyecto histórico; solo lectura, no permite nuevas
evidencias

Evidence PENDING Subida por el técnico; esperando revisión del Admin

Evidence APPROVED Revisada y aprobada por un Admin

Evidence REJECTED Rechazada; el técnico debe subir una nueva versión

14.4 Historial de Versiones del Documento

Versión Fecha Autor Descripción del Cambio

1.0 2025 Equipo Electsun Versión inicial del SRS

2.0 2025 Equipo Electsun Versión completa: esquema BD, auth, errores,
setup, componentes

