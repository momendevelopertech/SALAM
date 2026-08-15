import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { Printer } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getAdminOrders, updateOrder } from "@/lib/admin.functions";
import { formatDate, formatPrice } from "@/lib/format";
import { OrderReceipt } from "@/components/order-receipt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready_for_shipping"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

type PaymentStatus = "pending" | "awaiting_verification" | "paid" | "failed" | "refunded";

type Item = {
  id: string;
  name_ar: string;
  color_ar: string | null;
  size: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  governorate: string;
  city: string;
  address: string;
  notes: string | null;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  coupon_code: string | null;
  status: OrderStatus;
  payment_method: "cod" | "instapay" | "vodafone_cash";
  payment_status: PaymentStatus;
  payment_reference: string | null;
  tracking_number: string | null;
  admin_notes: string | null;
  created_at: string;
  order_items: Item[];
};

const STATUS: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_shipping",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const PAYMENT: PaymentStatus[] = ["pending", "awaiting_verification", "paid", "failed", "refunded"];

const METHOD_LABELS: Record<Order["payment_method"], string> = {
  cod: "admin.orders.payCod",
  instapay: "admin.orders.payInstapay",
  vodafone_cash: "admin.orders.payVodafone",
};

function AdminOrders() {
  const { t, locale } = useI18n();
  const fetchOrders = useServerFn(getAdminOrders);
  const patch = useServerFn(updateOrder);
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => fetchOrders(),
  });

  const mutation = useMutation({
    mutationFn: (v: {
      id: string;
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      trackingNumber?: string;
      adminNotes?: string;
    }) => patch({ data: v }),
    onSuccess: () => {
      toast.success(t("admin.orders.updated"));
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const orders = (data?.orders ?? []) as unknown as Order[];
  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">{t("admin.nav.orders")}</h1>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.orders.allStatuses")}</SelectItem>
            {STATUS.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("admin.orders.emptyStatus")}</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">{t("admin.orders.orderNumber")}</TableHead>
                <TableHead>{t("admin.orders.customer")}</TableHead>
                <TableHead>{t("admin.orders.date")}</TableHead>
                <TableHead>{t("admin.orders.total")}</TableHead>
                <TableHead>{t("admin.orders.payment")}</TableHead>
                <TableHead>{t("admin.orders.status")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((o) => (
                <Fragment key={o.id}>
                  <TableRow>
                    <TableCell dir="ltr" className="font-medium">
                      {o.order_number}
                    </TableCell>
                    <TableCell>
                      <p>{o.customer_name}</p>
                      <p dir="ltr" className="text-xs text-muted-foreground">
                        {o.phone}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      {formatDate(o.created_at, locale)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatPrice(o.total, locale)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={o.payment_status === "paid" ? "default" : "secondary"}>
                        {t(`pay.${o.payment_status}`)}
                      </Badge>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {t(METHOD_LABELS[o.payment_method])}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={o.status}
                        onValueChange={(v) =>
                          mutation.mutate({ id: o.id, status: v as OrderStatus })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {t(`status.${s}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                      >
                        {expanded === o.id ? t("common.close") : t("admin.orders.details")}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expanded === o.id && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/40">
                        <OrderDetails
                          order={o}
                          onSave={(v) => mutation.mutate({ id: o.id, ...v })}
                          saving={mutation.isPending}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function OrderDetails({
  order,
  onSave,
  saving,
}: {
  order: Order;
  onSave: (v: {
    paymentStatus?: PaymentStatus;
    trackingNumber?: string;
    adminNotes?: string;
  }) => void;
  saving: boolean;
}) {
  const { t, locale } = useI18n();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.payment_status);
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [notes, setNotes] = useState(order.admin_notes ?? "");

  return (
    <div className="grid gap-6 py-4 lg:grid-cols-3">
      <div className="space-y-1 text-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-medium">{t("admin.orders.shipping")}</p>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            {t("admin.orders.print")}
          </Button>
        </div>
        <p className="text-muted-foreground">
          {order.governorate} — {order.city}
        </p>
        <p className="text-muted-foreground">{order.address}</p>
        {order.email ? (
          <p dir="ltr" className="text-muted-foreground">
            {order.email}
          </p>
        ) : null}
        {order.notes ? (
          <p className="text-muted-foreground">
            {t("admin.orders.customerNote")} {order.notes}
          </p>
        ) : null}
        {order.payment_reference ? (
          <p className="text-muted-foreground">
            {t("admin.orders.paymentRef")} {order.payment_reference}
          </p>
        ) : null}
      </div>

      <div className="space-y-2 text-sm">
        <p className="font-medium">{t("admin.orders.products")}</p>
        {order.order_items.map((it) => (
          <div key={it.id} className="flex justify-between gap-3">
            <span className="text-muted-foreground">
              {it.name_ar} — {it.color_ar} / {it.size} × {it.quantity}
            </span>
            <span>{formatPrice(it.line_total, locale)}</span>
          </div>
        ))}
        <div className="mt-2 border-t pt-2 text-xs text-muted-foreground">
          <p>
            {t("admin.orders.subtotal")} {formatPrice(order.subtotal, locale)}
          </p>
          <p>
            {t("admin.orders.discount")} {formatPrice(order.discount, locale)}
          </p>
          <p>
            {t("admin.orders.shippingFee")} {formatPrice(order.shipping_fee, locale)}
          </p>
          <p className="text-foreground">
            {t("admin.orders.grandTotal")} {formatPrice(order.total, locale)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">{t("admin.orders.paymentStatus")}</Label>
          <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT.map((p) => (
                <SelectItem key={p} value={p}>
                  {t(`pay.${p}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t("admin.orders.tracking")}</Label>
          <Input dir="ltr" value={tracking} onChange={(e) => setTracking(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t("admin.orders.adminNotes")}</Label>
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button
          size="sm"
          disabled={saving}
          onClick={() => onSave({ paymentStatus, trackingNumber: tracking, adminNotes: notes })}
        >
          {t("admin.orders.saveChanges")}
        </Button>
      </div>

      <OrderReceipt order={order} />
    </div>
  );
}
