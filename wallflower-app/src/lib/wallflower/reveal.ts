import type { Event } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Lazily flips an event to "revealed" once its revealDate has passed.
 * There's no cron/scheduler in this deployment target, so the auto-fire
 * is implemented as a check-on-read: whoever loads the event next
 * (recipient or organizer) triggers the flip.
 */
export async function maybeAutoReveal(event: Event): Promise<Event> {
  if (event.status !== "collecting" || !event.revealDate) return event;
  if (event.revealDate.getTime() > Date.now()) return event;

  return prisma.event.update({ where: { id: event.id }, data: { status: "revealed" } });
}
