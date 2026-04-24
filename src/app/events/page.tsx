"use client";

import { v4 as uuidv4 } from "uuid";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { getUser, AuthUser } from "@/lib/auth";

type EventDisplay = {
  event_id: string;
  event_datetime: string;
  event_title: string;
  venue_id: string;
  venue_name: string;
  organizer_id: string;
  organizer_name: string;
};

const venueOptions = [
  { venue_id: "550e8400-e29b-41d4-a716-446655447001", venue_name: "Jakarta Convention Center" },
  { venue_id: "550e8400-e29b-41d4-a716-446655447002", venue_name: "Sabuga Bandung" },
  { venue_id: "550e8400-e29b-41d4-a716-446655447003", venue_name: "Grand City Surabaya" },
];

const organizerOptions = [
  { organizer_id: "550e8400-e29b-41d4-a716-446655446001", organizer_name: "Organizer Satu" },
  { organizer_id: "550e8400-e29b-41d4-a716-446655446002", organizer_name: "Organizer Dua" },
];

const initialEvents: EventDisplay[] = [
  {
    event_id: "550e8400-e29b-41d4-a716-446655441001",
    event_title: "The Weeknd After Hours Tour",
    event_datetime: "2025-08-15T19:00",
    venue_id: "550e8400-e29b-41d4-a716-446655447001",
    venue_name: "Jakarta Convention Center",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
    organizer_name: "Organizer Satu",
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441002",
    event_title: "Justin Bieber World Tour",
    event_datetime: "2025-09-20T18:00",
    venue_id: "550e8400-e29b-41d4-a716-446655447001",
    venue_name: "Jakarta Convention Center",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
    organizer_name: "Organizer Dua",
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441003",
    event_title: "Olivia Rodrigo GUTS Tour",
    event_datetime: "2025-10-05T20:00",
    venue_id: "550e8400-e29b-41d4-a716-446655447002",
    venue_name: "Sabuga Bandung",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
    organizer_name: "Organizer Satu",
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441004",
    event_title: "Kanye West Donda Live",
    event_datetime: "2025-11-12T19:30",
    venue_id: "550e8400-e29b-41d4-a716-446655447002",
    venue_name: "Sabuga Bandung",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
    organizer_name: "Organizer Dua",
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441005",
    event_title: "The Weeknd Starboy Festival",
    event_datetime: "2025-12-01T20:00",
    venue_id: "550e8400-e29b-41d4-a716-446655447002",
    venue_name: "Sabuga Bandung",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
    organizer_name: "Organizer Satu",
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441006",
    event_title: "Drake It's All A Blur Tour",
    event_datetime: "2026-01-10T19:00",
    venue_id: "550e8400-e29b-41d4-a716-446655447003",
    venue_name: "Grand City Surabaya",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
    organizer_name: "Organizer Dua",
  },
];

