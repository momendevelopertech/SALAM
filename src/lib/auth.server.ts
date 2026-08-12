import { createHash, randomBytes } from "node:crypto";

const SESSION_COOKIE = "salam_session";
const SESSION_DAYS = 30;

function tokenHash(token: string) {
  return createHash("sha256")
    .update(token)
    .update(process.env["AUTH_SECRET"] ?? "")
    .digest("hex");
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    secure: process.env["NODE_ENV"] === "production",
  };
}

async function getSessionCookie() {
  const { getCookies } = await import("@tanstack/react-start/server");
  return getCookies()[SESSION_COOKIE];
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const { prisma } = await import("@/lib/db");
  await prisma.sessions.create({
    data: { user_id: userId, token_hash: tokenHash(token), expires_at: expiresAt },
  });
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function destroySession() {
  const token = await getSessionCookie();
  if (token) {
    const { prisma } = await import("@/lib/db");
    await prisma.sessions.deleteMany({ where: { token_hash: tokenHash(token) } });
  }
  const { deleteCookie } = await import("@tanstack/react-start/server");
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

export async function getSessionUser() {
  const token = await getSessionCookie();
  if (!token) return null;
  const { prisma } = await import("@/lib/db");
  const session = await prisma.sessions.findUnique({
    where: { token_hash: tokenHash(token) },
    include: { users: true },
  });
  if (!session || session.expires_at.getTime() < Date.now() || !session.users.is_active)
    return null;
  return session.users;
}
