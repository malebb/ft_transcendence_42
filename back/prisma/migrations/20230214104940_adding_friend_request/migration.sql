-- CreateEnum
CREATE TYPE "Status" AS ENUM ('pending', 'accepted', 'declined');

-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" SERIAL NOT NULL,
    "status" "Status" NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);
