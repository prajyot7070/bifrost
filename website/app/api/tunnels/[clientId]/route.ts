// /api/tunnels/[clientId]/route.ts

import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { prisma } from "@/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { clientId: string } }
) {
  const authHeader = req.headers.get("authorization");
  const result = await validateApiKey(authHeader);

  if (!result) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId } = params;
  const { userId } = result;

  if (!clientId) {
    return NextResponse.json({ error: "Client ID is missing" }, { status: 400 });
  }

  try {
    // Find the tunnel using the clientId, not the primary key
    const tunnel = await prisma.tunnel.findFirst({
      where: { clientId: clientId },
    });

    // The ownership check remains the same and is very important
    if (!tunnel || tunnel.userId !== userId) {
      return NextResponse.json({ error: "Tunnel not found or unauthorized" }, { status: 404 });
    }

    // Update the record using its primary key (tunnel.id)
    await prisma.tunnel.update({
      where: { id: tunnel.id },
      data: { isActive: false },
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error("Error deactivating tunnel:", error);
    return NextResponse.json({ error: "Failed to deactivate tunnel" }, { status: 500 });
  }
}
