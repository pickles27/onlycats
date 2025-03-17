import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await sql`
      SELECT post_id, image_url, created_at, likes
      FROM Post
      ORDER BY created_at DESC
      LIMIT 100;
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
