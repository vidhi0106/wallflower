import type { Submission } from "@prisma/client";

export function serializeSubmission(submission: Submission) {
  return {
    editToken: submission.editToken,
    contributorName: submission.contributorName,
    contributorEmail: submission.contributorEmail,
    noteText: submission.noteText,
    bouquetData: submission.bouquetData,
    status: submission.status,
  };
}