export default function EventsPage() {
  const [user, setUser] = useState<AuthUser | null | "guest">(null);
  const [events, setEvents] = useState<EventDisplay[]>(initialEvents);
  const [search, setSearch] = useState("");

  // create
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [datetime, setDatetime] = useState("");
  const [venueId, setVenueId] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [error, setError] = useState("");

  // edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDatetime, setEditDatetime] = useState("");
  const [editVenueId, setEditVenueId] = useState("");
  const [editOrganizerId, setEditOrganizerId] = useState("");
  const [editError, setEditError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [successType, setSuccessType] = useState<"create" | "update" | "">("");

  useEffect(() => {
    const u = getUser();
    setUser(u ?? "guest");
    if (u?.role === "organizer" && u.organizer_id) {
      setOrganizerId(u.organizer_id);
    }
  }, []);

  const currentUser = user === "guest" ? null : user;
  const canManage = currentUser?.role === "admin" || currentUser?.role === "organizer";
  const isOrganizer = currentUser?.role === "organizer";
  const navRole = currentUser?.role ?? "guest";

  const visibleEvents = useMemo(() => {
    const base = isOrganizer
      ? events.filter((e) => e.organizer_id === currentUser?.organizer_id)
      : events;
    const kw = search.trim().toLowerCase();
    if (!kw) return base;
    return base.filter(
      (e) =>
        e.event_title.toLowerCase().includes(kw) ||
        e.venue_name.toLowerCase().includes(kw) ||
        e.organizer_name.toLowerCase().includes(kw)
    );
  }, [search, events, isOrganizer, currentUser]);

  const resolveVenue = (id: string) => venueOptions.find((v) => v.venue_id === id);
  const resolveOrganizer = (id: string) => organizerOptions.find((o) => o.organizer_id === id);

  const handleCreate = () => {
    if (!title.trim()) { setError("Judul event wajib diisi."); return; }
    if (!datetime) { setError("Tanggal & waktu wajib diisi."); return; }
    if (!venueId) { setError("Venue wajib dipilih."); return; }
    if (!organizerId) { setError("Organizer wajib dipilih."); return; }

    const venue = resolveVenue(venueId)!;
    const org = resolveOrganizer(organizerId)!;
    setEvents((prev) => [
      ...prev,
      { event_id: uuidv4(), event_title: title.trim(), event_datetime: datetime, venue_id: venue.venue_id, venue_name: venue.venue_name, organizer_id: org.organizer_id, organizer_name: org.organizer_name },
    ]);
    setTitle(""); setDatetime(""); setVenueId("");
    if (!isOrganizer) setOrganizerId("");
    setError("");
    setIsCreateOpen(false);
    setSuccessMessage("Event berhasil ditambahkan.");
    setSuccessType("create");
  };

  const handleOpenEdit = (event: EventDisplay) => {
    setSelectedId(event.event_id);
    setEditTitle(event.event_title);
    setEditDatetime(event.event_datetime);
    setEditVenueId(event.venue_id);
    setEditOrganizerId(event.organizer_id);
    setEditError("");
    setSuccessMessage("");
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editTitle.trim()) { setEditError("Judul event wajib diisi."); return; }
    if (!editDatetime) { setEditError("Tanggal & waktu wajib diisi."); return; }
    if (!editVenueId) { setEditError("Venue wajib dipilih."); return; }
    if (!editOrganizerId) { setEditError("Organizer wajib dipilih."); return; }

    const venue = resolveVenue(editVenueId)!;
    const org = resolveOrganizer(editOrganizerId)!;
    setEvents((prev) =>
      prev.map((e) =>
        e.event_id === selectedId
          ? { ...e, event_title: editTitle.trim(), event_datetime: editDatetime, venue_id: venue.venue_id, venue_name: venue.venue_name, organizer_id: org.organizer_id, organizer_name: org.organizer_name }
          : e
      )
    );
    setIsEditOpen(false);
    setSuccessMessage("Event berhasil diperbarui.");
    setSuccessType("update");
  };

  if (user === null) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <Navbar role={navRole} />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                {isOrganizer ? "Event Saya" : canManage ? "Manajemen Event" : "Semua Event"}
              </h1>
              <p className="mt-2 text-base text-slate-500">
                {isOrganizer
                  ? "Kelola event yang Anda miliki."
                  : canManage
                  ? "Kelola seluruh event pada platform JEANS RAQIL."
                  : "Daftar event yang tersedia pada platform JEANS RAQIL."}
              </p>
            </div>
            {canManage && (
              <button
                onClick={() => { setIsCreateOpen(true); setError(""); setSuccessMessage(""); }}
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <span className="mr-2 text-lg leading-none">＋</span>Tambah Event
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                {isOrganizer ? "Event Saya" : "Total Event"}
              </p>
              <p className="mt-3 text-5xl font-bold text-slate-900">{visibleEvents.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Total Venue</p>
              <p className="mt-3 text-5xl font-bold text-slate-900">
                {new Set(events.map((e) => e.venue_id)).size}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Total Organizer</p>
              <p className="mt-3 text-5xl font-bold text-slate-900">
                {new Set(events.map((e) => e.organizer_id)).size}
              </p>
            </div>
          </div>

          {/* Success message */}
          {successMessage && (
            <div className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium border ${
              successType === "create" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-yellow-200 bg-yellow-50 text-yellow-700"
            }`}>
              {successMessage}
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-6">
              <div className="mb-4">
                <h2 className="text-3xl font-bold text-slate-900">Tabel Event</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {isOrganizer ? "Menampilkan event milik Anda." : "Menampilkan seluruh event yang terdaftar."}
                </p>
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
                <p className="text-sm font-medium text-slate-400">{visibleEvents.length} event ditemukan</p>
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
                    <th className="px-6 py-4">Aksi</th>
                    {!isOrganizer && <th className="px-6 py-4">Organizer</th>}
                    {canManage && <th className="px-6 py-4 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleEvents.map((event) => (
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
                      <td className="px-6 py-5">
                        <a
  href={`/order?event_id=${event.event_id}`}
  className="inline-flex items-center justify-center whitespace-nowrap bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
>
  Beli Tiket
</a>
                      </td>
                      {!isOrganizer && <td className="px-6 py-5">{event.organizer_name}</td>}
                      {canManage && (
                        <td className="px-6 py-5">
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleOpenEdit(event)}
                              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                              title="Update Event"
                            >✎</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {visibleEvents.length === 0 && (
                    <tr>
                      <td colSpan={5 + (isOrganizer ? 0 : 1) + (canManage ? 1 : 0)} className="px-6 py-10 text-center text-sm text-slate-400">
                        Tidak ada event yang sesuai.
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
              <h2 className="text-3xl font-bold text-slate-900">Tambah Event Baru</h2>
              <button onClick={() => { setIsCreateOpen(false); setError(""); }} className="text-3xl text-slate-300 transition hover:text-slate-500">×</button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">Judul Event <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="cth. The Weeknd After Hours Tour" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">Tanggal & Waktu <span className="text-rose-500">*</span></label>
                <input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">Venue <span className="text-rose-500">*</span></label>
                <select value={venueId} onChange={(e) => setVenueId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500">
                  <option value="">-- Pilih Venue --</option>
                  {venueOptions.map((v) => <option key={v.venue_id} value={v.venue_id}>{v.venue_name}</option>)}
                </select>
              </div>
              {!isOrganizer && (
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">Organizer <span className="text-rose-500">*</span></label>
                  <select value={organizerId} onChange={(e) => setOrganizerId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500">
                    <option value="">-- Pilih Organizer --</option>
                    {organizerOptions.map((o) => <option key={o.organizer_id} value={o.organizer_id}>{o.organizer_name}</option>)}
                  </select>
                </div>
              )}
              {error && <p className="text-sm font-medium text-rose-500">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setIsCreateOpen(false); setError(""); }}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Batal</button>
                <button onClick={handleCreate}
                  className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700">Tambah Event</button>
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
              <h2 className="text-3xl font-bold text-slate-900">Edit Event</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-3xl text-slate-300 transition hover:text-slate-500">×</button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">Judul Event <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="cth. The Weeknd After Hours Tour" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">Tanggal & Waktu <span className="text-rose-500">*</span></label>
                <input type="datetime-local" value={editDatetime} onChange={(e) => setEditDatetime(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">Venue <span className="text-rose-500">*</span></label>
                <select value={editVenueId} onChange={(e) => setEditVenueId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500">
                  <option value="">-- Pilih Venue --</option>
                  {venueOptions.map((v) => <option key={v.venue_id} value={v.venue_id}>{v.venue_name}</option>)}
                </select>
              </div>
              {!isOrganizer && (
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">Organizer <span className="text-rose-500">*</span></label>
                  <select value={editOrganizerId} onChange={(e) => setEditOrganizerId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500">
                    <option value="">-- Pilih Organizer --</option>
                    {organizerOptions.map((o) => <option key={o.organizer_id} value={o.organizer_id}>{o.organizer_name}</option>)}
                  </select>
                </div>
              )}
              {editError && <p className="text-sm font-medium text-rose-500">{editError}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsEditOpen(false)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Batal</button>
                <button onClick={handleUpdate}
                  className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700">Simpan Perubahan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}