import * as Minio from "minio";

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT!,
    port: parseInt(process.env.MINIO_PORT!, 10),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY!,
    secretKey: process.env.MINIO_SECRET_KEY!,
});

export async function getSignedUrl(
    bucket: string,
    key: string,
    expirySeconds = 3600
): Promise<string> {
    return minioClient.presignedGetObject(bucket, key, expirySeconds);
}

export async function ensureBucketExists(bucket: string): Promise<void> {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
        await minioClient.makeBucket(bucket);
        console.log(`[MINIO] Bucket "${bucket}" created automatically.`);
    }
}

export async function uploadFile(
    bucket: string,
    key: string,
    buffer: Buffer,
    contentType: string
): Promise<string> {
    await ensureBucketExists(bucket);
    await minioClient.putObject(bucket, key, buffer, buffer.length, {
        "Content-Type": contentType,
    });
    return key;
}
