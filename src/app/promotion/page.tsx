"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { getUser, AuthUser } from "@/lib/auth";

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const initialPromotions: Promotion[] = [
  {
    promotion_id: "550e8400-e29b-41d4-a716-44665544b001",
    promo_code: "TIKTAK20",
    discount_type: "PERCENTAGE",
    discount_value: 20,
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    usage_limit: 100,
    usage_count: 45,
  },
  {
    promotion_id: "550e8400-e29b-41d4-a716-44665544b002",
    promo_code: "HEMAT10",
    discount_type: "PERCENTAGE",
    discount_value: 10,
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    usage_limit: 200,
    usage_count: 87,
  },
  {
    promotion_id: "550e8400-e29b-41d4-a716-44665544b003",
    promo_code: "HEMAT50K",
    discount_type: "NOMINAL",
    discount_value: 50000,
    start_date: "2025-03-01",
    end_date: "2025-06-30",
    usage_limit: 50,
    usage_count: 12,
  },
  {
    promotion_id: "550e8400-e29b-41d4-a716-44665544b004",
    promo_code: "NEWUSER30",
    discount_type: "PERCENTAGE",
    discount_value: 30,
    start_date: "2025-06-01",
    end_date: "2025-09-30",
    usage_limit: 150,
    usage_count: 63,
  },
  {
    promotion_id: "550e8400-e29b-41d4-a716-44665544b005",
    promo_code: "WEEKNDFEST",
    discount_type: "NOMINAL",
    discount_value: 100000,
    start_date: "2025-11-01",
    end_date: "2025-12-31",
    usage_limit: 75,
    usage_count: 20,
  },
  {
    promotion_id: "550e8400-e29b-41d4-a716-44665544b006",
    promo_code: "FLASH15",
    discount_type: "PERCENTAGE",
    discount_value: 15,
    start_date: "2025-08-01",
    end_date: "2025-08-31",
    usage_limit: 80,
    usage_count: 55,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDiscount(p: Promotion) {
  if (p.discount_type === "PERCENTAGE") return `${p.discount_value}%`;
  return "Rp " + p.discount_value.toLocaleString("id-ID");
}

function generateId() {
  return "550e8400-e29b-41d4-a716-" + Math.random().toString(16).slice(2, 14).padEnd(12, "0");
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
  onSave: (data: Omit<Promotion, "promotion_id" | "usage_count">) => void;
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

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave({
      promo_code: form.promo_code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      start_date: form.start_date,
      end_date: form.end_date,
      usage_limit: Number(form.usage_limit),
    });
    onClose();
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

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            {mode === "create" ? "Buat" : "Simpan"}
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
  onDelete: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-lg">Hapus Promo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Apakah Anda yakin ingin menghapus kode promo ini?<br />
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => { onDelete(promo.promotion_id); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PromotionsPage() {
  const [user, setUser] = useState<AuthUser | null | "guest">(null);
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | DiscountType>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Promotion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);

  useEffect(() => {
    const u = getUser();
    setUser(u ?? "guest");
  }, []);

  // Tunggu sampai user terload dari auth
  if (user === null) return null;

  const currentUser = user === "guest" ? null : user;
  const role = currentUser?.role ?? "guest";
  const navRole = role;

  // Hanya admin yang bisa CUD
  const isAdmin = role === "admin";

  const displayed = promotions.filter((p) => {
    const matchSearch =
      search === "" || p.promo_code.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || p.discount_type === filterType;
    return matchSearch && matchType;
  });

  // Stats
  const totalPromo = promotions.length;
  const totalUsage = promotions.reduce((s, p) => s + p.usage_count, 0);
  const totalPercentage = promotions.filter((p) => p.discount_type === "PERCENTAGE").length;

  const handleCreate = (data: Omit<Promotion, "promotion_id" | "usage_count">) => {
    setPromotions((prev) => [
      { ...data, promotion_id: generateId(), usage_count: 0 },
      ...prev,
    ]);
  };

  const handleEdit = (data: Omit<Promotion, "promotion_id" | "usage_count">) => {
    if (!editTarget) return;
    setPromotions((prev) =>
      prev.map((p) =>
        p.promotion_id === editTarget.promotion_id ? { ...p, ...data } : p
      )
    );
  };

  const handleDelete = (id: string) => {
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

      {/* Modals — hanya muncul kalau admin */}
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
          {/* Tombol "+ Buat Promo" hanya untuk admin */}
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Promo</p>
            <p className="text-3xl font-bold text-gray-900">{totalPromo}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Penggunaan</p>
            <p className="text-3xl font-bold text-gray-900">{totalUsage}×</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tipe Persentase</p>
            <p className="text-3xl font-bold text-gray-900">{totalPercentage}</p>
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
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Kode Promo</th>
                  <th className="text-left px-5 py-3 font-medium">Tipe</th>
                  <th className="text-left px-5 py-3 font-medium">Nilai Diskon</th>
                  <th className="text-left px-5 py-3 font-medium">Mulai</th>
                  <th className="text-left px-5 py-3 font-medium">Berakhir</th>
                  <th className="text-left px-5 py-3 font-medium">Penggunaan</th>
                  {/* Kolom action hanya muncul untuk admin */}
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
                                width: `${Math.min(100, (promo.usage_count / promo.usage_limit) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {promo.usage_count} / {promo.usage_limit}
                          </span>
                        </div>
                      </td>
                      {/* Tombol edit & delete hanya untuk admin */}
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
          </div>
        </div>
      </div>
    </main>
  );
}