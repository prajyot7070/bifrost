// app/api/user/route.ts
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      currentTier: true,
      apiKey: {
        where: { isActive: true }, // Fetch only active API keys
        select: { keyHash: true }, // Only return the keyHash, not the plain key!
      },
    },
  });

  if (!userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userApiKey = userData.apiKey 
  ? `sk-bifrost-...${userData.apiKey.keyHash.substring(userData.apiKey.keyHash.length-8)}`
  : null;

  
  return NextResponse.json({
    id: userData.id,
    email: userData.email,
    name: userData.name,
    currentTier: userData.currentTier,
    apiKey: userApiKey, // This will be the placeholder/partial hash
  });
}
