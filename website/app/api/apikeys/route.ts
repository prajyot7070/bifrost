
import bcrypt from "bcrypt";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/prisma";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

//get new apikey and delete the old one
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rawSecret = randomBytes(32).toString("hex");
  const fullApiKey = `sk-bifrost-${rawSecret}`;
  const keyPrefix = rawSecret.slice(0, 10); // used for DB lookup
  const keyHash = await bcrypt.hash(fullApiKey, 10);

  try {
    // delete old keys for user
    await prisma.aPIKey.deleteMany({ where: { userId: user.id } });

    // store new key with prefix
    const newKey = await prisma.aPIKey.create({
      data: {
        keyPrefix,
        keyHash,
        userId: user.id,
        isActive: true,
      }
    });

    return NextResponse.json({ apiKey: fullApiKey }); // Show full key only once
  } catch (error) {
    console.error("Error generating API key:", error);
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 });
  }
}

