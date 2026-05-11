import EmptyState from "./EmptyState";
import StatusBadge from "./StatusBadge";

export default function NotificationPanel({
  open,
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
}) {
  if (!open) {
    return null;
  }

  return (
    <aside className="fixed right-4 top-24 z-40 w-[calc(100vw-2rem)] max-w-md rounded-xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-base font-bold text-slate-950">Notifications</h2>
          <p className="text-xs text-slate-500">Realtime operational alerts</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
        >
          Close
        </button>
      </div>

      <div className="max-h-[65vh] overflow-y-auto p-4">
        {notifications.length === 0 ? (
          <EmptyState
            title="No alerts yet"
            message="Delayed, delivered, and deleted shipment alerts appear here."
          />
        ) : (
          <div className="space-y-3">
            <button
              onClick={onMarkAllRead}
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
            >
              Mark all read
            </button>

            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => onMarkRead(notification.id)}
                className={`w-full rounded-lg border p-3 text-left transition hover:border-indigo-200 ${
                  notification.is_read
                    ? "border-slate-200 bg-white"
                    : "border-indigo-200 bg-indigo-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {notification.title}
                  </p>
                  <StatusBadge value={notification.notification_type} />
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {notification.message}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
