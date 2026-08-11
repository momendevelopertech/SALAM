import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const env = Object.fromEntries(
  readFileSync(import.meta.dirname + "/../.env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      const v = l.slice(i + 1).trim();
      return [l.slice(0, i).trim(), v.replace(/^"|"$/g, "").replace(/^'|'$/g, "")];
    }),
);

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const res = await cloudinary.api.resources({ type: "upload", prefix: "salam/", max_results: 50 });
const urlByPublicId = new Map(res.resources.map((r) => [r.public_id, r.secure_url]));

const CATEGORY_IMG = {
  abayas: urlByPublicId.get("salam/categories/abayas"),
  dresses: urlByPublicId.get("salam/categories/dresses"),
  esdals: urlByPublicId.get("salam/categories/esdals"),
};

const SLUG_TO_PUBLIC = {
  "abaya-hadea": "salam/products/abaya-hadea",
  "abaya-lina": "salam/products/abaya-lina",
  "abaya-noor": "salam/products/abaya-noor",
  "abaya-rahma": "salam/products/abaya-rahma",
  "abaya-sakina": "salam/products/abaya-sakina",
  "dress-jana": "salam/products/dress-jana",
  "dress-mariam": "salam/products/dress-mariam",
  "dress-salma": "salam/products/dress-salma",
  "dress-yasmin": "salam/products/dress-yasmin",
  "esdal-huda": "salam/products/esdal-huda",
  "esdal-safa": "salam/products/esdal-safa",
  "esdal-tuqa": "salam/products/esdal-tuqa",
};
const PRODUCT_IMG = {};
for (const [slug, pub] of Object.entries(SLUG_TO_PUBLIC)) {
  PRODUCT_IMG[slug] = urlByPublicId.get(pub);
  if (!PRODUCT_IMG[slug]) throw new Error(`Missing cloudinary url for ${pub}`);
}

const prisma = new PrismaClient({ datasourceUrl: env.DATABASE_URL });

let products = 0;
for (const [slug, url] of Object.entries(PRODUCT_IMG)) {
  const r = await prisma.products.updateMany({
    where: { slug },
    data: { main_image: url, gallery: [url] },
  });
  products += r.count;
}
console.log(`Products updated: ${products}`);

let variants = 0;
for (const [slug, url] of Object.entries(PRODUCT_IMG)) {
  const p = await prisma.products.findUnique({ where: { slug }, select: { id: true } });
  if (!p) continue;
  const r = await prisma.product_variants.updateMany({
    where: { product_id: p.id },
    data: { image_url: url },
  });
  variants += r.count;
}
console.log(`Variants updated: ${variants}`);

let categories = 0;
for (const [slug, url] of Object.entries(CATEGORY_IMG)) {
  const r = await prisma.categories.updateMany({ where: { slug }, data: { image_url: url } });
  categories += r.count;
}
console.log(`Categories updated: ${categories}`);

const check = await prisma.products.findMany({
  select: { slug: true, main_image: true },
  orderBy: { slug: "asc" },
});
console.log("\n=== PRODUCT IMAGES IN DB ===");
for (const p of check) console.log(`${p.slug}: ${p.main_image}`);

await prisma.$disconnect();
