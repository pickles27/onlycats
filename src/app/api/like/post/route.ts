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

    if (!rows.length) {
      return NextResponse.json(
        { message: "This cat doesn't exist 🙀", status: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      updatedLikes: rows[0].likes,
    });
  } catch (error) {
    console.error("Error during like operation:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
