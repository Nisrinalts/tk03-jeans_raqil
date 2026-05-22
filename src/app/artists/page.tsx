"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import LoadingState from "@/components/LoadingState";
import { Artist } from "@/types/artist";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

type Role = "guest" | "admin" | "organizer" | "customer";

type EventArtist = {
  event_id: string;
  event_title: string;
  artist_id: string;
  artist_name: string;
  role: string;
};

type EventOption = {
  event_id: string;
  event_title: string;
};


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
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);

  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "list">("table");

  const [eventArtists, setEventArtists] = useState<EventArtist[]>([]);
  const [artistsList, setArtistsList] = useState<Artist[]>([]);
  const [eventsList, setEventsList] = useState<EventOption[]>([]);

  const [selectedEventIdEA, setSelectedEventIdEA] = useState("");
  const [selectedArtistIdEA, setSelectedArtistIdEA] = useState("");
  const [manualEventIdEA, setManualEventIdEA] = useState("");
  const [manualArtistIdEA, setManualArtistIdEA] = useState("");
  const [eventArtistInputMode, setEventArtistInputMode] = useState<
    "select" | "manual"
  >("select");
  const [roleEA, setRoleEA] = useState("");

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

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "warning" | "danger" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "warning" | "danger" | "error"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const user = getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setRole(user.role);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [router]);

  useEffect(() => {
  if (!role) return;

  async function fetchArtists() {
    try {
      const res = await fetch("/api/artists");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengambil data artist.");
      }

      setArtists(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  fetchArtists();
}, [role]);

useEffect(() => {
  async function fetchEventArtists() {
    try {
      const res = await fetch("/api/event-artists");
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setEventArtists(data.eventArtists);
      setArtistsList(data.artists);
      setEventsList(data.events);
    } catch (err) {
      console.error(err);
    }
  }

  fetchEventArtists();
}, []);

  const canManage = role === "admin";

  const sortedArtists = useMemo(() => {
    return [...artists].sort((a, b) => a.name.localeCompare(b.name));
  }, [artists]);

  const filteredArtists = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return sortedArtists;

    return sortedArtists.filter(
      (artist) =>
        artist.name.toLowerCase().includes(keyword) ||
        (artist.genre || "").toLowerCase().includes(keyword) ||
        artist.artist_id.toLowerCase().includes(keyword)
    );
  }, [search, sortedArtists]);

  const totalArtists = artists.length;
  const totalGenres = new Set(
  artists
    .map((artist) => (artist.genre || "").trim().toLowerCase())
    .filter(Boolean)
).size;
  const totalTampilDiEvent = new Set(
    eventArtists.map((item) => item.artist_id)
  ).size;

  const resetCreateForm = () => {
    setName("");
    setGenre("");
    setError("");
  };

  const resetEditForm = () => {
    setSelectedArtistId("");
    setEditName("");
    setEditGenre("");
    setEditError("");
  };

  const handleCreateArtist = async () => {
  if (!name.trim()) {
    setError("Name wajib diisi.");
    showToast("Name wajib diisi.", "error");
    return;
  }

  try {
    const res = await fetch("/api/artists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        genre: genre.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Gagal menambahkan artist.");
      showToast(data.message || "Gagal menambahkan artist.", "error");
      return;
    }
    setArtists((prev) => [...prev, data]);
    resetCreateForm();
    setIsCreateOpen(false);
    showToast("Artist berhasil ditambahkan.", "success");
  } catch (error) {
    console.error(error);
    setError("Gagal menambahkan artist.");
  showToast("Gagal menambahkan artist.", "error");
  }
};

  const handleOpenEdit = (artist: Artist) => {
    setSelectedArtistId(artist.artist_id);
    setEditName(artist.name);
    setEditGenre(artist.genre || "");
    setEditError("");
    setIsEditOpen(true);
  };

  const handleUpdateArtist = async () => {
  if (!editName.trim()) {
    setEditError("Name wajib diisi.");
    return;
  }

  try {
    const res = await fetch("/api/artists", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        artist_id: selectedArtistId,
        name: editName.trim(),
        genre: editGenre.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setEditError(data.message || "Gagal memperbarui artist.");
      showToast(data.message || "Gagal memperbarui artist.", "error");
      return;
    }

    setArtists((prev) =>
      prev.map((artist) =>
        artist.artist_id === selectedArtistId ? data : artist
      )
    );

    resetEditForm();
    setIsEditOpen(false);
    showToast("Artist berhasil diperbarui.", "warning");
  } catch (error) {
    console.error(error);
    setEditError("Gagal memperbarui artist.");
  }
};

  const handleOpenDelete = (artist: Artist) => {
    setArtistToDelete(artist);
    setIsDeleteOpen(true);
  };

  const handleDeleteArtist = async () => {
  if (!artistToDelete) return;

  try {
    const res = await fetch("/api/artists", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        artist_id: artistToDelete.artist_id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Gagal menghapus artist.", "error");
      return;
    }

    setArtists((prev) =>
      prev.filter((artist) => artist.artist_id !== data.artist_id)
    );

    setIsDeleteOpen(false);
    setArtistToDelete(null);
    showToast("Artist berhasil dihapus.", "danger");
  } catch (error) {
    console.error(error);
    showToast("Gagal menghapus artist.", "error");
  }
};

