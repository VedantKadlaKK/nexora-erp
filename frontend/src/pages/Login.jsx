import { useState } from "react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  async function handleLogin(e) {

    e.preventDefault();

    try {

      const response = await API.post("/login", {
        email,
        password
      });

        if (response.data.access_token) {

        localStorage.setItem(
            "token",
            response.data.access_token
        );

        navigate("/");

        }

      navigate("/");

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.detail || "Login failed"
        );

    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-50">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl border shadow-sm w-96"
      >

        <h1 className="text-3xl font-bold mb-6 text-gray-800">

          Nexora Login

        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg p-3 mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg p-3 mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-slate-900 text-white py-3 rounded-lg"
        >

          Login

        </button>

      </form>

    </div>
  );
}
