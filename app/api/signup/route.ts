import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "manager", "surveyor"], {
    errorMap: () => ({ message: "Role must be admin, manager, or surveyor" }),
  }),
});

const RoleEnum = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SURVEYOR: "SURVEYOR",
} as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Signup request received:", { 
      hasName: !!body.name, 
      hasEmail: !!body.email, 
      hasPassword: !!body.password, 
      hasRole: !!body.role,
      role: body.role 
    });
    
    // Validate input
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors);
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validationResult.data;

    // Verify database connection
    try {
      await prisma.$connect();
    } catch (connectionError) {
      console.error("Database connection error:", connectionError);
      return NextResponse.json(
        { error: "Database connection failed. Please check your database configuration." },
        { status: 500 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`Signup attempt with existing email: ${email}`);
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Map role to uppercase enum value (role is already validated as lowercase)
    const roleUpper = role.toUpperCase() as "ADMIN" | "MANAGER" | "SURVEYOR";
    
    // Validate role is one of the enum values
    if (!["ADMIN", "MANAGER", "SURVEYOR"].includes(roleUpper)) {
      console.error(`Invalid role provided: ${role} -> ${roleUpper}`);
      return NextResponse.json(
        { error: "Invalid role. Must be admin, manager, or surveyor" },
        { status: 400 }
      );
    }

    console.log(`Creating user with data:`, { name, email, role: roleUpper });

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: roleUpper,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log(`User created successfully: ${user.email} (${user.role})`);
    return NextResponse.json(
      { 
        message: "User created successfully",
        user 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : typeof error,
    });
    
    // Handle Prisma errors
    if (error instanceof Error) {
      // Check for unique constraint violation
      if (error.message.includes("Unique constraint") || error.message.includes("Unique violation")) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }
      
      // Check for Prisma client errors
      if (error.message.includes("P2002")) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }
      
      // Return detailed error in development, generic in production
      const errorMessage = process.env.NODE_ENV === "development" 
        ? error.message 
        : "Failed to create user. Please try again.";
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during signup" },
      { status: 500 }
    );
  }
}
