import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email"; // Adjust the import path based on your alias

export async function POST(request: Request) {
  try {
    const { to, name } = await request.json();

    if (!to || !name) {
      return NextResponse.json(
        { error: "Missing required fields: to, name" },
        { status: 400 }
      );
    }

    await sendWelcomeEmail(to, name);

    return NextResponse.json({ message: "Welcome email sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}