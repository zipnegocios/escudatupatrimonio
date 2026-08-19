import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { MediaStorage } from "@/core/ports/media-storage";
import { env } from "@/infrastructure/config/env";

function requireR2Config(): {
  client: S3Client;
  bucket: string;
} {
  if (
    !env.R2_ACCOUNT_ID ||
    !env.R2_ACCESS_KEY_ID ||
    !env.R2_SECRET_ACCESS_KEY ||
    !env.R2_BUCKET ||
    !env.R2_ENDPOINT
  ) {
    throw new Error(
      "R2 no está configurado (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_ENDPOINT).",
    );
  }

  // R2 es compatible con S3 — "auto" es la región que espera Cloudflare acá.
  const client = new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });

  return { client, bucket: env.R2_BUCKET };
}

export class R2MediaStorage implements MediaStorage {
  async upload(key: string, data: Buffer, contentType: string): Promise<void> {
    const { client, bucket } = requireR2Config();
    await client.send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: data, ContentType: contentType }),
    );
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const { client, bucket } = requireR2Config();
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  }
}
