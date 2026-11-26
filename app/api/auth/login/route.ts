import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email aur password dono zaroori hain." },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "User nahi mila. Email check karein." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(String(password), staff.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Galat password! Dobara try karein." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Login failed. Database connection check karein." },
      { status: 500 }
    );
  }
}
