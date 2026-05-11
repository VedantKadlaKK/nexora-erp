export default function ShipmentTable({ shipments }) {

  return (

    <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">

      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Shipments
      </h2>

      <table className="w-full">

        <thead>

          <tr className="text-left border-b border-gray-200 text-gray-600">

            <th className="py-3">ID</th>
            <th className="py-3">Customer</th>
            <th className="py-3">Status</th>
            <th className="py-3">Payment</th>

          </tr>

        </thead>

        <tbody>

          {shipments.map((shipment) => (

            <tr
              key={shipment.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition"
            >

              <td className="py-3">
                {shipment.shipment_code}
              </td>

              <td className="py-3">
                {shipment.customer_name}
              </td>

              <td className="py-3">
                {shipment.status}
              </td>

              <td className="py-3">
                {shipment.payment_status}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}