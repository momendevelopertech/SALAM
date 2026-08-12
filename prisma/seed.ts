import { PrismaClient, type app_role } from "@prisma/client";
import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@salam.store";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "SalamAdmin@2026";

const CDN = "https://res.cloudinary.com/djseokhow/image/upload";

const IMG = {
  hero: `${CDN}/v1786443226/salam/hero.jpg`,
  logo: `${CDN}/v1786443227/salam/logo.jpg`,
  catAbayas: `${CDN}/v1786443224/salam/categories/abayas.jpg`,
  catDresses: `${CDN}/v1786443224/salam/categories/dresses.jpg`,
  catEsdals: `${CDN}/v1786443225/salam/categories/esdals.jpg`,
  abayas: {
    hadea: `${CDN}/v1786443227/salam/products/abaya-hadea.jpg`,
    lina: `${CDN}/v1786443228/salam/products/abaya-lina.jpg`,
    noor: `${CDN}/v1786443229/salam/products/abaya-noor.jpg`,
    rahma: `${CDN}/v1786443229/salam/products/abaya-rahma.jpg`,
    sakina: `${CDN}/v1786443230/salam/products/abaya-sakina.jpg`,
  },
  dresses: {
    jana: `${CDN}/v1786443231/salam/products/dress-jana.jpg`,
    mariam: `${CDN}/v1786443232/salam/products/dress-mariam.jpg`,
    salma: `${CDN}/v1786443232/salam/products/dress-salma.jpg`,
    yasmin: `${CDN}/v1786443233/salam/products/dress-yasmin.jpg`,
  },
  esdals: {
    huda: `${CDN}/v1786443234/salam/products/esdal-huda.jpg`,
    safa: `${CDN}/v1786443234/salam/products/esdal-safa.jpg`,
    tuqa: `${CDN}/v1786443235/salam/products/esdal-tuqa.jpg`,
  },
};

function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

function verifyPassword(password: string, stored: string) {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt") return false;
  const derived = scryptSync(password, Buffer.from(saltB64, "base64url"), 64);
  return timingSafeEqual(derived, Buffer.from(hashB64, "base64url"));
}

const GOVS = [
  { ar: "القاهرة", en: "Cairo", fee: 60 },
  { ar: "الجيزة", en: "Giza", fee: 60 },
  { ar: "الإسكندرية", en: "Alexandria", fee: 70 },
  { ar: "الدقهلية", en: "Dakahlia", fee: 75 },
  { ar: "الشرقية", en: "Sharqia", fee: 75 },
  { ar: "الغربية", en: "Gharbia", fee: 75 },
  { ar: "المنوفية", en: "Monufia", fee: 75 },
  { ar: "القليوبية", en: "Qalyubia", fee: 70 },
  { ar: "الفيوم", en: "Faiyum", fee: 80 },
  { ar: "بني سويف", en: "Beni Suef", fee: 85 },
  { ar: "المنيا", en: "Minya", fee: 90 },
  { ar: "أسيوط", en: "Asyut", fee: 95 },
  { ar: "سوهاج", en: "Sohag", fee: 100 },
  { ar: "قنا", en: "Qena", fee: 105 },
  { ar: "الأقصر", en: "Luxor", fee: 105 },
  { ar: "أسوان", en: "Aswan", fee: 110 },
  { ar: "البحر الأحمر", en: "Red Sea", fee: 110 },
  { ar: "بورسعيد", en: "Port Said", fee: 80 },
  { ar: "الإسماعيلية", en: "Ismailia", fee: 80 },
  { ar: "السويس", en: "Suez", fee: 80 },
  { ar: "دمياط", en: "Damietta", fee: 80 },
  { ar: "كفر الشيخ", en: "Kafr El Sheikh", fee: 75 },
  { ar: "مطروح", en: "Matrouh", fee: 120 },
  { ar: "شمال سيناء", en: "North Sinai", fee: 130 },
  { ar: "جنوب سيناء", en: "South Sinai", fee: 140 },
  { ar: "الوادي الجديد", en: "New Valley", fee: 150 },
];

