export default function KPIcards({ shipments, finance, analytics }) {
  const total = shipments.length;
  const delayed = shipments.filter((shipment) => shipment.status === "Delayed").length;
  const inTransit = shipments.filter((shipment) => shipment.status === "In Transit").length;
  const revenue = finance.reduce((sum, item) => sum + (item.revenue_amount || 0), 0);

  const cards = [
    {
      label: "Total Shipments",
      value: total,
      detail: `${inTransit} moving now`,
      accent: "text-slate-950",
    },
    {
      label: "Delayed",
      value: delayed,
      detail: `${analytics?.insights?.delay_rate || 0}% delay rate`,
      accent: "text-red-600",
    },
    {
      label: "Revenue",
      value: `INR ${revenue.toLocaleString("en-IN")}`,
      detail: "Recognized shipment revenue",
      accent: "text-emerald-700",
    },
    {
      label: "Delivery Rate",
      value: `${analytics?.insights?.delivery_rate || 0}%`,
      detail: `${analytics?.insights?.active_routes || 0} active routes`,
      accent: "text-indigo-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <section
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-semibold text-slate-500">{card.label}</p>
          <p className={`mt-2 text-2xl font-bold ${card.accent}`}>{card.value}</p>
          <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
        </section>
      ))}
    </div>
  );
}
