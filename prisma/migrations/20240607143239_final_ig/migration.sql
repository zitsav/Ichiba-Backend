/*
  Warnings:

  - You are about to drop the column `likes` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `ProductLike` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductLike" DROP CONSTRAINT "ProductLike_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductLike" DROP CONSTRAINT "ProductLike_userId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "likes";

-- DropTable
DROP TABLE "ProductLike";
