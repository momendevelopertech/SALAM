import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { getAdminOrders, updateOrder } from "@/lib/admin.functions";
import { formatDate, formatPrice } from "@/lib/format";
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

const STATUS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "confirmed", label: "مؤكد" },
  { value: "preparing", label: "قيد التجهيز" },
  { value: "ready_for_shipping", label: "جاهز للشحن" },
  { value: "shipped", label: "تم الشحن" },
  { value: "out_for_delivery", label: "قيد التوصيل" },
  { value: "delivered", label: "تم التسليم" },
  { value: "cancelled", label: "ملغي" },
];

const PAYMENT: { value: PaymentStatus; label: string }[] = [
  { value: "pending", label: "غير مدفوع" },
  { value: "awaiting_verification", label: "بانتظار المراجعة" },
  { value: "paid", label: "مدفوع" },
  { value: "failed", label: "فشل" },
  { value: "refunded", label: "مسترد" },
];

const METHOD: Record<Order["payment_method"], string> = {
  cod: "الدفع عند الاستلام",
  instapay: "إنستاباي",
  vodafone_cash: "فودافون كاش",
};

function AdminOrders() {
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
      toast.success("تم تحديث الطلب");
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const orders = (data?.orders ?? []) as unknown as Order[];
  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">الطلبات</h1>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {STATUS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد طلبات بهذه الحالة.</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>العميلة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>الدفع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((o) => (
                <>
                  <TableRow key={o.id}>
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
                      {formatDate(o.created_at, "ar")}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatPrice(o.total, "ar")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={o.payment_status === "paid" ? "default" : "secondary"}>
                        {PAYMENT.find((p) => p.value === o.payment_status)?.label}
                      </Badge>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {METHOD[o.payment_method]}
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
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
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
                        {expanded === o.id ? "إغلاق" : "تفاصيل"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expanded === o.id && (
                    <TableRow key={`${o.id}-details`}>
                      <TableCell colSpan={7} className="bg-muted/40">
                        <OrderDetails
                          order={o}
                          onSave={(v) => mutation.mutate({ id: o.id, ...v })}
                          saving={mutation.isPending}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </>
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
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.payment_status);
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [notes, setNotes] = useState(order.admin_notes ?? "");

  return (
    <div className="grid gap-6 py-4 lg:grid-cols-3">
      <div className="space-y-1 text-sm">
        <p className="font-medium">بيانات الشحن</p>
        <p className="text-muted-foreground">
          {order.governorate} — {order.city}
        </p>
        <p className="text-muted-foreground">{order.address}</p>
        {order.email ? (
          <p dir="ltr" className="text-muted-foreground">
            {order.email}
          </p>
        ) : null}
        {order.notes ? <p className="text-muted-foreground">ملاحظة العميلة: {order.notes}</p> : null}
        {order.payment_reference ? (
          <p className="text-muted-foreground">مرجع الدفع: {order.payment_reference}</p>
        ) : null}
      </div>

      <div className="space-y-2 text-sm">
        <p className="font-medium">المنتجات</p>
        {order.order_items.map((it) => (
          <div key={it.id} className="flex justify-between gap-3">
            <span className="text-muted-foreground">
              {it.name_ar} — {it.color_ar} / {it.size} × {it.quantity}
            </span>
            <span>{formatPrice(it.line_total, "ar")}</span>
          </div>
        ))}
        <div className="mt-2 border-t pt-2 text-xs text-muted-foreground">
          <p>المجموع: {formatPrice(order.subtotal, "ar")}</p>
          <p>الخصم: {formatPrice(order.discount, "ar")}</p>
          <p>الشحن: {formatPrice(order.shipping_fee, "ar")}</p>
          <p className="text-foreground">الإجمالي: {formatPrice(order.total, "ar")}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">حالة الدفع</Label>
          <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">رقم التتبع</Label>
          <Input dir="ltr" value={tracking} onChange={(e) => setTracking(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">ملاحظات الإدارة</Label>
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button
          size="sm"
          disabled={saving}
          onClick={() => onSave({ paymentStatus, trackingNumber: tracking, adminNotes: notes })}
        >
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}
