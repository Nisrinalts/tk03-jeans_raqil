"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getUser, AuthUser } from "@/lib/auth";

type EventDisplay = {
  event_id: string;
  event_title: string;
  event_datetime: string;
  venue_name: string;
  organizer_id: string;
};

const eventData: EventDisplay[] = [
  { event_id: "550e8400-e29b-41d4-a716-446655441001", event_title: "The Weeknd After Hours Tour", event_datetime: "2025-08-15 19:00", venue_name: "Jakarta Convention Center", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { event_id: "550e8400-e29b-41d4-a716-446655441002", event_title: "Justin Bieber World Tour", event_datetime: "2025-09-20 18:00", venue_name: "Jakarta Convention Center", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { event_id: "550e8400-e29b-41d4-a716-446655441003", event_title: "Olivia Rodrigo GUTS Tour", event_datetime: "2025-10-05 20:00", venue_name: "Sabuga Bandung", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { event_id: "550e8400-e29b-41d4-a716-446655441004", event_title: "Kanye West Donda Live", event_datetime: "2025-11-12 19:30", venue_name: "Sabuga Bandung", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { event_id: "550e8400-e29b-41d4-a716-446655441005", event_title: "The Weeknd Starboy Festival", event_datetime: "2025-12-01 20:00", venue_name: "Sabuga Bandung", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { event_id: "550e8400-e29b-41d4-a716-446655441006", event_title: "Drake It's All A Blur Tour", event_datetime: "2026-01-10 19:00", venue_name: "Grand City Surabaya", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
    } else {
      setUser((prev) => (prev?.user_id === u.user_id ? prev : u));
    }
  }, [router]);

  if (!user) return null;

  const role = user.role;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <Navbar role={role} />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-2 text-base text-slate-500">
            Selamat datang,{" "}
            <span className="font-semibold text-slate-700">{user.username}</span>.{" "}
            Role:{" "}
            <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
              {role}
            </span>
          </p>
        </div>

        {role === "admin" && <AdminDashboard />}
        {role === "organizer" && <OrganizerDashboard user={user} />}
        {role === "customer" && <CustomerDashboard />}
      </section>
    </main>
  );
}

/* ===================== ADMIN ===================== */
function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* top stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Pengguna" value="4" hint="3 user seed + 1 admin" color="from-blue-500 to-indigo-500" />
        <StatCard label="Total Acara" value={String(eventData.length)} hint="acara terjadwal" color="from-indigo-500 to-purple-500" />
        <StatCard label="Omset Platform" value="—" hint="dalam pengembangan" color="from-emerald-500 to-teal-500" placeholder />
        <StatCard label="Promosi Aktif" value="—" hint="dalam pengembangan" color="from-amber-500 to-orange-500" placeholder />
      </div>

      {/* infrastruktur venue */}
      <Section title="Infrastruktur Venue" desc="Ringkasan kapasitas venue yang terdaftar di platform.">
        <div className="grid gap-4 md:grid-cols-3">
          <MiniStat label="Total Venue Terdaftar" value="3" />
          <MiniStat label="Reserved Seating" value="—" placeholder />
          <MiniStat label="Kapasitas Terbesar" value="—" placeholder />
        </div>
        <div className="mt-5">
          <Link
            href="/venues/manage"
            className="inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Kelola Venue
          </Link>
        </div>
      </Section>

      {/* marketing & promosi */}
      <Section title="Marketing & Promosi" desc="Pantau performa kampanye promo platform.">
        <div className="grid gap-4 md:grid-cols-3">
          <MiniStat label="Promo Persentase Aktif" value="—" placeholder />
          <MiniStat label="Promo Potongan Nominal Aktif" value="—" placeholder />
          <MiniStat label="Total Penggunaan" value="—" placeholder />
        </div>
        <div className="mt-5">
          <Link
            href="/promotion"
            className="inline-flex rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Kelola Promosi
          </Link>
        </div>
      </Section>
    </div>
  );
}

