import EmptyState from "./EmptyState";
import StatusBadge from "./StatusBadge";

export default function ShipmentTable({ shipments, onSelectShipment }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950">Shipment Register</h2>
          <p className="text-sm text-slate-500">
            Live operational state across customers, routes, and payment status
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        {shipments.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No shipments found"
              message="Create shipments through the API to populate this register."
            />
          </div>
        ) : (
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Shipment</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Route</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">ETA</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr
                  key={shipment.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4 text-sm font-bold text-slate-900">
                    {shipment.shipment_code}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {shipment.customer_name}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {shipment.origin} to {shipment.destination}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge value={shipment.status} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge value={shipment.payment_status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {shipment.eta || "Unscheduled"}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => onSelectShipment(shipment)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
