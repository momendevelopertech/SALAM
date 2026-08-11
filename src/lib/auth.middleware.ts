import { createMiddleware } from "@tanstack/react-start";

export const requireAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { getSessionUser } = await import("./auth.server");
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  return next({ context: { userId: user.id, user } });
});

export const requireAdmin = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { getSessionUser } = await import("./auth.server");
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  if (user.role !== "admin") throw new Error("Forbidden: admin role required");
  return next({ context: { userId: user.id, user } });
});
