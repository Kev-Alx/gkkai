import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files received" }, { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (!file.size) continue;

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.name);
      const fileName = `${timestamp}-${randomString}${fileExtension}`;

      // Create upload directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      // Return the public URL
      const fileUrl = `/uploads/${fileName}`;

      uploadedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        originalName: file.name,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
