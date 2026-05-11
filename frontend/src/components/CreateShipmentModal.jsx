import { useState } from "react";

const initialForm = {
  shipment_code: "",
  customer_name: "",
  origin: "",
  destination: "",
  eta: "",
  payment_status: "Pending",
  assigned_operator: "",
};

export default function CreateShipmentModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return null;
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  }

  function validate() {
    const nextErrors = {};

    ["shipment_code", "customer_name", "origin", "destination"].forEach((field) => {
      if (!form[field].trim()) {
        nextErrors[field] = "Required";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    const ok = await onCreate({
      ...form,
      status: "Created",
      shipment_code: form.shipment_code.trim(),
      customer_name: form.customer_name.trim(),
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      eta: form.eta.trim(),
      note: form.assigned_operator
        ? `Assigned operator: ${form.assigned_operator.trim()}`
        : undefined,
    });
    setSubmitting(false);

    if (ok) {
      setForm(initialForm);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">Create Shipment</h2>
          <p className="text-sm text-slate-500">
            New shipments start in Created state and enter the operational workflow.
          </p>
        </div>

        <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-5 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Shipment Code
            <input
              value={form.shipment_code}
              onChange={(event) => updateField("shipment_code", event.target.value)}
              className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-400 ${
                errors.shipment_code ? "border-red-300" : "border-slate-200"
              }`}
              placeholder="SHP108"
            />
            {errors.shipment_code && (
              <span className="mt-1 block text-xs font-semibold text-red-600">
                {errors.shipment_code}
              </span>
            )}
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Customer Name
            <input
              value={form.customer_name}
              onChange={(event) => updateField("customer_name", event.target.value)}
              className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-400 ${
                errors.customer_name ? "border-red-300" : "border-slate-200"
              }`}
              placeholder="Vedant Logistics"
            />
            {errors.customer_name && (
              <span className="mt-1 block text-xs font-semibold text-red-600">
                {errors.customer_name}
              </span>
            )}
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Origin
            <input
              value={form.origin}
              onChange={(event) => updateField("origin", event.target.value)}
              className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-400 ${
                errors.origin ? "border-red-300" : "border-slate-200"
              }`}
              placeholder="Mumbai"
            />
            {errors.origin && (
              <span className="mt-1 block text-xs font-semibold text-red-600">
                {errors.origin}
              </span>
            )}
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Destination
            <input
              value={form.destination}
              onChange={(event) => updateField("destination", event.target.value)}
              className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-400 ${
                errors.destination ? "border-red-300" : "border-slate-200"
              }`}
              placeholder="Pune"
            />
            {errors.destination && (
              <span className="mt-1 block text-xs font-semibold text-red-600">
                {errors.destination}
              </span>
            )}
          </label>

          <label className="text-sm font-semibold text-slate-700">
            ETA
            <input
              value={form.eta}
              onChange={(event) => updateField("eta", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
              placeholder="2026-05-15"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Payment Status
            <select
              value={form.payment_status}
              onChange={(event) => updateField("payment_status", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
            >
              <option>Pending</option>
              <option>Paid</option>
              <option>Complete</option>
              <option>Overdue</option>
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700 md:col-span-2">
            Assigned Operator
            <input
              value={form.assigned_operator}
              onChange={(event) => updateField("assigned_operator", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
              placeholder="Optional"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
          <span className="text-sm font-semibold text-slate-500">
            Initial lifecycle state: Created
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Shipment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
