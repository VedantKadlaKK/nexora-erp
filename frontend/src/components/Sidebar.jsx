import { useNavigate } from "react-router-dom";

export default function Sidebar({ activeView, onViewChange }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const items = ["Operations", "Analytics", "Customers"];

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-indigo-400/30 bg-indigo-600 p-4 text-white lg:flex lg:flex-col lg:justify-between">
      <div>
        <div className="mb-8 rounded-lg bg-white/10 p-3">
          <p className="text-sm font-bold">Nexora ERP</p>
          <p className="mt-1 text-xs text-indigo-100">Logistics operating system</p>
        </div>

        <nav className="space-y-1">
          {items.map((item) => (
            <button
              key={item}
              onClick={() => onViewChange(item)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                activeView === item
                  ? "bg-white/20 text-white"
                  : "text-indigo-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="rounded-lg bg-white/10 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-100">
          Workspace
        </p>
        <p className="mt-1 text-sm font-semibold">Nexora Operations</p>
        <button
          onClick={logout}
          className="mt-4 w-full rounded-lg bg-white px-3 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
