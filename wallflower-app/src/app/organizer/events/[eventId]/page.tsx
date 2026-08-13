import QRCode from "qrcode";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizer } from "@/lib/wallflower/auth";
import { decideSubmission, revealEvent, setAutoApprove } from "@/app/organizer/actions";
import { maybeAutoReveal } from "@/lib/wallflower/reveal";
import { getBaseUrl } from "@/lib/wallflower/email";
import CopyRow from "@/components/CopyRow";
import ToggleSwitch from "@/components/ToggleSwitch";
import {
  CalendarIcon,
  CheckCircleIcon,
  CheckIcon,
  ClipboardIcon,
  LinkIcon,
  LockIcon,
  TrashIcon,
  XCircleIcon,
} from "@/components/icons";
import type { EnvelopeColorId, FlowerId } from "@/lib/wallflower/catalog";

const ink = "#3e3428";
const inkMuted = "#8a7c63";
const green = "#5b7553";
const cardBorder = "#e5dcc3";
const cardBg = "#fbf6e9";
const badgeBg = "#e3efd9";
const badgeFg = "#4a5f42";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 20 }}>
      {children}
    </div>
  );
}

function IconBadge({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

function InfoCard({
  icon,
  iconBg,
  iconFg,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconFg: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex gap-3">
        <IconBadge bg={iconBg} fg={iconFg}>
          {icon}
        </IconBadge>
        <div className="flex-1">
          <div className="font-nunito font-bold text-sm" style={{ color: ink }}>
            {title}
          </div>
          <p className="text-xs mt-1" style={{ color: inkMuted, lineHeight: 1.5 }}>
            {description}
          </p>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </Card>
  );
}

function RevealCard({ eventId, status, revealDate }: { eventId: string; status: string; revealDate: Date | null }) {
  if (status === "revealed") {
    return (
      <InfoCard
        icon={<CalendarIcon size={18} />}
        iconBg={badgeBg}
        iconFg={badgeFg}
        title="Reveal date"
        description="Revealed — the garden is live for anyone with the link."
      >
        <></>
      </InfoCard>
    );
  }
  const reveal = revealEvent.bind(null, eventId);
  return (
    <InfoCard
      icon={<CalendarIcon size={18} />}
      iconBg={badgeBg}
      iconFg={badgeFg}
      title="Reveal date"
      description={
        revealDate ? `Set to auto-reveal ${revealDate.toLocaleString()}` : "Not set — trigger it manually when you're ready."
      }
    >
      <form action={reveal}>
        <button
          type="submit"
          className="font-nunito font-bold text-xs"
          style={{ background: green, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}
        >
          Reveal now
        </button>
      </form>
    </InfoCard>
  );
}

function AutoApproveCard({ eventId, autoApprove }: { eventId: string; autoApprove: boolean }) {
  const setForEvent = setAutoApprove.bind(null, eventId);
  return (
    <Card>
      <div className="flex gap-3">
        <IconBadge bg={badgeBg} fg={badgeFg}>
          <ClipboardIcon size={18} />
        </IconBadge>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="font-nunito font-bold text-sm" style={{ color: ink }}>
              Auto-approve
            </div>
            <ToggleSwitch checked={autoApprove} action={setForEvent} />
          </div>
          <p className="text-xs mt-1" style={{ color: inkMuted, lineHeight: 1.5 }}>
            {autoApprove ? "On — new notes skip review and go straight to the wall." : "New notes wait in your review queue."}
          </p>
        </div>
      </div>
    </Card>
  );
}

function Avatar({ name }: { name: string }) {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="font-nunito font-bold"
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "#4a5f42",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        flexShrink: 0,
      }}
    >
      {letter}
    </div>
  );
}

function DecisionButtons({ submissionId }: { submissionId: string }) {
  const approve = decideSubmission.bind(null, submissionId, "approved");
  const deny = decideSubmission.bind(null, submissionId, "denied");
  const denyFormId = `deny-${submissionId}`;
  return (
    <div className="flex flex-col gap-2" style={{ minWidth: 220 }}>
      <div className="flex gap-2">
        <form action={approve}>
          <button
            type="submit"
            className="font-nunito font-bold text-sm flex items-center gap-1.5"
            style={{ background: green, color: "#fff", border: "none", borderRadius: 10, padding: "9px 14px", cursor: "pointer" }}
          >
            <CheckIcon size={15} /> Approve
          </button>
        </form>
        <button
          form={denyFormId}
          type="submit"
          className="font-nunito font-bold text-sm flex items-center gap-1.5"
          style={{ background: "#fff", color: "#b0503f", border: "1px solid #b0503f", borderRadius: 10, padding: "9px 14px", cursor: "pointer" }}
        >
          <TrashIcon size={15} /> Deny
        </button>
      </div>
      <form id={denyFormId} action={deny}>
        <textarea
          name="note"
          rows={2}
          placeholder="Optional note if denying…"
          className="w-full text-xs font-nunito"
          style={{ border: `1px solid ${cardBorder}`, borderRadius: 8, padding: "8px 10px", resize: "none", color: ink, background: "#faf7f0" }}
        />
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
    <li>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3 min-w-0">
            <Avatar name={submission.contributorName} />
            <div className="min-w-0">
              <div className="font-nunito font-bold text-sm" style={{ color: ink }}>
                {submission.contributorName}
              </div>
              <div className="text-xs" style={{ color: inkMuted }}>
                {submission.contributorEmail}
              </div>
              <p className="text-sm mt-2" style={{ color: ink }}>
                {submission.noteText}
              </p>
              {bouquet && (
                <div className="text-xs mt-2" style={{ color: inkMuted }}>
                  {bouquet.color} envelope • {bouquet.flowerIds.length} flower{bouquet.flowerIds.length === 1 ? "" : "s"}
                </div>
              )}
            </div>
          </div>
          {actionable && <DecisionButtons submissionId={submission.id} />}
        </div>
      </Card>
    </li>
  );
}

