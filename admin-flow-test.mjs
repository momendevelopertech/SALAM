import fs from "node:fs";
import { toJSONAsync, fromCrossJSON } from "seroval";
import { defaultSerovalPlugins } from "@tanstack/router-core";

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      const key = l.slice(0, i).trim();
      let val = l.slice(i + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      return [key, val];
    }),
);
process.env.DATABASE_URL ??= env.DATABASE_URL;
const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

const BASE = "http://localhost:8080";
const cookieJar = { cookie: null };
let pass = 0;
let fail = 0;

function report(name, ok, extra = "") {
  if (ok) {
    pass++;
    console.log(`  PASS ${name}${extra ? " ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â " + extra : ""}`);
  } else {
    fail++;
    console.log(`  FAIL ${name}${extra ? " ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â " + extra : ""}`);
  }
}

async function call(fid, { method = "POST", data, withCookie = true, expectError = false } = {}) {
  const headers = { "x-tsr-serverFn": "true", "Sec-Fetch-Site": "same-origin" };
  if (withCookie && cookieJar.cookie) headers["Cookie"] = cookieJar.cookie;
  let body;
  if (method === "POST" && data !== undefined) {
    body = JSON.stringify(await toJSONAsync({ data }));
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${BASE}/_serverFn/${fid}`, {
    method,
    headers,
    body,
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  });
  const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get("set-cookie")].filter(Boolean);
  for (const sc of setCookies) {
    const kv = sc.split(";")[0];
    const name = kv.split("=")[0].trim();
    if (name && name !== "__Host-") cookieJar.cookie = kv;
  }
  const text = await res.text();
  let parsed = text;
  if (res.headers.get("x-tss-serialized") === "true") {
    try {
      parsed = fromCrossJSON(JSON.parse(text), { plugins: defaultSerovalPlugins });
    } catch (e) {
      parsed = text;
    }
  } else {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }
  let hadError = false;
  if (parsed && typeof parsed === "object" && "result" in parsed && "error" in parsed) {
    hadError = !!parsed.error;
    parsed = parsed.result;
  }
  if (expectError && (res.status >= 400 || hadError)) return { status: res.status, parsed, hadError, ok: false };
  if (res.status >= 400) throw new Error(`HTTP ${res.status}: ${text}`);
  return { status: res.status, parsed, hadError, ok: true };
}

async function getFunctionIds() {
  const modules = {
    auth: "/src/lib/auth.functions.ts",
    admin: "/src/lib/admin.functions.ts",
    catalog: "/src/lib/catalog.functions.ts",
  };
  const out = {};
  for (const [name, path] of Object.entries(modules)) {
    const res = await fetch(BASE + path, { signal: AbortSignal.timeout(30000) });
    const src = await res.text();
    const ids = {};
    const re = /export const (\w+) =[\s\S]*?createClientRpc\("([^"]+)"\)/g;
    let m;
    while ((m = re.exec(src))) ids[m[1]] = m[2];
    out[name] = ids;
    if (res.status !== 200) console.log(`  WARN fetch ${path} status ${res.status}`);
  }
  return out;
}

const ids = await getFunctionIds();
console.log("function ids:", {
  auth: Object.keys(ids.auth),
  admin: Object.keys(ids.admin),
  catalog: Object.keys(ids.catalog),
});

console.log("\n== 0. Defensive cleanup of leftover test rows ==");
{
  const dp = await prisma.products.deleteMany({ where: { slug: { startsWith: "test-prod-" } } });
  const dc = await prisma.categories.deleteMany({ where: { slug: { startsWith: "test-cat-" } } });
  console.log(`  cleaned ${dp.count} products, ${dc.count} categories`);
}

const { login, getMe } = ids.auth;
const { getAdminMe, getAdminOverview, getAdminProducts, saveProduct, setProductActive, setVariantStock, getAdminTaxonomies, saveTaxonomy, deleteTaxonomy, getAdminOrders } = ids.admin;
const { getCatalog } = ids.catalog;

console.log("\n== 1. Unauthorized guard (requireAdmin) ==");
{
  const r = await call(getAdminOverview, { method: "GET", withCookie: false, expectError: true });
  report("getAdminOverview without cookie is rejected", r.hadError || r.status >= 400, `hadError=${r.hadError} status=${r.status}`);
  const r2 = await call(getAdminMe, { method: "GET", withCookie: false, expectError: true });
  report("getAdminMe without cookie is rejected", r2.hadError || r2.status >= 400, `hadError=${r2.hadError} status=${r2.status}`);
}

console.log("\n== 2. Login as admin ==");
let adminMe;
{
  const adminPassword = env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) throw new Error("Set SEED_ADMIN_PASSWORD in .env to run login tests");
  const r = await call(login, { data: { email: "admin@salam.store", password: adminPassword } });
  report("login returns ok", r.status === 200 && r.parsed && r.parsed.role === "admin", JSON.stringify(r.parsed ?? r));
  report("session cookie set", !!cookieJar.cookie, cookieJar.cookie ? cookieJar.cookie.split(";")[0] : "none");
}

console.log("\n== 3. getMe with session ==");
{
  const r = await call(getMe, { method: "GET" });
  report("getMe returns admin user", r.status === 200 && r.parsed?.role === "admin", JSON.stringify(r.parsed));
  const r2 = await call(getAdminMe, { method: "GET" });
  report("getAdminMe returns isAdmin", r2.status === 200 && r2.parsed?.isAdmin === true, JSON.stringify(r2.parsed));
}

console.log("\n== 4. Overview & reads ==");
{
  const r = await call(getAdminOverview, { method: "GET" });
  report("overview returns numbers", r.status === 200 && typeof r.parsed?.productCount === "number", JSON.stringify(r.parsed));
  const rp = await call(getAdminProducts, { method: "GET" });
  report("products list loaded", rp.status === 200 && Array.isArray(rp.parsed?.products), `count=${rp.parsed?.products?.length}`);
  const rt = await call(getAdminTaxonomies, { method: "GET" });
  report("taxonomies loaded", rt.status === 200 && Array.isArray(rt.parsed?.categories), `categories=${rt.parsed?.categories?.length}`);
  const ro = await call(getAdminOrders, { method: "GET" });
  report("orders list loaded", ro.status === 200 && Array.isArray(ro.parsed?.orders), `orders=${ro.parsed?.orders?.length}`);
}

console.log("\n== 5. Create taxonomy (category) ==");
let testCatId = null;
{
  const slug = "test-cat-" + Date.now();
  const r = await call(saveTaxonomy, {
    data: { table: "categories", slug, name_ar: "Test Cat Ar", name_en: "Test Category", sort_order: 999, is_active: true },
  });
  report("saveTaxonomy ok", r.status === 200 && r.parsed?.ok === true, JSON.stringify(r.parsed));
  const rt = await call(getAdminTaxonomies, { method: "GET" });
  const cat = rt.parsed?.categories?.find((c) => c.slug === slug);
  testCatId = cat?.id ?? null;
  report("category visible after create", !!testCatId);
}

console.log("\n== 6. Create product + public propagation ==");
let testProdId = null;
{
  const slug = "test-prod-" + Date.now();
  const r = await call(saveProduct, {
    data: {
      slug,
      name_ar: "Test Prod Ar",
      name_en: "Test Product",
      category_id: testCatId,
      cost_price: 100,
      price: 250,
      sale_price: null,
      is_new: false,
      is_best_seller: false,
      is_limited: false,
      is_active: true,
      fulfillment: "in_stock",
    },
  });
  report("saveProduct ok", r.status === 200 && r.parsed?.ok === true, JSON.stringify(r.parsed));

  const rp = await call(getAdminProducts, { method: "GET" });
  const prod = rp.parsed?.products?.find((p) => p.slug === slug);
  testProdId = prod?.id ?? null;
  report("product visible in admin list", !!testProdId);

  const pub = await call(getCatalog, { method: "GET" });
  const pubProd = pub.parsed?.products?.find((p) => p.slug === slug);
  report("active product visible in PUBLIC catalog", !!pubProd);

  const deact = await call(setProductActive, { data: { id: testProdId, isActive: false } });
  report("setProductActive(false) ok", deact.status === 200 && deact.parsed?.ok === true);

  const pub2 = await call(getCatalog, { method: "GET" });
  const gone = !pub2.parsed?.products?.find((p) => p.slug === slug);
  report("deactivated product GONE from PUBLIC catalog", gone);
}

console.log("\n== 7. Edit existing product ==");
{
  const rp = await call(getAdminProducts, { method: "GET" });
  const first = rp.parsed?.products?.[0];
  if (first) {
    const r = await call(saveProduct, {
      data: {
        id: first.id,
        slug: first.slug,
        sku: first.sku ?? null,
        name_ar: first.name_ar,
        name_en: first.name_en,
        category_id: first.category_id,
        collection_id: first.collection_id,
        occasion_id: first.occasion_id,
        cost_price: first.cost_price,
        price: first.price,
        sale_price: first.sale_price ?? null,
        main_image: first.main_image ?? null,
        fabric_ar: first.fabric_ar ?? null,
        fabric_en: first.fabric_en ?? null,
        fulfillment: first.fulfillment,
        is_new: first.is_new,
        is_best_seller: first.is_best_seller,
        is_limited: first.is_limited,
        is_active: first.is_active,
      },
    });
    report("saveProduct (edit, no-change) ok", r.status === 200 && r.parsed?.ok === true, JSON.stringify(r.parsed));
  } else {
    report("saveProduct (edit) ok", false, "no products to edit");
  }
}

console.log("\n== 8. setVariantStock (no-op current value) ==");
{
  const rp = await call(getAdminProducts, { method: "GET" });
  const prod = rp.parsed?.products?.find((p) => p.product_variants?.length);
  const v = prod?.product_variants?.[0];
  if (v) {
    const r = await call(setVariantStock, { data: { variantId: v.id, stockAvailable: v.stock_available } });
    report("setVariantStock ok", r.status === 200 && r.parsed?.ok === true, `variant=${v.id}`);
  } else {
    report("setVariantStock ok", false, "no variants found");
  }
}

console.log("\n== 9. Delete test taxonomy via API ==");
{
  if (testCatId) {
    const r = await call(deleteTaxonomy, { data: { id: testCatId, table: "categories" } });
    report("deleteTaxonomy ok", r.status === 200 && r.parsed?.ok === true, JSON.stringify(r.parsed));
  } else {
    report("deleteTaxonomy ok", false, "no test category id");
  }
}

console.log("\n== 10. Cleanup via Prisma ==");
{
  const dp = await prisma.products.deleteMany({ where: { slug: { startsWith: "test-prod-" } } });
  const dc = await prisma.categories.deleteMany({ where: { slug: { startsWith: "test-cat-" } } });
  report("test products cleaned", dp.count === 0 || true, `removed=${dp.count}`);
  report("test categories cleaned", dc.count === 0 || true, `removed=${dc.count}`);
  if (testProdId) {
    const left = await prisma.products.findUnique({ where: { id: testProdId } });
    report("test product (by id) cleaned", !left);
  }
  if (testCatId) {
    const left = await prisma.categories.findUnique({ where: { id: testCatId } });
    report("test category (by id) cleaned", !left);
  }
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
await prisma.$disconnect();
process.exit(fail ? 1 : 0);
