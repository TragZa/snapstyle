import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { sql } from "@vercel/postgres";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    if (!firstName) {
      return NextResponse.json({ message: "First name cannot be empty" });
    }

    if (!lastName) {
      return NextResponse.json({ message: "Last name cannot be empty" });
    }

    if (!email) {
      return NextResponse.json({ message: "Email cannot be empty" });
    }

    if (!password) {
      return NextResponse.json({ message: "Password cannot be empty" });
    }

    const emailCheck = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (emailCheck.rows.length > 0) {
      return NextResponse.json({ message: "Email already exists" });
    }

    const hashedPassword = await hash(password, 10);

    await sql`
      INSERT INTO users (
        first_name, 
        last_name, 
        email, 
        password, 
        subscription_plan, 
        profile_photo_url
      ) VALUES (
        ${firstName}, 
        ${lastName}, 
        ${email}, 
        ${hashedPassword}, 
        'free', 
        NULL
      )
    `;

    return NextResponse.json({ message: "Success" });
  } catch (e) {
    return NextResponse.json({ message: "Server side error." });
  }
}
