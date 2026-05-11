export default function KPIcards({ shipments }) {

  const total = shipments.length;

  const delayed = shipments.filter(
    s => s.status === "Delayed"
  ).length;

  const inTransit = shipments.filter(
    s => s.status === "In Transit"
  ).length;

  return (

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">

        <h2 className="text-gray-500 text-sm">
          Total Shipments
        </h2>

        <p className="text-3xl font-bold text-gray-800 mt-2">
          {total}
        </p>

      </div>

      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">

        <h2 className="text-gray-500 text-sm">
          Delayed
        </h2>

        <p className="text-3xl font-bold text-red-500 mt-2">
          {delayed}
        </p>

      </div>

      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">

        <h2 className="text-gray-500 text-sm">
          In Transit
        </h2>

        <p className="text-3xl font-bold text-blue-500 mt-2">
          {inTransit}
        </p>

      </div>

    </div>

  );
}