import { prisma } from "@/lib/prisma";
import { serializeSubmission } from "@/lib/wallflower/serialize";

export async function GET(_request: Request, ctx: RouteContext<"/api/submissions/[editToken]">) {
  const { editToken } = await ctx.params;
  const submission = await prisma.submission.findUnique({ where: { editToken } });
  if (!submission) {
    return Response.json({ error: "Submission not found" }, { status: 404 });
  }
  return Response.json(serializeSubmission(submission));
}
