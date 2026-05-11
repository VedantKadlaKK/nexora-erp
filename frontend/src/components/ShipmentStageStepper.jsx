const stages = ["Created", "Packed", "In Transit", "Out For Delivery", "Delivered"];

export default function ShipmentStageStepper({ status, compact = false }) {
  const effectiveStatus = status === "Delayed" ? null : status;
  const activeIndex = stages.indexOf(effectiveStatus);

  return (
    <div className={compact ? "flex items-center gap-1.5" : "grid gap-3"}>
      <div className="flex items-center">
        {stages.map((stage, index) => {
          const complete = activeIndex >= index;
          const current = activeIndex === index;

          return (
            <div key={stage} className="flex flex-1 items-center last:flex-none">
              <div
                className={`grid shrink-0 place-items-center rounded-full border text-[10px] font-bold ${
                  compact ? "h-4 w-4" : "h-7 w-7"
                } ${
                  complete
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-400"
                } ${current ? "ring-2 ring-indigo-100" : ""}`}
              >
                {index + 1}
              </div>
              {index < stages.length - 1 && (
                <div
                  className={`h-px flex-1 ${
                    activeIndex > index ? "bg-indigo-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {!compact && (
        <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-semibold text-slate-500">
          {stages.map((stage) => (
            <span key={stage}>{stage}</span>
          ))}
        </div>
      )}
    </div>
  );
}
