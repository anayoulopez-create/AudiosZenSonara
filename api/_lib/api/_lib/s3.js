import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

export function bucket() {
  return required('B2_BUCKET');
}

export function client() {
  return new S3Client({
    region: process.env.B2_REGION || 'auto',
    endpoint: required('B2_ENDPOINT'),
    credentials: {
      accessKeyId: required('B2_KEY_ID'),
      secretAccessKey: required('B2_APPLICATION_KEY')
    },
  });
}

export async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export async function getObject(Key) {
  const result = await client().send(new GetObjectCommand({ Bucket: bucket(), Key }));
  return {
    body: await streamToBuffer(result.Body),
    contentType: result.ContentType || 'application/octet-stream'
  };
}

export async function putObject(Key, Body, ContentType = 'application/json; charset=utf-8') {
  await client().send(new PutObjectCommand({ Bucket: bucket(), Key, Body, ContentType }));
}

export async function deleteObject(Key) {
  if (!Key) return;
  try {
    await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key }));
  } catch (error) {
    console.error('No se pudo borrar', Key, error.message);
  }
}

export async function signedPutUrl(Key, ContentType) {
  const command = new PutObjectCommand({ Bucket: bucket(), Key, ContentType: ContentType || 'application/octet-stream' });
  return getSignedUrl(client(), command, { expiresIn: 60 * 10 });
}
