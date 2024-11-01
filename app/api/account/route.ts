import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" });
    }

    const { email } = session.user;

    const result = await sql`
      SELECT first_name, last_name, email, subscription_plan 
      FROM users 
      WHERE email = ${email}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "User not found" });
    }

    const user = result.rows[0];

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: "Server side error." });
  }
}
