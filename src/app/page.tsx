"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (u) {
      router.replace("/dashboard");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      {/* Top bar (guest only: landing, login, register) */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
            TikTakTuk
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Registrasi
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
              Platform Tiket Konser
            </span>
            <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl">
              Pesan tiket konser favoritmu dengan mudah.
            </h1>
            <p className="mt-5 text-lg text-slate-600">
              TikTakTuk menghubungkan customer, organizer, dan venue dalam
              satu platform tiket terpadu. Kelola event, pilih kursi, dan
              nikmati promo spesial — semua dalam satu tempat.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Mulai Sekarang
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Sudah Punya Akun? Login
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <FeatureCard title="6+" desc="Event Aktif" color="from-blue-500 to-indigo-500" />
              <FeatureCard title="3+" desc="Venue Mitra" color="from-emerald-500 to-teal-500" />
              <FeatureCard title="2+" desc="Organizer" color="from-amber-500 to-orange-500" />
              <FeatureCard title="∞" desc="Pengalaman Seru" color="from-rose-500 to-pink-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Kenapa TikTakTuk?
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <BenefitCard
            title="Tiket Resmi"
            desc="Semua tiket bersumber langsung dari organizer resmi. Bebas penipuan."
          />
          <BenefitCard
            title="Pilih Kursi Bebas"
            desc="Lihat denah kursi dan pilih posisi terbaik sebelum checkout."
          />
          <BenefitCard
            title="Promo Eksklusif"
            desc="Dapatkan kode promo persentase atau potongan nominal untuk hemat lebih."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-600 px-8 py-14 text-center text-white shadow-[0_20px_60px_rgba(37,99,235,0.35)]">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Siap menikmati konser berikutnya?
          </h2>
          <p className="mt-3 text-base text-blue-100">
            Buat akun gratis sebagai customer atau organizer dalam hitungan
            detik.
          </p>
          <Link
            href="/register"
            className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Daftar Sekarang
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} JEANS RAQIL. Tugas Basis Data TK03.
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  desc,
  color,
}: {
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${color} p-5 text-white`}>
      <p className="text-3xl font-bold">{title}</p>
      <p className="mt-1 text-sm opacity-90">{desc}</p>
    </div>
  );
}

function BenefitCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
    </div>
  );
}
