import { useState } from "react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";

export default function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  async function handleRegister(e) {

    e.preventDefault();

    try {

      await API.post("/register", form);

      navigate("/login");

    } catch (error) {

      console.error(error);

      alert("Registration failed");

    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-50">

      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl border shadow-sm w-96"
      >

        <h1 className="text-3xl font-bold mb-6 text-gray-800">

          Create Account

        </h1>

        <input
          type="text"
          placeholder="Username"
          className="w-full border rounded-lg p-3 mb-4"
          onChange={(e) =>
            setForm({
              ...form,
              username: e.target.value
            })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg p-3 mb-4"
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg p-3 mb-4"
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value
            })
          }
        />

        <button
          className="w-full bg-slate-900 text-white py-3 rounded-lg"
        >

          Register

        </button>

      </form>

    </div>
  );
}