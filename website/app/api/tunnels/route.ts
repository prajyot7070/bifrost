import bcrypt from "bcrypt";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { validateApiKey } from "@/lib/auth";

//get list of tunnels 
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tunnels = await prisma.tunnel.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  console.log(tunnels);

  return NextResponse.json({ tunnels });
}

//add a tunnel
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const validationResult = await validateApiKey(authHeader);

    // If API key is invalid, validationResult will be null
    if (!validationResult) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
    }
    
    // The userId comes from the validated API key
    const { userId } = validationResult;

    const body = await req.json();
    const {
      clientId,
      subdomain,
      publicUrl,
      localPort,
      lastActivity,
    } = body;

    if (!clientId || !subdomain || !publicUrl || !localPort) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    const newTunnel = await prisma.tunnel.create({
      data: {
        clientId,
        subdomain,
        publicUrl,
        localPort,
        userId: userId, // Use the ID from the validated key
        lastActivity: new Date(lastActivity),
      },
    });
    return NextResponse.json({ tunnel: newTunnel }, { status: 201 });
  } catch (error) {
    console.error("Error creating tunnel:", error);
    return NextResponse.json({ error: "Failed to create tunnel" }, { status: 500 });
  }
}

