import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const organizer = await prisma.organizer.upsert({
    where: { email: "organizer@example.com" },
    update: {},
    create: { email: "organizer@example.com" },
  });

  const revealDate = new Date();
  revealDate.setDate(revealDate.getDate() + 7);

  await prisma.event.upsert({
    where: { slug: "laksh-18th" },
    update: {},
    create: {
      organizerId: organizer.id,
      slug: "laksh-18th",
      recipientName: "Laksh",
      occasionText: "18th Birthday",
      revealDate,
      status: "collecting",
    },
  });

  console.log("Seeded event: /e/laksh-18th");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
