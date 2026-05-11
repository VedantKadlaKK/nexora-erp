import { useState } from "react";

export default function ShipmentActionModal({
  shipment,
  financeRecord,
  onClose,
  onUpdate,
  onDelete,
}) {
  const [form, setForm] = useState({
    status: shipment?.status || "In Transit",
    payment_status: shipment?.payment_status || "Pending",
    eta: shipment?.eta || "",
    revenue_amount: financeRecord?.revenue_amount || 0,
  });

  if (!shipment) {
    return null;
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function submit(e) {
    e.preventDefault();
    onUpdate(shipment.id, {
      ...form,
      revenue_amount: Number(form.revenue_amount || 0),
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">Update Shipment</h2>
          <p className="text-sm text-slate-500">
            {shipment.shipment_code} for {shipment.customer_name}
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Status
            <select
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
            >
              <option>In Transit</option>
              <option>Delayed</option>
              <option>Delivered</option>
              <option>Pending</option>
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Payment
            <select
              value={form.payment_status}
              onChange={(e) => updateField("payment_status", e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
            >
              <option>Pending</option>
              <option>Paid</option>
              <option>Complete</option>
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            ETA
            <input
              value={form.eta}
              onChange={(e) => updateField("eta", e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              placeholder="2026-05-15"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Revenue
            <input
              type="number"
              value={form.revenue_amount}
              onChange={(e) => updateField("revenue_amount", e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={() => onDelete(shipment.id)}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
          >
            Delete
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
