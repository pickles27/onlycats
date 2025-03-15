import { NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";
import OpenAI from "openai";

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#maxduration
export const maxDuration = 20;

const openai = new OpenAI();

export async function POST(request: Request) {
  try {
    const arrayBuffer = await request.arrayBuffer();
    const dataUrl = await getDataUrlByArrayBuffer(arrayBuffer);

    const isFlagged = await getIsFlagged(dataUrl);
    if (isFlagged) {
      return NextResponse.json(
        { error: "Image flagged by automod." },
        { status: 400 }
      );
    }

    const isCat = await getIsCat(dataUrl);
    if (!isCat) {
      return NextResponse.json(
        { error: "That doesn't look like a cat!" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error during image validation:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function getIsCat(dataUrl: string): Promise<boolean> {
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: 'Is there a cat in this image? If so, respond "yes", otherwise respond "no".',
          },
          {
            type: "input_image",
            image_url: dataUrl,
            detail: "low",
          },
        ],
      },
    ],
  });

  console.log("response from image classification: ", response);

  return response.output_text.toLowerCase().includes("yes");
}

async function getIsFlagged(dataUrl: string): Promise<boolean> {
  const response = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: [
      {
        type: "image_url",
        image_url: {
          url: dataUrl,
        },
      },
    ],
  });

  console.log("results from image moderation openai: ", response.results);

  return response.results[0].flagged;
}

async function getDataUrlByArrayBuffer(arrayBuffer: ArrayBuffer) {
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");
  const result = await fileTypeFromBuffer(buffer);
  const mimeType = result?.mime;

  return `data:${mimeType};base64,${base64Image}`;
}
