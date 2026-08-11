# SALAM — متجر ملابس

متجر إلكتروني متكامل لبيع العبايات والفساتين والإسدالات، مبني بـ **TanStack Start + Prisma/PostgreSQL + React Query**، بواجهة عربية/إنجليزية ولوحة تحكم أدمن.

## المميزات

- كتالوج منتجات حي (عبايات، فساتين، إسدالات) مع تصنيفات ومجموعات ومناسبات.
- صفحة منتج تفصيلية مع مقاسات وألوان وتوفر مخزون ومراجعات ومنتجات مشابهة.
- سلة مشتريات ومفضلة محفوظة محلياً (localStorage).
- إتمام طلب مع شحن لجميع محافظات مصر، دفع عند الاستلام أو تحويل بنكي.
- تتبع طلب برقم الطلب، وكوبونات خصم (WELCOME10 / SALAM50).
- لوحة تحكم أدمن: نظرة عامة، إدارة منتجات وتصنيفات وأصناف ومخزون وطلبات.
- واجهة عربية/إنجليزية كاملة (i18n) وخطوط مناسبة للغة العربية.
- دليل مقاسات، سياسة شحن، صفحة تواصل، واختيار الأنسب حسب الطلب (Style Finder).

## التقنيات

- [TanStack Start](https://tanstack.com/start) — Full-stack React (SSR).
- [Prisma](https://www.prisma.io) + PostgreSQL (Neon).
- [React Query](https://tanstack.com/query) لإدارة حالة الخادم.
- Tailwind CSS v4 + shadcn/ui.
- الصور مستضافة على Cloudinary.

## التشغيل محلياً

```sh
npm i
```

أنشئ ملف `.env` (انظر `.env.example` إن وُجد) بالمتغيرات التالية:

| المتغير | الوصف |
|---|---|
| `DATABASE_URL` | اتصال PostgreSQL (Neon) |
| `DIRECT_URL` | اتصال مباشر لـ Prisma migrations |
| `AUTH_SECRET` | سر توقيع جلسات الأدمن |
| `CLOUDINARY_*` | بيانات Cloudinary للصور |
| `SEED_ADMIN_PASSWORD` | كلمة مرور حساب الأدمن (مطلوبة للـ seed) |

ثم:

```sh
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

- المتجر: http://localhost:8080
- لوحة الأدمن: `admin@salam.store` / كلمة مرور `SEED_ADMIN_PASSWORD`

## البناء للإنتاج

```sh
npm run build
```

## هيكل المشروع

```
src/
├── components/      # مكونات واجهة (بطاقات منتج، عدّاد، …)
├── lib/             # دوال الخادم (catalog, checkout, admin, auth) ومنطق الأعمال
├── routes/          # مسارات TanStack (المتجر، المنتج، السلة، الأدمن، …)
└── integrations/    # تكاملات خارجية (Supabase، …)
prisma/
├── schema.prisma    # مخطط قاعدة البيانات
└── seed.ts          # بيانات البذرة (منتجات، تصنيفات، محافظات، أدمن)
```

## اختبار دفق الأدمن

```sh
node admin-flow-test.mjs
```

يختبر الحماية، الدخول، وإنشاء/تعديل/حذف المنتجات والتصنيفات مع انتشارها للعرض العام.
