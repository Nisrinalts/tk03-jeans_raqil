"use client";

import { v4 as uuidv4 } from "uuid";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Venue } from "@/types/venue";
import { getUser, AuthUser } from "@/lib/auth";
import LoadingState from "@/components/LoadingState";

const initialVenues: Venue[] = [];

function getCityBadgeClass(city: string) {
  const c = city.toLowerCase();
  if (c === "jakarta") return "bg-blue-50 text-blue-700 border border-blue-100";
  if (c === "bandung") return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  if (c === "surabaya") return "bg-amber-50 text-amber-700 border border-amber-100";
  return "bg-gray-50 text-gray-700 border border-gray-100";
}

export default function VenuesPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [search, setSearch] = useState("");

  // create
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [isReserved, setIsReserved] = useState(false);
  const [error, setError] = useState("");

  // edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [editVenueName, setEditVenueName] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editIsReserved, setEditIsReserved] = useState(false);
  const [editError, setEditError] = useState("");

  // delete
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);

    async function fetchVenues() {
      try {
        const res = await fetch("/api/venues");
        if (res.ok) {
          const data = await res.json();
          setVenues(data);
        }
      } catch (e) {
        console.error("Failed to fetch venues:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchVenues();
  }, [router]);

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return venues;
    return venues.filter(
      (v) =>
        v.venue_name.toLowerCase().includes(kw) ||
        v.city.toLowerCase().includes(kw) ||
        v.address.toLowerCase().includes(kw)
    );
  }, [search, venues]);

  const canManage = user?.role === "admin" || user?.role === "organizer";
  const navRole = user?.role ?? "guest";

  const handleCreate = async () => {
    if (!venueName.trim()) { setError("Nama venue wajib diisi."); return; }
    if (!capacity || isNaN(Number(capacity)) || Number(capacity) <= 0) {
      setError("Kapasitas harus berupa angka lebih dari 0."); return;
    }
    if (!address.trim()) { setError("Alamat wajib diisi."); return; }
    if (!city.trim()) { setError("Kota wajib diisi."); return; }

    try {
      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: venueName.trim(),
          capacity: Number(capacity),
          address: address.trim(),
          city: city.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Gagal menambahkan venue.");
      }

      const fetchRes = await fetch("/api/venues");
      if (fetchRes.ok) {
        const freshVenues = await fetchRes.json();
        setVenues(freshVenues);
      }

      setVenueName(""); setCapacity(""); setAddress(""); setCity(""); setIsReserved(false); setError("");
      setIsCreateOpen(false);
      showToast("Venue berhasil ditambahkan.", "success");
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const handleOpenEdit = (venue: Venue) => {
    setSelectedId(venue.venue_id);
    setEditVenueName(venue.venue_name);
    setEditCapacity(String(venue.capacity));
    setEditAddress(venue.address);
    setEditCity(venue.city);
    setEditIsReserved(venue.is_reserved_seating);
    setEditError("");
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editVenueName.trim()) { setEditError("Nama venue wajib diisi."); return; }
    if (!editCapacity || isNaN(Number(editCapacity)) || Number(editCapacity) <= 0) {
      setEditError("Kapasitas harus berupa angka lebih dari 0."); return;
    }
    if (!editAddress.trim()) { setEditError("Alamat wajib diisi."); return; }
    if (!editCity.trim()) { setEditError("Kota wajib diisi."); return; }

    try {
      const res = await fetch("/api/venues", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venue_id: selectedId,
          name: editVenueName.trim(),
          capacity: Number(editCapacity),
          address: editAddress.trim(),
          city: editCity.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Gagal memperbarui venue.");
      }

      const fetchRes = await fetch("/api/venues");
      if (fetchRes.ok) {
        const freshVenues = await fetchRes.json();
        setVenues(freshVenues);
      }

      setIsEditOpen(false);
      showToast("Venue berhasil diperbarui.", "success");
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const handleOpenDelete = (venue: Venue) => {
    setVenueToDelete(venue);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!venueToDelete) return;
    try {
      const res = await fetch("/api/venues", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venue_id: venueToDelete.venue_id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Gagal menghapus venue.");
      }

      const fetchRes = await fetch("/api/venues");
      if (fetchRes.ok) {
        const freshVenues = await fetchRes.json();
        setVenues(freshVenues);
      }

      setIsDeleteOpen(false);
      setVenueToDelete(null);
      showToast("Venue berhasil dihapus.", "success");
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <Navbar role={navRole} />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                {canManage ? "Manajemen Venue" : "Daftar Venue"}
              </h1>
              <p className="mt-2 text-base text-slate-500">
                {canManage
                  ? "Kelola data venue yang terdaftar pada platform JEANS RAQIL."
                  : "Semua venue yang tersedia pada platform JEANS RAQIL."}
              </p>
            </div>
            {canManage && (
              <button
                onClick={() => { setIsCreateOpen(true); setError(""); }}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <span className="mr-2 text-lg leading-none">＋</span>Tambah Venue
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Venue</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? <span className="text-gray-300">—</span> : venues.length}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Kapasitas Terbesar</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? <span className="text-gray-300">—</span> : Math.max(...venues.map((v) => v.capacity)).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Kota</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? <span className="text-gray-300">—</span> : new Set(venues.map((v) => v.city)).size}
              </p>
            </div>
          </div>

          {toast && (
            <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white transition-all animate-in fade-in slide-in-from-right-5 ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              <span>{toast.type === 'success' ? '✅' : '⛔'}</span>
              <span className="font-medium">{toast.message}</span>
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-6">
              <div className="mb-4">
                <h2 className="text-3xl font-bold text-slate-900">Tabel Venue</h2>
                <p className="mt-2 text-sm text-slate-500">Menampilkan seluruh venue yang terdaftar.</p>
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
              {loading ? (
                <LoadingState message="Memuat data venue..." />
              ) : (
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Venue</th>
                      <th className="px-6 py-4">Venue ID</th>
                      <th className="px-6 py-4">Kapasitas</th>
                      <th className="px-6 py-4">Kota</th>
                      <th className="px-6 py-4">Reserved Seating</th>
                      {canManage && <th className="px-6 py-4 text-right">Action</th>}
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
                        <td className="px-6 py-5 font-semibold text-slate-900">{venue.capacity.toLocaleString("id-ID")}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${getCityBadgeClass(venue.city)}`}>
                            {venue.city}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${venue.is_reserved_seating ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                            {venue.is_reserved_seating ? "Ya" : "Tidak"}
                          </span>
                        </td>
                        {canManage && (
                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => handleOpenEdit(venue)}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                title="Update Venue"
                              >✎</button>
                              <button
                                onClick={() => handleOpenDelete(venue)}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-600 shadow-sm transition hover:bg-rose-50"
                                title="Delete Venue"
                              >🗑</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={canManage ? 6 : 5} className="px-6 py-10 text-center text-sm text-slate-400">
                          Tidak ada venue yang sesuai dengan pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">Tambah Venue Baru</h2>
              <button onClick={() => { setIsCreateOpen(false); setError(""); }} className="text-3xl text-slate-300 transition hover:text-slate-500">×</button>
            </div>
            <div className="space-y-5">
              {([
                { label: "Nama Venue", val: venueName, set: setVenueName, ph: "cth. Jakarta Convention Center" },
                { label: "Kapasitas", val: capacity, set: setCapacity, ph: "cth. 500" },
                { label: "Alamat", val: address, set: setAddress, ph: "cth. Jl. Gatot Subroto, Senayan" },
                { label: "Kota", val: city, set: setCity, ph: "cth. Jakarta" },
              ] as { label: string; val: string; set: (v: string) => void; ph: string }[]).map(({ label, val, set, ph }) => (
                <div key={label}>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {label} <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" placeholder={ph} value={val} onChange={(e) => set(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500" />
                </div>
              ))}
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Reserved Seating
                </label>
                <button
                  type="button"
                  onClick={() => setIsReserved((v) => !v)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${isReserved ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"}`}
                >
                  {isReserved ? "✓ Ya, Reserved Seating" : "Tidak (Non-Reserved)"}
                </button>
              </div>
              {error && <p className="text-sm font-medium text-rose-500">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setIsCreateOpen(false); setError(""); setVenueName(""); setCapacity(""); setAddress(""); setCity(""); setIsReserved(false); }}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Batal</button>
                <button onClick={handleCreate}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">Tambah Venue</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">Edit Venue</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-3xl text-slate-300 transition hover:text-slate-500">×</button>
            </div>
            <div className="space-y-5">
              {([
                { label: "Nama Venue", val: editVenueName, set: setEditVenueName, ph: "cth. Jakarta Convention Center" },
                { label: "Kapasitas", val: editCapacity, set: setEditCapacity, ph: "cth. 500" },
                { label: "Alamat", val: editAddress, set: setEditAddress, ph: "cth. Jl. Gatot Subroto, Senayan" },
                { label: "Kota", val: editCity, set: setEditCity, ph: "cth. Jakarta" },
              ] as { label: string; val: string; set: (v: string) => void; ph: string }[]).map(({ label, val, set, ph }) => (
                <div key={label}>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {label} <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" placeholder={ph} value={val} onChange={(e) => set(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500" />
                </div>
              ))}
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Reserved Seating
                </label>
                <button
                  type="button"
                  onClick={() => setEditIsReserved((v) => !v)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${editIsReserved ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"}`}
                >
                  {editIsReserved ? "✓ Ya, Reserved Seating" : "Tidak (Non-Reserved)"}
                </button>
              </div>
              {editError && <p className="text-sm font-medium text-rose-500">{editError}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsEditOpen(false)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Batal</button>
                <button onClick={handleUpdate}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">Simpan Perubahan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteOpen && venueToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-rose-600">Hapus Venue</h2>
              <button onClick={() => { setIsDeleteOpen(false); setVenueToDelete(null); }} className="text-3xl text-slate-300 transition hover:text-slate-500">×</button>
            </div>
            <div className="space-y-4">
              <p className="text-base text-slate-600">Apakah Anda yakin ingin menghapus venue ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700"><span className="font-semibold text-slate-900">Venue ID:</span> {venueToDelete.venue_id}</p>
                <p className="mt-2 text-sm text-slate-700"><span className="font-semibold text-slate-900">Nama:</span> {venueToDelete.venue_name}</p>
                <p className="mt-2 text-sm text-slate-700"><span className="font-semibold text-slate-900">Kota:</span> {venueToDelete.city}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setIsDeleteOpen(false); setVenueToDelete(null); }}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Batal</button>
                <button onClick={handleDelete}
                  className="w-full rounded-2xl bg-rose-600 px-4 py-3 font-semibold text-white transition hover:bg-rose-700">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
