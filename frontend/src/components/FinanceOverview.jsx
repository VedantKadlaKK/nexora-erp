import EmptyState from "./EmptyState";
import StatusBadge from "./StatusBadge";

export default function FinanceOverview({ finance }) {
  const totalRevenue = finance.reduce(
    (sum, item) => sum + (item.revenue_amount || 0),
    0
  );

  const highRisk = finance.filter((item) => item.payment_risk === "High").length;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950">Finance Overview</h2>
          <p className="text-sm text-slate-500">Invoice exposure and payment risk</p>
        </div>
        <StatusBadge value={highRisk > 0 ? "High" : "Low"} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Revenue
          </p>
          <p className="mt-2 text-xl font-bold text-slate-950">
            INR {totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            High Risk
          </p>
          <p className="mt-2 text-xl font-bold text-red-600">{highRisk}</p>
        </div>
      </div>

      <div className="mt-4">
        {finance.length === 0 ? (
          <EmptyState
            title="No finance records"
            message="Finance records are created with shipments."
          />
        ) : (
          <div className="space-y-3">
            {finance.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {item.shipment_code}
                  </p>
                  <p className="text-xs text-slate-500">
                    INR {(item.revenue_amount || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <StatusBadge value={item.invoice_status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
