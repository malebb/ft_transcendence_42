/*
  Warnings:

  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Activity" AS ENUM ('ONLINE', 'OFFLINE', 'IN_GAME');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "status",
ADD COLUMN     "status" "Activity" NOT NULL DEFAULT 'OFFLINE';
