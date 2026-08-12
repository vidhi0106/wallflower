import type { Submission } from "@prisma/client";

export function serializeSubmission(submission: Submission) {
  return {
    id: submission.id,
    editToken: submission.editToken,
    contributorName: submission.contributorName,
    contributorEmail: submission.contributorEmail,
    noteText: submission.noteText,
    bouquetData: submission.bouquetData,
    status: submission.status,
    denyNote: submission.status === "denied" ? submission.denyNote : null,
  };
}
