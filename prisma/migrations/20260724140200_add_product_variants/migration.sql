-- CreateTable: ProductVariant
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "brandId" UUID,
    "name" TEXT,
    "sku" TEXT,
    "model" TEXT,
    "countryOfOrigin" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'AVAILABLE',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2),
    "discountPrice" DECIMAL(10,2),
    "showPrice" BOOLEAN NOT NULL DEFAULT true,
    "catalogUrl" TEXT,
    "installationGuideUrl" TEXT,
    "datasheetUrl" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");
CREATE INDEX "product_variants_productId_idx" ON "product_variants"("productId");
CREATE INDEX "product_variants_brandId_idx" ON "product_variants"("brandId");
CREATE INDEX "product_variants_sku_idx" ON "product_variants"("sku");
CREATE INDEX "product_variants_status_idx" ON "product_variants"("status");

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enable RLS on product_variants
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read product_variants" ON "product_variants" FOR SELECT USING (true);
CREATE POLICY "Admin all product_variants" ON "product_variants" FOR ALL USING (auth.role() = 'authenticated');
