import { useState } from "react";

import EmptyState from "./EmptyState";
import StatusBadge from "./StatusBadge";

export default function CustomerPanel({ customers, shipments, onCreateCustomer }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();
    await onCreateCustomer(form);
    setForm({
      name: "",
      email: "",
      phone: "",
      company: "",
    });
  }

  function customerShipments(customer) {
    return shipments.filter(
      (shipment) =>
        shipment.customer_id === customer.id ||
        shipment.customer_name === customer.name
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-950">Add Customer</h2>
        <p className="text-sm text-slate-500">Create ownership for shipment history.</p>

        <form onSubmit={submit} className="mt-5 space-y-4">
          {["name", "email", "phone", "company"].map((field) => (
            <label key={field} className="block text-sm font-semibold capitalize text-slate-700">
              {field}
              <input
                value={form[field]}
                required={field === "name"}
                onChange={(e) => updateField(field, e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </label>
          ))}
          <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700">
            Create Customer
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-base font-bold text-slate-950">Customer Register</h2>
          <p className="text-sm text-slate-500">
            Customer history is derived from shipment ownership relationships.
          </p>
        </div>

        <div className="p-5">
          {customers.length === 0 ? (
            <EmptyState
              title="No customers yet"
              message="Customers are created directly or inferred from new shipments."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {customers.map((customer) => {
                const history = customerShipments(customer);

                return (
                  <article
                    key={customer.id}
                    className="rounded-lg border border-slate-200 p-4 transition hover:border-indigo-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-950">{customer.name}</h3>
                        <p className="text-sm text-slate-500">
                          {customer.company || customer.email || "No company recorded"}
                        </p>
                      </div>
                      <StatusBadge value={customer.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Shipments
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-950">
                          {history.length}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Delayed
                        </p>
                        <p className="mt-1 text-lg font-bold text-red-600">
                          {history.filter((shipment) => shipment.status === "Delayed").length}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
