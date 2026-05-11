import { useMemo, useState } from "react";

import ShipmentStageStepper from "./ShipmentStageStepper";
import StatusBadge from "./StatusBadge";

const rolePermissions = {
  Admin: [
    "mark_packed",
    "dispatch",
    "mark_out_for_delivery",
    "mark_delivered",
    "delay",
    "resolve_delay",
    "update_payment",
  ],
  "Warehouse Staff": ["mark_packed", "delay", "resolve_delay"],
  "Logistics Staff": [
    "dispatch",
    "mark_out_for_delivery",
    "mark_delivered",
    "delay",
    "resolve_delay",
  ],
  "Finance Staff": ["update_payment"],
};

const actionCopy = {
  mark_packed: {
    label: "Mark Packed",
    detail: "Confirm warehouse packing is complete.",
    nextStatus: "Packed",
  },
  dispatch: {
    label: "Dispatch Shipment",
    detail: "Move a packed shipment into transit.",
    nextStatus: "In Transit",
  },
  mark_out_for_delivery: {
    label: "Out For Delivery",
    detail: "Confirm the shipment is on its final delivery leg.",
    nextStatus: "Out For Delivery",
  },
  mark_delivered: {
    label: "Mark Delivered",
    detail: "Close the shipment lifecycle as delivered.",
    nextStatus: "Delivered",
  },
  delay: {
    label: "Delay Shipment",
    detail: "Flag an operational exception and raise payment risk.",
    nextStatus: "Delayed",
  },
  resolve_delay: {
    label: "Resolve Delay",
    detail: "Return a delayed shipment to its previous lifecycle stage.",
    nextStatus: "Restored",
  },
  update_payment: {
    label: "Update Payment Status",
    detail: "Sync shipment and finance payment status.",
    nextStatus: "Finance",
  },
};

function validActions(shipment) {
  if (shipment.status === "Created") {
    return ["mark_packed", "delay", "update_payment"];
  }

  if (shipment.status === "Packed") {
    return ["dispatch", "delay", "update_payment"];
  }

  if (shipment.status === "In Transit") {
    return ["mark_out_for_delivery", "delay", "update_payment"];
  }

  if (shipment.status === "Out For Delivery") {
    return ["mark_delivered", "delay", "update_payment"];
  }

  if (shipment.status === "Delayed") {
    return ["resolve_delay", "update_payment"];
  }

  return ["update_payment"];
}

export default function ShipmentActionModal({
  shipment,
  financeRecord,
  profile,
  onClose,
  onAction,
  onDelete,
}) {
  const [selectedAction, setSelectedAction] = useState("");
  const [form, setForm] = useState({
    payment_status: shipment?.payment_status || "Pending",
    eta: shipment?.eta || "",
    revenue_amount: financeRecord?.revenue_amount || 0,
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const allowedActions = useMemo(() => {
    if (!shipment) {
      return [];
    }

    const permissions = rolePermissions[profile?.role || "Admin"] || [];

    return validActions(shipment).filter((action) => permissions.includes(action));
  }, [shipment, profile]);

  if (!shipment) {
    return null;
  }

  const chosenAction = actionCopy[selectedAction];

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();

    if (!selectedAction) {
      return;
    }

    setSubmitting(true);
    await onAction(shipment.id, selectedAction, {
      ...form,
      revenue_amount: Number(form.revenue_amount || 0),
    });
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Operate Shipment</h2>
              <p className="text-sm text-slate-500">
                {shipment.shipment_code} for {shipment.customer_name}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={shipment.status} />
              <StatusBadge value={shipment.payment_status} />
              <StatusBadge value={profile?.role || "Admin"} />
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_260px]">
          <div className="space-y-5">
            <section className="rounded-lg border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">Lifecycle Stage</p>
                  <p className="text-sm text-slate-500">
                    Invalid jumps are rejected by the backend workflow service.
                  </p>
                </div>
              </div>
              <ShipmentStageStepper status={shipment.status} />
            </section>

            <section className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-bold text-slate-950">Available Actions</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {allowedActions.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                    Your role has no valid action for this shipment stage.
                  </div>
                ) : (
                  allowedActions.map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => setSelectedAction(action)}
                      className={`rounded-lg border p-3 text-left transition ${
                        selectedAction === action
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-slate-200 hover:border-indigo-200"
                      }`}
                    >
                      <span className="text-sm font-bold text-slate-950">
                        {actionCopy[action].label}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {actionCopy[action].detail}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </section>

            {selectedAction === "update_payment" && (
              <section className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-2">
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
                    <option>Overdue</option>
                  </select>
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
              </section>
            )}

            {(selectedAction === "delay" || selectedAction === "resolve_delay") && (
              <label className="block rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-700">
                Operational note
                <textarea
                  value={form.note}
                  onChange={(e) => updateField("note", e.target.value)}
                  className="mt-2 h-24 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  placeholder="Reason, exception owner, or resolution note"
                />
              </label>
            )}
          </div>

          <aside className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Current Route
              </p>
              <p className="mt-1 text-sm font-bold text-slate-950">
                {shipment.origin} to {shipment.destination}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">ETA</p>
              <input
                value={form.eta}
                onChange={(e) => updateField("eta", e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                placeholder="2026-05-15"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Confirmation
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {chosenAction
                  ? `${chosenAction.label} moves this record toward ${chosenAction.nextStatus}.`
                  : "Choose an operation to preview the transition."}
              </p>
            </div>
          </aside>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
          {profile?.role === "Admin" ? (
            <button
              type="button"
              onClick={() => onDelete(shipment.id)}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          ) : (
            <span className="text-sm font-semibold text-slate-400">
              Admin approval required to delete shipments
            </span>
          )}

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
              disabled={!selectedAction || submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Applying..." : "Confirm Action"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
