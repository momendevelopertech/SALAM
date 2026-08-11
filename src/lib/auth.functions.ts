import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const register = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        fullName: z.string().min(2).max(120).optional(),
        email: z.string().email(),
        password: z.string().min(6).max(128),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { prisma } = await import("@/lib/db");
    const { hashPassword } = await import("@/lib/password");
    const { createSession } = await import("@/lib/auth.server");

    const email = data.email.trim().toLowerCase();
    const exists = await prisma.users.findUnique({ where: { email } });
    if (exists) throw new Error("VALIDATION_ERROR: هذا البريد مسجّل بالفعل");

    const user = await prisma.users.create({
      data: {
        email,
        password_hash: hashPassword(data.password),
        full_name: data.fullName?.trim() || null,
        role: "customer",
      },
    });
    await createSession(user.id);
    return { userId: user.id, email: user.email, fullName: user.full_name, role: user.role };
  });

export const login = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ email: z.string().email(), password: z.string().min(1).max(128) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { prisma } = await import("@/lib/db");
    const { verifyPassword } = await import("@/lib/password");
    const { createSession } = await import("@/lib/auth.server");

    const email = data.email.trim().toLowerCase();
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user || !verifyPassword(data.password, user.password_hash)) {
      throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
    if (!user.is_active) throw new Error("هذا الحساب معطّل");
    await createSession(user.id);
    return { userId: user.id, email: user.email, fullName: user.full_name, role: user.role };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const { destroySession } = await import("@/lib/auth.server");
  await destroySession();
  return { ok: true };
});

export const getMe = createServerFn({ method: "GET" }).handler(async () => {
  const { getSessionUser } = await import("@/lib/auth.server");
  const user = await getSessionUser();
  if (!user) return null;
  return { userId: user.id, email: user.email, fullName: user.full_name, role: user.role };
});
