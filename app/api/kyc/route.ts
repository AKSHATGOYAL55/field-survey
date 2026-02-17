import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const kycSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  aadharName: z.string().min(1, "Aadhar name is required").max(255, "Aadhar name is too long"),
  aadharNumber: z.string().min(12, "Aadhar number must be 12 digits").max(12, "Aadhar number must be 12 digits").regex(/^\d+$/, "Aadhar number must contain only digits"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number is too long").regex(/^\d+$/, "Phone number must contain only digits"),
  address: z.string().min(1, "Address is required").max(500, "Address is too long"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("KYC submission request received:", { 
      hasUserId: !!body.userId,
      hasAadharName: !!body.aadharName,
      hasAadharNumber: !!body.aadharNumber,
      hasPhoneNumber: !!body.phoneNumber,
      hasAddress: !!body.address,
    });
    
    // Validate input
    const validationResult = kycSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("KYC validation error:", validationResult.error.errors);
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { userId, aadharName, aadharNumber, phoneNumber, address } = validationResult.data;

    // Verify user exists and is SURVEYOR
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        kyc: true,
      },
    });

    if (!user) {
      console.error(`KYC submission for non-existent user: ${userId}`);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Only SURVEYOR users can submit KYC
    if (user.role !== "SURVEYOR") {
      console.error(`KYC submission attempted by non-SURVEYOR user: ${user.role}`);
      return NextResponse.json(
        { error: "KYC submission is only available for SURVEYOR users" },
        { status: 403 }
      );
    }

    // Check if KYC already exists
    if (user.kyc) {
      console.log(`KYC already exists for user: ${userId}`);
      return NextResponse.json(
        { error: "KYC has already been submitted. You cannot submit it again." },
        { status: 400 }
      );
    }

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

    // Create KYC record
    const kyc = await prisma.kYC.create({
      data: {
        userId,
        aadharName,
        aadharNumber,
        phoneNumber,
        address,
      },
      select: {
        id: true,
        userId: true,
        aadharName: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    console.log(`KYC created successfully for user: ${userId}`);
    return NextResponse.json(
      { 
        message: "KYC submitted successfully",
        kyc 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("KYC submission error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : typeof error,
    });
    
    // Handle Prisma errors
    if (error instanceof Error) {
      // Check for unique constraint violation (userId already has KYC)
      if (error.message.includes("Unique constraint") || error.message.includes("Unique violation")) {
        return NextResponse.json(
          { error: "KYC has already been submitted for this user" },
          { status: 400 }
        );
      }
      
      // Check for Prisma client errors
      if (error.message.includes("P2002")) {
        return NextResponse.json(
          { error: "KYC has already been submitted for this user" },
          { status: 400 }
        );
      }
      
      // Return detailed error in development, generic in production
      const errorMessage = process.env.NODE_ENV === "development" 
        ? error.message 
        : "Failed to submit KYC. Please try again.";
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during KYC submission" },
      { status: 500 }
    );
  }
}

// GET endpoint to check KYC status
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const kyc = await prisma.kYC.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        aadharName: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { 
        exists: !!kyc,
        kyc: kyc || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("KYC status check error:", error);
    return NextResponse.json(
      { error: "Failed to check KYC status" },
      { status: 500 }
    );
  }
}
