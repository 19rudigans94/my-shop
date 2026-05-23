import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

let _s3 = null;
let _endpoint = null;
let _bucket = null;

function getS3Client() {
  if (_s3) return _s3;

  _endpoint = process.env.PSCLOUD_ENDPOINT;
  _bucket = process.env.PSCLOUD_BUCKET;
  const region = process.env.PSCLOUD_REGION;
  const s3ApiEndpoint = _endpoint.replace(`${_bucket}.`, "");

  _s3 = new S3Client({
    endpoint: s3ApiEndpoint,
    region,
    credentials: {
      accessKeyId: process.env.PSCLOUD_ACCESS_KEY,
      secretAccessKey: process.env.PSCLOUD_SECRET_KEY,
    },
    forcePathStyle: true,
  });

  return _s3;
}

export async function uploadFileToS3(buffer, key, contentType) {
  const s3 = getS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: _bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read",
    })
  );
  return `${_endpoint}/${key}`;
}

export async function deleteFileFromS3(url) {
  const s3 = getS3Client();
  const key = url.replace(`${_endpoint}/`, "");
  await s3.send(new DeleteObjectCommand({ Bucket: _bucket, Key: key }));
}

// Удаляет несколько файлов из PSCloud; ошибки по отдельным файлам не прерывают операцию
export async function deleteImagesFromS3(urls = []) {
  const endpoint = process.env.PSCLOUD_ENDPOINT;
  const ours = urls.filter((u) => u && u.startsWith(endpoint));
  await Promise.allSettled(ours.map((url) => deleteFileFromS3(url)));
}
