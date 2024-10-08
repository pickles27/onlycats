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

interface ParsedFile {
  filename: string;
  mimeType: string;
  buffer: Buffer;
}

interface ParsedData {
  [key: string]: ParsedFile | string;
}

const parseMultipart = (buffer: Buffer, boundary: string): ParsedData => {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const result: ParsedData = {};
  let currentIndex = buffer.indexOf(boundaryBuffer);

  while (currentIndex !== -1) {
    const startIndex = currentIndex + boundaryBuffer.length;
    const endIndex = buffer.indexOf(boundaryBuffer, startIndex);
    if (endIndex === -1) {
      break;
    }

    const part = buffer.subarray(startIndex, endIndex).toString();
    const headerEndIndex = part.indexOf("\r\n\r\n");
    if (headerEndIndex === -1) {
      currentIndex = endIndex;
      continue;
    }

    const header = part.slice(0, headerEndIndex);
    const body = buffer.subarray(
      currentIndex + boundaryBuffer.length + headerEndIndex + 4,
      startIndex
    );

    const nameMatch = header.match(/name="([^"]+)"/);
    const filenameMatch = header.match(/filename="([^"]+)"/);
    const contentTypeMatch = header.match(/Content-Type: (.+)/);

    if (nameMatch) {
      const name = nameMatch[1];
      if (filenameMatch) {
        const filename = filenameMatch[1];
        const mimeType = contentTypeMatch
          ? contentTypeMatch[1]
          : "application/octet-stream";

        result[name] = { filename, mimeType, buffer: body };
      } else {
        result[name] = body.toString();
      }
    }

    currentIndex = startIndex;
  }

  return result;
};

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type");
    if (!contentType) {
      return NextResponse.json(
        { message: "Content type not found." },
        { status: 400 }
      );
    }

    const boundary = contentType.split("=")[1];
    const buffer = Buffer.from(await req.arrayBuffer());
    const parsedData = parseMultipart(buffer, boundary);

    if (!parsedData.image || !(parsedData.image as ParsedFile).buffer) {
      return NextResponse.json(
        { message: "No image file found in the request." },
        { status: 400 }
      );
    }

    const imageFile = parsedData.image as ParsedFile;

    const blob = bucket.file(`cats/${randomUUID()}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: imageFile.mimeType,
      },
    });

    await new Promise<void>((resolve, reject) => {
      blobStream.on("error", (error) => {
        reject(error);
      });

      blobStream.on("finish", () => {
        resolve();
      });

      blobStream.end(imageFile.buffer);
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    const createdAt = new Date().toISOString();
    const likes = 0;

    await sql`
      INSERT INTO Post (created_at, image_url, likes)
      VALUES (${createdAt}, ${publicUrl}, ${likes});
    `;

    return NextResponse.json({ fileUrl: publicUrl });
  } catch (error) {
    return NextResponse.json(
      { message: "Error handling upload: " + (error as Error).message },
      { status: 500 }
    );
  }
}
