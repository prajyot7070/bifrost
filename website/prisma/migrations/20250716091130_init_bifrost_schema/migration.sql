-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "name" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APIKey" (
    "id" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "APIKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tunnel" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "localPort" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActivity" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "Tunnel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "APIKey_keyHash_key" ON "APIKey"("keyHash");

-- CreateIndex
CREATE UNIQUE INDEX "APIKey_userId_keyHash_key" ON "APIKey"("userId", "keyHash");

-- CreateIndex
CREATE UNIQUE INDEX "Tunnel_clientId_key" ON "Tunnel"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Tunnel_subdomain_key" ON "Tunnel"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "Tunnel_publicUrl_key" ON "Tunnel"("publicUrl");

-- AddForeignKey
ALTER TABLE "APIKey" ADD CONSTRAINT "APIKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tunnel" ADD CONSTRAINT "Tunnel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
