export default function TopNavbar({
  profile,
  activeView,
  onViewChange,
  unreadCount,
  onToggleNotifications,
}) {
  const views = ["Operations", "Analytics", "Customers"];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Nexora ERP
          </p>
          <h1 className="text-2xl font-bold text-slate-950">
            Operational Command Center
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {views.map((view) => (
              <button
                key={view}
                onClick={() => onViewChange(view)}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  activeView === view
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          <button
            onClick={onToggleNotifications}
            className="relative rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
          >
            Alerts
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {(profile?.username || "N").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {profile?.username || "Nexora User"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {profile?.email || "operations@nexora.local"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
