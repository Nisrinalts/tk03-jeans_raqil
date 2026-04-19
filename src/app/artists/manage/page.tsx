"use client";

import { v4 as uuidv4 } from "uuid";
import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Artist } from "@/types/artist";

const initialArtists: Artist[] = [
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

export default function ManageArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>(initialArtists);
  const [search, setSearch] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [error, setError] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [editName, setEditName] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editError, setEditError] = useState("");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [artistToDelete, setArtistToDelete] = useState<Artist | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
const [successType, setSuccessType] = useState<"create" | "update" | "delete" | "">("");

  const sortedArtists = useMemo(() => {
    return [...artists].sort((a, b) => a.name.localeCompare(b.name));
  }, [artists]);

  const filteredArtists = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return sortedArtists;

    return sortedArtists.filter(
      (artist) =>
        artist.name.toLowerCase().includes(keyword) ||
        artist.genre.toLowerCase().includes(keyword)
    );
  }, [search, sortedArtists]);

  const totalArtists = artists.length;
  const totalGenres = new Set(
    artists.map((artist) => artist.genre.trim().toLowerCase()).filter(Boolean)
  ).size;
  const totalTampilDiEvent = artists.length;

  const handleCreateArtist = () => {
    if (!name.trim()) {
      setError("Name wajib diisi.");
      return;
    }

    const newArtist: Artist = {
      artist_id: uuidv4(),
      name: name.trim(),
      genre: genre.trim(),
    };

    setArtists((prev) => [...prev, newArtist]);
    setName("");
    setGenre("");
    setError("");
    setIsCreateOpen(false);
    setSuccessMessage("Artist berhasil ditambahkan.");
    setSuccessType("create");
  };

  const handleOpenEdit = (artist: Artist) => {
    setSelectedArtistId(artist.artist_id);
    setEditName(artist.name);
    setEditGenre(artist.genre);
    setEditError("");
    setSuccessMessage("");
    setIsEditOpen(true);
  };

  const handleUpdateArtist = () => {
    if (!editName.trim()) {
      setEditError("Name wajib diisi.");
      return;
    }

    setArtists((prev) =>
      prev.map((artist) =>
        artist.artist_id === selectedArtistId
          ? {
              ...artist,
              name: editName.trim(),
              genre: editGenre.trim(),
            }
          : artist
      )
    );

    setIsEditOpen(false);
    setSelectedArtistId("");
    setEditName("");
    setEditGenre("");
    setEditError("");
    setSuccessMessage("Artist berhasil diperbarui.");
    setSuccessType("update");
  };

  const handleOpenDelete = (artist: Artist) => {
    setArtistToDelete(artist);
    setSuccessMessage("");
    setIsDeleteOpen(true);
  };

  const handleDeleteArtist = () => {
    if (!artistToDelete) return;

    setArtists((prev) =>
      prev.filter((artist) => artist.artist_id !== artistToDelete.artist_id)
    );

    setIsDeleteOpen(false);
    setArtistToDelete(null);
    setSuccessMessage("Artist berhasil dihapus.");
    setSuccessType("delete");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <Navbar role="admin" />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Manajemen Artis
                </h1>
                <p className="mt-2 text-base text-slate-500">
                Kelola data artist yang terdaftar pada platform TikTakTuk.
                </p>
            </div>

            <button
              onClick={() => {
                setIsCreateOpen(true);
                setError("");
                setSuccessMessage("");
              }}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <span className="mr-2 text-lg leading-none">＋</span>
              Tambah Artis
            </button>
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

          {successMessage && (
                <div
                    className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium border ${
                    successType === "create"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : successType === "update"
                        ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                        : successType === "delete"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : ""
                    }`}
                >
                    {successMessage}
                </div>
                )}

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
                    <th className="px-6 py-4 text-right">Action</th>
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

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleOpenEdit(artist)}
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            title="Update Artist"
                          >
                            ✎
                          </button>

                          <button
                            onClick={() => handleOpenDelete(artist)}
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-600 shadow-sm transition hover:bg-rose-50"
                            title="Delete Artist"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredArtists.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
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

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">Tambah Artist Baru</h2>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setError("");
                  setName("");
                  setGenre("");
                }}
                className="text-3xl text-slate-300 transition hover:text-slate-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Nama Artis <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="cth. Drake"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Genre
                </label>
                <input
                  type="text"
                  placeholder="cth. Indie Folk"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500"
                />
              </div>

              {error && <p className="text-sm font-medium text-rose-500">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsCreateOpen(false);
                    setError("");
                    setName("");
                    setGenre("");
                  }}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  onClick={handleCreateArtist}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Tambah Artist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">Edit Artist</h2>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedArtistId("");
                  setEditName("");
                  setEditGenre("");
                  setEditError("");
                }}
                className="text-3xl text-slate-300 transition hover:text-slate-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Nama Artis <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="cth. Fourtwnty"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Genre
                </label>
                <input
                  type="text"
                  placeholder="cth. Indie Folk"
                  value={editGenre}
                  onChange={(e) => setEditGenre(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500"
                />
              </div>

              {editError && (
                <p className="text-sm font-medium text-rose-500">{editError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedArtistId("");
                    setEditName("");
                    setEditGenre("");
                    setEditError("");
                  }}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  onClick={handleUpdateArtist}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && artistToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-rose-600">Hapus Artist</h2>
              <button
                onClick={() => {
                  setIsDeleteOpen(false);
                  setArtistToDelete(null);
                }}
                className="text-3xl text-slate-300 transition hover:text-slate-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-base text-slate-600">
                Apakah Anda yakin ingin menghapus artist ini? Tindakan ini tidak
                dapat dibatalkan.
              </p>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Artist ID:</span>{" "}
                  {artistToDelete.artist_id}
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Name:</span>{" "}
                  {artistToDelete.name}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsDeleteOpen(false);
                    setArtistToDelete(null);
                  }}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  onClick={handleDeleteArtist}
                  className="w-full rounded-2xl bg-rose-600 px-4 py-3 font-semibold text-white transition hover:bg-rose-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}