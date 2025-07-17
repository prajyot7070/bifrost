
// lib/getCurrentUser.ts
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    return user;
  } catch {
    return null;
  }
}
