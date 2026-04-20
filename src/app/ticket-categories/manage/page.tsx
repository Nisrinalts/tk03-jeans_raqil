"use client";

import { v4 as uuidv4 } from "uuid";
import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { TicketCategory } from "@/types/ticketCategory";

type EventDisplay = {
  event_id: string;
  event_title: string;
  venue_name: string;
  venue_capacity: number;
};

const events: EventDisplay[] = [
  {
    event_id: "550e8400-e29b-41d4-a716-446655441001",
    event_title: "After Hours Tour",
    venue_name: "Gelora Hall Jakarta",
    venue_capacity: 500,
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441002",
    event_title: "Justice World Tour",
    venue_name: "Bandung Convention Center",
    venue_capacity: 400,
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441003",
    event_title: "SOUR Live in Jakarta",
    venue_name: "Tennis Indoor Senayan",
    venue_capacity: 350,
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441004",
    event_title: "SOS Tour",
    venue_name: "ICE BSD Hall 3",
    venue_capacity: 600,
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441005",
    event_title: "Utopia Stadium Show",
    venue_name: "Istora Arena Surabaya",
    venue_capacity: 450,
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441006",
    event_title: "Starboy Night",
    venue_name: "Makassar Grand Hall",
    venue_capacity: 300,
  },
];

const initialTicketCategories: TicketCategory[] = [
  {
    category_id: "550e8400-e29b-41d4-a716-446655442001",
    category_name: "WVIP",
    quota: 50,
    price: 2500000,
    event_id: "550e8400-e29b-41d4-a716-446655441001",
    event_title: "After Hours Tour",
  },
  {
    category_id: "550e8400-e29b-41d4-a716-446655442002",
    category_name: "VIP",
    quota: 100,
    price: 1750000,
    event_id: "550e8400-e29b-41d4-a716-446655441001",
    event_title: "After Hours Tour",
  },
  {
    category_id: "550e8400-e29b-41d4-a716-446655442003",
    category_name: "Category 1",
    quota: 150,
    price: 900000,
    event_id: "550e8400-e29b-41d4-a716-446655441001",
    event_title: "After Hours Tour",
  },
  {
    category_id: "550e8400-e29b-41d4-a716-446655442004",
    category_name: "VIP",
    quota: 80,
    price: 1500000,
    event_id: "550e8400-e29b-41d4-a716-446655441002",
    event_title: "Justice World Tour",
  },
  {
    category_id: "550e8400-e29b-41d4-a716-446655442005",
    category_name: "Regular",
    quota: 200,
    price: 700000,
    event_id: "550e8400-e29b-41d4-a716-446655441002",
    event_title: "Justice World Tour",
  },
  {
    category_id: "550e8400-e29b-41d4-a716-446655442006",
    category_name: "CAT 1",
    quota: 120,
    price: 850000,
    event_id: "550e8400-e29b-41d4-a716-446655441003",
    event_title: "SOUR Live in Jakarta",
  },
  {
    category_id: "550e8400-e29b-41d4-a716-446655442007",
    category_name: "CAT 2",
    quota: 180,
    price: 550000,
    event_id: "550e8400-e29b-41d4-a716-446655441003",
    event_title: "SOUR Live in Jakarta",
  },
  {
    category_id: "550e8400-e29b-41d4-a716-446655442008",
    category_name: "Platinum",
    quota: 100,
    price: 1800000,
    event_id: "550e8400-e29b-41d4-a716-446655441004",
    event_title: "SOS Tour",
  },
  {
    category_id: "550e8400-e29b-41d4-a716-446655442009",
    category_name: "Gold",
    quota: 150,
    price: 1200000,
    event_id: "550e8400-e29b-41d4-a716-446655441004",
    event_title: "SOS Tour",
  },
  {
    category_id: "550e8400-e29b-41d4-a716-446655442010",
    category_name: "Silver",
    quota: 200,
    price: 750000,
    event_id: "550e8400-e29b-41d4-a716-446655441004",
    event_title: "SOS Tour",
  },
  {
    category_id: "550e8400-e29b-41d4-a716-446655442011",
    category_name: "Front Row",
    quota: 70,
    price: 1600000,
    event_id: "550e8400-e29b-41d4-a716-446655441005",
    event_title: "Utopia Stadium Show",
  },
  {
    category_id: "550e8400-e29b-41d4-a716-446655442012",
    category_name: "Festival",
    quota: 250,
    price: 800000,
    event_id: "550e8400-e29b-41d4-a716-446655441005",
    event_title: "Utopia Stadium Show",
  },
  {
    category_id: "550e8400-e29b-41d4-a716-446655442013",
    category_name: "VIP",
    quota: 60,
    price: 1400000,
    event_id: "550e8400-e29b-41d4-a716-446655441006",
    event_title: "Starboy Night",
  },
  {
    category_id: "550e8400-e29b-41d4-a716-446655442014",
    category_name: "Regular",
    quota: 180,
    price: 650000,
    event_id: "550e8400-e29b-41d4-a716-446655441006",
    event_title: "Starboy Night",
  },
];

