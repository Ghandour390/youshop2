/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "role" AS ENUM ('CLIENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'expired');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "status" "status" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "total" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "role" DEFAULT 'CLIENT';

-- DropEnum
DROP TYPE "Role";
