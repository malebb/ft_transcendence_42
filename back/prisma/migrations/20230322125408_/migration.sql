-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "privateMessageId" INTEGER;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_privateMessageId_fkey" FOREIGN KEY ("privateMessageId") REFERENCES "PrivateMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
