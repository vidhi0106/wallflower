import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "wallflower_session";
const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createMagicLink(rawEmail: string) {
  const email = normalizeEmail(rawEmail);
  const link = await prisma.magicLink.create({
    data: { email, expiresAt: new Date(Date.now() + MAGIC_LINK_TTL_MS) },
  });
  return link;
}

export async function consumeMagicLink(token: string) {
  const link = await prisma.magicLink.findUnique({ where: { token } });
  if (!link || link.consumedAt || link.expiresAt.getTime() < Date.now()) {
    return null;
  }
  await prisma.magicLink.update({ where: { id: link.id }, data: { consumedAt: new Date() } });
  const organizer = await prisma.organizer.upsert({
    where: { email: link.email },
    update: {},
    create: { email: link.email },
  });
  return organizer;
}

export async function createSession(organizerId: string) {
  return prisma.session.create({
    data: { organizerId, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
  });
}

export async function getCurrentOrganizer() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({ where: { token }, include: { organizer: true } });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  return session.organizer;
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};
