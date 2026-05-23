import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const endpoint = process.env.PSCLOUD_ENDPOINT;
const bucket = process.env.PSCLOUD_BUCKET;
const region = process.env.PSCLOUD_REGION;

// PSCloud endpoint for S3 API is the base domain without bucket prefix
const s3ApiEndpoint = endpoint.replace(`${bucket}.`, "");

const s3 = new S3Client({
  endpoint: s3ApiEndpoint,
  region,
  credentials: {
    accessKeyId: process.env.PSCLOUD_ACCESS_KEY,
    secretAccessKey: process.env.PSCLOUD_SECRET_KEY,
  },
  forcePathStyle: true,
});

export async function uploadFileToS3(buffer, key, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read",
    })
  );
  return `${endpoint}/${key}`;
}

export async function deleteFileFromS3(url) {
  const key = url.replace(`${endpoint}/`, "");
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

// Удаляет несколько файлов из PSCloud; ошибки по отдельным файлам не прерывают операцию
export async function deleteImagesFromS3(urls = []) {
  const ours = urls.filter((u) => u && u.startsWith(endpoint));
  await Promise.allSettled(ours.map((url) => deleteFileFromS3(url)));
}
