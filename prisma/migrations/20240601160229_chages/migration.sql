/*
  Warnings:

  - The values [FASHION,HOME_APPLIANCES] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[enrollmentNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('ELECTRONICS', 'COOLER', 'BOOKS', 'MATTRESS', 'OTHERS');
ALTER TABLE "Product" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "Category_old";
COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "User_enrollmentNumber_key" ON "User"("enrollmentNumber");
