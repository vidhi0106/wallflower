import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BouquetBuilder from "@/components/BouquetBuilder";
import { maybeAutoReveal } from "@/lib/wallflower/reveal";
import { getCurrentOrganizer } from "@/lib/wallflower/auth";
import type { EnvelopeColorId, FlowerId } from "@/lib/wallflower/catalog";

export default async function EventPage(props: PageProps<"/e/[slug]">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const viewParam = Array.isArray(searchParams.view) ? searchParams.view[0] : searchParams.view;
  const initialView = viewParam === "wall" ? "wall" : "builder";
  const recipientParam = Array.isArray(searchParams.recipient) ? searchParams.recipient[0] : searchParams.recipient;

  const found = await prisma.event.findUnique({ where: { slug } });
  if (!found) notFound();
  const event = await maybeAutoReveal(found);

  // Full access (everyone's note text, not just names) is limited to the
  // owning organizer and whoever holds the recipient's private link —
  // everyone else only gets their own note text unlocked (client-side, via
  // their editToken), keeping other contributors' messages private even
  // though the garden of names stays visible to build recognition.
  const organizer = await getCurrentOrganizer();
  const fullAccess =
    (organizer !== null && organizer.id === event.organizerId) ||
    (!!recipientParam && recipientParam === event.recipientAccessToken);

  const approved =
    event.status === "revealed"
      ? await prisma.submission.findMany({
          where: { eventId: event.id, status: "approved" },
          orderBy: { updatedAt: "asc" },
        })
      : [];

  return (
    <BouquetBuilder
      initialView={initialView}
      event={{
        slug: event.slug,
        recipientName: event.recipientName,
        occasionText: event.occasionText,
        revealDate: event.revealDate ? event.revealDate.toISOString() : null,
        status: event.status,
      }}
      fullAccess={fullAccess}
      wallSubmissions={approved.map((s) => ({
        id: s.id,
        contributorName: s.contributorName,
        noteText: fullAccess ? s.noteText : null,
        bouquetData: s.bouquetData as { flowerIds: FlowerId[]; color: EnvelopeColorId },
        updatedAt: s.updatedAt.toISOString(),
      }))}
    />
  );
}