type SeedProduct = {
  slug: string;
  sku: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  sale_price?: number;
  image: string;
  fabric_ar: string;
  fabric_en: string;
  is_new?: boolean;
  is_best_seller?: boolean;
};

const PRODUCTS: Record<string, SeedProduct[]> = {
  abayas: [
    {
      slug: "abaya-hadea",
      sku: "SLM-AB-HA",
      name_ar: "عباية هدية",
      name_en: "Hadea Abaya",
      description_ar:
        "عباية انسيابية بقصّة مريحة، مصمّمة بلمسة كلاسيكية راقية تناسب الإطلالات اليومية والمناسبات.",
      description_en: "A flowy abaya with a relaxed, elegant cut for daily and formal wear.",
      price: 1350,
      sale_price: 1150,
      image: IMG.abayas.hadea,
      fabric_ar: "كرينكل رايان",
      fabric_en: "Crinkle rayon",
      is_new: true,
    },
    {
      slug: "abaya-lina",
      sku: "SLM-AB-LN",
      name_ar: "عباية لينا",
      name_en: "Lina Abaya",
      description_ar: "عباية خفيفة بقماش ناعم مثالي لفصل الصيف، بتفاصيل أنيقة وبساطة راقية.",
      description_en: "A lightweight abaya in a soft summer-friendly fabric with refined details.",
      price: 1250,
      image: IMG.abayas.lina,
      fabric_ar: "رايان قطني",
      fabric_en: "Cotton rayon",
      is_new: true,
    },
    {
      slug: "abaya-noor",
      sku: "SLM-AB-NR",
      name_ar: "عباية نور",
      name_en: "Noor Abaya",
      description_ar: "عباية سوداء كلاسيكية بأكمام مريحة وقصّة عصرية تناسب جميع الأوقات.",
      description_en: "A classic black abaya with comfortable sleeves and a modern silhouette.",
      price: 1450,
      image: IMG.abayas.noor,
      fabric_ar: "نايلون كريب",
      fabric_en: "Nylon crepe",
      is_new: true,
    },
    {
      slug: "abaya-rahma",
      sku: "SLM-AB-RM",
      name_ar: "عباية رحمة",
      name_en: "Rahma Abaya",
      description_ar: "عباية فاخرة بتصميم بسيط وأقمشة مختارة بعناية لراحة تدوم طوال اليوم.",
      description_en: "A premium abaya with a minimal design and carefully chosen fabrics.",
      price: 1550,
      sale_price: 1350,
      image: IMG.abayas.rahma,
      fabric_ar: "جيرسي لبنان",
      fabric_en: "Lebanese jersey",
      is_best_seller: true,
    },
    {
      slug: "abaya-sakina",
      sku: "SLM-AB-SK",
      name_ar: "عباية سكينة",
      name_en: "Sakina Abaya",
      description_ar: "عباية سكينة بتفاصيل هادئة وقصّة مثالية للحشمة والأناقة في نفس الوقت.",
      description_en: "The Sakina abaya blends modest cuts with understated elegance.",
      price: 1400,
      image: IMG.abayas.sakina,
      fabric_ar: "كرينكل حريري",
      fabric_en: "Silky crinkle",
      is_best_seller: true,
    },
  ],
  dresses: [
    {
      slug: "dress-jana",
      sku: "SLM-DR-JN",
      name_ar: "فستان جنى",
      name_en: "Jana Dress",
      description_ar: "فستان محتشم بأكمام طويلة وقصّة واسعة، مثالي للمناسبات والإطلالات النهارية.",
      description_en: "A modest long-sleeve dress with a wide cut, perfect for events and daytime.",
      price: 1650,
      image: IMG.dresses.jana,
      fabric_ar: "بريمير قطن",
      fabric_en: "Premium cotton",
      is_new: true,
    },
    {
      slug: "dress-mariam",
      sku: "SLM-DR-MR",
      name_ar: "فستان مريم",
      name_en: "Mariam Dress",
      description_ar: "فستان محتشم بقصّة مميزة وقماش يسمح بالتهوية، أناقة بلا مجهود.",
      description_en:
        "A modest dress with a distinctive cut and breathable fabric for effortless style.",
      price: 1750,
      sale_price: 1490,
      image: IMG.dresses.mariam,
      fabric_ar: "فيسكوز مخلوط",
      fabric_en: "Blended viscose",
      is_best_seller: true,
    },
    {
      slug: "dress-salma",
      sku: "SLM-DR-SL",
      name_ar: "فستان سلمى",
      name_en: "Salma Dress",
      description_ar: "فستان واسع مريح بألوان هادئة، مصمم ليكون خيارك اليومي الأنيق.",
      description_en: "A comfortable wide dress in calm tones — your everyday elegant pick.",
      price: 1550,
      image: IMG.dresses.salma,
      fabric_ar: "رايان مطبوع",
      fabric_en: "Printed rayon",
    },
    {
      slug: "dress-yasmin",
      sku: "SLM-DR-YM",
      name_ar: "فستان ياسمين",
      name_en: "Yasmin Dress",
      description_ar: "فستان محتشم بتفاصيل ناعمة وقصّة أنثوية راقية للمناسبات المسائية.",
      description_en: "A modest dress with soft details and a refined feminine cut for evenings.",
      price: 1850,
      image: IMG.dresses.yasmin,
      fabric_ar: "مخمل قطني",
      fabric_en: "Cotton velvet",
    },
  ],
  esdals: [
    {
      slug: "esdal-huda",
      sku: "SLM-ES-HD",
      name_ar: "إسدال هدى",
      name_en: "Huda Esdal",
      description_ar: "إسدال محتشم بقصّة كلاسيكية أنيقة، مثالي للإطلالات المحتشمة الراقية.",
      description_en: "A classic modest esdal with an elegant cut for refined looks.",
      price: 1150,
      image: IMG.esdals.huda,
      fabric_ar: "كريب سادة",
      fabric_en: "Plain crepe",
      is_new: true,
    },
    {
      slug: "esdal-safa",
      sku: "SLM-ES-SF",
      name_ar: "إسدال صفا",
      name_en: "Safa Esdal",
      description_ar: "إسدال خفيف الوزن يناسب الطقس الحار مع الاحتفاظ بالحشمة الكاملة.",
      description_en: "A lightweight esdal ideal for warm weather with full coverage.",
      price: 1050,
      sale_price: 890,
      image: IMG.esdals.safa,
      fabric_ar: "شيفون",
      fabric_en: "Chiffon",
      is_best_seller: true,
    },
    {
      slug: "esdal-tuqa",
      sku: "SLM-ES-TQ",
      name_ar: "إسدال تقوى",
      name_en: "Tuqa Esdal",
      description_ar: "إسدال بقصّة واسعة ومريحة بتصميم بسيط يليق بكل المناسبات.",
      description_en: "A wide, comfortable esdal with a simple design for every occasion.",
      price: 1200,
      image: IMG.esdals.tuqa,
      fabric_ar: "جورجيت",
      fabric_en: "Georgette",
    },
  ],
};

