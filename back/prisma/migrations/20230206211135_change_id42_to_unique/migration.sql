/*
  Warnings:

  - A unique constraint covering the columns `[id42]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_id42_key" ON "users"("id42");
