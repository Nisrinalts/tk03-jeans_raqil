"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { getUser, AuthUser } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────
type DiscountType = "PERCENTAGE" | "NOMINAL";

type Promotion = {
  promotion_id: string;
  promo_code: string;
  discount_type: DiscountType;
  discount_value: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  usage_count: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDiscount(p: Promotion) {
  if (p.discount_type === "PERCENTAGE") return `${p.discount_value}%`;
  return "Rp " + Number(p.discount_value).toLocaleString("id-ID");
}

// ─── Empty Form ───────────────────────────────────────────────────────────────
const emptyForm = {
  promo_code: "",
  discount_type: "PERCENTAGE" as DiscountType,
  discount_value: "",
  start_date: "",
  end_date: "",
  usage_limit: "1",
};

// ─── Create/Edit Modal ────────────────────────────────────────────────────────
function PromoModal({
  mode,
  initial,
  existingCodes,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  initial?: Promotion;
  existingCodes: string[];
  onClose: () => void;
  onSave: (data: Omit<Promotion, "promotion_id" | "usage_count">) => Promise<void>;
}) {
  const [form, setForm] = useState(
    initial
      ? {
          promo_code: initial.promo_code,
          discount_type: initial.discount_type,
          discount_value: String(initial.discount_value),
          start_date: initial.start_date,
          end_date: initial.end_date,
          usage_limit: String(initial.usage_limit),
        }
      : emptyForm
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.promo_code.trim()) e.promo_code = "Kode promo wajib diisi.";
    else if (
      mode === "create" &&
      existingCodes.map((c) => c.toUpperCase()).includes(form.promo_code.toUpperCase())
    )
      e.promo_code = "Kode promo sudah digunakan.";
    if (!form.discount_value || Number(form.discount_value) <= 0)
      e.discount_value = "Nilai diskon harus lebih dari 0.";
    if (!form.start_date) e.start_date = "Tanggal mulai wajib diisi.";
    if (!form.end_date) e.end_date = "Tanggal berakhir wajib diisi.";
    else if (form.end_date < form.start_date)
      e.end_date = "Tanggal berakhir harus sama dengan atau setelah tanggal mulai.";
    if (!form.usage_limit || Number(form.usage_limit) <= 0)
      e.usage_limit = "Batas penggunaan harus lebih dari 0.";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    setSaveError("");
    try {
      await onSave({
        promo_code: form.promo_code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        start_date: form.start_date,
        end_date: form.end_date,
        usage_limit: Number(form.usage_limit),
      });
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan promosi.");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    key: keyof typeof form,
    type = "text",
    extra?: React.InputHTMLAttributes<HTMLInputElement>
  ) => (
    <div>
      <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => {
          setForm((f) => ({ ...f, [key]: e.target.value }));
          setErrors((er) => ({ ...er, [key]: "" }));
        }}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
        {...extra}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">
            {mode === "create" ? "Buat Promo Baru" : "Edit Promo"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-4">
          {field("Kode Promo", "promo_code", "text", { placeholder: "CTH. TIKTAK20" })}

          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Tipe Diskon</label>
            <select
              value={form.discount_type}
              onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as DiscountType }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              <option value="PERCENTAGE">Persentase (%)</option>
              <option value="NOMINAL">Nominal (Rp)</option>
            </select>
          </div>

          {field("Nilai Diskon", "discount_value", "number", {
            placeholder: form.discount_type === "PERCENTAGE" ? "cth. 20" : "cth. 50000",
            min: "1",
          })}

          <div className="grid grid-cols-2 gap-3">
            {field("Tanggal Mulai", "start_date", "date")}
            {field("Tanggal Berakhir", "end_date", "date")}
          </div>

          {field("Batas Penggunaan", "usage_limit", "number", { min: "1", placeholder: "1" })}
        </div>

        {saveError && (
          <p className="text-xs text-red-500 mt-4 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : mode === "create" ? "Buat" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeletePromoModal({
  promo,
  onClose,
  onDelete,
}: {
  promo: Promotion;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await onDelete(promo.promotion_id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus promosi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-lg">Hapus Promo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Apakah Anda yakin ingin menghapus kode promo ini?<br />
          Tindakan ini tidak dapat dibatalkan.
        </p>
        {error && (
          <p className="text-xs text-red-500 mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PromotionsPage() {
  const [user, setUser] = useState<AuthUser | null | "guest">(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | DiscountType>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Promotion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);

  useEffect(() => {
    const u = getUser();
    setUser(u ?? "guest");
  }, []);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/promotion");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal mengambil data promosi.");
      }
      const data: Promotion[] = await res.json();
      setPromotions(data);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user !== null) fetchPromotions();
  }, [user, fetchPromotions]);

  if (user === null) return null;

  const currentUser = user === "guest" ? null : user;
  const role = currentUser?.role ?? "guest";
  const navRole = role;
  const isAdmin = role === "admin";

  const displayed = promotions.filter((p) => {
    const matchSearch =
      search === "" || p.promo_code.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || p.discount_type === filterType;
    return matchSearch && matchType;
  });

  // Stats
  const totalPromo = promotions.length;
  const totalUsage = promotions.reduce((s, p) => s + Number(p.usage_count), 0);
  const totalPercentage = promotions.filter((p) => p.discount_type === "PERCENTAGE").length;

  const handleCreate = async (data: Omit<Promotion, "promotion_id" | "usage_count">) => {
    const res = await fetch("/api/promotion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Gagal membuat promosi.");
    }
    const created: Promotion = await res.json();
    setPromotions((prev) => [created, ...prev]);
  };

  const handleEdit = async (data: Omit<Promotion, "promotion_id" | "usage_count">) => {
    if (!editTarget) return;
    const res = await fetch("/api/promotion", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promotion_id: editTarget.promotion_id, ...data }),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Gagal mengupdate promosi.");
    }
    const updated: Promotion = await res.json();
    setPromotions((prev) =>
      prev.map((p) => (p.promotion_id === updated.promotion_id ? updated : p))
    );
  };

  const handleDelete = async (id: string) => {
    const res = await fetch("/api/promotion", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promotion_id: id }),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Gagal menghapus promosi.");
    }
    setPromotions((prev) => prev.filter((p) => p.promotion_id !== id));
  };

  const typeStyle: Record<DiscountType, string> = {
    PERCENTAGE: "bg-blue-100 text-blue-700",
    NOMINAL: "bg-purple-100 text-purple-700",
  };

  const typeLabel: Record<DiscountType, string> = {
    PERCENTAGE: "Persentase",
    NOMINAL: "Nominal",
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <Navbar role={navRole} />

      {showCreate && isAdmin && (
        <PromoModal
          mode="create"
          existingCodes={promotions.map((p) => p.promo_code)}
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
        />
      )}
      {editTarget && isAdmin && (
        <PromoModal
          mode="edit"
          initial={editTarget}
          existingCodes={promotions
            .filter((p) => p.promotion_id !== editTarget.promotion_id)
            .map((p) => p.promo_code)}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
        />
      )}
      {deleteTarget && isAdmin && (
        <DeletePromoModal
          promo={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDelete={handleDelete}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Promosi</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kelola kode promo dan kampanye diskon</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <span className="text-lg leading-none">+</span>
              Buat Promo
            </button>
          )}
        </div>

        {/* Error State */}
        {fetchError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
            <span>{fetchError}</span>
            <button
              onClick={fetchPromotions}
              className="ml-4 text-xs underline hover:no-underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Promo</p>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? <span className="text-gray-300">—</span> : totalPromo}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Penggunaan</p>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? <span className="text-gray-300">—</span> : `${totalUsage}×`}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tipe Persentase</p>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? <span className="text-gray-300">—</span> : totalPercentage}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kode promo..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "all" | DiscountType)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 min-w-[140px]"
            >
              <option value="all">Semua Tipe</option>
              <option value="PERCENTAGE">Persentase</option>
              <option value="NOMINAL">Nominal</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <svg
                    className="w-7 h-7 text-blue-400 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  <p className="text-sm text-gray-400">Memuat data promosi...</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                    <th className="text-left px-5 py-3 font-medium">Kode Promo</th>
                    <th className="text-left px-5 py-3 font-medium">Tipe</th>
                    <th className="text-left px-5 py-3 font-medium">Nilai Diskon</th>
                    <th className="text-left px-5 py-3 font-medium">Mulai</th>
                    <th className="text-left px-5 py-3 font-medium">Berakhir</th>
                    <th className="text-left px-5 py-3 font-medium">Penggunaan</th>
                    {isAdmin && <th className="px-5 py-3 font-medium"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayed.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isAdmin ? 7 : 6}
                        className="text-center py-12 text-sm text-gray-400"
                      >
                        Tidak ada promosi ditemukan.
                      </td>
                    </tr>
                  ) : (
                    displayed.map((promo) => (
                      <tr key={promo.promotion_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
                              </svg>
                            </span>
                            <span className="text-sm font-semibold text-gray-800">{promo.promo_code}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${typeStyle[promo.discount_type]}`}>
                            {typeLabel[promo.discount_type]}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                          {formatDiscount(promo)}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">{promo.start_date}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{promo.end_date}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px]">
                              <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, (Number(promo.usage_count) / Number(promo.usage_limit)) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {promo.usage_count} / {promo.usage_limit}
                            </span>
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditTarget(promo)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeleteTarget(promo)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                                title="Hapus"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}