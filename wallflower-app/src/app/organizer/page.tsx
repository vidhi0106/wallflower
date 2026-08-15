import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizer } from "@/lib/wallflower/auth";
import CreateEventForm from "./CreateEventForm";

export default async function OrganizerDashboard() {
  const organizer = await getCurrentOrganizer();
  if (!organizer) return null; // layout already redirects

  const events = await prisma.event.findMany({
    where: { organizerId: organizer.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { submissions: true },
      },
    },
  });

  const pendingCounts = await prisma.submission.groupBy({
    by: ["eventId"],
    where: { event: { organizerId: organizer.id }, status: "pending" },
    _count: { _all: true },
  });
  const pendingByEvent = new Map(pendingCounts.map((p) => [p.eventId, p._count._all]));

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="font-caveat font-bold text-2xl" style={{ color: "#4a3d2c" }}>
          Your events
        </h1>
        {events.length === 0 ? (
          <p className="text-sm mt-2" style={{ color: "#7c6a4e" }}>
            No events yet. Create one below.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {events.map((event) => {
              const pending = pendingByEvent.get(event.id) ?? 0;
              return (
                <li key={event.id}>
                  <Link
                    href={`/organizer/events/${event.id}`}
                    className="flex items-center justify-between px-4 py-3 no-underline"
                    style={{ background: "#F7EFDD", borderRadius: 10, color: "#4a3d2c" }}
                  >
                    <span>
                      <strong>{event.recipientName}</strong>&rsquo;s {event.occasionText}
                      <span className="text-xs ml-2" style={{ color: "#a8977a" }}>
                        /e/{event.slug}
                      </span>
                    </span>
                    <span className="text-xs" style={{ color: "#7c6a4e" }}>
                      {event._count.submissions} submission{event._count.submissions === 1 ? "" : "s"}
                      {pending > 0 && <span style={{ color: "#b0503f" }}> · {pending} pending</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-caveat font-bold text-xl" style={{ color: "#4a3d2c" }}>
          Create a new event
        </h2>
        <div className="mt-4">
          <CreateEventForm />
        </div>
      </section>
    </div>
  );
}
