-- CreateEnum
CREATE TYPE "RestaurantStatus" AS ENUM ('draft', 'pending_review', 'active', 'needs_changes', 'bookings_disabled', 'suspended', 'archived');

-- CreateEnum
CREATE TYPE "BranchStatus" AS ENUM ('open', 'closed', 'temporarily_closed', 'bookings_disabled', 'archived');

-- CreateEnum
CREATE TYPE "SeatingAreaType" AS ENUM ('indoor', 'outdoor', 'family', 'vip', 'smoking', 'non_smoking', 'mixed');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('available', 'reserved', 'occupied', 'waiting_cleaning', 'cleaning', 'blocked', 'out_of_service', 'archived');

-- CreateEnum
CREATE TYPE "RestaurantUserRole" AS ENUM ('owner', 'manager', 'host', 'viewer');

-- CreateEnum
CREATE TYPE "RestaurantOnboardingStatus" AS ENUM ('not_started', 'profile_pending', 'branches_pending', 'tables_pending', 'under_review', 'approved', 'needs_changes');

-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT,
    "slug" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "city" TEXT NOT NULL,
    "area" TEXT,
    "addressText" TEXT,
    "phone" TEXT,
    "status" "RestaurantStatus" NOT NULL,
    "onboardingStatus" "RestaurantOnboardingStatus" NOT NULL,
    "bookingsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "cuisineTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" JSONB,
    "ratingAvg" DECIMAL(4,2),
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "cancellationPolicyAr" TEXT,
    "defaultReservationDurationMinutes" INTEGER NOT NULL DEFAULT 90,
    "defaultGracePeriodMinutes" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT,
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "addressText" TEXT NOT NULL,
    "landmark" TEXT,
    "phone" TEXT,
    "status" "BranchStatus" NOT NULL,
    "bookingsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "defaultHoursAr" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seating_areas" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "branchId" TEXT,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT,
    "type" "SeatingAreaType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seating_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_tables" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "seatingAreaId" TEXT,
    "tableNumber" TEXT NOT NULL,
    "displayNameAr" TEXT,
    "capacityMin" INTEGER NOT NULL DEFAULT 1,
    "capacityMax" INTEGER NOT NULL,
    "status" "TableStatus" NOT NULL,
    "isBookable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "restaurant_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_staff_assignments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "branchId" TEXT,
    "role" "RestaurantUserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_staff_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_slug_key" ON "restaurants"("slug");

-- CreateIndex
CREATE INDEX "restaurants_status_idx" ON "restaurants"("status");

-- CreateIndex
CREATE INDEX "restaurants_city_area_idx" ON "restaurants"("city", "area");

-- CreateIndex
CREATE INDEX "restaurants_bookingsEnabled_idx" ON "restaurants"("bookingsEnabled");

-- CreateIndex
CREATE INDEX "restaurants_isVisible_idx" ON "restaurants"("isVisible");

-- CreateIndex
CREATE INDEX "branches_restaurantId_idx" ON "branches"("restaurantId");

-- CreateIndex
CREATE INDEX "branches_status_idx" ON "branches"("status");

-- CreateIndex
CREATE INDEX "branches_city_area_idx" ON "branches"("city", "area");

-- CreateIndex
CREATE INDEX "branches_bookingsEnabled_idx" ON "branches"("bookingsEnabled");

-- CreateIndex
CREATE INDEX "seating_areas_restaurantId_idx" ON "seating_areas"("restaurantId");

-- CreateIndex
CREATE INDEX "seating_areas_branchId_idx" ON "seating_areas"("branchId");

-- CreateIndex
CREATE INDEX "seating_areas_type_idx" ON "seating_areas"("type");

-- CreateIndex
CREATE INDEX "seating_areas_isActive_idx" ON "seating_areas"("isActive");

-- CreateIndex
CREATE INDEX "restaurant_tables_restaurantId_idx" ON "restaurant_tables"("restaurantId");

-- CreateIndex
CREATE INDEX "restaurant_tables_branchId_idx" ON "restaurant_tables"("branchId");

-- CreateIndex
CREATE INDEX "restaurant_tables_seatingAreaId_idx" ON "restaurant_tables"("seatingAreaId");

-- CreateIndex
CREATE INDEX "restaurant_tables_status_idx" ON "restaurant_tables"("status");

-- CreateIndex
CREATE INDEX "restaurant_tables_isBookable_idx" ON "restaurant_tables"("isBookable");

-- CreateIndex
CREATE INDEX "restaurant_tables_capacityMax_idx" ON "restaurant_tables"("capacityMax");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_tables_branchId_tableNumber_key" ON "restaurant_tables"("branchId", "tableNumber");

-- CreateIndex
CREATE INDEX "restaurant_staff_assignments_userId_idx" ON "restaurant_staff_assignments"("userId");

-- CreateIndex
CREATE INDEX "restaurant_staff_assignments_restaurantId_idx" ON "restaurant_staff_assignments"("restaurantId");

-- CreateIndex
CREATE INDEX "restaurant_staff_assignments_branchId_idx" ON "restaurant_staff_assignments"("branchId");

-- CreateIndex
CREATE INDEX "restaurant_staff_assignments_role_idx" ON "restaurant_staff_assignments"("role");

-- CreateIndex
CREATE INDEX "restaurant_staff_assignments_isActive_idx" ON "restaurant_staff_assignments"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_staff_assignments_userId_restaurantId_role_branc_key" ON "restaurant_staff_assignments"("userId", "restaurantId", "role", "branchId");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seating_areas" ADD CONSTRAINT "seating_areas_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seating_areas" ADD CONSTRAINT "seating_areas_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_tables" ADD CONSTRAINT "restaurant_tables_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_tables" ADD CONSTRAINT "restaurant_tables_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_tables" ADD CONSTRAINT "restaurant_tables_seatingAreaId_fkey" FOREIGN KEY ("seatingAreaId") REFERENCES "seating_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_staff_assignments" ADD CONSTRAINT "restaurant_staff_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_staff_assignments" ADD CONSTRAINT "restaurant_staff_assignments_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_staff_assignments" ADD CONSTRAINT "restaurant_staff_assignments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
