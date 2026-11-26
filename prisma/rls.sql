-- Enable Row Level Security (RLS) on all Supabase PostgreSQL tables
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Stock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Bill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BillItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Measurement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Udhaar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MarketingCampaign" ENABLE ROW LEVEL SECURITY;

-- Service-role full access policy (used by Prisma server-side)
CREATE POLICY "service_role_all_customer" ON "Customer" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_product" ON "Product" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_stock" ON "Stock" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_staff" ON "Staff" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_bill" ON "Bill" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_billitem" ON "BillItem" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_measurement" ON "Measurement" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_udhaar" ON "Udhaar" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_campaign" ON "MarketingCampaign" FOR ALL USING (auth.role() = 'service_role');
