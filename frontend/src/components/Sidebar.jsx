import { useNavigate } from "react-router-dom";

export default function Sidebar() {

  const navigate = useNavigate();

  function logout() {

    localStorage.removeItem("token");

    navigate("/login");
  }

  return (

    <div className="w-64 h-screen bg-slate-900 text-white p-5 flex flex-col justify-between">

      <div>

        <h1 className="text-2xl font-bold mb-10">
          Nexora ERP
        </h1>

        <ul className="space-y-4 text-gray-300">

          <li className="hover:text-white cursor-pointer transition">
            Dashboard
          </li>

          <li className="hover:text-white cursor-pointer transition">
            Shipments
          </li>

          <li className="hover:text-white cursor-pointer transition">
            Finance
          </li>

          <li className="hover:text-white cursor-pointer transition">
            Customers
          </li>

          <li className="hover:text-white cursor-pointer transition">
            Analytics
          </li>

        </ul>

      </div>

      <button
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-lg font-medium"
      >
        Logout
      </button>

    </div>

  );
}