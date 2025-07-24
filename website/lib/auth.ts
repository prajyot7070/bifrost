import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "@/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}

export async function validateApiKey(authorizationHeader: string | null) {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) return null; 
  const rawKey = authorizationHeader.replace("Bearer ","").trim();
  const keySecret = rawKey.replace("sk-bifrost-","");
  const keyPrefix = keySecret.slice(0, 10);
  const keyRecord = await prisma.aPIKey.findFirst({
    where: { keyPrefix }
  });
  if (!keyRecord || !keyRecord.isActive) return null;
  const isValid = await bcrypt.compare(rawKey, keyRecord.keyHash);
  if (!isValid) return null;
  return { userId: keyRecord.userId };
}
