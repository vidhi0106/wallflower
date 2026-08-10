import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BouquetBuilder from "@/components/BouquetBuilder";
import { maybeAutoReveal } from "@/lib/wallflower/reveal";
import type { EnvelopeColorId, FlowerId } from "@/lib/wallflower/catalog";

export default async function EventPage(props: PageProps<"/e/[slug]">) {
  const { slug } = await props.params;

  const found = await prisma.event.findUnique({ where: { slug } });
  if (!found) notFound();
  const event = await maybeAutoReveal(found);

  const approved =
    event.status === "revealed"
      ? await prisma.submission.findMany({
          where: { eventId: event.id, status: "approved" },
          orderBy: { updatedAt: "asc" },
        })
      : [];

  return (
    <BouquetBuilder
      event={{
        slug: event.slug,
        recipientName: event.recipientName,
        occasionText: event.occasionText,
        revealDate: event.revealDate ? event.revealDate.toISOString() : null,
        status: event.status,
      }}
      wallSubmissions={approved.map((s) => ({
        id: s.id,
        contributorName: s.contributorName,
        noteText: s.noteText,
        bouquetData: s.bouquetData as { flowerIds: FlowerId[]; color: EnvelopeColorId },
        updatedAt: s.updatedAt.toISOString(),
      }))}
    />
  );
}
