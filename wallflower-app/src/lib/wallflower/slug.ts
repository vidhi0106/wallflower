import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "event";
}

export async function generateUniqueEventSlug(recipientName: string) {
  const base = slugify(recipientName);
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const existing = await prisma.event.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique event slug");
}
