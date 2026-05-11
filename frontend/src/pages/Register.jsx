import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthBackground from "../components/AuthBackground";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Admin",
  });
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await API.post("/register", form);

      if (response.data.error) {
        setError(response.data.error);
        return;
      }

      navigate("/login");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Registration failed");
    }
  }

  return (
    <AuthBackground>
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
          Nexora ERP
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">
          Provision an operator account for the ERP workspace.
        </p>

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Username
            <input
              value={form.username}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
              onChange={(e) => updateField("username", e.target.value)}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Email
            <input
              type="email"
              value={form.email}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
              onChange={(e) => updateField("email", e.target.value)}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Password
            <input
              type="password"
              value={form.password}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
              onChange={(e) => updateField("password", e.target.value)}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Role
            <select
              value={form.role}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
              onChange={(e) => updateField("role", e.target.value)}
            >
              <option>Admin</option>
              <option>Warehouse Staff</option>
              <option>Logistics Staff</option>
              <option>Finance Staff</option>
            </select>
          </label>
        </div>

        <button className="mt-6 w-full rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700">
          Register
        </button>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link className="font-bold text-indigo-700" to="/login">
            Login
          </Link>
        </p>
      </form>
    </AuthBackground>
  );
}
