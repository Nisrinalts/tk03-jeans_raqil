"use client";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { TicketCategory } from "@/types/ticketCategory";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";


type Role = "guest" | "admin" | "organizer" | "customer";

type EventDisplay = {
  event_id: string;
  event_title: string;
  venue_name: string;
  venue_capacity: number;
};
type RemainingQuota = {
  category_id: string;
  category_name: string;
  event_id: string;
  event_title: string;
  quota: number;
  sold_quantity: number;
  remaining_quota: number;
  price: number;
};

type TicketCategoriesPayload = {
  ticketCategories: TicketCategory[];
  events: EventDisplay[];
};

export default function TicketCategoryPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);

  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
  const [events, setEvents] = useState<EventDisplay[]>([]);
  const [quotaEventId, setQuotaEventId] = useState("");
  const [manualQuotaEventId, setManualQuotaEventId] = useState("");
  const [quotaInputMode, setQuotaInputMode] = useState<"select" | "manual">(
    "select"
  );
  const [remainingQuotas, setRemainingQuotas] = useState<RemainingQuota[]>([]);
  const [isQuotaLoading, setIsQuotaLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "list">("table");
  const [selectedFilterEvent, setSelectedFilterEvent] = useState("");

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

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<TicketCategory | null>(null);

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

    async function fetchTicketCategories() {
      try {
        const res = await fetch("/api/ticket-categories");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal mengambil data kategori tiket.");
        }

        const payload = data as TicketCategoriesPayload | TicketCategory[];
        setTicketCategories(
          Array.isArray(payload) ? payload : payload.ticketCategories
        );
        setEvents(Array.isArray(payload) ? [] : payload.events);
      } catch (error) {
        console.error(error);
        showToast("Gagal mengambil data kategori tiket.", "error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTicketCategories();
  }, [role]);

  const canManage = role === "admin" || role === "organizer";

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
  const totalQuota = ticketCategories.reduce((sum, item) => sum + item.quota, 0);
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

  const handleCreateCategory = async () => {
  const validationError = validateCategoryForm({
    eventId: selectedEventId,
    categoryName,
    quota,
    price,
  });

  if (validationError) {
    setError(validationError);
    showToast(validationError, "error");
    return;
  }

  try {
    const res = await fetch("/api/ticket-categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category_name: categoryName.trim(),
        quota: Number(quota),
        price: Number(price),
        event_id: selectedEventId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Gagal menambahkan kategori tiket.");
      showToast(data.message || "Gagal menambahkan kategori tiket.", "error");
      return;
    }

    setTicketCategories((prev) => [...prev, data]);
    setIsCreateOpen(false);
    resetCreateForm();
    showToast("Kategori tiket berhasil ditambahkan.", "success");
  } catch (error) {
    console.error(error);
    setError("Gagal menambahkan kategori tiket.");
    showToast("Gagal menambahkan kategori tiket.", "error");
  }
};

  const handleOpenEdit = (category: TicketCategory) => {
    setSelectedCategoryId(category.category_id);
    setEditSelectedEventId(category.event_id);
    setEditCategoryName(category.category_name);
    setEditQuota(String(category.quota));
    setEditPrice(String(category.price));
    setEditError("");
    setIsEditOpen(true);
  };

  const handleUpdateCategory = async () => {
  const validationError = validateCategoryForm({
    eventId: editSelectedEventId,
    categoryName: editCategoryName,
    quota: editQuota,
    price: editPrice,
    excludeCategoryId: selectedCategoryId,
  });

  if (validationError) {
    setEditError(validationError);
    showToast(validationError, "error");
    return;
  }

  try {
    const res = await fetch("/api/ticket-categories", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category_id: selectedCategoryId,
        category_name: editCategoryName.trim(),
        quota: Number(editQuota),
        price: Number(editPrice),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setEditError(data.message || "Gagal memperbarui kategori tiket.");
      showToast(data.message || "Gagal memperbarui kategori tiket.", "error");
      return;
    }

    setTicketCategories((prev) =>
      prev.map((category) =>
        category.category_id === selectedCategoryId ? data : category
      )
    );

    setIsEditOpen(false);
    resetEditForm();
    showToast("Kategori tiket berhasil diperbarui.", "warning");
  } catch (error) {
    console.error(error);
    setEditError("Gagal memperbarui kategori tiket.");
    showToast("Gagal memperbarui kategori tiket.", "error");
  }
};

  const handleOpenDelete = (category: TicketCategory) => {
    setCategoryToDelete(category);
    setIsDeleteOpen(true);
  };

  const handleDeleteCategory = async () => {
  if (!categoryToDelete) return;

  try {
    const res = await fetch("/api/ticket-categories", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category_id: categoryToDelete.category_id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Gagal menghapus kategori tiket.", "error");
      return;
    }

    setTicketCategories((prev) =>
      prev.filter((category) => category.category_id !== data.category_id)
    );

    setIsDeleteOpen(false);
    setCategoryToDelete(null);
    showToast("Kategori tiket berhasil dihapus.", "danger");
  } catch (error) {
    console.error(error);
    showToast("Gagal menghapus kategori tiket.", "error");
  }
};

const handleCheckRemainingQuota = async () => {
  const eventId =
    quotaInputMode === "manual" ? manualQuotaEventId.trim() : quotaEventId;

  if (!eventId) {
    showToast("Event wajib dipilih.", "error");
    return;
  }

  try {
    setIsQuotaLoading(true);
    setRemainingQuotas([]);

    const res = await fetch("/api/ticket-categories/remaining-quota", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_id: eventId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Gagal mengambil sisa kuota.", "error");
      return;
    }

    setRemainingQuotas(data);
    showToast("Sisa kuota berhasil ditampilkan.", "success");
  } catch (error) {
    console.error(error);
    showToast("Gagal mengambil sisa kuota.", "error");
  } finally {
    setIsQuotaLoading(false);
  }
};
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
              {canManage ? "Manajemen Kategori Tiket" : "Kategori Tiket"}
            </h1>
            <p className="mt-2 text-base text-slate-500">
              {canManage
                ? "Kelola kategori tiket yang terdaftar pada platform TikTakTuk."
                : "Lihat kategori dan harga tiket per acara."}
            </p>
          </div>

          {canManage && (
            <button
              disabled
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white opacity-70 shadow-sm"
            >
              <span className="mr-2 text-lg leading-none">＋</span>
              Tambah Kategori Tiket
            </button>
          )}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {["Total Kategori", "Total Kuota", "Harga Tertinggi"].map((label) => (
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
                  Tabel Kategori Tiket
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Menampilkan seluruh kategori tiket.
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
              <div className="flex w-full flex-col gap-4 md:max-w-2xl md:flex-row">
                <div className="h-12 w-full rounded-2xl border border-slate-200 bg-white md:flex-1" />
                <div className="h-12 w-full rounded-2xl border border-slate-200 bg-white md:w-[220px]" />
              </div>
              <p className="text-sm font-medium text-slate-300">
                — kategori ditemukan
              </p>
            </div>
          </div>

          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-500" />
            <p className="text-sm font-medium text-slate-400">
              Memuat data kategori tiket...
            </p>
          </div>
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
                {canManage ? "Manajemen Kategori Tiket" : "Kategori Tiket"}
              </h1>
              <p className="mt-2 text-base text-slate-500">
                {canManage
                  ? "Kelola kategori tiket yang terdaftar pada platform TikTakTuk."
                  : "Lihat kategori dan harga tiket per acara."}
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
                Tambah Kategori Tiket
              </button>
            )}
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
      Total Kuota
    </p>
    <p className="mt-3 text-5xl font-bold text-slate-900">
      {totalQuota.toLocaleString("id-ID")}
    </p>
  </div>

  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
      Harga Tertinggi
    </p>
    <p className="mt-3 text-4xl font-bold text-slate-900">
      Rp {highestPrice.toLocaleString("id-ID")}
    </p>
  </div>
</div>

<div className="mb-8 rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">
        Stored Procedure
      </p>
      <h2 className="mt-1 text-2xl font-bold text-slate-900">
        Cek Sisa Kuota Ticket Category
      </h2>
    </div>

    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => {
            setQuotaInputMode("select");
            setManualQuotaEventId("");
          }}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            quotaInputMode === "select"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Pilih event
        </button>
        <button
          type="button"
          onClick={() => {
            setQuotaInputMode("manual");
            setQuotaEventId("");
          }}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            quotaInputMode === "manual"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Input ID
        </button>
      </div>

      {quotaInputMode === "select" ? (
        <select
          value={quotaEventId}
          onChange={(e) => setQuotaEventId(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 md:w-80"
        >
          <option value="">Pilih event</option>
          {events.map((event) => (
            <option key={event.event_id} value={event.event_id}>
              {event.event_title}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          placeholder="Event ID manual"
          value={manualQuotaEventId}
          onChange={(e) => setManualQuotaEventId(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 md:w-80"
        />
      )}

      <button
        onClick={handleCheckRemainingQuota}
        disabled={isQuotaLoading}
        className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
      >
        {isQuotaLoading ? "Mengecek..." : "Cek Sisa Kuota"}
      </button>
    </div>
  </div>

  {remainingQuotas.length > 0 && (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-5 py-4">Kategori</th>
            <th className="px-5 py-4">Event</th>
            <th className="px-5 py-4">Kuota Awal</th>
            <th className="px-5 py-4">Terjual</th>
            <th className="px-5 py-4">Sisa</th>
            <th className="px-5 py-4">Harga</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {remainingQuotas.map((item) => (
            <tr key={item.category_id}>
              <td className="px-5 py-4 font-semibold text-slate-900">
                {item.category_name}
              </td>
              <td className="px-5 py-4 text-slate-600">{item.event_title}</td>
              <td className="px-5 py-4 text-slate-600">{item.quota}</td>
              <td className="px-5 py-4 text-slate-600">{item.sold_quantity}</td>
              <td className="px-5 py-4 font-bold text-emerald-600">
                {item.remaining_quota}
              </td>
              <td className="px-5 py-4 font-semibold text-blue-600">
                Rp {Number(item.price).toLocaleString("id-ID")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

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
                  <button
                    onClick={() => setViewMode("table")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${viewMode === "table"
                        ? "bg-slate-100 text-slate-700"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    Tabel
                  </button>

                  <button
                    onClick={() => setViewMode("list")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${viewMode === "list"
                        ? "bg-slate-100 text-slate-700"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                  >
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

            {viewMode === "table" ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Acara</th>
                      <th className="px-6 py-4">Harga</th>
                      <th className="px-6 py-4">Kuota</th>
                      {canManage && <th className="px-6 py-4 text-right">Aksi</th>}
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

                        <td className="px-6 py-5 text-slate-700">{category.quota} tiket</td>

                        {canManage && (
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
                        )}
                      </tr>
                    ))}

                    {filteredCategories.length === 0 && (
                      <tr>
                        <td
                          colSpan={canManage ? 5 : 4}
                          className="px-6 py-10 text-center text-sm text-slate-400"
                        >
                          Tidak ada kategori tiket yang sesuai dengan pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredCategories.map((category) => (
                  <div
                    key={category.category_id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-slate-900">
                        {category.category_name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {category.event_title}
                      </p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Category ID
                        </p>
                        <p className="mt-1 break-all font-medium text-slate-700">
                          {category.category_id}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Harga
                          </p>
                          <p className="mt-1 font-bold text-blue-600">
                            Rp {category.price.toLocaleString("id-ID")}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Kuota
                          </p>
                          <p className="mt-1 font-bold text-slate-900">
                            {category.quota} tiket
                          </p>
                        </div>
                      </div>
                    </div>

                    {canManage && (
                      <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
                        <button
                          onClick={() => handleOpenEdit(category)}
                          className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          ✎ Edit
                        </button>

                        <button
                          onClick={() => handleOpenDelete(category)}
                          className="flex-1 rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                        >
                          🗑 Hapus
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {filteredCategories.length === 0 && (
                  <div className="col-span-full py-10 text-center text-sm text-slate-400">
                    Tidak ada kategori tiket yang sesuai dengan pencarian.
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

      {canManage && isEditOpen && (
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
                  Acara
                </label>
                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-700">
                  {getEventById(editSelectedEventId)?.event_title ?? "-"}
                </div>
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

      {canManage && isDeleteOpen && categoryToDelete && (
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
