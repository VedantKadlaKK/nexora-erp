import EmptyState from "./EmptyState";

function formatTime(value) {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export default function AuditTrail({ audits }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-950">Audit Trail</h2>
        <p className="text-sm text-slate-500">Operator, state transition, and timestamp</p>
      </div>

      {audits.length === 0 ? (
        <EmptyState
          title="No audit logs yet"
          message="Operational actions will create tamper-aware history here."
        />
      ) : (
        <div className="space-y-3">
          {audits.slice(0, 8).map((audit) => (
            <article
              key={audit.id}
              className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {audit.operator_name} · {audit.action}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {audit.shipment_code || "Shipment"}:{" "}
                    <span className="font-semibold text-slate-900">
                      {audit.previous_state || "None"}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-slate-900">
                      {audit.new_state || "None"}
                    </span>
                  </p>
                  {audit.note && (
                    <p className="mt-1 text-xs text-slate-500">{audit.note}</p>
                  )}
                </div>
                <time className="shrink-0 text-xs font-semibold text-slate-400">
                  {formatTime(audit.created_at)}
                </time>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
