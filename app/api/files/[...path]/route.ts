import { NextRequest, NextResponse } from "next/server";
import { minioClient } from "@/lib/minio";

/**
 * Proxy route to serve MinIO files through Next.js,
 * avoiding CORS/ORB issues from direct browser→MinIO access.
 * 
 * Usage: /api/files/[bucket]/[...key]
 * Example: /api/files/discovery-resources/covers/abc123.jpg
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const resolvedParams = await params;
        const pathParts = resolvedParams.path;

        if (!pathParts || pathParts.length < 2) {
            return NextResponse.json({ error: "Missing bucket/key" }, { status: 400 });
        }

        const bucket = pathParts[0];
        const key = pathParts.slice(1).join("/");

        const stream = await minioClient.getObject(bucket, key);

        // Collect stream into buffer
        const chunks: Uint8Array[] = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Infer content type from extension
        const ext = key.split(".").pop()?.toLowerCase() || "";
        const contentTypes: Record<string, string> = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            gif: "image/gif",
            webp: "image/webp",
            svg: "image/svg+xml",
            pdf: "application/pdf",
            mp4: "video/mp4",
            mp3: "audio/mpeg",
            wav: "audio/wav",
            txt: "text/plain",
        };
        const contentType = contentTypes[ext] || "application/octet-stream";

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600, immutable",
            },
        });
    } catch (error: any) {
        console.error("[FILE PROXY ERROR]:", error?.message || error);
        if (error?.code === "NoSuchKey" || error?.code === "NoSuchBucket") {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
