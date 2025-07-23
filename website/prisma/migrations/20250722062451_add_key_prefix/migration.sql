/*
  Warnings:

  - A unique constraint covering the columns `[keyPrefix]` on the table `APIKey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keyPrefix` to the `APIKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "APIKey" ADD COLUMN     "keyPrefix" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "APIKey_keyPrefix_key" ON "APIKey"("keyPrefix");
