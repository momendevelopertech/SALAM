# دليل تشغيل واختبار مشروع SALAM

> مشروع متجر "سلام" للعبايات والفساتين — مبني على **TanStack Start** مع قاعدة بيانات **PostgreSQL (Neon)** عبر **Prisma**، ومصادقة محلية (جلسات HTTP-only Cookie) بدلاً من Supabase.

---

## 1) التشغيل محلياً

### المتطلبات
- Node.js v20+ (المشروع يعمل على v24).
- حساب قاعدة بيانات **Neon** (أو أي PostgreSQL) مع `DATABASE_URL` + `DIRECT_URL`.
- حساب **Cloudinary** (مستخدم لاحقاً للصور، يمكن تجاهله الآن).

### الخطوات

```bash
# 1) تثبيت الاعتماديات
npm install

# 2) إعداد متغيرات البيئة
# انسخ من ملف .env الموجود (يحتوي على DATABASE_URL / DIRECT_URL / AUTH_SECRET / CLOUDINARY_*)

# 3) توليد عميل Prisma ورفع المخطط إلى قاعدة البيانات
npx prisma generate
npx prisma migrate deploy

# 4) زرع البيانات التجريبية (أدمن + منتجات + كوبونات + محافظات)
npm run db:seed

# 5) تشغيل خادم التطوير
npm run dev
```

افتح المتصفح على: **http://localhost:8080**

> الخادم قيد التشغيل حالياً، والسجل في:
> `C:\Users\Momen\AppData\Local\Temp\opencode\salam-dev.log`

### أوامر مفيدة
```bash
npm run db:seed      # إعادة زرع البيانات
npm run db:studio    # فتح Prisma Studio لعرض/تعديل البيانات
npm run build        # بناء الإنتاج (nitro + wrangler)
npm run lint         # فحص الكود
```

---

## 2) بيانات الاختبار

| النوع | القيمة |
|---|---|
| أدمن | `admin@salam.store` — كلمة المرور من متغير `SEED_ADMIN_PASSWORD` |
| كوبون 10% | `WELCOME10` |
| كوبون 50% | `SALAM50` |
| المنتجات | 12 منتجاً (5 عبايات، 4 فساتين، 3 إسدالات) بمقاسات M/L/XL |
| المحافظات | 26 محافظة شحن بأسعار متنوعة |
| التصنيفات | عبايات، فساتين، إسدالات |

---

## 3) سيناريوهات الاختبار

### أ) صفحات المتجر (بدون تسجيل دخول)
| الصفحة | المسار | ما يُختبر |
|---|---|---|
| الرئيسية | `/` | عرض المنتجات القادمة من قاعدة البيانات (Neon) |
| المتجر | `/shop` | تصفّح المنتجات والتصنيفات |
| السلة | `/cart` | إضافة منتجات للسلة (محلية) |
| القائمة المفضلة | `/wishlist` | إضافة/إزالة من المفضلة |
| تتبع الطلب | `/track` | صفحة تتبع الطلبات |
| من نحن | `/about` | صفحة ثابتة |
| اتصل بنا | `/contact` | صفحة ثابتة |
| مقاسك | `/style-finder` | أداة تحديد المقاس |
| دليل المقاسات | `/size-guide` | جدول المقاسات |
| الشحن والدفع | `/shipping` | سياسة الشحن |

### ب) المصادقة (تسجيل الدخول / الخروج)
1. افتح `/auth`.
2. سجّل الدخول ببيانات الأدمن أعلاه → بعد النجاح يُنقل تلقائياً إلى `/admin`.
3. من لوحة الأدمن اضغط **تسجيل الخروج** → تعود للرئيسية، والجلسة تُحذف من قاعدة البيانات.

> الدخول لصفحات `/admin*` محمي عبر `getMe` + `requireAdmin` — زائر غير مسجّل يُحوَّل إلى `/auth`.

### ج) لوحة الأدمن
| الصفحة | المسار | الوظيفة |
|---|---|---|
| لوحة التحكم | `/admin` | ملخصات وإحصائيات |
| المنتجات | `/admin/products` | إدارة المنتجات |
| الطلبات | `/admin/orders` | إدارة الطلبات وتحديث حالتها |
| الكطلوج | `/admin/catalog` | إدارة الكطلوج |

### د) إنشاء حساب جديد
- من `/auth` اختر "إنشاء حساب" → يُنشأ بحساب `customer` ويُسجّل دخوله مباشرة.

---

## 4) اختبار المصادقة عبر HTTP (RPC)

الدوال تُستدعى كـ Server Functions على المسار `/_serverFn/<functionId>`.

