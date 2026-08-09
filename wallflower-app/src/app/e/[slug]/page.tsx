import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BouquetBuilder from "@/components/BouquetBuilder";

export default async function EventPage(props: PageProps<"/e/[slug]">) {
  const { slug } = await props.params;

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) notFound();

  return (
    <BouquetBuilder
      event={{
        slug: event.slug,
        recipientName: event.recipientName,
        occasionText: event.occasionText,
        revealDate: event.revealDate ? event.revealDate.toISOString() : null,
      }}
    />
  );
}
