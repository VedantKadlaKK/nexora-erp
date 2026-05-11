export default function ToastHost({ toasts }) {
  return (
    <div className="fixed right-5 top-5 z-50 space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="w-80 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg"
        >
          <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
          <p className="mt-1 text-sm text-slate-500">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
