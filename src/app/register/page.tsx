"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";

type Role = "customer" | "organizer" | "admin";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role | null>(null);

  // shared
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // customer fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // organizer fields
  const [organizerName, setOrganizerName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSelectRole = (r: Role) => {
    setRole(r);
    setStep(2);
    setError("");
  };

  const handleSubmit = () => {
    setError("");
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (role === "customer" && !fullName.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }
    if (role === "organizer" && !organizerName.trim()) {
      setError("Nama organizer wajib diisi.");
      return;
    }
    // admin: tidak ada field tambahan

    const result = register(
      username.trim(),
      password.trim(),
      role!,
      {
        full_name: fullName.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
        organizer_name: organizerName.trim() || undefined,
        contact_email: contactEmail.trim() || undefined,
      }
    );

    if (!result.success) {
      setError(result.error ?? "Pendaftaran gagal.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-10">
      <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            JEANS RAQIL
          </Link>
          <p className="mt-2 text-sm text-slate-500">
            Buat akun baru dalam dua langkah
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <StepIndicator num={1} active={step >= 1} label="Pilih Tipe Akun" />
          <span className="h-px w-10 bg-slate-200" />
          <StepIndicator num={2} active={step >= 2} label="Isi Data" />
        </div>

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Pendaftaran berhasil disimulasikan. Mengarahkan ke halaman login…
          </div>
        )}

        {step === 1 && (
          <>
            <p className="mb-5 text-center text-sm text-slate-600">
              Pilih tipe akun yang ingin kamu daftarkan.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <RoleCard
                title="Customer"
                desc="Beli tiket, pilih kursi, dan nikmati promo eksklusif."
                onClick={() => handleSelectRole("customer")}
                accent="from-blue-500 to-indigo-500"
              />
              <RoleCard
                title="Organizer"
                desc="Kelola event, venue mitra, dan pantau penjualan tiket."
                onClick={() => handleSelectRole("organizer")}
                accent="from-amber-500 to-orange-500"
              />
              <RoleCard
                title="Admin"
                desc="Akses penuh ke seluruh manajemen platform."
                onClick={() => handleSelectRole("admin")}
                accent="from-rose-500 to-pink-500"
              />
            </div>
          </>
        )}

        {step === 2 && role && (
          <div className="space-y-5">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
            >
              ← Ganti tipe akun
            </button>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
              Tipe akun:{" "}
              <span className="font-bold uppercase">{role}</span>
            </div>

            <Field label="Username" value={username} onChange={setUsername} placeholder="cth. budi123" />
            <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
            <Field label="Konfirmasi Password" value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="••••••••" />

            {role === "customer" && (
              <>
                <Field label="Nama Lengkap" value={fullName} onChange={setFullName} placeholder="cth. Budi Santoso" />
                <Field label="Nomor HP" value={phoneNumber} onChange={setPhoneNumber} placeholder="cth. 081234567890" />
              </>
            )}

            {role === "organizer" && (
              <>
                <Field label="Nama Organizer" value={organizerName} onChange={setOrganizerName} placeholder="cth. Mega Promotions" />
                <Field label="Email Kontak" value={contactEmail} onChange={setContactEmail} type="email" placeholder="cth. info@mega.com" />
              </>
            )}

            {role === "admin" && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                Akun admin tidak memerlukan data tambahan. Hanya username dan password yang diperlukan.
              </div>
            )}

            {error && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={success}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              Daftar
            </button>

          </div>
        )}

        <div className="mt-8 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </main>
  );
}

function StepIndicator({
  num,
  active,
  label,
}: {
  num: number;
  active: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
          active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
        }`}
      >
        {num}
      </span>
      <span
        className={`text-xs font-semibold uppercase tracking-wide ${
          active ? "text-slate-900" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function RoleCard({
  title,
  desc,
  onClick,
  accent,
}: {
  title: string;
  desc: string;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-3xl border-2 border-slate-200 bg-white p-6 text-left transition hover:border-blue-400 hover:shadow-lg"
    >
      <div
        className={`mb-4 inline-flex rounded-full bg-gradient-to-br ${accent} px-3 py-1 text-xs font-bold uppercase tracking-wide text-white`}
      >
        {title}
      </div>
      <p className="text-sm text-slate-600">{desc}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-blue-600 opacity-0 transition group-hover:opacity-100">
        Pilih →
      </p>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500"
      />
    </div>
  );
}
