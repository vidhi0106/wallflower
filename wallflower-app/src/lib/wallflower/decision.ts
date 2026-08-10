import type { Event, Submission } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { denyNotificationEmail, getBaseUrl, sendEmail } from "@/lib/wallflower/email";

export async function applySubmissionDecision(
  submission: Submission & { event: Event },
  decision: "approved" | "denied",
  note: string | null
) {
  const updated = await prisma.submission.update({
    where: { id: submission.id },
    data: { status: decision, denyNote: decision === "denied" ? note : null },
  });

  if (decision === "denied") {
    await sendEmail({
      to: submission.contributorEmail,
      ...denyNotificationEmail({
        recipientName: submission.event.recipientName,
        occasionText: submission.event.occasionText,
        note,
        editUrl: `${getBaseUrl()}/e/${submission.event.slug}?edit=${submission.editToken}`,
      }),
    });
  }

  return updated;
}