**معرّفات الدوال (وضع التطوير):**
- `login`: `eyJmaWxlIjoiL3NyYy9saWIvYXV0aC5mdW5jdGlvbnMudHM_dHNzLXNlcnZlcmZuLXNwbGl0IiwiZXhwb3J0IjoibG9naW5fY3JlYXRlU2VydmVyRm5faGFuZGxlciJ9`
- `getMe`: `eyJmaWxlIjoiL3NyYy9saWIvYXV0aC5mdW5jdGlvbnMudHM_dHNzLXNlcnZlcmZuLXNwbGl0IiwiZXhwb3J0IjoiZ2V0TWVfY3JlYXRlU2VydmVyRm5faGFuZGxlciJ9`
- `logout`: `eyJmaWxlIjoiL3NyYy9saWIvYXV0aC5mdW5jdGlvbnMudHM_dHNzLXNlcnZlcmZuLXNwbGl0IiwiZXhwb3J0IjoibG9nb3V0X2NyZWF0ZVNlcnZlckZuX2hhbmRsZXIifQ`

### الدورة الكاملة (curl.exe — ويندوز):
```bash
# ملف الجلسة
SET JAR=C:\Temp\cookies.txt

# 1) تسجيل الدخول → يحفظ الكوكي
curl.exe -c %JAR% "http://localhost:8080/_serverFn/<LOGIN_ID>" -X POST ^
  -H "x-tsr-serverFn: true" -H "Referer: http://localhost:8080/" ^
  -H "Accept: application/x-tss-framed, application/x-ndjson, application/json" ^
  -H "Content-Type: application/json" ^
  --data-binary "{""data"":{""email"":""admin@salam.store"",""password"":""<PASSWORD_FROM_SEED_ADMIN_PASSWORD>""},""context"":{}}"

# 2) التحقق من الجلسة (بالكوكي)
curl.exe -b %JAR% "http://localhost:8080/_serverFn/<GETME_ID>" ^
  -H "x-tsr-serverFn: true" -H "Referer: http://localhost:8080/"

# 3) تسجيل الخروج
curl.exe -b %JAR% "http://localhost:8080/_serverFn/<LOGOUT_ID>" -X POST ^
  -H "x-tsr-serverFn: true" -H "Referer: http://localhost:8080/"

# 4) بعد الخروج يجب أن يعود getMe null
curl.exe -b %JAR% "http://localhost:8080/_serverFn/<GETME_ID>" ^
  -H "x-tsr-serverFn: true" -H "Referer: http://localhost:8080/"
```

**ملاحظات بروتوكول الـ RPC:**
- يتطلب `x-tsr-serverFn: true` وهيدر `Referer`/`Origin` من نفس الأصل (حماية CSRF — بدونها 403).
- جسم طلب POST هو serialization خاص (seroval cross-JSON) بصيغة `{ "data": <المدخلات>, "context": {} }`.
- الاستجابة تُفك بواسطة المكتبة الرسمية؛ يُفضَّل استخدام المتصفح (الواجهات) بدلاً من curl للاختبار اليومي.
- **تحذير**: `Invoke-WebRequest` في PowerShell لا يرسل هيدر `Cookie` بشكل موثوق — استخدم `curl.exe` عند الاختبار اليدوي.

---

## 5) استكشاف الأخطاء الشائعة

| المشكلة | الحل |
|---|---|
| صفحة 403 عند استدعاء Server Function | أضف `Referer` من نفس الأصل (أو `Origin`) |
| `PrismaClientInitializationError` | تأكد من `DATABASE_URL` في `.env` وصحتها (`postgresql://...`) |
| صفحات الأدمن تعيد التوجيه لـ `/auth` | انتهت الجلسة — سجّل الدخول مجدداً |
| سطر `Error kind: Closed` في سجل Prisma | عابر مع اتصال Neon pooler — لا يؤثر ويُعاد الاتصال تلقائياً |
| `prisma migrate dev` يفشل | استخدم `npx prisma migrate deploy` (غالباً أخطاء غير تفاعلية) |

---

## 6) ملاحظات معمارية (باختصار)
- **البيانات**: `src/lib/db.ts` — عميل Prisma واحد (singleton).
- **المصادقة**: `src/lib/auth.server.ts` — جلسات في جدول `sessions`، التشفير `scrypt` في `src/lib/password.ts`.
- **الدوال الخادمية**: `src/lib/auth.functions.ts`، `catalog.functions.ts`، `checkout.functions.ts`، `admin.functions.ts`.
- **إزالة Supabase**: لا يوجد أي أثر لـ `@supabase/*` أو `src/integrations/`.
- **الخطوة القادمة غير منفَّذة**: صفحة Checkout كاملة (الدوال جاهزة في `checkout.functions.ts` لكن لا توجد صفحة تربطها).
