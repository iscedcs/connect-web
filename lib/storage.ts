"use server";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || "",
    secretAccessKey: process.env.DO_SPACES_SECRET || "",
  },
});

const BUCKET_NAME = process.env.DO_SPACES_BUCKET || "";

export async function uploadFile(
  file: File,
  folder = process.env.DO_SPACES_DOCS_PREFIX
) {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${folder}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read",
    });

    await s3Client.send(command);

    const fileUrl = `${process.env.DO_SPACES_ENDPOINT}/${BUCKET_NAME}/${key}`;

    return { success: true, url: fileUrl, key: key, error: null };
  } catch (error) {
    console.error(" Error uploading file:", error);
    return {
      success: false,
      url: null,
      key: null,
      error: "Failed to upload file",
    };
  }
}

export async function deleteFile(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    return { success: true, error: null };
  } catch (error) {
    console.error(" Error deleting file:", error);
    return { success: false, error: "Failed to delete file" };
  }
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return { success: true, url, error: null };
  } catch (error) {
    console.error(" Error generating signed URL:", error);
    return {
      success: false,
      url: null,
      error: "Failed to generate download URL",
    };
  }
}
