import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";

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

    const blob = bucket.file(`cats/${randomUUID()}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.type,
      },
    });
    const buffer = Buffer.from(await file.arrayBuffer());

    await new Promise<void>((resolve, reject) => {
      blobStream.on("error", (error) => reject(error));
      blobStream.on("finish", () => resolve());
      blobStream.end(buffer);
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    const createdAt = new Date().toISOString();
    const likes = 0;

    await sql`
      INSERT INTO Post (created_at, image_url, likes)
      VALUES (${createdAt}, ${publicUrl}, ${likes});
    `;

    return NextResponse.json({ fileUrl: publicUrl }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error handling upload: " + (error as Error).message },
      { status: 500 }
    );
  }
}
