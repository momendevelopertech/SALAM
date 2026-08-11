-- AddUniqueConstraint shipping_rates.governorate_en
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_governorate_en_key" UNIQUE ("governorate_en");
