"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { applySubmissionDecision } from "@/lib/wallflower/decision";

export async function decideByReviewToken(
  reviewToken: string,
  decision: "approved" | "denied",
  formData?: FormData
) {
  const submission = await prisma.submission.findUnique({
    where: { reviewToken },
    include: { event: true },
  });
  if (!submission) throw new Error("Submission not found");

  const note = String(formData?.get("note") || "").trim() || null;
  await applySubmissionDecision(submission, decision, note);
  revalidatePath(`/review/${reviewToken}`);
}
