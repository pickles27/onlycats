import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
  try {
    const result = await sql`
      SELECT post_id, image_url, created_at, likes, caption
      FROM Post
      ORDER BY created_at DESC;
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