const SIZES = ["M", "L", "XL"];
const COLORS = [
  { ar: "أسود", en: "Black", hex: "#1c1c1c" },
  { ar: "كحلي", en: "Navy", hex: "#1f2a44" },
  { ar: "رمادي", en: "Grey", hex: "#8a8a8a" },
];

const REELS = [
  "https://www.facebook.com/reel/1566552774815870",
  "https://www.facebook.com/reel/1536982634875864",
  "https://www.facebook.com/reel/1657339745351500",
  "https://www.facebook.com/reel/1757685301901777",
  "https://www.facebook.com/reel/2482127515572111",
  "https://www.facebook.com/reel/1426396779248397",
  "https://www.facebook.com/reel/1326293326372445",
  "https://www.facebook.com/reel/1695901064893067",
  "https://www.facebook.com/reel/27113612254957846",
  "https://www.facebook.com/reel/1897032214313869",
  "https://www.facebook.com/reel/1926101641324862",
  "https://www.facebook.com/reel/946772588290192",
  "https://www.facebook.com/reel/1627172655257930",
  "https://www.facebook.com/reel/1467153241791195",
  "https://www.facebook.com/reel/1452804696636291",
  "https://www.facebook.com/reel/25709471665390623",
  "https://www.facebook.com/reel/1430665941801326",
  "https://www.facebook.com/reel/4243178759298991",
  "https://www.facebook.com/reel/1337310881417412",
  "https://www.facebook.com/reel/1294395555861632",
  "https://www.facebook.com/reel/1783408702257708",
  "https://www.facebook.com/reel/1231865735167671",
  "https://www.facebook.com/reel/1385322200274989",
  "https://www.facebook.com/reel/2364896050665648",
  "https://www.facebook.com/reel/1637444647432331",
  "https://www.facebook.com/reel/868985086137376",
  "https://www.facebook.com/reel/1197036752509320",
  "https://www.facebook.com/reel/901365946016067",
  "https://www.facebook.com/reel/4280355585571186",
  "https://www.facebook.com/reel/1298290425458231",
  "https://www.facebook.com/reel/2665647503817552",
  "https://www.facebook.com/reel/1435615411313170",
  "https://www.facebook.com/reel/1213437230434705",
];

