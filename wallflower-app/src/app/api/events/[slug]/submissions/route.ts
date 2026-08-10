import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { serializeSubmission } from "@/lib/wallflower/serialize";
import { submissionInputSchema, submissionUpdateSchema } from "@/lib/wallflower/validation";
import {
  getBaseUrl,
  reviewRequestEmail,
  sendEmail,
  submissionConfirmationEmail,
} from "@/lib/wallflower/email";

export async function POST(request: Request, ctx: RouteContext<"/api/events/[slug]/submissions">) {
  const { slug } = await ctx.params;
  const event = await prisma.event.findUnique({ where: { slug }, include: { organizer: true } });
  if (!event) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  const parsed = submissionInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid submission" }, { status: 400 });
  }
  const { contributorName, contributorEmail, noteText, color, flowerIds } = parsed.data;

  try {
    const submission = await prisma.submission.create({
      data: {
        eventId: event.id,
        contributorName,
        contributorEmail,
        noteText,
        bouquetData: { flowerIds, color },
      },
    });

    const baseUrl = getBaseUrl();
    await Promise.all([
      sendEmail({
        to: submission.contributorEmail,
        ...submissionConfirmationEmail({
          recipientName: event.recipientName,
          occasionText: event.occasionText,
          editUrl: `${baseUrl}/e/${event.slug}?edit=${submission.editToken}`,
        }),
      }),
      sendEmail({
        to: event.organizer.email,
        ...reviewRequestEmail({
          contributorName: submission.contributorName,
          recipientName: event.recipientName,
          occasionText: event.occasionText,
          reviewUrl: `${baseUrl}/review/${submission.reviewToken}`,
        }),
      }),
    ]);

    return Response.json(serializeSubmission(submission), { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return Response.json(
        { error: "A bouquet has already been sent from this email for this event." },
        { status: 409 }
      );
    }
    throw e;
  }
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/events/[slug]/submissions">) {
  const { slug } = await ctx.params;
  const event = await prisma.event.findUnique({ where: { slug }, include: { organizer: true } });
  if (!event) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  const parsed = submissionUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid submission" }, { status: 400 });
  }
  const { editToken, contributorName, contributorEmail, noteText, color, flowerIds } = parsed.data;

  const existing = await prisma.submission.findUnique({ where: { editToken } });
  if (!existing || existing.eventId !== event.id) {
    return Response.json({ error: "Submission not found" }, { status: 404 });
  }

  try {
    const submission = await prisma.submission.update({
      where: { editToken },
      data: {
        contributorName,
        contributorEmail,
        noteText,
        bouquetData: { flowerIds, color },
        status: "pending",
        denyNote: null,
      },
    });

    if (existing.status !== "pending") {
      // Revised after a decision — the organizer needs to look again.
      await sendEmail({
        to: event.organizer.email,
        ...reviewRequestEmail({
          contributorName: submission.contributorName,
          recipientName: event.recipientName,
          occasionText: event.occasionText,
          reviewUrl: `${getBaseUrl()}/review/${submission.reviewToken}`,
        }),
      });
    }

    return Response.json(serializeSubmission(submission));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return Response.json(
        { error: "Another bouquet for this event already uses that email." },
        { status: 409 }
      );
    }
    throw e;
  }
}
