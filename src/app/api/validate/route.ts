import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

export const maxDuration = 20;

const huggingface = new HfInference(process.env.HUGGINGFACE_API_KEY as string);

export async function POST(request: Request) {
  try {
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isFlagged = await getIsFlagged(buffer);
    if (isFlagged) {
      return NextResponse.json(
        { error: "Image flagged as inappropriate" },
        { status: 400 }
      );
    }

    const isCat = await getIsCat(buffer);
    if (!isCat) {
      return NextResponse.json(
        { error: "Uploaded image is not a cat" },
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

async function getIsCat(imageBuffer: Buffer): Promise<boolean> {
  const results = await huggingface.imageClassification({
    model: "google/vit-base-patch16-224",
    data: imageBuffer,
  });

  console.log("results from getIsCat image classification: ", results);

  const catResult = results.find(
    (result) =>
      result.label.toLowerCase().includes("cat") && result.score > 0.15
  );
  return catResult !== undefined;
}

async function getIsFlagged(imageBuffer: Buffer): Promise<boolean> {
  const results = await huggingface.imageClassification({
    model: "Falconsai/nsfw_image_detection",
    data: imageBuffer,
  });

  console.log("results from getIsFlagged image classification: ", results);

  const nsfwScore = results[1].score;
  return nsfwScore > 0.1;
}
