import bcrypt from "bcrypt";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/prisma";
import { randomBytes, createHash } from "crypto";
import { NextResponse } from "next/server";
import { prefetchDNS } from "react-dom";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rawKey = randomBytes(32).toString("hex");
  const prefix = "sk-bifrost-";
  const fullApiKey = prefix + rawKey;
  const keyHash = await bcrypt.hash(fullApiKey, 10);
  try {
    //delete prev apiKey
    await prisma.aPIKey.deleteMany({
      where: {
        userId: user.id,
      }
    });
    //create new key
    const newKeyRecord = await prisma.aPIKey.create({
      data: {
        keyHash: keyHash,
        userId: user.id,
        isActive: true,
      }
    })
  } catch (error) {
    console.error("Error generating or storing the API key:", error);
    return NextResponse.json({ error: "Failed to generate API key"});
  }
  // Show actual key once to user
  return NextResponse.json({ apiKey: rawKey });
}
