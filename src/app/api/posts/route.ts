import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  const page = pageParam && !isNaN(Number(pageParam)) ? parseInt(pageParam) : 1;
  const limit =
    limitParam && !isNaN(Number(limitParam)) ? parseInt(limitParam) : 10;
  const offset = (page - 1) * limit;

  try {
    const result = await sql`
      SELECT post_id, image_url, created_at, likes, caption, blur_data_url
      FROM Post
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
