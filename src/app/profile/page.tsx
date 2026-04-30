"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getUser, getProfile, saveProfile, logout, AuthUser, ProfileData } from "@/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ProfileData>({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
    setProfile(getProfile(u.user_id));
  }, [router]);

  if (!user) return null;

  const role = user.role;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Ukuran foto maksimum 2MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProfile((prev) => ({ ...prev, avatar: dataUrl }));
      setMessage({ type: "success", text: "Foto profil dipilih. Klik Simpan untuk menyimpan perubahan." });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setProfile((prev) => ({ ...prev, avatar: undefined }));
  };

  const handleSave = () => {
    setMessage(null);
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setMessage({ type: "error", text: "Konfirmasi password tidak cocok." });
        return;
      }
      if (password.length < 4) {
        setMessage({ type: "error", text: "Password minimal 4 karakter." });
        return;
      }
    }
    saveProfile(user.user_id, profile);
    setPassword("");
    setConfirmPassword("");
    setMessage({ type: "success", text: "Profil berhasil disimpan." });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <Navbar role={role} />

      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Profil Saya</h1>
          <p className="mt-2 text-base text-slate-500">
            Kelola informasi akun dan foto profil Anda.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
          {/* Avatar */}
          <div className="mb-8 flex flex-wrap items-center gap-6">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md">
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{user.username}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                Role: <span className="font-semibold text-blue-700">{role}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Upload Foto
                </button>
                {profile.avatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Hapus Foto
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">PNG/JPG, maksimum 2MB.</p>
            </div>
          </div>

          {message && (
            <div
              className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium ${
                message.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-rose-200 bg-rose-50 text-rose-600"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Customer fields */}
          {role === "customer" && (
            <div className="space-y-5">
              <Field
                label="Nama Lengkap"
                value={profile.full_name ?? ""}
                onChange={(v) => setProfile((p) => ({ ...p, full_name: v }))}
                placeholder="cth. Budi Santoso"
              />
              <Field
                label="Nomor HP"
                value={profile.phone_number ?? ""}
                onChange={(v) => setProfile((p) => ({ ...p, phone_number: v }))}
                placeholder="cth. 081234567890"
              />
            </div>
          )}

          {/* Organizer fields */}
          {role === "organizer" && (
            <div className="space-y-5">
              <Field
                label="Nama Organizer"
                value={profile.organizer_name ?? ""}
                onChange={(v) => setProfile((p) => ({ ...p, organizer_name: v }))}
                placeholder="cth. Mega Promotions"
              />
              <Field
                label="Email Kontak"
                value={profile.contact_email ?? ""}
                onChange={(v) => setProfile((p) => ({ ...p, contact_email: v }))}
                placeholder="cth. info@mega.com"
                type="email"
              />
            </div>
          )}

          {/* Admin: minimal info */}
          {role === "admin" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Akun admin: hanya mendukung perubahan foto profil dan password.
            </div>
          )}

          {/* Password (semua role) */}
          <div className="mt-8 border-t border-slate-200 pt-8">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Ubah Password</h2>
            <p className="mb-4 text-sm text-slate-500">
              Kosongkan jika tidak ingin mengganti password.
            </p>
            <div className="space-y-5">
              <Field
                label="Password Baru"
                value={password}
                onChange={setPassword}
                type="password"
                placeholder="••••••••"
              />
              <Field
                label="Konfirmasi Password Baru"
                value={confirmPassword}
                onChange={setConfirmPassword}
                type="password"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Simpan Perubahan
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Kembali ke Dashboard
            </button>
          </div>

          {/* Logout */}
          <div className="mt-10 border-t border-slate-200 pt-8">
            <h2 className="mb-2 text-lg font-bold text-slate-900">Keluar Akun</h2>
            <p className="mb-5 text-sm text-slate-500">
              Anda akan keluar dari sesi ini dan diarahkan ke halaman login.
            </p>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="rounded-full border border-rose-300 bg-white px-6 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              Logout
            </button>
          </div>
        </div>
      </section>
    </main>
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
