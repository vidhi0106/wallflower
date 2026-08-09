import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizer } from "@/lib/wallflower/auth";
import { decideSubmission } from "@/app/organizer/actions";
import type { EnvelopeColorId, FlowerId } from "@/lib/wallflower/catalog";

function DecisionButtons({ submissionId }: { submissionId: string }) {
  const approve = decideSubmission.bind(null, submissionId, "approved");
  const deny = decideSubmission.bind(null, submissionId, "denied");
  return (
    <div className="flex gap-2">
      <form action={approve}>
        <button
          type="submit"
          className="font-nunito font-bold text-sm"
          style={{ background: "#6b7d5c", color: "#FBF6E9", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer" }}
        >
          Approve
        </button>
      </form>
      <form action={deny}>
        <button
          type="submit"
          className="font-nunito font-bold text-sm"
          style={{ background: "transparent", color: "#b0503f", border: "1px solid #b0503f", borderRadius: 8, padding: "8px 14px", cursor: "pointer" }}
        >
          Deny
        </button>
      </form>
    </div>
  );
}

function SubmissionRow({
  submission,
  actionable,
}: {
  submission: {
    id: string;
    contributorName: string;
    contributorEmail: string;
    noteText: string;
    bouquetData: unknown;
  };
  actionable: boolean;
}) {
  const bouquet = submission.bouquetData as { flowerIds: FlowerId[]; color: EnvelopeColorId } | null;
  return (
    <li className="px-4 py-3" style={{ background: "#F7EFDD", borderRadius: 10 }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-caveat font-bold text-lg" style={{ color: "#4a3d2c" }}>
            {submission.contributorName}
          </div>
          <div className="text-xs" style={{ color: "#a8977a" }}>
            {submission.contributorEmail}
          </div>
          <p className="text-sm mt-2" style={{ color: "#4a3d2c" }}>
            {submission.noteText}
          </p>
          {bouquet && (
            <div className="text-xs mt-2" style={{ color: "#7c6a4e" }}>
              {bouquet.color} envelope · {bouquet.flowerIds.length} flower{bouquet.flowerIds.length === 1 ? "" : "s"}
            </div>
          )}
        </div>
        {actionable && <DecisionButtons submissionId={submission.id} />}
      </div>
    </li>
  );
}

export default async function EventReviewPage(props: PageProps<"/organizer/events/[eventId]">) {
  const { eventId } = await props.params;
  const organizer = await getCurrentOrganizer();
  if (!organizer) redirect("/login");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { submissions: { orderBy: { createdAt: "desc" } } },
  });
  if (!event || event.organizerId !== organizer.id) notFound();

  const pending = event.submissions.filter((s) => s.status === "pending");
  const approved = event.submissions.filter((s) => s.status === "approved");
  const denied = event.submissions.filter((s) => s.status === "denied");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-caveat font-bold text-2xl" style={{ color: "#4a3d2c" }}>
          {event.recipientName}&rsquo;s {event.occasionText}
        </h1>
        <p className="text-xs mt-1" style={{ color: "#a8977a" }}>
          Contribution link: /e/{event.slug}
        </p>
      </div>

      <section>
        <h2 className="font-caveat font-bold text-xl" style={{ color: "#4a3d2c" }}>
          Pending review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm mt-2" style={{ color: "#7c6a4e" }}>
            Nothing waiting on you.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {pending.map((s) => (
              <SubmissionRow key={s.id} submission={s} actionable />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-caveat font-bold text-xl" style={{ color: "#4a3d2c" }}>
          Approved ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <p className="text-sm mt-2" style={{ color: "#7c6a4e" }}>
            None yet.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {approved.map((s) => (
              <SubmissionRow key={s.id} submission={s} actionable={false} />
            ))}
          </ul>
        )}
      </section>

      {denied.length > 0 && (
        <section>
          <h2 className="font-caveat font-bold text-xl" style={{ color: "#4a3d2c" }}>
            Denied ({denied.length})
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {denied.map((s) => (
              <SubmissionRow key={s.id} submission={s} actionable={false} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
