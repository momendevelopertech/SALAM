import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n";
import { formatDate, formatPrice } from "@/lib/format";

type ReceiptItem = {
  name_ar: string;
  color_ar: string | null;
  size: string | null;
  quantity: number;
  line_total: number;
};

export type ReceiptOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  notes: string | null;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  payment_method: "cod" | "instapay" | "vodafone_cash";
  payment_status: "pending" | "awaiting_verification" | "paid" | "failed" | "refunded";
  created_at: string;
  order_items: ReceiptItem[];
};

const METHOD_LABELS: Record<ReceiptOrder["payment_method"], string> = {
  cod: "admin.orders.payCod",
  instapay: "admin.orders.payInstapay",
  vodafone_cash: "admin.orders.payVodafone",
};

export function OrderReceipt({ order }: { order: ReceiptOrder }) {
  const { t, locale } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="print-receipt" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="receipt-brand">SALAM</div>
      <div className="receipt-title">{t("admin.orders.invoice")}</div>

      <div className="receipt-row">
        <span>{t("admin.orders.orderNumber")}</span>
        <span>{order.order_number}</span>
      </div>
      <div className="receipt-row">
        <span>{t("admin.orders.dateShort")}</span>
        <span>{formatDate(order.created_at, locale)}</span>
      </div>

      <div className="receipt-divider" />

      <div className="receipt-row">
        <span>{t("admin.orders.customer")}</span>
        <span>{order.customer_name}</span>
      </div>
      <div className="receipt-row" dir="ltr">
        <span>{t("order.phone")}</span>
        <span>{order.phone}</span>
      </div>
      <div className="receipt-row">
        <span>{t("admin.orders.shipping")}</span>
        <span>
          {order.governorate} — {order.city}
        </span>
      </div>
      <div className="receipt-row">
        <span>{t("admin.orders.payMethod")}</span>
        <span>{t(METHOD_LABELS[order.payment_method])}</span>
      </div>
      <div className="receipt-row">
        <span>{t("admin.orders.paymentStatus")}</span>
        <span>{t(`pay.${order.payment_status}`)}</span>
      </div>

      <div className="receipt-divider" />

      {order.order_items.map((it, i) => (
        <div key={i} className="receipt-item">
          <div className="receipt-item-line">
            <span className="receipt-item-name">{it.name_ar}</span>
            <span>{formatPrice(it.line_total, locale)}</span>
          </div>
          <div className="receipt-item-meta">
            {it.color_ar} {it.size ? `/ ${it.size}` : ""} × {it.quantity}
          </div>
        </div>
      ))}

      <div className="receipt-divider" />

      <div className="receipt-row">
        <span>{t("admin.orders.subtotal")}</span>
        <span>{formatPrice(order.subtotal, locale)}</span>
      </div>
      <div className="receipt-row">
        <span>{t("admin.orders.discount")}</span>
        <span>{formatPrice(order.discount, locale)}</span>
      </div>
      <div className="receipt-row">
        <span>{t("admin.orders.shippingFee")}</span>
        <span>{formatPrice(order.shipping_fee, locale)}</span>
      </div>
      <div className="receipt-row receipt-total">
        <span>{t("admin.orders.totalItems")}</span>
        <span>{formatPrice(order.total, locale)}</span>
      </div>

      <div className="receipt-divider" />

      <div className="receipt-footer">{t("admin.orders.receiptFooter")}</div>
    </div>,
    document.body,
  );
}
