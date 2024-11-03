import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { v2 as cloudinary } from "cloudinary";
import { extractPublicId } from "cloudinary-build-url";
import { getServerSession } from "next-auth/next";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!request.body) {
      throw new Error("Request body is null");
    }

    const formData = await request.formData();
    const url = formData.get("url") as string;
    const imageFile = formData.get("image") as string;
    const country = formData.get("country") as string;

    const dataToSend = url ? { url } : { image: imageFile };

    if (!session) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }

    const response = await fetch("https://c263-2405-201-34-b121-6c23-82ad-245f-9a44.ngrok-free.app/api/segment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });

    const images = (await response.json()) as Record<string, string>;

    const data: Record<string, any> = {};
    for (const key in images) {
      const image = images[key];
      const res = await cloudinary.uploader.upload(
        `data:image/png;base64,${image}`
      );
      const imageUrl = res.secure_url;

      let serpApiUrl = `https://serpapi.com/search.json?engine=google_lens&url=${imageUrl}&api_key=${process.env.SERP_API_KEY}`;

      if (country) {
        serpApiUrl += `&country=${country}`;
      }

      const serpApiResponse = await fetch(serpApiUrl);
      const serpApiData = await serpApiResponse.json();

      data[key] = serpApiData;

      const publicId = extractPublicId(imageUrl);
      await cloudinary.uploader.destroy(publicId);
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Server side error." });
  }
}