async function main() {
  const exists = await prisma.users.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!exists) {
    await prisma.users.create({
      data: {
        email: ADMIN_EMAIL,
        password_hash: hashPassword(ADMIN_PASSWORD),
        full_name: "SALAM Admin",
        role: "admin" as app_role,
      },
    });
    console.log(`✓ Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    console.log(`✓ Admin already exists: ${ADMIN_EMAIL}`);
  }

  const categories = {
    abayas: await prisma.categories.upsert({
      where: { slug: "abayas" },
      update: {},
      create: {
        slug: "abayas",
        name_ar: "عبايات",
        name_en: "Abayas",
        description_ar: "مجموعة عبايات محتشمة راقية",
        description_en: "A collection of elegant modest abayas",
        image_url: IMG.catAbayas,
        sort_order: 1,
      },
    }),
    dresses: await prisma.categories.upsert({
      where: { slug: "dresses" },
      update: {},
      create: {
        slug: "dresses",
        name_ar: "فساتين",
        name_en: "Dresses",
        description_ar: "فساتين محتشمة للمناسبات واليومي",
        description_en: "Modest dresses for events and everyday",
        image_url: IMG.catDresses,
        sort_order: 2,
      },
    }),
    esdals: await prisma.categories.upsert({
      where: { slug: "esdals" },
      update: {},
      create: {
        slug: "esdals",
        name_ar: "إسدالات",
        name_en: "Esdals",
        description_ar: "إسدالات محتشمة بأناقة هادئة",
        description_en: "Modest esdals with quiet elegance",
        image_url: IMG.catEsdals,
        sort_order: 3,
      },
    }),
  };

  const collections = await Promise.all([
    prisma.collections.upsert({
      where: { slug: "classic" },
      update: {},
      create: {
        slug: "classic",
        name_ar: "الكلاسيكية",
        name_en: "The Classics",
        description_ar: "قطع دائمة لا تخرج عن الموضة",
        description_en: "Timeless pieces that never go out of style",
        sort_order: 1,
      },
    }),
    prisma.collections.upsert({
      where: { slug: "special-occasions" },
      update: {},
      create: {
        slug: "special-occasions",
        name_ar: "المناسبات",
        name_en: "Special Occasions",
        description_ar: "إطلالات راقية لمناسباتك",
        description_en: "Elevated looks for your special moments",
        sort_order: 2,
      },
    }),
  ]);

  const occasions = await Promise.all([
    prisma.occasions.upsert({
      where: { slug: "ramadan" },
      update: {},
      create: {
        slug: "ramadan",
        name_ar: "رمضان",
        name_en: "Ramadan",
        description_ar: "إطلالات رمضانية محتشمة",
        description_en: "Modest Ramadan looks",
        sort_order: 1,
      },
    }),
    prisma.occasions.upsert({
      where: { slug: "eid" },
      update: {},
      create: {
        slug: "eid",
        name_ar: "العيد",
        name_en: "Eid",
        description_ar: "تألقي في العيد",
        description_en: "Shine this Eid",
        sort_order: 2,
      },
    }),
    prisma.occasions.upsert({
      where: { slug: "daily" },
      update: {},
      create: {
        slug: "daily",
        name_ar: "يومي",
        name_en: "Everyday",
        description_ar: "إطلالات يومية مريحة",
        description_en: "Comfortable everyday outfits",
        sort_order: 3,
      },
    }),
  ]);

  for (const [key, list] of Object.entries(PRODUCTS)) {
    const category = categories[key as keyof typeof categories];
    for (const p of list) {
      const product = await prisma.products.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          slug: p.slug,
          sku: p.sku,
          name_ar: p.name_ar,
          name_en: p.name_en,
          description_ar: p.description_ar,
          description_en: p.description_en,
          category_id: category.id,
          collection_id: key === "esdals" ? collections[0].id : collections[1].id,
          occasion_id: occasions[2].id,
          cost_price: Math.round(p.price * 0.5),
          price: p.price,
          sale_price: p.sale_price ?? null,
          main_image: p.image,
          gallery: [p.image],
          fabric_ar: p.fabric_ar,
          fabric_en: p.fabric_en,
          is_new: p.is_new ?? false,
          is_best_seller: p.is_best_seller ?? false,
          is_active: true,
        },
      });

      const variants = await prisma.product_variants.findMany({
        where: { product_id: product.id },
      });
      if (variants.length === 0) {
        for (let i = 0; i < SIZES.length; i++) {
          const color = COLORS[i % COLORS.length];
          await prisma.product_variants.create({
            data: {
              product_id: product.id,
              color_ar: color.ar,
              color_en: color.en,
              color_hex: color.hex,
              size: SIZES[i],
              sku: `${p.sku}-${color.en}-${SIZES[i]}`,
              price: p.price,
              image_url: p.image,
              stock_available: 12,
            },
          });
        }
      }
      console.log(`✓ Product: ${p.name_ar}`);
    }
  }

  for (const g of GOVS) {
    await prisma.shipping_rates.upsert({
      where: { governorate_en: g.en },
      update: { fee: g.fee },
      create: {
        governorate_ar: g.ar,
        governorate_en: g.en,
        fee: g.fee,
        days_min: 2,
        days_max: 5,
        is_active: true,
      },
    });
  }
  console.log(`✓ Shipping rates: ${GOVS.length} governorates`);

  await prisma.coupons.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      min_total: 500,
      usage_limit: 500,
      is_active: true,
    },
  });
  await prisma.coupons.upsert({
    where: { code: "SALAM50" },
    update: {},
    create: {
      code: "SALAM50",
      type: "fixed",
      value: 50,
      min_total: 1000,
      usage_limit: 200,
      is_active: true,
    },
  });
  console.log("✓ Coupons: WELCOME10, SALAM50");

  let reelsCreated = 0;
  for (const [index, url] of REELS.entries()) {
    await prisma.reels.upsert({
      where: { url },
      update: {},
      create: {
        url,
        title_ar: null,
        title_en: null,
        sort_order: index,
        is_active: true,
      },
    });
    reelsCreated++;
  }
  console.log(`✓ Reels: ${reelsCreated} seeded`);

  const sanity = await verifyPassword(ADMIN_PASSWORD, hashPassword(ADMIN_PASSWORD));
  if (!sanity) throw new Error("Password hash self-check failed");
}

main()
  .then(() => {
    console.log("✓ Seed complete");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
