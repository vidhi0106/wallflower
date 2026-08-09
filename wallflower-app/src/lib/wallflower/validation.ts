import { z } from "zod";
import { MAX_STEMS, isEnvelopeColorId, isFlowerId } from "./catalog";

export const submissionInputSchema = z.object({
  contributorName: z.string().trim().min(1, "Your name is required").max(120),
  contributorEmail: z.string().trim().email("Enter a valid email").max(200),
  noteText: z.string().trim().min(1, "Write a note before sending").max(4000),
  color: z.string().refine(isEnvelopeColorId, "Unknown envelope color"),
  flowerIds: z
    .array(z.string().refine(isFlowerId, "Unknown flower"))
    .min(1, "Add at least one flower")
    .max(MAX_STEMS, `You can add up to ${MAX_STEMS} flowers`),
});

export const submissionUpdateSchema = submissionInputSchema.extend({
  editToken: z.string().min(1),
});
