import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import EmptyState from "./EmptyState";

const colors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

export default function AnalyticsPanel({ analytics }) {
  const statusData = analytics?.status_counts || [];
  const revenueData = analytics?.revenue_trend || [];
  const delayData = analytics?.delay_trend || [];
  const routeData = analytics?.top_routes || [];

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-950">Revenue Trend</h2>
          <p className="text-sm text-slate-500">Realtime finance movement by day</p>
        </div>
        {revenueData.length === 0 ? (
          <EmptyState title="No revenue data" message="Revenue charts update as finance events arrive." />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-950">Shipment Mix</h2>
          <p className="text-sm text-slate-500">Current status distribution</p>
        </div>
        {statusData.length === 0 ? (
          <EmptyState title="No status data" message="Status badges feed this distribution." />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96}>
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-950">Top Routes</h2>
          <p className="text-sm text-slate-500">Highest-volume lanes across active shipments</p>
        </div>
        {routeData.length === 0 ? (
          <EmptyState title="No route data" message="Routes appear once shipments are created." />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeData}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="route" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="shipments" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-950">Delay Trend</h2>
          <p className="text-sm text-slate-500">Operational exceptions by day</p>
        </div>
        {delayData.length === 0 ? (
          <EmptyState title="No delays" message="Delay events will populate this chart." />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={delayData}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="delays" stroke="#ef4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
