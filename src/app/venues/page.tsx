"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Venue } from "@/types/venue";

const venueData: Venue[] = [
  {
    venue_id: "550e8400-e29b-41d4-a716-446655447001",
    venue_name: "Jakarta Convention Center",
    capacity: 500,
    address: "Jl. Gatot Subroto, Senayan",
    city: "Jakarta",
  },
  {
    venue_id: "550e8400-e29b-41d4-a716-446655447002",
    venue_name: "Sabuga Bandung",
    capacity: 500,
    address: "Jl. Tamansari No.73",
    city: "Bandung",
  },
  {
    venue_id: "550e8400-e29b-41d4-a716-446655447003",
    venue_name: "Grand City Surabaya",
    capacity: 300,
    address: "Jl. Gubeng Pojok No.1",
    city: "Surabaya",
  },
];

function getCityBadgeClass(city: string) {
  const c = city.toLowerCase();
  if (c === "jakarta") return "bg-blue-50 text-blue-700 border border-blue-100";
  if (c === "bandung") return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  if (c === "surabaya") return "bg-amber-50 text-amber-700 border border-amber-100";
  return "bg-gray-50 text-gray-700 border border-gray-100";
}

export default function VenuesPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return venueData;
    return venueData.filter(
      (v) =>
        v.venue_name.toLowerCase().includes(kw) ||
        v.city.toLowerCase().includes(kw) ||
        v.address.toLowerCase().includes(kw)
    );
  }, [search]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <Navbar role="guest" />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Daftar Venue</h1>
            <p className="mt-2 text-base text-slate-500">
              Semua venue yang terdaftar pada platform JEANS RAQIL.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Total Venue</p>
              <p className="mt-3 text-5xl font-bold text-slate-900">{venueData.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Kapasitas Terbesar</p>
              <p className="mt-3 text-5xl font-bold text-slate-900">
                {Math.max(...venueData.map((v) => v.capacity)).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Total Kota</p>
              <p className="mt-3 text-5xl font-bold text-slate-900">
                {new Set(venueData.map((v) => v.city)).size}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-6">
              <div className="mb-4">
                <h2 className="text-3xl font-bold text-slate-900">Tabel Venue</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Menampilkan seluruh venue yang terdaftar.
                </p>
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full max-w-md">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">⌕</span>
                  <input
                    type="text"
                    placeholder="Cari nama, kota, atau alamat..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500"
                  />
                </div>
                <p className="text-sm font-medium text-slate-400">{filtered.length} venue ditemukan</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Venue</th>
                    <th className="px-6 py-4">Venue ID</th>
                    <th className="px-6 py-4">Kapasitas</th>
                    <th className="px-6 py-4">Kota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((venue) => (
                    <tr key={venue.venue_id} className="text-sm text-slate-700">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-sm">
                            {venue.venue_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{venue.venue_name}</p>
                            <p className="mt-1 text-xs text-slate-400">{venue.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-medium text-slate-700">{venue.venue_id}</td>
                      <td className="px-6 py-5 font-semibold text-slate-900">
                        {venue.capacity.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${getCityBadgeClass(venue.city)}`}>
                          {venue.city}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">
                        Tidak ada venue yang sesuai dengan pencarian.
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
