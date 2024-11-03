import { NextResponse, NextRequest } from "next/server";
import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";
import { extractPublicId } from "cloudinary-build-url";
import { UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" });
    }

    const { email } = session.user;

    const result = await sql`
      SELECT first_name, last_name, email, subscription_plan, profile_photo_url 
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

export async function DELETE() {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" });
    }

    const { email } = session.user;

    const result = await sql`
      SELECT profile_photo_url FROM users WHERE email = ${email}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "User not found" });
    }

    const profilePhotoUrl = result.rows[0].profile_photo_url;

    if (profilePhotoUrl) {
      const publicId = extractPublicId(profilePhotoUrl);
      await cloudinary.uploader.destroy(publicId);
    }

    await sql`
      DELETE FROM users
      WHERE email = ${email}
    `;

    return NextResponse.json({ message: "Account deleted successfully." });
  } catch (error) {
    return NextResponse.json({ message: "Server side error." });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" });
    }

    const { email } = session.user;

    const formData = await request.formData();
    const imageFile = formData.get("image");

    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json({ message: "No image file provided" });
    }

    const currentUserResult = await sql`
      SELECT profile_photo_url FROM users WHERE email = ${email}
    `;
    const currentProfilePhotoUrl = currentUserResult.rows[0]?.profile_photo_url;

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult: UploadApiResponse = await new Promise(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as UploadApiResponse);
          }
        );
        stream.end(buffer);
      }
    );

    const imageUrl = uploadResult.secure_url;

    if (currentProfilePhotoUrl) {
      const publicId = extractPublicId(currentProfilePhotoUrl);
      await cloudinary.uploader.destroy(publicId);
    }

    await sql`
      UPDATE users
      SET profile_photo_url = ${imageUrl}
      WHERE email = ${email}
    `;

    return NextResponse.json({
      message: "Profile photo updated",
      profile_photo_url: imageUrl,
    });
  } catch (error) {
    return NextResponse.json({ message: "Server side error." });
  }
}
