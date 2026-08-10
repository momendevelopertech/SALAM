import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "ar" | "en";

const STORAGE_KEY = "salam.locale";

type Dict = Record<string, { ar: string; en: string }>;

export const dict: Dict = {
  "brand.name": { ar: "سلام", en: "SALAM" },
  "brand.tagline": { ar: "أزياء محتشمة راقية", en: "Premium Modest Fashion" },

  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.shop": { ar: "المتجر", en: "Shop" },
  "nav.all": { ar: "كل القطع", en: "All Products" },
  "nav.collections": { ar: "المجموعات", en: "Collections" },
  "nav.occasions": { ar: "المناسبات", en: "Occasions" },
  "nav.about": { ar: "عن سلام", en: "About" },
  "nav.contact": { ar: "تواصلي معنا", en: "Contact" },
  "nav.sizeGuide": { ar: "دليل المقاسات", en: "Size Guide" },
  "nav.shipping": { ar: "الشحن والاستبدال", en: "Shipping & Returns" },
  "nav.track": { ar: "تتبع الطلب", en: "Track Order" },
  "nav.styleFinder": { ar: "دليل الإطلالة", en: "Style Finder" },
  "nav.account": { ar: "حسابي", en: "Account" },
  "nav.wishlist": { ar: "المفضلة", en: "Wishlist" },
  "nav.cart": { ar: "الحقيبة", en: "Bag" },
  "nav.admin": { ar: "الإدارة", en: "Admin" },
  "nav.signIn": { ar: "تسجيل الدخول", en: "Sign in" },
  "nav.signOut": { ar: "تسجيل الخروج", en: "Sign out" },
  "nav.menu": { ar: "القائمة", en: "Menu" },
  "nav.search": { ar: "بحث", en: "Search" },

  "home.heroEyebrow": { ar: "مجموعة سلام", en: "The SALAM collection" },
  "home.heroTitle": { ar: "أناقة هادئة\nمصممة لتشبهكِ", en: "Calm elegance,\nmade to look like you" },
  "home.heroBody": {
    ar: "عبايات وإسدالات وفساتين محتشمة بأقمشة مختارة بعناية وخطوط بسيطة تدوم.",
    en: "Abayas, esdals and modest dresses in carefully chosen fabrics and quiet lines that last.",
  },
  "home.heroCta": { ar: "اكتشفي المجموعة", en: "Discover the collection" },
  "home.categories": { ar: "تسوقي حسب الفئة", en: "Shop by category" },
  "home.newArrivals": { ar: "وصل حديثًا", en: "New Arrivals" },
  "home.signature": { ar: "مجموعة التوقيع", en: "Signature Collection" },
  "home.bestSellers": { ar: "الأكثر مبيعًا", en: "Best Sellers" },
  "home.storyTitle": { ar: "حكاية سلام", en: "The SALAM story" },
  "home.storyBody": {
    ar: "بدأت سلام من فكرة واحدة: أن تجد المرأة ملابس محتشمة تشبهها، بخامة تستحق ثمنها وقصّة تمنحها الطمأنينة. نصنع كمياتنا بعناية، ونختار كل قماش بأيدينا.",
    en: "SALAM began with one idea: that a woman should find modest clothing that looks like her — fabric worth its price and a cut that gives her peace. We produce in careful quantities and choose every fabric by hand.",
  },
  "home.reviews": { ar: "كلمات عميلاتنا", en: "What our customers say" },
  "home.finderTitle": { ar: "لستِ متأكدة من الإطلالة؟", en: "Not sure what suits you?" },
  "home.finderBody": {
    ar: "ثلاث خطوات قصيرة ونقترح عليكِ القطع الأقرب لذوقكِ.",
    en: "Three short steps and we suggest the pieces closest to your taste.",
  },
  "home.finderCta": { ar: "ابدئي دليل الإطلالة", en: "Start the Style Finder" },
  "home.newsletter": { ar: "انضمي إلى قائمتنا", en: "Join our list" },
  "home.newsletterBody": {
    ar: "أول من يعرف عن الإصدارات الجديدة والعروض الهادئة.",
    en: "Be first to know about new releases and quiet offers.",
  },
  "home.emailPlaceholder": { ar: "بريدكِ الإلكتروني", en: "Your email" },
  "home.subscribe": { ar: "اشتراك", en: "Subscribe" },
  "home.subscribed": { ar: "تم تسجيل بريدكِ، شكرًا لكِ.", en: "You're on the list. Thank you." },
  "home.viewAll": { ar: "عرض الكل", en: "View all" },

  "shop.title": { ar: "المتجر", en: "Shop" },
  "shop.filters": { ar: "تصفية", en: "Filters" },
  "shop.category": { ar: "الفئة", en: "Category" },
  "shop.collection": { ar: "المجموعة", en: "Collection" },
  "shop.occasion": { ar: "المناسبة", en: "Occasion" },
  "shop.size": { ar: "المقاس", en: "Size" },
  "shop.color": { ar: "اللون", en: "Colour" },
  "shop.price": { ar: "السعر", en: "Price" },
  "shop.availability": { ar: "التوفر", en: "Availability" },
  "shop.inStockOnly": { ar: "المتوفر فقط", en: "In stock only" },
  "shop.sort": { ar: "الترتيب", en: "Sort" },
  "shop.sortNewest": { ar: "الأحدث", en: "Newest" },
  "shop.sortBest": { ar: "الأكثر مبيعًا", en: "Best selling" },
  "shop.sortPriceAsc": { ar: "السعر: من الأقل", en: "Price: low to high" },
  "shop.sortPriceDesc": { ar: "السعر: من الأعلى", en: "Price: high to low" },
  "shop.results": { ar: "قطعة", en: "items" },
  "shop.empty": { ar: "لا توجد قطع مطابقة لاختياركِ.", en: "No pieces match your selection." },
  "shop.clear": { ar: "إزالة التصفية", en: "Clear filters" },
  "shop.searchPlaceholder": { ar: "ابحثي بالاسم أو الكود…", en: "Search by name or SKU…" },
  "shop.all": { ar: "الكل", en: "All" },

  "badge.new": { ar: "جديد", en: "New" },
  "badge.best": { ar: "الأكثر مبيعًا", en: "Best Seller" },
  "badge.limited": { ar: "محدود", en: "Limited" },
  "badge.sale": { ar: "خصم", en: "Sale" },
  "badge.soldOut": { ar: "نفدت الكمية", en: "Sold Out" },
  "badge.madeToOrder": { ar: "تُصنع حسب الطلب", en: "Made to order" },

  "product.selectColor": { ar: "اختاري اللون", en: "Select colour" },
  "product.selectSize": { ar: "اختاري المقاس", en: "Select size" },
  "product.addToBag": { ar: "أضيفي إلى الحقيبة", en: "Add to bag" },
  "product.added": { ar: "تمت الإضافة إلى الحقيبة", en: "Added to your bag" },
  "product.chooseFirst": { ar: "اختاري اللون والمقاس أولًا", en: "Please choose colour and size" },
  "product.details": { ar: "تفاصيل القطعة", en: "Product details" },
  "product.fabric": { ar: "القماش", en: "Fabric" },
  "product.fit": { ar: "القَصّة", en: "Fit" },
  "product.length": { ar: "الطول", en: "Length" },
  "product.care": { ar: "العناية", en: "Care" },
  "product.sku": { ar: "الكود", en: "SKU" },
  "product.sizeGuide": { ar: "دليل المقاسات", en: "Size guide" },
  "product.askWhatsapp": { ar: "اسألي عن هذه القطعة", en: "Ask about this piece" },
  "product.related": { ar: "قد يناسبكِ أيضًا", en: "You may also like" },
  "product.reviews": { ar: "التقييمات", en: "Reviews" },
  "product.noReviews": { ar: "لا توجد تقييمات بعد.", en: "No reviews yet." },
  "product.lowStock": { ar: "الكمية محدودة", en: "Low stock" },
  "product.sizeUnavailable": { ar: "غير متوفر بهذا اللون", en: "Unavailable in this colour" },

  "cart.title": { ar: "حقيبة التسوق", en: "Shopping Bag" },
  "cart.empty": { ar: "حقيبتكِ فارغة.", en: "Your bag is empty." },
  "cart.continue": { ar: "مواصلة التسوق", en: "Continue shopping" },
  "cart.subtotal": { ar: "المجموع", en: "Subtotal" },
  "cart.shipping": { ar: "الشحن", en: "Shipping" },
  "cart.discount": { ar: "الخصم", en: "Discount" },
  "cart.total": { ar: "الإجمالي", en: "Total" },
  "cart.checkout": { ar: "إتمام الشراء", en: "Checkout" },
  "cart.remove": { ar: "إزالة", en: "Remove" },
  "cart.quantity": { ar: "الكمية", en: "Quantity" },
  "cart.calculatedAtCheckout": { ar: "يُحسب في الخطوة التالية", en: "Calculated at checkout" },
  "cart.coupon": { ar: "كود الخصم", en: "Discount code" },
  "cart.apply": { ar: "تطبيق", en: "Apply" },
  "cart.couponApplied": { ar: "تم تطبيق الكود", en: "Code applied" },
  "cart.couponInvalid": { ar: "الكود غير صالح", en: "Invalid code" },

  "wishlist.title": { ar: "المفضلة", en: "Wishlist" },
  "wishlist.empty": { ar: "لم تضيفي قطعًا إلى المفضلة بعد.", en: "You haven't saved any pieces yet." },

  "checkout.title": { ar: "إتمام الشراء", en: "Checkout" },
  "checkout.customerInfo": { ar: "بيانات العميلة", en: "Your details" },
  "checkout.name": { ar: "الاسم بالكامل", en: "Full name" },
  "checkout.phone": { ar: "رقم الموبايل", en: "Mobile number" },
  "checkout.email": { ar: "البريد الإلكتروني (اختياري)", en: "Email (optional)" },
  "checkout.address": { ar: "العنوان", en: "Address" },
  "checkout.governorate": { ar: "المحافظة", en: "Governorate" },
  "checkout.city": { ar: "المدينة / المنطقة", en: "City / Area" },
  "checkout.street": { ar: "العنوان بالتفصيل", en: "Detailed address" },
  "checkout.notes": { ar: "ملاحظات (اختياري)", en: "Notes (optional)" },
  "checkout.payment": { ar: "طريقة الدفع", en: "Payment method" },
  "checkout.cod": { ar: "الدفع عند الاستلام", en: "Cash on delivery" },
  "checkout.codNote": { ar: "تدفعين للمندوب عند التسليم.", en: "Pay the courier on delivery." },
  "checkout.instapay": { ar: "إنستاباي", en: "InstaPay" },
  "checkout.vodafone": { ar: "فودافون كاش", en: "Vodafone Cash" },
  "checkout.manualNote": {
    ar: "بعد تأكيد الطلب سنراجع التحويل يدويًا ونؤكد الطلب.",
    en: "After you place the order we verify the transfer manually and confirm it.",
  },
  "checkout.reference": { ar: "رقم مرجع التحويل", en: "Transfer reference" },
  "checkout.placeOrder": { ar: "تأكيد الطلب", en: "Place order" },
  "checkout.summary": { ar: "ملخص الطلب", en: "Order summary" },
  "checkout.selectGovernorate": { ar: "اختاري المحافظة", en: "Select governorate" },
  "checkout.deliveryDays": { ar: "مدة التوصيل", en: "Delivery time" },
  "checkout.days": { ar: "أيام عمل", en: "working days" },

  "order.confirmedTitle": { ar: "تم استلام طلبكِ", en: "Your order is placed" },
  "order.number": { ar: "رقم الطلب", en: "Order number" },
  "order.thanks": {
    ar: "شكرًا لثقتكِ في سلام. سنتواصل معكِ لتأكيد الطلب.",
    en: "Thank you for trusting SALAM. We will contact you to confirm.",
  },
  "order.status": { ar: "حالة الطلب", en: "Order status" },
  "order.paymentStatus": { ar: "حالة الدفع", en: "Payment status" },
  "order.items": { ar: "القطع", en: "Items" },
  "order.trackTitle": { ar: "تتبع طلبكِ", en: "Track your order" },
  "order.trackBody": {
    ar: "أدخلي رقم الطلب ورقم الموبايل المستخدم في الطلب.",
    en: "Enter your order number and the mobile number used on the order.",
  },
  "order.trackCta": { ar: "تتبع", en: "Track" },
  "order.notFound": { ar: "لم نجد طلبًا بهذه البيانات.", en: "We couldn't find an order with those details." },
  "order.myOrders": { ar: "طلباتي", en: "My orders" },
  "order.none": { ar: "لا توجد طلبات بعد.", en: "No orders yet." },

  "status.pending": { ar: "بانتظار التأكيد", en: "Pending" },
  "status.confirmed": { ar: "مؤكد", en: "Confirmed" },
  "status.preparing": { ar: "قيد التحضير", en: "Preparing" },
  "status.ready_for_shipping": { ar: "جاهز للشحن", en: "Ready for shipping" },
  "status.shipped": { ar: "تم الشحن", en: "Shipped" },
  "status.out_for_delivery": { ar: "مع مندوب التوصيل", en: "Out for delivery" },
  "status.delivered": { ar: "تم التسليم", en: "Delivered" },
  "status.cancelled": { ar: "ملغي", en: "Cancelled" },

  "pay.pending": { ar: "بانتظار الدفع", en: "Pending" },
  "pay.awaiting_verification": { ar: "بانتظار مراجعة التحويل", en: "Awaiting verification" },
  "pay.paid": { ar: "مدفوع", en: "Paid" },
  "pay.failed": { ar: "فشل", en: "Failed" },
  "pay.refunded": { ar: "مرتجع", en: "Refunded" },

  "finder.title": { ar: "دليل الإطلالة", en: "Style Finder" },
  "finder.occasion": { ar: "ما المناسبة؟", en: "What is the occasion?" },
  "finder.style": { ar: "أي أسلوب يشبهكِ؟", en: "Which style feels like you?" },
  "finder.fit": { ar: "القَصّة المفضلة؟", en: "Preferred fit?" },
  "finder.styleMinimal": { ar: "بسيط جدًا", en: "Very minimal" },
  "finder.styleClassic": { ar: "كلاسيكي هادئ", en: "Quiet classic" },
  "finder.styleDetailed": { ar: "بتفاصيل ناعمة", en: "Softly detailed" },
  "finder.fitRelaxed": { ar: "فضفاض", en: "Relaxed" },
  "finder.fitRegular": { ar: "منتظم", en: "Regular" },
  "finder.results": { ar: "اخترنا لكِ", en: "Chosen for you" },
  "finder.restart": { ar: "من جديد", en: "Start again" },
  "finder.next": { ar: "التالي", en: "Next" },
  "finder.back": { ar: "السابق", en: "Back" },

  "auth.title": { ar: "حسابكِ في سلام", en: "Your SALAM account" },
  "auth.signIn": { ar: "تسجيل الدخول", en: "Sign in" },
  "auth.signUp": { ar: "إنشاء حساب", en: "Create account" },
  "auth.email": { ar: "البريد الإلكتروني", en: "Email" },
  "auth.password": { ar: "كلمة المرور", en: "Password" },
  "auth.fullName": { ar: "الاسم بالكامل", en: "Full name" },
  "auth.google": { ar: "المتابعة بحساب Google", en: "Continue with Google" },
  "auth.checkEmail": {
    ar: "أرسلنا رسالة تأكيد إلى بريدكِ، افتحيها لتفعيل الحساب.",
    en: "We sent a confirmation email — open it to activate your account.",
  },
  "auth.or": { ar: "أو", en: "or" },

  "about.title": { ar: "عن سلام", en: "About SALAM" },
  "size.title": { ar: "دليل المقاسات", en: "Size Guide" },
  "ship.title": { ar: "الشحن والاستبدال", en: "Shipping & Returns" },
  "contact.title": { ar: "تواصلي معنا", en: "Contact us" },
  "contact.whatsapp": { ar: "محادثة واتساب", en: "Chat on WhatsApp" },
  "contact.hours": { ar: "من السبت إلى الخميس، 10 ص – 8 م", en: "Saturday to Thursday, 10am – 8pm" },

  "common.egp": { ar: "ج.م", en: "EGP" },
  "common.loading": { ar: "جاري التحميل…", en: "Loading…" },
  "common.save": { ar: "حفظ", en: "Save" },
  "common.cancel": { ar: "إلغاء", en: "Cancel" },
  "common.delete": { ar: "حذف", en: "Delete" },
  "common.edit": { ar: "تعديل", en: "Edit" },
  "common.close": { ar: "إغلاق", en: "Close" },
  "common.back": { ar: "رجوع", en: "Back" },
  "common.saved": { ar: "تم الحفظ", en: "Saved" },
  "common.error": { ar: "حدث خطأ، حاولي مرة أخرى.", en: "Something went wrong. Please try again." },
  "common.required": { ar: "هذا الحقل مطلوب", en: "This field is required" },
  "footer.rights": { ar: "جميع الحقوق محفوظة", en: "All rights reserved" },
  "footer.help": { ar: "المساعدة", en: "Help" },
  "footer.brand": { ar: "العلامة", en: "Brand" },
  "footer.shopFooter": { ar: "التسوق", en: "Shop" },
};

type I18nValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  t: (key: keyof typeof dict | string) => string;
  pick: (ar?: string | null, en?: string | null) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "ar" || stored === "en") setLocaleState(stored);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      setLocale,
      toggleLocale: () => setLocale(locale === "ar" ? "en" : "ar"),
      t: (key) => dict[key as string]?.[locale] ?? (key as string),
      pick: (ar, en) => (locale === "ar" ? (ar ?? en ?? "") : (en ?? ar ?? "")),
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