export default function ManageTicketCategoryPage() {
  const [ticketCategories, setTicketCategories] =
    useState<TicketCategory[]>(initialTicketCategories);
  const [search, setSearch] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [quota, setQuota] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [editSelectedEventId, setEditSelectedEventId] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editQuota, setEditQuota] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editError, setEditError] = useState("");
  const [selectedFilterEvent, setSelectedFilterEvent] = useState("");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<TicketCategory | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [successType, setSuccessType] = useState<"create" | "update" | "delete" | "">("");

  const sortedCategories = useMemo(() => {
    return [...ticketCategories].sort((a, b) => {
      const byEvent = a.event_title.localeCompare(b.event_title);
      if (byEvent !== 0) return byEvent;
      return a.category_name.localeCompare(b.category_name);
    });
  }, [ticketCategories]);

  const filteredCategories = useMemo(() => {
  const keyword = search.trim().toLowerCase();

  return sortedCategories.filter((category) => {
    const matchSearch =
      !keyword ||
      category.category_name.toLowerCase().includes(keyword) ||
      category.event_title.toLowerCase().includes(keyword);

    const matchEvent =
      !selectedFilterEvent || category.event_id === selectedFilterEvent;

    return matchSearch && matchEvent;
  });
}, [search, selectedFilterEvent, sortedCategories]);

  const totalCategories = ticketCategories.length;
  const totalEvents = new Set(ticketCategories.map((item) => item.event_id)).size;
  const highestPrice =
    ticketCategories.length > 0
      ? Math.max(...ticketCategories.map((item) => item.price))
      : 0;

  const getEventById = (eventId: string) =>
    events.find((event) => event.event_id === eventId);

  const validateCategoryForm = ({
    eventId,
    categoryName,
    quota,
    price,
    excludeCategoryId,
  }: {
    eventId: string;
    categoryName: string;
    quota: string;
    price: string;
    excludeCategoryId?: string;
  }) => {
    if (!eventId || !categoryName.trim() || !quota.trim() || !price.trim()) {
      return "Semua field wajib diisi.";
    }

    const parsedQuota = Number(quota);
    const parsedPrice = Number(price);

    if (!Number.isInteger(parsedQuota) || parsedQuota <= 0) {
      return "Kuota harus berupa bilangan bulat positif (> 0).";
    }

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return "Harga harus berupa bilangan tidak negatif (>= 0).";
    }

    const selectedEvent = getEventById(eventId);
    if (!selectedEvent) {
      return "Event tidak ditemukan.";
    }

    const totalQuotaOnEvent = ticketCategories
      .filter((category) => {
        if (category.event_id !== eventId) return false;
        if (excludeCategoryId && category.category_id === excludeCategoryId) return false;
        return true;
      })
      .reduce((sum, category) => sum + category.quota, 0);

    if (totalQuotaOnEvent + parsedQuota > selectedEvent.venue_capacity) {
      return `Total kuota melebihi kapasitas venue (${selectedEvent.venue_capacity}) untuk event ${selectedEvent.event_title}.`;
    }

    return "";
  };

  const resetCreateForm = () => {
    setSelectedEventId("");
    setCategoryName("");
    setQuota("");
    setPrice("");
    setError("");
  };

  const resetEditForm = () => {
    setSelectedCategoryId("");
    setEditSelectedEventId("");
    setEditCategoryName("");
    setEditQuota("");
    setEditPrice("");
    setEditError("");
  };

  const handleCreateCategory = () => {
    const validationError = validateCategoryForm({
      eventId: selectedEventId,
      categoryName,
      quota,
      price,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    const selectedEvent = getEventById(selectedEventId);
    if (!selectedEvent) return;

    const newCategory: TicketCategory = {
      category_id: uuidv4(),
      category_name: categoryName.trim(),
      quota: Number(quota),
      price: Number(price),
      event_id: selectedEvent.event_id,
      event_title: selectedEvent.event_title,
    };

    setTicketCategories((prev) => [...prev, newCategory]);
    setIsCreateOpen(false);
    resetCreateForm();
    setSuccessMessage("Kategori tiket berhasil ditambahkan.");
    setSuccessType("create");
  };

  const handleOpenEdit = (category: TicketCategory) => {
    setSelectedCategoryId(category.category_id);
    setEditSelectedEventId(category.event_id);
    setEditCategoryName(category.category_name);
    setEditQuota(String(category.quota));
    setEditPrice(String(category.price));
    setEditError("");
    setSuccessMessage("");
    setIsEditOpen(true);
  };

  const handleUpdateCategory = () => {
    const validationError = validateCategoryForm({
      eventId: editSelectedEventId,
      categoryName: editCategoryName,
      quota: editQuota,
      price: editPrice,
      excludeCategoryId: selectedCategoryId,
    });

    if (validationError) {
      setEditError(validationError);
      return;
    }

    const selectedEvent = getEventById(editSelectedEventId);
    if (!selectedEvent) return;

    setTicketCategories((prev) =>
      prev.map((category) =>
        category.category_id === selectedCategoryId
          ? {
              ...category,
              category_name: editCategoryName.trim(),
              quota: Number(editQuota),
              price: Number(editPrice),
              event_id: selectedEvent.event_id,
              event_title: selectedEvent.event_title,
            }
          : category
      )
    );

    setIsEditOpen(false);
    resetEditForm();
    setSuccessMessage("Kategori tiket berhasil diperbarui.");
    setSuccessType("update");
  };

  const handleOpenDelete = (category: TicketCategory) => {
    setCategoryToDelete(category);
    setSuccessMessage("");
    setIsDeleteOpen(true);
  };

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;

    setTicketCategories((prev) =>
      prev.filter((category) => category.category_id !== categoryToDelete.category_id)
    );

    setIsDeleteOpen(false);
    setCategoryToDelete(null);
    setSuccessMessage("Kategori tiket berhasil dihapus.");
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
                Manajemen Kategori Tiket
              </h1>
              <p className="mt-2 text-base text-slate-500">
                Kelola kategori tiket yang terdaftar pada platform TikTakTuk.
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
              Tambah Kategori Tiket
            </button>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Total Kategori
              </p>
              <p className="mt-3 text-5xl font-bold text-slate-900">{totalCategories}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Total Event
              </p>
              <p className="mt-3 text-5xl font-bold text-slate-900">{totalEvents}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Harga Tertinggi
              </p>
              <p className="mt-3 text-5xl font-bold text-slate-900">
                Rp {highestPrice.toLocaleString("id-ID")}
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
                  <h2 className="text-3xl font-bold text-slate-900">
                    Tabel Kategori Tiket
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Menampilkan seluruh kategori tiket. Tabel diurutkan berdasarkan
                    nama event lalu nama kategori secara ascending.
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
  <div className="flex w-full flex-col gap-4 md:max-w-2xl md:flex-row">
    <div className="relative w-full md:flex-1">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
        ⌕
      </span>
      <input
        type="text"
        placeholder="Cari kategori..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500"
      />
    </div>

                <select
                value={selectedFilterEvent}
                onChange={(e) => setSelectedFilterEvent(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 md:w-[220px]"
                >
                <option value="">Semua Acara</option>
                {events.map((event) => (
                    <option key={event.event_id} value={event.event_id}>
                    {event.event_title}
                    </option>
                ))}
                </select>
            </div>

            <p className="text-sm font-medium text-slate-400">
                {filteredCategories.length} kategori ditemukan
            </p>
            </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Acara</th>
                    <th className="px-6 py-4">Harga</th>
                    <th className="px-6 py-4">Kuota</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.map((category) => (
                    <tr key={category.category_id} className="text-sm text-slate-700">
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {category.category_name}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Category ID: {category.category_id}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5 font-medium text-slate-500">
                        {category.event_title}
                      </td>

                      <td className="px-6 py-5 font-semibold text-blue-600">
                        Rp {category.price.toLocaleString("id-ID")}
                      </td>

                      <td className="px-6 py-5 text-slate-700">
                        {category.quota} tiket
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleOpenEdit(category)}
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            title="Update Category"
                          >
                            ✎
                          </button>

                          <button
                            onClick={() => handleOpenDelete(category)}
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-600 shadow-sm transition hover:bg-rose-50"
                            title="Delete Category"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredCategories.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-sm text-slate-400"
                      >
                        Tidak ada kategori tiket yang sesuai dengan pencarian.
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
              <h2 className="text-3xl font-bold text-slate-900">
                Tambah Kategori Baru
              </h2>
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
                  Acara <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500"
                >
                  <option value="">Pilih acara</option>
                  {events.map((event) => (
                    <option key={event.event_id} value={event.event_id}>
                      {event.event_title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="cth. WVIP"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Harga (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="750000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Kuota <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="100"
                    value={quota}
                    onChange={(e) => setQuota(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500"
                  />
                </div>
              </div>

              {error && <p className="text-sm font-medium text-rose-500">{error}</p>}

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
                  onClick={handleCreateCategory}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Tambah Kategori
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
              <h2 className="text-3xl font-bold text-slate-900">Edit Kategori</h2>
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
                  Acara <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editSelectedEventId}
                  onChange={(e) => setEditSelectedEventId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500"
                >
                  <option value="">Pilih acara</option>
                  {events.map((event) => (
                    <option key={event.event_id} value={event.event_id}>
                      {event.event_title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="cth. VIP"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Harga (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Kuota <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={editQuota}
                    onChange={(e) => setEditQuota(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500"
                  />
                </div>
              </div>

              {editError && (
                <p className="text-sm font-medium text-rose-500">{editError}</p>
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
                  onClick={handleUpdateCategory}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-rose-600">Hapus Kategori Tiket</h2>
              <button
                onClick={() => {
                  setIsDeleteOpen(false);
                  setCategoryToDelete(null);
                }}
                className="text-3xl text-slate-300 transition hover:text-slate-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-base text-slate-600">
                Apakah Anda yakin ingin menghapus kategori tiket ini? Tindakan ini
                tidak dapat dibatalkan.
              </p>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Category ID:</span>{" "}
                  {categoryToDelete.category_id}
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Category Name:</span>{" "}
                  {categoryToDelete.category_name}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsDeleteOpen(false);
                    setCategoryToDelete(null);
                  }}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  onClick={handleDeleteCategory}
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