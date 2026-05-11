const variants = {
  Delayed: "bg-red-50 text-red-700 border-red-200",
  "In Transit": "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  High: "bg-red-50 text-red-700 border-red-200",
  Low: "bg-slate-50 text-slate-600 border-slate-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function StatusBadge({ value }) {
  const label = value || "Pending";
  const classes = variants[label] || "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}
