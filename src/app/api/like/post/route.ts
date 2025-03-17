import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { postId } = await request.json();

    const { rows } = await sql`
      UPDATE post
      SET likes = likes + 1
      WHERE post_id = ${postId}
      RETURNING likes
    `;

    return NextResponse.json({
      status: 200,
      updatedLikes: rows[0]?.likes ?? 0,
    });
  } catch (error) {
    console.error("error during like: ", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
