/*
  Warnings:

  - You are about to drop the `ProductImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProfilePicture` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProfilePicture" DROP CONSTRAINT "ProfilePicture_userId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePicture" TEXT;

-- DropTable
DROP TABLE "ProductImage";

-- DropTable
DROP TABLE "ProfilePicture";
