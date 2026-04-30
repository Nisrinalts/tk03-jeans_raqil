"use client";

import { v4 as uuidv4 } from "uuid";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Venue } from "@/types/venue";
import { getUser, AuthUser } from "@/lib/auth";

const initialVenues: Venue[] = [
  {
    venue_id: "550e8400-e29b-41d4-a716-446655447001",
    venue_name: "Jakarta Convention Center",
    capacity: 500,
    address: "Jl. Gatot Subroto, Senayan",
    city: "Jakarta",
    is_reserved_seating: true,
  },
  {
    venue_id: "550e8400-e29b-41d4-a716-446655447002",
    venue_name: "Sabuga Bandung",
    capacity: 500,
    address: "Jl. Tamansari No.73",
    city: "Bandung",
    is_reserved_seating: false,
  },
  {
    venue_id: "550e8400-e29b-41d4-a716-446655447003",
    venue_name: "Grand City Surabaya",
    capacity: 300,
    address: "Jl. Gubeng Pojok No.1",
    city: "Surabaya",
    is_reserved_seating: true,
  },
];

export default function ManageVenuesPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [search, setSearch] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [editVenueName, setEditVenueName] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editError, setEditError] = useState("");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [successType, setSuccessType] = useState<"create" | "update" | "delete" | "">("");

  useEffect(() => {
    const u = getUser();
    if (!u || (u.role !== "admin" && u.role !== "organizer")) {
      router.replace("/login");
    } else {
      setUser(prev => prev?.user_id === u.user_id ? prev : u);
    }
  }, [router]);

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return venues;
    return venues.filter(
      (v) =>
        v.venue_name.toLowerCase().includes(kw) ||
        v.city.toLowerCase().includes(kw)
    );
  }, [search, venues]);

  const handleCreate = () => {
    if (!venueName.trim()) { setError("Nama venue wajib diisi."); return; }
    if (!capacity || isNaN(Number(capacity)) || Number(capacity) <= 0) {
      setError("Kapasitas harus berupa angka lebih dari 0."); return;
    }
    if (!address.trim()) { setError("Alamat wajib diisi."); return; }
    if (!city.trim()) { setError("Kota wajib diisi."); return; }

    const newVenue: Venue = {
      venue_id: uuidv4(),
      venue_name: venueName.trim(),
      capacity: Number(capacity),
      address: address.trim(),
      city: city.trim(),
      is_reserved_seating: false,
    };
    setVenues((prev) => [...prev, newVenue]);
    setVenueName(""); setCapacity(""); setAddress(""); setCity(""); setError("");
    setIsCreateOpen(false);
    setSuccessMessage("Venue berhasil ditambahkan.");
    setSuccessType("create");
  };

  const handleOpenEdit = (venue: Venue) => {
    setSelectedId(venue.venue_id);
    setEditVenueName(venue.venue_name);
    setEditCapacity(String(venue.capacity));
    setEditAddress(venue.address);
    setEditCity(venue.city);
    setEditError("");
    setSuccessMessage("");
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editVenueName.trim()) { setEditError("Nama venue wajib diisi."); return; }
    if (!editCapacity || isNaN(Number(editCapacity)) || Number(editCapacity) <= 0) {
      setEditError("Kapasitas harus berupa angka lebih dari 0."); return;
    }
    if (!editAddress.trim()) { setEditError("Alamat wajib diisi."); return; }
    if (!editCity.trim()) { setEditError("Kota wajib diisi."); return; }

    setVenues((prev) =>
      prev.map((v) =>
        v.venue_id === selectedId
          ? { ...v, venue_name: editVenueName.trim(), capacity: Number(editCapacity), address: editAddress.trim(), city: editCity.trim() }
          : v
      )
    );
    setIsEditOpen(false);
    setSuccessMessage("Venue berhasil diperbarui.");
    setSuccessType("update");
  };

  const handleOpenDelete = (venue: Venue) => {
    setVenueToDelete(venue);
    setSuccessMessage("");
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!venueToDelete) return;
    setVenues((prev) => prev.filter((v) => v.venue_id !== venueToDelete.venue_id));
    setIsDeleteOpen(false);
    setVenueToDelete(null);
    setSuccessMessage("Venue berhasil dihapus.");
    setSuccessType("delete");
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <Navbar role={user.role} />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">Manajemen Venue</h1>
              <p className="mt-2 text-base text-slate-500">Kelola data venue yang terdaftar pada platform JEANS RAQIL.</p>
            </div>
            <button
              onClick={() => { setIsCreateOpen(true); setError(""); setSuccessMessage(""); }}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <span className="mr-2 text-lg leading-none">＋</span>Tambah Venue
            </button>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Total Venue</p>
              <p className="mt-3 text-5xl font-bold text-slate-900">{venues.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Kapasitas Terbesar</p>
              <p className="mt-3 text-5xl font-bold text-slate-900">{Math.max(...venues.map((v) => v.capacity)).toLocaleString("id-ID")}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Total Kota</p>
              <p className="mt-3 text-5xl font-bold text-slate-900">{new Set(venues.map((v) => v.city)).size}</p>
            </div>
          </div>

          {successMessage && (
            <div className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium border ${
              successType === "create" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : successType === "update" ? "border-yellow-200 bg-yellow-50 text-yellow-700"
              : successType === "delete" ? "border-red-200 bg-red-50 text-red-700"
              : ""}`}>
              {successMessage}
            </div>
          )}

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-900">Tabel Venue</h2>
                <p className="mt-2 text-sm text-slate-500">Menampilkan seluruh venue yang terdaftar.</p>
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full max-w-md">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">⌕</span>
                  <input
                    type="text"
                    placeholder="Cari nama atau kota..."
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
                    <th className="px-6 py-4 text-right">Action</th>
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
                        <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-700 border border-slate-200">
                          {venue.city}
                        </span>
                      </td>
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
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
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

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">Tambah Venue Baru</h2>
              <button onClick={() => { setIsCreateOpen(false); setError(""); setVenueName(""); setCapacity(""); setAddress(""); setCity(""); }} className="text-3xl text-slate-300 transition hover:text-slate-500">×</button>
            </div>
            <div className="space-y-5">
              {[
                { label: "Nama Venue", val: venueName, set: setVenueName, ph: "cth. Jakarta Convention Center", req: true },
                { label: "Kapasitas", val: capacity, set: setCapacity, ph: "cth. 500", req: true },
                { label: "Alamat", val: address, set: setAddress, ph: "cth. Jl. Gatot Subroto, Senayan", req: true },
                { label: "Kota", val: city, set: setCity, ph: "cth. Jakarta", req: true },
              ].map(({ label, val, set, ph, req }) => (
                <div key={label}>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {label} {req && <span className="text-rose-500">*</span>}
                  </label>
                  <input type="text" placeholder={ph} value={val} onChange={(e) => set(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500" />
                </div>
              ))}
              {error && <p className="text-sm font-medium text-rose-500">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setIsCreateOpen(false); setError(""); setVenueName(""); setCapacity(""); setAddress(""); setCity(""); }}
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
              {[
                { label: "Nama Venue", val: editVenueName, set: setEditVenueName, ph: "cth. Jakarta Convention Center" },
                { label: "Kapasitas", val: editCapacity, set: setEditCapacity, ph: "cth. 500" },
                { label: "Alamat", val: editAddress, set: setEditAddress, ph: "cth. Jl. Gatot Subroto, Senayan" },
                { label: "Kota", val: editCity, set: setEditCity, ph: "cth. Jakarta" },
              ].map(({ label, val, set, ph }) => (
                <div key={label}>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {label} <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" placeholder={ph} value={val} onChange={(e) => set(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500" />
                </div>
              ))}
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