const handleAddEventArtist = async () => {
  const eventId =
    eventArtistInputMode === "manual" ? manualEventIdEA.trim() : selectedEventIdEA;
  const artistId =
    eventArtistInputMode === "manual"
      ? manualArtistIdEA.trim()
      : selectedArtistIdEA;

  if (!eventId || !artistId || !roleEA.trim()) {
    showToast("Semua field wajib diisi.", "error");
    return;
  }

  try {
    const res = await fetch("/api/event-artists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_id: eventId,
        artist_id: artistId,
        role: roleEA,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Gagal menambahkan artist ke event.", "error");
      return;
    }

    setEventArtists((prev) => [...prev, data]);

    // reset
    setSelectedEventIdEA("");
    setSelectedArtistIdEA("");
    setManualEventIdEA("");
    setManualArtistIdEA("");
    setRoleEA("");
    showToast("Artist berhasil ditambahkan ke event.", "success");
  } catch (err) {
    console.error(err);
    showToast("Gagal menambahkan artist ke event.", "error");
  }
};

const getEventArtistKey = (eventId: string, artistId: string) =>
  `${eventId}-${artistId}`;
  
  if (!role) return null;

  const toastStyle =
    toast?.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : toast?.type === "warning"
      ? "border-yellow-200 bg-yellow-50 text-yellow-700"
      : "border-rose-200 bg-rose-50 text-rose-700";
  const toastIcon =
    toast?.type === "success" ? "✅ " : toast?.type === "warning" ? "⚠️ " : "⛔ ";

  const toastBanner = toast ? (
    <div
      className={`fixed right-6 top-20 z-[60] rounded-2xl border px-5 py-4 text-sm font-semibold shadow-lg ${toastStyle}`}
    >
      {toastIcon}
      {toast.message}
    </div>
  ) : null;

  if (isLoading) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <Navbar role={role} />
      {toastBanner}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              {canManage ? "Manajemen Artis" : "Daftar Artis"}
            </h1>
            <p className="mt-2 text-base text-slate-500">
              {canManage
                ? "Kelola data artist yang terdaftar pada platform TikTakTuk."
                : "Lihat daftar artist yang terdaftar pada platform TikTakTuk."}
            </p>
          </div>

          {canManage && (
            <button
              disabled
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white opacity-70 shadow-sm"
            >
              <span className="mr-2 text-lg leading-none">＋</span>
              Tambah Artis
            </button>
          )}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {["Total Artis", "Genre", "Tampil di Event"].map((label) => (
            <div
              key={label}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                {label}
              </p>
              <p className="mt-3 text-5xl font-bold text-slate-300">—</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Tabel Artis
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Menampilkan seluruh artist yang terdaftar.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400"
                >
                  Tabel
                </button>
                <button
                  disabled
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-400"
                >
                  Daftar
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="h-12 w-full max-w-md rounded-2xl border border-slate-200 bg-white" />
              <p className="text-sm font-medium text-slate-300">
                — artis ditemukan
              </p>
            </div>
          </div>

          <LoadingState message="Memuat data artist..." />
        </div>
      </section>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <Navbar role={role} />
      {toastBanner}

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                {canManage ? "Manajemen Artis" : "Daftar Artis"}
              </h1>
              <p className="mt-2 text-base text-slate-500">
                {canManage
                  ? "Kelola data artist yang terdaftar pada platform TikTakTuk."
                  : "Lihat daftar artist yang terdaftar pada platform TikTakTuk."}
              </p>
            </div>

            {canManage && (
              <button
                onClick={() => {
                  setIsCreateOpen(true);
                  setError("");
                }}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <span className="mr-2 text-lg leading-none">＋</span>
                Tambah Artis
              </button>
            )}
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
          {canManage && (
  <div className="mb-8 rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
    <div className="mb-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">
        Trigger Event Artist
      </p>
      <h2 className="mt-1 text-2xl font-bold text-slate-900">
        Tambah Artist ke Event
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Pilih event dan artist untuk menguji validasi duplikasi artist pada event.
      </p>
    </div>

    <div className="mb-4 inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
      <button
        type="button"
        onClick={() => {
          setEventArtistInputMode("select");
          setManualEventIdEA("");
          setManualArtistIdEA("");
        }}
        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
          eventArtistInputMode === "select"
            ? "bg-white text-blue-700 shadow-sm"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        Pilih dari daftar
      </button>
      <button
        type="button"
        onClick={() => {
          setEventArtistInputMode("manual");
          setSelectedEventIdEA("");
          setSelectedArtistIdEA("");
        }}
        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
          eventArtistInputMode === "manual"
            ? "bg-white text-blue-700 shadow-sm"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        Input ID manual
      </button>
    </div>

    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      {eventArtistInputMode === "select" ? (
        <>
          <select
            value={selectedEventIdEA}
            onChange={(e) => setSelectedEventIdEA(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="">Pilih Event</option>
            {eventsList.map((event) => (
              <option key={event.event_id} value={event.event_id}>
                {event.event_title}
              </option>
            ))}
          </select>

          <select
            value={selectedArtistIdEA}
            onChange={(e) => setSelectedArtistIdEA(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="">Pilih Artist</option>
            {artistsList.map((artist) => (
              <option key={artist.artist_id} value={artist.artist_id}>
                {artist.name}
              </option>
            ))}
          </select>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Event ID manual"
            value={manualEventIdEA}
            onChange={(e) => setManualEventIdEA(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
          />

          <input
            type="text"
            placeholder="Artist ID manual"
            value={manualArtistIdEA}
            onChange={(e) => setManualArtistIdEA(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
          />
        </>
      )}

      <input
        type="text"
        placeholder="Role, cth. Main Performer"
        value={roleEA}
        onChange={(e) => setRoleEA(e.target.value)}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
      />

      <button
        onClick={handleAddEventArtist}
        className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        Tambah ke Event
      </button>
    </div>

    {eventArtists.length > 0 && (
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-4">Event</th>
              <th className="px-5 py-4">Artist</th>
              <th className="px-5 py-4">Role</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {eventArtists.map((item) => (
              <tr key={getEventArtistKey(item.event_id, item.artist_id)}>
                <td className="px-5 py-4 font-medium text-slate-700">
                  {item.event_title}
                </td>
                <td className="px-5 py-4 font-semibold text-slate-900">
                  {item.artist_name}
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    {item.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
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
                  <button
                    onClick={() => setViewMode("table")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      viewMode === "table"
                        ? "bg-slate-100 text-slate-700"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Tabel
                  </button>

                  <button
                    onClick={() => setViewMode("list")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      viewMode === "list"
                        ? "bg-slate-100 text-slate-700"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
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


            {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Artis</th>
                    <th className="px-6 py-4">Artist ID</th>
                    <th className="px-6 py-4">Genre</th>
                    {canManage && <th className="px-6 py-4 text-right">Action</th>}
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

                      {canManage && (
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
                      )}
                    </tr>
                  ))}

                  {filteredArtists.length === 0 && (
                    <tr>
                      <td
                        colSpan={canManage ? 4 : 3}
                        className="px-6 py-10 text-center text-sm text-slate-400"
                      >
                        Tidak ada artist yang sesuai dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
) : (
  <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
    {filteredArtists.map((artist) => (
      <div
        key={artist.artist_id}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      >
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-sm">
            {getInitial(artist.name)}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">{artist.name}</h3>
            <p className="text-xs text-slate-400">Data artist / grup band</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Artist ID
            </p>
            <p className="mt-1 break-all font-medium text-slate-700">
              {artist.artist_id}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Genre
            </p>
            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${getGenreBadgeClass(
                artist.genre || "-"
              )}`}
            >
              {artist.genre || "-"}
            </span>
          </div>
        </div>

        {canManage && (
          <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
            <button
              onClick={() => handleOpenEdit(artist)}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              ✎ Edit
            </button>

            <button
              onClick={() => handleOpenDelete(artist)}
              className="flex-1 rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              🗑 Hapus
            </button>
          </div>
        )}
      </div>
    ))}

    {filteredArtists.length === 0 && (
      <div className="col-span-full py-10 text-center text-sm text-slate-400">
        Tidak ada artist yang sesuai dengan pencarian.
      </div>
    )}
  </div>
)}
          </div>
        </div>
      </section>

      {canManage && isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">Tambah Artist Baru</h2>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  resetCreateForm();
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

              {error && (
   <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
    {error}
  </div>
)}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsCreateOpen(false);
                    resetCreateForm();
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

      {canManage && isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">Edit Artist</h2>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  resetEditForm();
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
                <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  <span>⚠️</span>
                  <span>{editError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsEditOpen(false);
                    resetEditForm();
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

      {canManage && isDeleteOpen && artistToDelete && (
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
