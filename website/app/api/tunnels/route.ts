
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

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
