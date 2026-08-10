import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { decideByReviewToken } from "@/app/review/actions";
import type { EnvelopeColorId, FlowerId } from "@/lib/wallflower/catalog";

const STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting your review",
  approved: "You approved this bouquet",
  denied: "You asked for a change",
};

export default async function ReviewByTokenPage(props: PageProps<"/review/[reviewToken]">) {
  const { reviewToken } = await props.params;

  const submission = await prisma.submission.findUnique({
    where: { reviewToken },
    include: { event: true },
  });
  if (!submission) notFound();

  const bouquet = submission.bouquetData as { flowerIds: FlowerId[]; color: EnvelopeColorId } | null;
  const approve = decideByReviewToken.bind(null, reviewToken, "approved");
  const deny = decideByReviewToken.bind(null, reviewToken, "denied");

  return (
    <div className="min-h-screen flex justify-center" style={{ background: "#EFEAE0" }}>
      <div className="w-full max-w-sm px-6 py-16" style={{ color: "#4a3d2c" }}>
        <p className="text-xs uppercase tracking-wide" style={{ color: "#a8977a" }}>
          {submission.event.recipientName}&rsquo;s {submission.event.occasionText}
        </p>
        <h1 className="font-caveat font-bold text-3xl mt-1">{submission.contributorName}&rsquo;s bouquet</h1>
        <p className="text-xs mt-1" style={{ color: "#a8977a" }}>
          {submission.contributorEmail}
        </p>

        <div className="mt-6 px-4 py-4" style={{ background: "#F7EFDD", borderRadius: 10 }}>
          <p className="text-sm whitespace-pre-wrap">{submission.noteText}</p>
          {bouquet && (
            <p className="text-xs mt-3" style={{ color: "#7c6a4e" }}>
              {bouquet.color} envelope · {bouquet.flowerIds.length} flower{bouquet.flowerIds.length === 1 ? "" : "s"}
            </p>
          )}
        </div>

        <p className="text-sm mt-6 font-nunito font-bold">{STATUS_LABEL[submission.status]}</p>
        {submission.status === "denied" && submission.denyNote && (
          <p className="text-xs mt-1" style={{ color: "#a8977a" }}>
            Your note: &ldquo;{submission.denyNote}&rdquo;
          </p>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <form action={approve}>
            <button
              type="submit"
              className="w-full font-nunito font-bold"
              style={{
                background: "#6b7d5c",
                color: "#FBF6E9",
                border: "none",
                borderRadius: 10,
                padding: 14,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Approve
            </button>
          </form>

          <form action={deny} className="flex flex-col gap-2">
            <textarea
              name="note"
              rows={2}
              placeholder="Optional note to send with the denial…"
              defaultValue={submission.status === "denied" ? (submission.denyNote ?? "") : ""}
              style={{
                border: "1px solid rgba(122,100,70,0.35)",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 14,
                resize: "none",
                color: "#4a3d2c",
                background: "#FBF6E9",
              }}
            />
            <button
              type="submit"
              className="w-full font-nunito font-bold"
              style={{
                background: "transparent",
                color: "#b0503f",
                border: "1px solid #b0503f",
                borderRadius: 10,
                padding: 14,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Deny
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
