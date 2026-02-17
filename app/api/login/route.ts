import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Login validation error:", validationResult.error.errors);
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email (include KYC for SURVEYOR users)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        kyc: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      console.log(`Login attempt with non-existent email: ${email}`);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user has a password (for users created via OAuth, etc.)
    if (!user.password) {
      console.log(`Login attempt for user without password: ${email}`);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`Invalid password attempt for: ${email}`);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log(`User logged in successfully: ${user.email} (${user.role})`);
    
    // Check KYC status for SURVEYOR users
    const hasKYC = user.role === "SURVEYOR" ? !!user.kyc : null;
    
    // Return user data (excluding password)
    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        role: user.role,
        hasKYC: hasKYC, // null for non-SURVEYOR, true/false for SURVEYOR
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to login" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
