import { NextResponse, after } from "next/server";
import { Storage } from "@google-cloud/storage";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { validateImage, ImageValidationError } from "@/lib/imageValidation";
import { isUploadRateLimited } from "@/lib/rateLimit";
import { sendErrorAlert } from "@/lib/errorAlert";

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
        { error: "No file uploaded 😿" },
        { status: 400 }
      );
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded?.split(",")[0]?.trim() || "unknown";

    // Skip when no IP is available (e.g. local dev) — on Vercel,
    // x-forwarded-for is always set
    if (ipAddress !== "unknown" && (await isUploadRateLimited(ipAddress))) {
      return NextResponse.json(
        { error: "Too many uploads — give the automod a breather 😼" },
        { status: 429 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    const validationResult = await validateImage(arrayBuffer);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const [publicUrl, blurDataUrl] = await Promise.all([
      uploadToBucket(arrayBuffer),
      getBlurDataUrl(arrayBuffer),
    ]);

    await savePostToDatabase(
      publicUrl,
      validationResult.caption,
      blurDataUrl,
      ipAddress
    );

    return NextResponse.json({ fileUrl: publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Error handling upload:", error);

    if (error instanceof ImageValidationError) {
      // Already alerted inside imageValidation; message is user-safe
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    after(() => sendErrorAlert("upload handling", error));
    return NextResponse.json(
      { error: "Something went wrong while uploading 😿" },
      { status: 500 }
    );
  }
}

async function uploadToBucket(arrayBuffer: ArrayBuffer) {
  const blob = bucket.file(`cats/${randomUUID()}`);
  const blobStream = blob.createWriteStream({
    resumable: false,
    // convertToJpeg always re-encodes, regardless of the uploaded type
    metadata: { contentType: "image/jpeg" },
  });
  const buffer = await convertToJpeg(Buffer.from(arrayBuffer));

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
  blurDataUrl: string,
  ipAddress: string
) {
  const createdAt = new Date().toISOString();
  const likes = 0;

  await sql`
    INSERT INTO Post (created_at, image_url, likes, caption, blur_data_url, ip_address)
    VALUES (${createdAt}, ${imageUrl}, ${likes}, ${caption}, ${blurDataUrl}, ${ipAddress});
  `;
}

const getBlurDataUrl = async (arrayBuffer: ArrayBuffer) => {
  const buffer = Buffer.from(arrayBuffer);
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
