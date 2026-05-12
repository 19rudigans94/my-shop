import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const PSCLOUD_ENDPOINT = process.env.PSCLOUD_ENDPOINT;
const PSCLOUD_BUCKET = process.env.PSCLOUD_BUCKET;
const PSCLOUD_ACCESS_KEY = process.env.PSCLOUD_ACCESS_KEY;
const PSCLOUD_SECRET_KEY = process.env.PSCLOUD_SECRET_KEY;
const PSCLOUD_REGION = process.env.PSCLOUD_REGION || "ru-central1";
const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
  (PSCLOUD_BUCKET ? `https://${PSCLOUD_BUCKET}.object.pscloud.io` : "");

function validatePsCloudEnv() {
  if (!PSCLOUD_ENDPOINT || !PSCLOUD_BUCKET || !PSCLOUD_ACCESS_KEY || !PSCLOUD_SECRET_KEY) {
    throw new Error(
      "Недостаточно переменных окружения для загрузки изображений в PS Cloud"
    );
  }
}

function createS3Client() {
  validatePsCloudEnv();

  return new S3Client({
    region: PSCLOUD_REGION,
    endpoint: PSCLOUD_ENDPOINT,
    credentials: {
      accessKeyId: PSCLOUD_ACCESS_KEY,
      secretAccessKey: PSCLOUD_SECRET_KEY,
    },
    forcePathStyle: true,
  });
}

export async function uploadToPSCloud(buffer, key, contentType) {
  const client = createS3Client();
  const command = new PutObjectCommand({
    Bucket: PSCLOUD_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);
  return getPublicUrl(key);
}

export async function deleteFromPSCloud(key) {
  const client = createS3Client();
  const command = new DeleteObjectCommand({
    Bucket: PSCLOUD_BUCKET,
    Key: key,
  });
  await client.send(command);
}

export function getPublicUrl(key) {
  const base = IMAGE_BASE_URL.replace(/\/$/, "");
  return `${base}/${key}`;
}
