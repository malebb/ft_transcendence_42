-- CreateEnum
CREATE TYPE "Accessibility" AS ENUM ('PUBLIC', 'PRIVATE', 'PROTECTED');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('pending', 'accepted', 'declined');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id42" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "hashRt" TEXT,
    "TFA" TEXT,
    "isTFA" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT,
    "lastName" TEXT,
    "profilePicture" TEXT,
    "skin" TEXT NOT NULL DEFAULT 'white',
    "map" TEXT NOT NULL DEFAULT 'basic',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "accessibility" "Accessibility" NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" SERIAL NOT NULL,
    "status" "Status" NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stats" (
    "id" SERIAL NOT NULL,
    "defeat" INTEGER NOT NULL DEFAULT 0,
    "victory" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "modeExplorer" BOOLEAN NOT NULL DEFAULT false,
    "fashionWeek" BOOLEAN NOT NULL DEFAULT false,
    "traveler" BOOLEAN NOT NULL DEFAULT false,
    "failureKnowledge" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePlayed" (
    "id" SERIAL NOT NULL,
    "leftUsername" TEXT NOT NULL,
    "rightUsername" TEXT NOT NULL,
    "leftScore" INTEGER NOT NULL,
    "rightScore" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GamePlayed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AchievementDone" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AchievementDone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "gameId" TEXT NOT NULL,
    "leftUsername" TEXT NOT NULL,
    "rightUsername" TEXT NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserAdmin" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UserMember" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_GamePlayedToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id42_key" ON "users"("id42");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_name_key" ON "ChatRoom"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Stats_userId_key" ON "Stats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Game_gameId_key" ON "Game"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "_UserAdmin_AB_unique" ON "_UserAdmin"("A", "B");

-- CreateIndex
CREATE INDEX "_UserAdmin_B_index" ON "_UserAdmin"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserMember_AB_unique" ON "_UserMember"("A", "B");

-- CreateIndex
CREATE INDEX "_UserMember_B_index" ON "_UserMember"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GamePlayedToUser_AB_unique" ON "_GamePlayedToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_GamePlayedToUser_B_index" ON "_GamePlayedToUser"("B");

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stats" ADD CONSTRAINT "Stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AchievementDone" ADD CONSTRAINT "AchievementDone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserAdmin" ADD CONSTRAINT "_UserAdmin_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserAdmin" ADD CONSTRAINT "_UserAdmin_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserMember" ADD CONSTRAINT "_UserMember_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserMember" ADD CONSTRAINT "_UserMember_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GamePlayedToUser" ADD CONSTRAINT "_GamePlayedToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "GamePlayed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GamePlayedToUser" ADD CONSTRAINT "_GamePlayedToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
