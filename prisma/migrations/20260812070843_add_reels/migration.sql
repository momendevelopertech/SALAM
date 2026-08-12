-- CreateTable
CREATE TABLE "reels" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title_ar" TEXT,
    "title_en" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reels_url_key" ON "reels"("url");
