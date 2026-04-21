"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";

type EventDisplay = {
  event_id: string;
  event_datetime: string;
  event_title: string;
  venue_id: string;
  venue_name: string;
  organizer_id: string;
  organizer_name: string;
};

const eventData: EventDisplay[] = [
  {
    event_id: "550e8400-e29b-41d4-a716-446655441001",
    event_title: "The Weeknd After Hours Tour",
    event_datetime: "2025-08-15 19:00",
    venue_id: "550e8400-e29b-41d4-a716-446655447001",
    venue_name: "Jakarta Convention Center",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
    organizer_name: "Organizer Satu",
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441002",
    event_title: "Justin Bieber World Tour",
    event_datetime: "2025-09-20 18:00",
    venue_id: "550e8400-e29b-41d4-a716-446655447001",
    venue_name: "Jakarta Convention Center",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
    organizer_name: "Organizer Dua",
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441003",
    event_title: "Olivia Rodrigo GUTS Tour",
    event_datetime: "2025-10-05 20:00",
    venue_id: "550e8400-e29b-41d4-a716-446655447002",
    venue_name: "Sabuga Bandung",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
    organizer_name: "Organizer Satu",
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441004",
    event_title: "Kanye West Donda Live",
    event_datetime: "2025-11-12 19:30",
    venue_id: "550e8400-e29b-41d4-a716-446655447002",
    venue_name: "Sabuga Bandung",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
    organizer_name: "Organizer Dua",
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441005",
    event_title: "The Weeknd Starboy Festival",
    event_datetime: "2025-12-01 20:00",
    venue_id: "550e8400-e29b-41d4-a716-446655447002",
    venue_name: "Sabuga Bandung",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
    organizer_name: "Organizer Satu",
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441006",
    event_title: "Drake It's All A Blur Tour",
    event_datetime: "2026-01-10 19:00",
    venue_id: "550e8400-e29b-41d4-a716-446655447003",
    venue_name: "Grand City Surabaya",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
    organizer_name: "Organizer Dua",
  },
];

export default function EventsPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return eventData;
    return eventData.filter(
      (e) =>
        e.event_title.toLowerCase().includes(kw) ||
        e.venue_name.toLowerCase().includes(kw) ||
        e.organizer_name.toLowerCase().includes(kw)
    );
  }, [search]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <Navbar role="guest" />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Semua Event</h1>
            <p className="mt-2 text-base text-slate-500">
              Daftar event yang tersedia pada platform JEANS RAQIL.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Total Event</p>
              <p className="mt-3 text-5xl font-bold text-slate-900">{eventData.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Total Venue</p>
              <p className="mt-3 text-5xl font-bold text-slate-900">
                {new Set(eventData.map((e) => e.venue_id)).size}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Total Organizer</p>
              <p className="mt-3 text-5xl font-bold text-slate-900">
                {new Set(eventData.map((e) => e.organizer_id)).size}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-6">
              <div className="mb-4">
                <h2 className="text-3xl font-bold text-slate-900">Tabel Event</h2>
                <p className="mt-2 text-sm text-slate-500">Menampilkan seluruh event yang terdaftar.</p>
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full max-w-md">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">⌕</span>
                  <input
                    type="text"
                    placeholder="Cari judul, venue, atau organizer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500"
                  />
                </div>
                <p className="text-sm font-medium text-slate-400">{filtered.length} event ditemukan</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Event</th>
                    <th className="px-6 py-4">Event ID</th>
                    <th className="px-6 py-4">Tanggal & Waktu</th>
                    <th className="px-6 py-4">Venue</th>
                    <th className="px-6 py-4">Organizer</th>
                    <th className="px-6 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((event) => (
                    <tr key={event.event_id} className="text-sm text-slate-700">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-sm">
                            {event.event_title.charAt(0)}
                          </div>
                          <p className="font-semibold text-slate-900">{event.event_title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-medium text-slate-700">{event.event_id}</td>
                      <td className="px-6 py-5">{event.event_datetime}</td>
                      <td className="px-6 py-5 font-medium text-slate-900">{event.venue_name}</td>
                      <td className="px-6 py-5">{event.organizer_name}</td>
                      <td className="px-6 py-5">
                        <a
  href={`/order?event_id=${event.event_id}`}
  className="inline-flex items-center justify-center whitespace-nowrap bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
>
  Beli Tiket
</a>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                        Tidak ada event yang sesuai dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}