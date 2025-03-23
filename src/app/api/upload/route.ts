import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";

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
    const buffer = Buffer.from(arrayBuffer);

    const validationResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/validate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: buffer,
      }
    );
    const validationResult = await validationResponse.json();
    if (!validationResponse.ok) {
      return NextResponse.json(
        { error: validationResult.error || "Image validation failed" },
        { status: 400 }
      );
    }

    const blob = bucket.file(`cats/${randomUUID()}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.type,
      },
    });

    await new Promise<void>((resolve, reject) => {
      blobStream.on("error", (error) => reject(error));
      blobStream.on("finish", () => resolve());
      blobStream.end(buffer);
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    const createdAt = new Date().toISOString();
    const likes = 0;

    await sql`
      INSERT INTO Post (created_at, image_url, likes, caption)
      VALUES (${createdAt}, ${publicUrl}, ${likes}, ${validationResult.caption});
    `;

    return NextResponse.json({ fileUrl: publicUrl }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error handling upload: " + (error as Error).message },
      { status: 500 }
    );
  }
}
