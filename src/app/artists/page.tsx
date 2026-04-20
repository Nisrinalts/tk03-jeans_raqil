"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Artist } from "@/types/artist";

type Role = "guest" | "organizer" | "customer";

const artistData: Artist[] = [
  {
    artist_id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Drake",
    genre: "Hip-Hop",
  },
  {
    artist_id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Justin Bieber",
    genre: "Pop",
  },
  {
    artist_id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Kanye West",
    genre: "Hip-Hop",
  },
  {
    artist_id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Olivia Rodrigo",
    genre: "Pop",
  },
  {
    artist_id: "550e8400-e29b-41d4-a716-446655440005",
    name: "Selena Gomez",
    genre: "Pop",
  },
  {
    artist_id: "550e8400-e29b-41d4-a716-446655440006",
    name: "SZA",
    genre: "R&B",
  },
  {
    artist_id: "550e8400-e29b-41d4-a716-446655440007",
    name: "The Weeknd",
    genre: "R&B / Pop",
  },
  {
    artist_id: "550e8400-e29b-41d4-a716-446655440008",
    name: "Travis Scott",
    genre: "Hip-Hop",
  },
];

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

function getGenreBadgeClass(genre: string) {
  const normalized = genre.toLowerCase();

  if (normalized.includes("indie folk")) {
    return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  }
  if (normalized.includes("indie pop")) {
    return "bg-blue-50 text-blue-700 border border-blue-100";
  }
  if (normalized.includes("pop")) {
    return "bg-pink-50 text-pink-700 border border-pink-100";
  }
  if (normalized.includes("folk")) {
    return "bg-amber-50 text-amber-700 border border-amber-100";
  }
  if (normalized.includes("singer-songwriter")) {
    return "bg-violet-50 text-violet-700 border border-violet-100";
  }
  if (normalized.includes("r&b")) {
    return "bg-rose-50 text-rose-700 border border-rose-100";
  }

  return "bg-gray-50 text-gray-700 border border-gray-100";
}

export default function ArtistsPage() {
  // Ganti role ini untuk kebutuhan screenshot non-admin
  const role: Role = "guest";

  const [search, setSearch] = useState("");

  const sortedArtists = useMemo(() => {
    return [...artistData].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredArtists = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return sortedArtists;

    return sortedArtists.filter(
      (artist) =>
        artist.name.toLowerCase().includes(keyword) ||
        artist.genre.toLowerCase().includes(keyword) ||
        artist.artist_id.toLowerCase().includes(keyword)
    );
  }, [search, sortedArtists]);

  const totalArtists = artistData.length;
  const totalGenres = new Set(
    artistData.map((artist) => artist.genre.trim().toLowerCase()).filter(Boolean)
  ).size;
  const totalTampilDiEvent = artistData.length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <Navbar role={role} />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Daftar Artis
            </h1>
            <p className="mt-2 text-base text-slate-500">
              Kelola artis yang ada di platform TikTakTuk.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Total Artis
              </p>
              <p className="mt-3 text-5xl font-bold text-slate-900">{totalArtists}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Genre
              </p>
              <p className="mt-3 text-5xl font-bold text-slate-900">{totalGenres}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Tampil di Event
              </p>
              <p className="mt-3 text-5xl font-bold text-slate-900">
                {totalTampilDiEvent}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Tabel Artis</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Menampilkan seluruh artist yang terdaftar. Tabel diurutkan
                    berdasarkan Name secara ascending.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    Tabel
                  </button>
                  <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                    Daftar
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full max-w-md">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                    ⌕
                  </span>
                  <input
                    type="text"
                    placeholder="Cari nama atau genre..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500"
                  />
                </div>

                <p className="text-sm font-medium text-slate-400">
                  {filteredArtists.length} artis ditemukan
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Artis</th>
                    <th className="px-6 py-4">Artist ID</th>
                    <th className="px-6 py-4">Genre</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredArtists.map((artist) => (
                    <tr key={artist.artist_id} className="text-sm text-slate-700">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-sm">
                            {getInitial(artist.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{artist.name}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              Data artist / grup band
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 font-medium text-slate-700">
                        {artist.artist_id}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${getGenreBadgeClass(
                            artist.genre || "-"
                          )}`}
                        >
                          {artist.genre || "-"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredArtists.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-10 text-center text-sm text-slate-400"
                      >
                        Tidak ada artist yang sesuai dengan pencarian.
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