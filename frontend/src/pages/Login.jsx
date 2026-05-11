import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthBackground from "../components/AuthBackground";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await API.post("/login", {
        email,
        password,
      });

      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        navigate("/");
      }
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Login failed");
    }
  }

  return (
    <AuthBackground>
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
          Nexora ERP
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to manage shipments, finance, customers, and alerts.
        </p>

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Email
            <input
              type="email"
              value={email}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Password
            <input
              type="password"
              value={password}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        <button className="mt-6 w-full rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700">
          Login
        </button>

        <p className="mt-5 text-center text-sm text-slate-500">
          New workspace?{" "}
          <Link className="font-bold text-indigo-700" to="/register">
            Create account
          </Link>
        </p>
      </form>
    </AuthBackground>
  );
}
