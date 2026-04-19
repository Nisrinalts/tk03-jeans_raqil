"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Artist } from "@/types/artist";

const initialArtists: Artist[] = [
  { artist_id: "ART-001", name: "Fourtwnty", genre: "Indie Folk" },
  { artist_id: "ART-002", name: "Hindia", genre: "Indie Pop" },
  { artist_id: "ART-003", name: "Nadin Amizah", genre: "Folk" },
  { artist_id: "ART-004", name: "Pamungkas", genre: "Singer-Songwriter" },
  { artist_id: "ART-005", name: "Raisa", genre: "R&B / Pop" },
  { artist_id: "ART-006", name: "Tulus", genre: "Pop" },
];

export default function ManageArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>(initialArtists);

  const sortedArtists = useMemo(() => {
    return [...artists].sort((a, b) => a.name.localeCompare(b.name));
  }, [artists]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar role="admin" />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Artist</h1>
            <p className="mt-2 text-sm text-gray-600">
              Kelola data artist yang tampil pada event di platform TikTakTuk.
            </p>
          </div>

          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            + Tambah Artist
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Daftar Artist</h2>
            <p className="mt-1 text-sm text-gray-500">
              Tabel diurutkan berdasarkan nama artist secara ascending.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 text-sm uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-4">Artist ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Genre</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedArtists.map((artist) => (
                  <tr key={artist.artist_id} className="text-sm text-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900">{artist.artist_id}</td>
                    <td className="px-6 py-4">{artist.name}</td>
                    <td className="px-6 py-4">{artist.genre || "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                          Update
                        </button>
                        <button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedArtists.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                      Belum ada artist.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}