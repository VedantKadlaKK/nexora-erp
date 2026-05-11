import EmptyState from "./EmptyState";

export default function ActivityFeed({ activities }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-950">Live Activity</h2>
        <p className="text-sm text-slate-500">Event stream from operations</p>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          title="No activity yet"
          message="Shipment and finance events will appear here."
        />
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 8).map((activity) => (
            <div
              key={activity.id}
              className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
            >
              <p className="text-sm font-semibold text-slate-900">
                {activity.event_type}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {activity.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
