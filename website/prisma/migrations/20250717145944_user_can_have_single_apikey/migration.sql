/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `APIKey` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "APIKey_userId_key" ON "APIKey"("userId");
