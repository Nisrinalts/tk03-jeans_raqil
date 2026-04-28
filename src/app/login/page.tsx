"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }
    const user = login(username.trim(), password.trim());
    if (!user) {
      setError("Username atau password salah.");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            JEANS RAQIL
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Masuk ke akun Anda untuk melanjutkan
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
              Username
            </label>
            <input
              type="text"
              placeholder="cth. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500"
            />
          </div>

          {error && (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Masuk
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-blue-600 hover:underline">
            Daftar sekarang
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Akun tersedia
          </p>
          <div className="space-y-1 text-xs text-slate-500">
            <p><span className="font-medium text-slate-700">admin</span> / admin123</p>
            <p><span className="font-medium text-slate-700">organizer1</span> / org123</p>
            <p><span className="font-medium text-slate-700">organizer2</span> / org456</p>
            <p><span className="font-medium text-slate-700">customer1</span> / cust123</p>
          </div>
        </div>
      </div>
    </main>
  );
}