/* ===================== ORGANIZER ===================== */
function OrganizerDashboard({ user }: { user: AuthUser }) {
  const myEvents = eventData.filter((e) => e.organizer_id === user.organizer_id);
  const venuesUsed = new Set(myEvents.map((e) => e.venue_name)).size;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Acara Aktif" value={String(myEvents.length)} hint="event milik anda" color="from-blue-500 to-indigo-500" />
        <StatCard label="Total Tiket Terjual" value="—" hint="dalam pengembangan" color="from-emerald-500 to-teal-500" placeholder />
        <StatCard label="Revenue Bulan Ini" value="—" hint="dalam pengembangan" color="from-amber-500 to-orange-500" placeholder />
        <StatCard label="Venue Mitra Aktif" value={String(venuesUsed)} hint="venue yang dipakai" color="from-rose-500 to-pink-500" />
      </div>

      <Section title="Performa Acara" desc="Daftar event yang Anda kelola beserta status singkatnya.">
        {myEvents.length === 0 ? (
          <EmptyState text="Belum ada acara yang Anda buat." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Judul Event</th>
                    <th className="px-6 py-4">Tanggal & Waktu</th>
                    <th className="px-6 py-4">Venue</th>
                    <th className="px-6 py-4">Tiket Terjual</th>
                    <th className="px-6 py-4">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myEvents.map((e) => (
                    <tr key={e.event_id} className="text-sm text-slate-700">
                      <td className="px-6 py-4 font-semibold text-slate-900">{e.event_title}</td>
                      <td className="px-6 py-4">{e.event_datetime}</td>
                      <td className="px-6 py-4">{e.venue_name}</td>
                      <td className="px-6 py-4 text-slate-400">dalam pengembangan</td>
                      <td className="px-6 py-4 text-slate-400">dalam pengembangan</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/events/manage" className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
            Kelola Event Saya
          </Link>
          <Link href="/venues" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Lihat Venue Mitra
          </Link>
        </div>
      </Section>
    </div>
  );
}

/* ===================== CUSTOMER ===================== */
function CustomerDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tiket Aktif" value="—" hint="dalam pengembangan" color="from-blue-500 to-indigo-500" placeholder />
        <StatCard label="Acara Diikuti" value="—" hint="dalam pengembangan" color="from-indigo-500 to-purple-500" placeholder />
        <StatCard label="Kode Promo Tersedia" value="—" hint="dalam pengembangan" color="from-amber-500 to-orange-500" placeholder />
        <StatCard label="Total Belanja Bulan Ini" value="—" hint="dalam pengembangan" color="from-emerald-500 to-teal-500" placeholder />
      </div>

      <Section title="Tiket Mendatang" desc="Tiket aktif Anda yang akan datang.">
        <EmptyState text="Belum ada tiket aktif. Fitur tiket mendatang dalam pengembangan." />
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/events" className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
            Cari Event
          </Link>
          <Link href="/my-tickets" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Lihat Tiket Saya
          </Link>
        </div>
      </Section>
    </div>
  );
}

/* ===================== shared bits ===================== */
function StatCard({
  label,
  value,
  hint,
  color,
  placeholder,
}: {
  label: string;
  value: string;
  hint?: string;
  color: string;
  placeholder?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-1.5 w-full bg-gradient-to-r ${color}`} />
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`mt-3 text-4xl font-bold ${placeholder ? "text-slate-300" : "text-slate-900"}`}>
          {value}
        </p>
        {hint && (
          <p className={`mt-1 text-xs ${placeholder ? "italic text-slate-400" : "text-slate-500"}`}>
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value, placeholder }: { label: string; value: string; placeholder?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${placeholder ? "text-slate-300" : "text-slate-900"}`}>
        {value}
      </p>
      {placeholder && (
        <p className="mt-1 text-xs italic text-slate-400">dalam pengembangan</p>
      )}
    </div>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <p className="text-sm italic text-slate-500">{text}</p>
    </div>
  );
}
