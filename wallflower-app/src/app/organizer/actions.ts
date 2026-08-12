"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { destroyCurrentSession, getCurrentOrganizer } from "@/lib/wallflower/auth";
import { generateUniqueEventSlug } from "@/lib/wallflower/slug";
import { applySubmissionDecision } from "@/lib/wallflower/decision";
import { eventCreatedEmail, getBaseUrl, sendEmail } from "@/lib/wallflower/email";

export async function logout() {
  await destroyCurrentSession();
  redirect("/login");
}

export type CreateEventState = { status: "idle" } | { status: "error"; error: string };

export async function createEvent(
  _prevState: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  const organizer = await getCurrentOrganizer();
  if (!organizer) redirect("/login");

  const recipientName = String(formData.get("recipientName") || "").trim();
  const occasionText = String(formData.get("occasionText") || "").trim();
  const revealDateRaw = String(formData.get("revealDate") || "").trim();

  if (!recipientName) return { status: "error", error: "Recipient name is required." };
  if (!occasionText) return { status: "error", error: "Occasion is required." };

  let revealDate: Date | null = null;
  if (revealDateRaw) {
    const parsed = new Date(revealDateRaw);
    if (Number.isNaN(parsed.getTime())) return { status: "error", error: "Invalid reveal date." };
    revealDate = parsed;
  }

  const slug = await generateUniqueEventSlug(recipientName);
  const event = await prisma.event.create({
    data: { organizerId: organizer.id, slug, recipientName, occasionText, revealDate },
  });

  const baseUrl = getBaseUrl();
  await sendEmail({
    to: organizer.email,
    ...eventCreatedEmail({
      recipientName,
      occasionText,
      revealDate,
      dashboardUrl: `${baseUrl}/organizer/events/${event.id}`,
      contributionUrl: `${baseUrl}/e/${event.slug}`,
    }),
  });

  revalidatePath("/organizer");
  redirect(`/organizer/events/${event.id}`);
}

export async function decideSubmission(
  submissionId: string,
  decision: "approved" | "denied",
  formData?: FormData
) {
  const organizer = await getCurrentOrganizer();
  if (!organizer) redirect("/login");

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { event: true },
  });
  if (!submission || submission.event.organizerId !== organizer.id) {
    throw new Error("Submission not found");
  }

  const note = String(formData?.get("note") || "").trim() || null;
  await applySubmissionDecision(submission, decision, note);
  revalidatePath(`/organizer/events/${submission.eventId}`);
}

export async function setAutoApprove(eventId: string, autoApprove: boolean) {
  const organizer = await getCurrentOrganizer();
  if (!organizer) redirect("/login");

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.organizerId !== organizer.id) {
    throw new Error("Event not found");
  }

  await prisma.event.update({ where: { id: eventId }, data: { autoApprove } });
  revalidatePath(`/organizer/events/${eventId}`);
}

export async function revealEvent(eventId: string) {
  const organizer = await getCurrentOrganizer();
  if (!organizer) redirect("/login");

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.organizerId !== organizer.id) {
    throw new Error("Event not found");
  }

  await prisma.event.update({ where: { id: eventId }, data: { status: "revealed" } });
  revalidatePath(`/organizer/events/${eventId}`);
}
