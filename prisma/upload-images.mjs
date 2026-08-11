import { readFileSync, readdirSync } from "node:fs";
import { v2 as cloudinary } from "cloudinary";

const PREVIEW_HOST = "id-preview--388bcdca-4732-4d64-b864-713ef2d8ded2.lovable.app";
const DIR = import.meta.dirname + "/../src/assets/";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const files = readdirSync(DIR).filter((f) => f.endsWith(".asset.json")).sort();
console.log(`Found ${files.length} asset files`);

const results = {};
for (const file of files) {
  const name = file.replace(/\.asset\.json$/, "");
  const meta = JSON.parse(readFileSync(DIR + file, "utf8"));
  const sourceUrl = `https://${PREVIEW_HOST}${meta.url}`;

  const base = name.replace(/\.jpg$/, "");
  let publicId;
  if (base === "hero") publicId = "salam/hero";
  else if (base === "logo") publicId = "salam/logo";
  else if (base.startsWith("cat-")) publicId = `salam/categories/${base.replace("cat-", "")}`;
  else publicId = `salam/products/${base.replace(/^p-/, "")}`;

  try {
    const res = await cloudinary.uploader.upload(sourceUrl, {
      public_id: publicId,
      resource_type: "image",
      overwrite: true,
    });
    results[name] = { url: res.secure_url, public_id: publicId };
    console.log(`OK  ${name} -> ${res.secure_url}`);
  } catch (err) {
    console.error(`ERR ${name}: ${err.message}`);
    results[name] = { url: null, public_id: publicId, error: err.message };
  }
}

console.log("\n=== SUMMARY ===");
for (const [k, v] of Object.entries(results)) console.log(`${k}: ${v.url ?? v.error}`);
