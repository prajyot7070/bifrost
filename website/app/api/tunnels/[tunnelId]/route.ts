// /api/tunnels/[tunnelId]/route.ts
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
    return NextResponse.json({ error: "Tunnel ID is missing" }, { status: 400 });
  }

  try {
    const tunnel = await prisma.tunnel.findUnique({
      where: { clientId:  clientId  },
    });

    if (!tunnel || tunnel.userId !== userId) {
      return NextResponse.json({ error: "Tunnel not found or unauthorized" }, { status: 404 });
    }

    await prisma.tunnel.update({
      where: { id: tunnelId },
      data: { isActive: false },
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error("Error deactivating tunnel:", error);
    return NextResponse.json({ error: "Failed to deactivate tunnel" }, { status: 500 });
  }
}