function SectionHeading({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="font-nunito font-bold text-lg flex items-center gap-2.5" style={{ color: ink }}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: badgeBg,
          color: badgeFg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      {children}
    </h2>
  );
}

export default async function EventReviewPage(props: PageProps<"/organizer/events/[eventId]">) {
  const { eventId } = await props.params;
  const organizer = await getCurrentOrganizer();
  if (!organizer) redirect("/login");

  const found = await prisma.event.findUnique({
    where: { id: eventId },
    include: { submissions: { orderBy: { createdAt: "desc" } } },
  });
  if (!found || found.organizerId !== organizer.id) notFound();
  const revealed = await maybeAutoReveal(found);
  const event = { ...found, ...revealed };

  const pending = event.submissions.filter((s) => s.status === "pending");
  const approved = event.submissions.filter((s) => s.status === "approved");
  const denied = event.submissions.filter((s) => s.status === "denied");

  const contributionUrl = `${getBaseUrl()}/e/${event.slug}`;
  const wallUrl = `${contributionUrl}?view=wall`;
  const recipientUrl = `${wallUrl}&recipient=${event.recipientAccessToken}`;
  const shareMessage = `Add a note for ${event.recipientName}'s ${event.occasionText}: ${contributionUrl}`;
  const qrSvg = await QRCode.toString(contributionUrl, {
    type: "svg",
    margin: 1,
    color: { dark: "#3e3428", light: "#00000000" },
  });
  const qrDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(qrSvg)}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <a href="/organizer" className="font-nunito text-xs" style={{ color: inkMuted, textDecoration: "none" }}>
          ← Back to all events
        </a>
        <div className="flex items-center justify-between flex-wrap gap-3 mt-2">
          <h1 className="font-nunito font-bold text-2xl" style={{ color: ink }}>
            {event.recipientName}&rsquo;s {event.occasionText}
          </h1>
          <a
            href={wallUrl}
            target="_blank"
            rel="noreferrer"
            className="font-nunito font-bold text-sm flex items-center gap-1.5"
            style={{ background: green, color: "#fff", borderRadius: 10, padding: "9px 16px", textDecoration: "none" }}
          >
            View Wall →
          </a>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <RevealCard eventId={event.id} status={event.status} revealDate={event.revealDate} />
        <AutoApproveCard eventId={event.id} autoApprove={event.autoApprove} />
      </div>

      <Card>
        <div className="flex gap-3">
          <IconBadge bg={badgeBg} fg={badgeFg}>
            <LinkIcon size={18} />
          </IconBadge>
          <div>
            <div className="font-nunito font-bold text-base" style={{ color: ink }}>
              Share this wall
            </div>
            <p className="text-xs mt-0.5" style={{ color: inkMuted }}>
              Invite others to add a bouquet and a note.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-5 mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUri}
            alt="QR code linking to the contribution page"
            width={128}
            height={128}
            style={{ borderRadius: 12, border: `1px solid ${cardBorder}`, flexShrink: 0 }}
          />
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <CopyRow label="Contribution link" value={contributionUrl} />
            <CopyRow label={`Add a note for ${event.recipientName}'s ${event.occasionText}:`} value={shareMessage} />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex gap-3">
          <IconBadge bg={badgeBg} fg={badgeFg}>
            <LockIcon size={18} />
          </IconBadge>
          <div className="flex-1 min-w-0">
            <div className="font-nunito font-bold text-base" style={{ color: ink }}>
              Private link (only for you)
            </div>
            <p className="text-xs mt-0.5" style={{ color: inkMuted }}>
              This private link shows everyone&rsquo;s full notes, not just names.
            </p>
            <div className="mt-3">
              <CopyRow value={recipientUrl} />
            </div>
          </div>
        </div>
      </Card>

      <section className="flex flex-col gap-3">
        <SectionHeading icon={<ClipboardIcon size={18} />}>Pending review ({pending.length})</SectionHeading>
        {pending.length === 0 ? (
          <p className="text-sm" style={{ color: inkMuted }}>
            Nothing waiting on you.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pending.map((s) => (
              <SubmissionRow key={s.id} submission={s} actionable />
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading icon={<CheckCircleIcon size={18} />}>Approved ({approved.length})</SectionHeading>
        {approved.length === 0 ? (
          <p className="text-sm" style={{ color: inkMuted }}>
            None yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {approved.map((s) => (
              <SubmissionRow key={s.id} submission={s} actionable={false} />
            ))}
          </ul>
        )}
      </section>

      {denied.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeading icon={<XCircleIcon size={18} />}>Denied ({denied.length})</SectionHeading>
          <ul className="flex flex-col gap-3">
            {denied.map((s) => (
              <SubmissionRow key={s.id} submission={s} actionable={false} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
