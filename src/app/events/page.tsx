"use client";

import { v4 as uuidv4 } from "uuid";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getUser, AuthUser } from "@/lib/auth";

type EventDisplay = {
  event_id: string;
  event_datetime: string;
  event_title: string;
  description: string;
  venue_id: string;
  venue_name: string;
  organizer_id: string;
  organizer_name: string;
  artist_id: string;
  artist_name: string;
  category_ids: string[];
  category_names: string[];
};

const venueOptions: any[] = [];
const organizerOptions: any[] = [];
const artistOptions: any[] = [];
const categoryOptions: any[] = [];

const initialEvents: EventDisplay[] = [];

export default function EventsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventDisplay[]>(initialEvents);
  const [search, setSearch] = useState("");

  // create
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [datetime, setDatetime] = useState("");
  const [venueId, setVenueId] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [artistId, setArtistId] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  // edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDatetime, setEditDatetime] = useState("");
  const [editVenueId, setEditVenueId] = useState("");
  const [editOrganizerId, setEditOrganizerId] = useState("");
  const [editArtistId, setEditArtistId] = useState("");
  const [editCategoryIds, setEditCategoryIds] = useState<string[]>([]);
  const [editError, setEditError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [successType, setSuccessType] = useState<"create" | "update" | "">("");

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
    setLoading(false);
    if (u.role === "organizer" && u.organizer_id) {
      setOrganizerId(u.organizer_id);
    }

    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (e) {
        console.error("Failed to fetch events:", e);
      }
    }
    fetchEvents();
  }, [router]);

  const canManage = user?.role === "admin" || user?.role === "organizer";
  const isOrganizer = user?.role === "organizer";
  const navRole = user?.role ?? "guest";

  const visibleEvents = useMemo(() => {
    const base = isOrganizer
      ? events.filter((e) => e.organizer_id === user?.organizer_id)
      : events;
    const kw = search.trim().toLowerCase();
    if (!kw) return base;
    return base.filter(
      (e) =>
        e.event_title.toLowerCase().includes(kw) ||
        e.venue_name.toLowerCase().includes(kw) ||
        e.organizer_name.toLowerCase().includes(kw) ||
        e.artist_name.toLowerCase().includes(kw)
    );
  }, [search, events, isOrganizer, user]);

  const resolveVenue = (id: string) => venueOptions.find((v) => v.venue_id === id);
  const resolveOrganizer = (id: string) => organizerOptions.find((o) => o.organizer_id === id);
  const resolveArtist = (id: string) => artistOptions.find((a) => a.artist_id === id);

  const toggleCategory = (id: string, current: string[], setter: (v: string[]) => void) => {
    setter(current.includes(id) ? current.filter((c) => c !== id) : [...current, id]);
  };

  const resetCreate = () => {
    setTitle(""); setDescription(""); setDatetime(""); setVenueId("");
    if (!isOrganizer) setOrganizerId("");
    setArtistId(""); setCategoryIds([]); setError("");
  };

  const handleCreate = async () => {
    if (!title.trim()) { setError("Judul event wajib diisi."); return; }
    if (!datetime) { setError("Tanggal & waktu wajib diisi."); return; }
    if (!venueId) { setError("Venue wajib dipilih."); return; }
    if (!organizerId) { setError("Organizer wajib dipilih."); return; }
    if (!artistId) { setError("Artis wajib dipilih."); return; }
    if (categoryIds.length === 0) { setError("Pilih minimal satu kategori tiket."); return; }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_title: title.trim(),
          description: description.trim(),
          event_datetime: datetime,
          venue_id: venueId,
          organizer_id: organizerId,
          artist_id: artistId,
          category_ids: categoryIds,
        }),
      });

      if (!res.ok) throw new Error("Gagal membuat event.");

      const data = await res.json();

      // Fetch fresh data to keep state in sync with DB (including joined names)
      const fetchRes = await fetch("/api/events");
      if (fetchRes.ok) {
        const freshEvents = await fetchRes.json();
        setEvents(freshEvents);
      }

      resetCreate();
      setIsCreateOpen(false);
      setSuccessMessage("Event berhasil ditambahkan.");
      setSuccessType("create");
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleOpenEdit = (event: EventDisplay) => {
    setSelectedId(event.event_id);
    setEditTitle(event.event_title);
    setEditDescription(event.description);
    setEditDatetime(event.event_datetime);
    setEditVenueId(event.venue_id);
    setEditOrganizerId(event.organizer_id);
    setEditArtistId(event.artist_id);
    setEditCategoryIds(event.category_ids);
    setEditError("");
    setSuccessMessage("");
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editTitle.trim()) { setEditError("Judul event wajib diisi."); return; }
    if (!editDatetime) { setEditError("Tanggal & waktu wajib diisi."); return; }
    if (!editVenueId) { setEditError("Venue wajib dipilih."); return; }
    if (!editOrganizerId) { setEditError("Organizer wajib dipilih."); return; }
    if (!editArtistId) { setEditError("Artis wajib dipilih."); return; }
    if (editCategoryIds.length === 0) { setEditError("Pilih minimal satu kategori tiket."); return; }

    try {
      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: selectedId,
          event_title: editTitle.trim(),
          description: editDescription.trim(),
          event_datetime: editDatetime,
          venue_id: editVenueId,
          organizer_id: editOrganizerId,
        }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui event.");

      const fetchRes = await fetch("/api/events");
      if (fetchRes.ok) {
        const freshEvents = await fetchRes.json();
        setEvents(freshEvents);
      }

      setIsEditOpen(false);
      setSuccessMessage("Event berhasil diperbarui.");
      setSuccessType("update");
    } catch (e: any) {
      setEditError(e.message);
    }
  };

  if (loading || !user) return null;

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
                  ? "Kelola seluruh event pada platform."
                  : "Daftar event yang tersedia."}
              </p>
            </div>
            {canManage && (
              <button
                onClick={() => { resetCreate(); setIsCreateOpen(true); setSuccessMessage(""); }}
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
                {new Set(visibleEvents.map((e) => e.venue_id)).size}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Total Artis</p>
              <p className="mt-3 text-5xl font-bold text-slate-900">
                {new Set(visibleEvents.map((e) => e.artist_id)).size}
              </p>
            </div>
          </div>

          {/* Success / error banner */}
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
                    placeholder="Cari judul, venue, artis, atau organizer..."
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
                    <th className="px-6 py-4">Tanggal & Waktu</th>
                    <th className="px-6 py-4">Artis</th>
                    <th className="px-6 py-4">Venue</th>
                    <th className="px-6 py-4">Kategori</th>
                    {!isOrganizer && <th className="px-6 py-4">Organizer</th>}
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleEvents.map((event) => (
                    <tr key={event.event_id} className="text-sm text-slate-700">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-sm">
                            {event.event_title.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{event.event_title}</p>
                            {event.description && (
                              <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400">{event.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">{event.event_datetime.replace("T", " ")}</td>
                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full bg-purple-50 border border-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                          {event.artist_name}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-medium text-slate-900">{event.venue_name}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {event.category_names.map((cat) => (
                            <span key={cat} className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      {!isOrganizer && <td className="px-6 py-5 text-slate-600">{event.organizer_name}</td>}
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          {user?.role === "customer" && (
                            <a
                              href={`/checkout?event_id=${event.event_id}&user_id=${user?.user_id}`}
                              className="flex h-9 items-center justify-center rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
                            >
                              Beli
                            </a>
                          )}
                          {canManage && (
                            <button
                              onClick={() => handleOpenEdit(event)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                              title="Edit Event"
                            >✎</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visibleEvents.length === 0 && (
                    <tr>
                      <td colSpan={isOrganizer ? 6 : 7} className="px-6 py-10 text-center text-sm text-slate-400">
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
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-7 pt-7 pb-4 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900">Tambah Event Baru</h2>
              <button onClick={() => { setIsCreateOpen(false); resetCreate(); }} className="text-3xl text-slate-300 transition hover:text-slate-500">×</button>
            </div>
            <div className="overflow-y-auto px-7 py-5 space-y-5">
              <FormField label="Judul Event" required>
                <input type="text" placeholder="cth. The Weeknd After Hours Tour" value={title} onChange={(e) => setTitle(e.target.value)}
                  className={inputCls} />
              </FormField>
              <FormField label="Deskripsi">
                <textarea rows={3} placeholder="Deskripsi singkat tentang event..." value={description} onChange={(e) => setDescription(e.target.value)}
                  className={inputCls + " resize-none"} />
              </FormField>
              <FormField label="Tanggal & Waktu" required>
                <input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="Venue" required>
                <select value={venueId} onChange={(e) => setVenueId(e.target.value)} className={inputCls}>
                  <option value="">-- Pilih Venue --</option>
                  {venueOptions.map((v) => <option key={v.venue_id} value={v.venue_id}>{v.venue_name}</option>)}
                </select>
              </FormField>
              {!isOrganizer && (
                <FormField label="Organizer" required>
                  <select value={organizerId} onChange={(e) => setOrganizerId(e.target.value)} className={inputCls}>
                    <option value="">-- Pilih Organizer --</option>
                    {organizerOptions.map((o) => <option key={o.organizer_id} value={o.organizer_id}>{o.organizer_name}</option>)}
                  </select>
                </FormField>
              )}
              <FormField label="Artis" required>
                <select value={artistId} onChange={(e) => setArtistId(e.target.value)} className={inputCls}>
                  <option value="">-- Pilih Artis --</option>
                  {artistOptions.map((a) => <option key={a.artist_id} value={a.artist_id}>{a.artist_name}</option>)}
                </select>
              </FormField>
              <FormField label="Kategori Tiket" required>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((c) => (
                    <button
                      key={c.category_id}
                      type="button"
                      onClick={() => toggleCategory(c.category_id, categoryIds, setCategoryIds)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        categoryIds.includes(c.category_id)
                          ? "border-indigo-500 bg-indigo-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                      }`}
                    >
                      {c.category_name}
                    </button>
                  ))}
                </div>
              </FormField>
              {error && <p className="text-sm font-medium text-rose-500">{error}</p>}
            </div>
            <div className="flex gap-3 px-7 py-5 border-t border-slate-100">
              <button onClick={() => { setIsCreateOpen(false); resetCreate(); }}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Batal</button>
              <button onClick={handleCreate}
                className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700">Tambah Event</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-7 pt-7 pb-4 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900">Edit Event</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-3xl text-slate-300 transition hover:text-slate-500">×</button>
            </div>
            <div className="overflow-y-auto px-7 py-5 space-y-5">
              <FormField label="Judul Event" required>
                <input type="text" placeholder="cth. The Weeknd After Hours Tour" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                  className={inputCls} />
              </FormField>
              <FormField label="Deskripsi">
                <textarea rows={3} placeholder="Deskripsi singkat tentang event..." value={editDescription} onChange={(e) => setEditDescription(e.target.value)}
                  className={inputCls + " resize-none"} />
              </FormField>
              <FormField label="Tanggal & Waktu" required>
                <input type="datetime-local" value={editDatetime} onChange={(e) => setEditDatetime(e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="Venue" required>
                <select value={editVenueId} onChange={(e) => setEditVenueId(e.target.value)} className={inputCls}>
                  <option value="">-- Pilih Venue --</option>
                  {venueOptions.map((v) => <option key={v.venue_id} value={v.venue_id}>{v.venue_name}</option>)}
                </select>
              </FormField>
              {!isOrganizer && (
                <FormField label="Organizer" required>
                  <select value={editOrganizerId} onChange={(e) => setEditOrganizerId(e.target.value)} className={inputCls}>
                    <option value="">-- Pilih Organizer --</option>
                    {organizerOptions.map((o) => <option key={o.organizer_id} value={o.organizer_id}>{o.organizer_name}</option>)}
                  </select>
                </FormField>
              )}
              <FormField label="Artis" required>
                <select value={editArtistId} onChange={(e) => setEditArtistId(e.target.value)} className={inputCls}>
                  <option value="">-- Pilih Artis --</option>
                  {artistOptions.map((a) => <option key={a.artist_id} value={a.artist_id}>{a.artist_name}</option>)}
                </select>
              </FormField>
              <FormField label="Kategori Tiket" required>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((c) => (
                    <button
                      key={c.category_id}
                      type="button"
                      onClick={() => toggleCategory(c.category_id, editCategoryIds, setEditCategoryIds)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        editCategoryIds.includes(c.category_id)
                          ? "border-indigo-500 bg-indigo-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                      }`}
                    >
                      {c.category_name}
                    </button>
                  ))}
                </div>
              </FormField>
              {editError && <p className="text-sm font-medium text-rose-500">{editError}</p>}
            </div>
            <div className="flex gap-3 px-7 py-5 border-t border-slate-100">
              <button onClick={() => setIsEditOpen(false)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Batal</button>
              <button onClick={handleUpdate}
                className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

const inputCls = "w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500";

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}
