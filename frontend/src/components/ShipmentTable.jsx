import { useMemo, useState } from "react";

import EmptyState from "./EmptyState";
import ShipmentStageStepper from "./ShipmentStageStepper";
import StatusBadge from "./StatusBadge";

const pageSize = 8;
const statusFilters = [
  "All",
  "Created",
  "Packed",
  "In Transit",
  "Out For Delivery",
  "Delayed",
  "Delivered",
];

function sortShipments(shipments, sortKey) {
  return [...shipments].sort((a, b) => {
    if (sortKey === "eta") {
      return (a.eta || "").localeCompare(b.eta || "");
    }

    if (sortKey === "status") {
      return (a.status || "").localeCompare(b.status || "");
    }

    return (b.updated_at || b.created_at || "").localeCompare(
      a.updated_at || a.created_at || ""
    );
  });
}

export default function ShipmentTable({ shipments, onSelectShipment, onCreateShipment }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [sortKey, setSortKey] = useState("updated");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rows = shipments.filter((shipment) => {
      const matchesStatus = status === "All" || shipment.status === status;
      const searchable = [
        shipment.shipment_code,
        shipment.customer_name,
        shipment.origin,
        shipment.destination,
        shipment.payment_status,
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchable.includes(normalizedQuery);
    });

    return sortShipments(rows, sortKey);
  }, [shipments, query, status, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function changeStatus(value) {
    setStatus(value);
    setPage(1);
  }

  function changeQuery(value) {
    setQuery(value);
    setPage(1);
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950">Shipment Register</h2>
            <p className="text-sm text-slate-500">
              Search, filter, sort, and operate shipment lifecycles in realtime
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">            <input
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              placeholder="Search shipment, customer, route"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
            />
            <select
              value={status}
              onChange={(event) => changeStatus(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400"
            >
              {statusFilters.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400"
            >
              <option value="updated">Recently Updated</option>
              <option value="eta">ETA</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={onCreateShipment}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Create Shipment
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {shipments.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No shipments found"
              message="Create a shipment to begin operating the lifecycle."
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No matching shipments"
              message="Adjust search or filters to widen the register."
            />
          </div>
        ) : (
          <table className="w-full min-w-[960px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Shipment</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Route</th>
                <th className="px-5 py-3">Lifecycle</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">ETA</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((shipment) => (
                <tr
                  key={shipment.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-900">
                      {shipment.shipment_code}
                    </p>
                    {shipment.delay_reason && (
                      <p className="mt-1 max-w-40 truncate text-xs text-red-600">
                        {shipment.delay_reason}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {shipment.customer_name}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {shipment.origin} to {shipment.destination}
                  </td>
                  <td className="px-5 py-4">
                    <div className="w-44">
                      <ShipmentStageStepper status={shipment.status} compact />
                    </div>
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
                      Operate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <span>
          Showing {visibleRows.length} of {filtered.length} shipments
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="font-semibold text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
