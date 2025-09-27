// src/lib/upload.ts
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export type UploadedFile = {
  url: string;
  name: string;
  size: number;
  type: string;
};

// Switch providers by changing only this function
export async function saveFile(file: File): Promise<UploadedFile> {
  // Local filesystem example
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);

  return {
    url: `/uploads/${filename}`,
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

/**
 * Later:
 * - switch to UploadThing SDK
 * - or MinIO client
 * - or S3
 * Just rewrite saveFile() to use new provider
 */
