
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/prisma";
import { randomBytes, createHash } from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rawKey = randomBytes(32).toString("hex");
  const keyHash = createHash("sha256").update(rawKey).digest("hex");

  const newKey = await prisma.aPIKey.create({
    data: {
      keyHash,
      userId: user.id,
    },
  });

  // Show actual key once to user
  return NextResponse.json({ apiKey: rawKey });
}
