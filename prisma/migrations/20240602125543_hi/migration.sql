-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "likes" SET DEFAULT 0,
ALTER COLUMN "isSold" SET DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isVerified" SET DEFAULT false;
