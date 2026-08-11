import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { login, register } from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — SALAM | سلام" },
      {
        name: "description",
        content: "سجّلي الدخول إلى حسابك في سلام لمتابعة طلباتك أو للوصول إلى لوحة الإدارة.",
      },
      { property: "og:title", content: "Sign in — SALAM" },
      { property: "og:description", content: "Sign in to your SALAM account or the admin dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const signIn = useServerFn(login);
  const signUp = useServerFn(register);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  async function quickAdminLogin() {
    setMode("signin");
    setBusy(true);
    try {
      await signIn({ data: { email: "admin@salam.store", password: "SalamAdmin@2026" } });
      toast.success("تم تسجيل الدخول كأدمن");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn({ data: { email, password } });
        toast.success("تم تسجيل الدخول");
        navigate({ to: "/admin" });
      } else {
        await signUp({ data: { email, password, fullName } });
        toast.success("تم إنشاء الحساب");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setBusy(false);
    }
  }


  return (
    <div className="container-salam flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <div className="gold-rule" />
        <h1 className="mt-6 font-display text-3xl">
          {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin"
            ? "للوصول إلى حسابك أو لوحة الإدارة."
            : "أنشئي حسابك لمتابعة طلباتك بسهولة."}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="fullName">الاسم</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              required
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "signin" ? "دخول" : "إنشاء الحساب"}
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          disabled={busy}
          onClick={quickAdminLogin}
        >
          دخول سريع كأدمن (تيست)
        </Button>


        <button
          type="button"
          className="mt-6 text-sm text-primary underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "ليس لديكِ حساب؟ إنشاء حساب" : "لديكِ حساب؟ تسجيل الدخول"}
        </button>

        <div className="mt-8">
          <Link to="/" className="text-sm text-muted-foreground underline">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
