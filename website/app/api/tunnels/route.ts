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
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");
    const result = await validateApiKey(authHeader);
    if (!result) {
      return NextResponse.json({error: "Unauthorized"},{status: 401});
    }
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
        userId: user.id,
        lastActivity: new Date(lastActivity),
      },
    });
    return NextResponse.json({ tunnel: newTunnel }, { status: 201 });
  } catch (error) {
    console.error("Error creating tunnel:", error);
    return NextResponse.json({ error: "Failed to create tunnel" }, { status: 500 });
  }
}


//Delete tunnel
export async function DELETE(req: Request) {
  const authHeader = req.headers.get("authorization");
    const result = await validateApiKey(authHeader);
    if (!result) {
      return NextResponse.json({error: "Unauthorized"},{status: 401});
    }  
  const { tunnelId } = await req.json();
  const { userId } = result;
  try {
    // Check ownership before deletion
    const tunnel = await prisma.tunnel.findUnique({
      where: { id: tunnelId },
    });
    if (!tunnel || tunnel.userId !== userId) {
      return NextResponse.json({ error: "Tunnel not found or unauthorized" }, { status: 404 });
    }
    await prisma.tunnel.delete({
      where: { id: tunnelId },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting tunnel:", error);
    return NextResponse.json({ error: "Failed to delete tunnel" }, { status: 500 });
  }
}

