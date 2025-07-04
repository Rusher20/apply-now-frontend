"use client";

import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "@/graphql/mutations/login";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { loading }] = useMutation(LOGIN_MUTATION);
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const toastId = toast.loading("Logging in...");
    try {
      const res = await login({ variables: { email, password } });

      localStorage.setItem("token", res.data.login);

      toast.success("Login successful!", { id: toastId });
      router.push("/admin");
    } catch (err) {
      console.error("Login failed:", err);
      toast.error("Invalid email or password.", { id: toastId });
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-t from-sky-500 to-indigo-500 p-4 sm:p-8"
      style={{ backgroundAttachment: "fixed" }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 max-w-md mx-auto mt-24 space-y-6"
      >
        <div className="flex justify-center">
          <img src="/PPSI.png" alt="PPSI Logo" className="h-20 object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-700 tracking-tight">
          Application Form Admin Login
        </h2>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
