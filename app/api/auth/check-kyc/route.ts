import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
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
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // For SURVEYOR users, check KYC status
    if (user.role === "SURVEYOR") {
      return NextResponse.json(
        {
          hasKYC: !!user.kyc,
          role: user.role,
        },
        { status: 200 }
      );
    }

    // For ADMIN and MANAGER, KYC is not required
    return NextResponse.json(
      {
        hasKYC: null,
        role: user.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("KYC check error:", error);
    return NextResponse.json(
      { error: "Failed to check KYC status" },
      { status: 500 }
    );
  }
}
