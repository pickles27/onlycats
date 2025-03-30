import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";
import sharp from "sharp";

export const maxDuration = 30;

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.split(
      String.raw`\n`
    ).join("\n"),
  },
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
const bucket = storage.bucket(bucketName!);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file || !file.name) {
      return NextResponse.json(
        { message: "No file uploaded." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = await convertToJpeg(Buffer.from(arrayBuffer));

    const validationResult = await validateImage(buffer);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const publicUrl = await uploadToBucket(buffer, file.type);
    const blurDataUrl = await getBlurDataUrl(buffer);

    await savePostToDatabase(publicUrl, validationResult.caption, blurDataUrl);

    return NextResponse.json({ fileUrl: publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Error handling upload:", error);
    return NextResponse.json(
      { message: "Error handling upload: " + (error as Error).message },
      { status: 500 }
    );
  }
}

async function validateImage(buffer: Buffer) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/validate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: buffer,
      }
    );
    const result = await response.json();
    return response.ok
      ? { success: true, caption: result.caption }
      : { success: false, error: result.error };
  } catch (error) {
    console.error("Error during image validation:", error);
    throw new Error("Image validation failed");
  }
}

async function uploadToBucket(buffer: Buffer, contentType: string) {
  const blob = bucket.file(`cats/${randomUUID()}`);
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: { contentType },
  });

  await new Promise<void>((resolve, reject) => {
    blobStream.on("error", reject);
    blobStream.on("finish", resolve);
    blobStream.end(buffer);
  });

  return `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
}

async function savePostToDatabase(
  imageUrl: string,
  caption: string,
  blurDataUrl: string
) {
  const createdAt = new Date().toISOString();
  const likes = 0;

  await sql`
    INSERT INTO Post (created_at, image_url, likes, caption, blur_data_url)
    VALUES (${createdAt}, ${imageUrl}, ${likes}, ${caption}, ${blurDataUrl});
  `;
}

const getBlurDataUrl = async (buffer: Buffer) => {
  const resizedBuffer = await sharp(buffer)
    .resize({ width: 10, height: 10, fit: "inside" })
    .jpeg({ quality: 30 })
    .toBuffer();
  const base64 = resizedBuffer.toString("base64");
  const mimeType = "image/jpeg";
  const blurDataUrl = `data:${mimeType};base64,${base64}`;
  return blurDataUrl;
};

const convertToJpeg = async (buffer: Buffer) => {
  const processedBuffer = await sharp(buffer)
    .resize({ width: 1024, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  return processedBuffer;
};
