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

type QuickLink = { label: string; href: string; color: string };

const adminLinks: QuickLink[] = [
  { label: "Manajemen Venue", href: "/venues/manage", color: "bg-blue-600 hover:bg-blue-700" },
  { label: "Manajemen Event", href: "/events/manage", color: "bg-indigo-600 hover:bg-indigo-700" },
  { label: "Lihat Semua Venue", href: "/venues", color: "bg-slate-700 hover:bg-slate-800" },
  { label: "Lihat Semua Event", href: "/events", color: "bg-slate-700 hover:bg-slate-800" },
];

const organizerLinks: QuickLink[] = [
  { label: "Manajemen Venue", href: "/venues/manage", color: "bg-blue-600 hover:bg-blue-700" },
  { label: "Event Saya", href: "/events/manage", color: "bg-indigo-600 hover:bg-indigo-700" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
    } else {
      setUser(u);
    }
  }, [router]);

  if (!user) return null;

  const role = user.role;
  const myEvents = eventData.filter((e) => e.organizer_id === user.organizer_id);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <Navbar role={role} />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
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

          {role === "admin" && (
            <>
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Total Event</p>
                  <p className="mt-3 text-5xl font-bold text-slate-900">{eventData.length}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Total Venue</p>
                  <p className="mt-3 text-5xl font-bold text-slate-900">3</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Total Organizer</p>
                  <p className="mt-3 text-5xl font-bold text-slate-900">2</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {adminLinks.map((l) => (
                  <Link key={l.href} href={l.href} className={`rounded-full px-5 py-3 text-sm font-semibold text-white transition ${l.color}`}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </>
          )}

          {role === "organizer" && (
            <>
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Event Saya</p>
                  <p className="mt-3 text-5xl font-bold text-slate-900">{myEvents.length}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Total Event Platform</p>
                  <p className="mt-3 text-5xl font-bold text-slate-900">{eventData.length}</p>
                </div>
              </div>
              <div className="mb-6 flex flex-wrap gap-3">
                {organizerLinks.map((l) => (
                  <Link key={l.href} href={l.href} className={`rounded-full px-5 py-3 text-sm font-semibold text-white transition ${l.color}`}>
                    {l.label}
                  </Link>
                ))}
              </div>
              {myEvents.length > 0 && (
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-6 py-4">
                    <h2 className="text-xl font-bold text-slate-900">Event Saya</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Judul Event</th>
                          <th className="px-6 py-4">Tanggal & Waktu</th>
                          <th className="px-6 py-4">Venue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {myEvents.map((e) => (
                          <tr key={e.event_id} className="text-sm text-slate-700">
                            <td className="px-6 py-4 font-semibold text-slate-900">{e.event_title}</td>
                            <td className="px-6 py-4">{e.event_datetime}</td>
                            <td className="px-6 py-4">{e.venue_name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {role === "customer" && (
            <>
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Event Tersedia</p>
                  <p className="mt-3 text-5xl font-bold text-slate-900">{eventData.length}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Venue Tersedia</p>
                  <p className="mt-3 text-5xl font-bold text-slate-900">3</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                  <h2 className="text-xl font-bold text-slate-900">Semua Event</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Judul Event</th>
                        <th className="px-6 py-4">Tanggal & Waktu</th>
                        <th className="px-6 py-4">Venue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {eventData.map((e) => (
                        <tr key={e.event_id} className="text-sm text-slate-700">
                          <td className="px-6 py-4 font-semibold text-slate-900">{e.event_title}</td>
                          <td className="px-6 py-4">{e.event_datetime}</td>
                          <td className="px-6 py-4">{e.venue_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
