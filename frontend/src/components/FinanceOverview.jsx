export default function FinanceOverview({ finance }) {

  const totalRevenue = finance.reduce(
    (sum, item) => sum + item.revenue_amount,
    0
  );

  const highRisk = finance.filter(
    item => item.payment_risk === "High"
  ).length;

  return (

    <div className="grid grid-cols-2 gap-4 mt-6">

      <div className="bg-white border rounded-xl p-5 shadow-sm">

        <h2 className="text-sm text-gray-500">
          Total Revenue
        </h2>

        <p className="text-3xl font-bold text-gray-800 mt-2">
          ₹ {totalRevenue}
        </p>

      </div>

      <div className="bg-white border rounded-xl p-5 shadow-sm">

        <h2 className="text-sm text-gray-500">
          High Risk Shipments
        </h2>

        <p className="text-3xl font-bold text-red-500 mt-2">
          {highRisk}
        </p>

      </div>

    </div>
  );
}