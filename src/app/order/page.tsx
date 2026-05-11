"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { getUser, AuthUser } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentStatus = "Pending" | "Paid" | "Cancelled";

type Order = {
  order_id: string;
  order_date: string;
  payment_status: PaymentStatus;
  total_amount: number;
  customer_id: string;
  customer_name: string;
  event_title: string;
  organizer_id: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRp(n: number) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function shortId(id: string) {
  return "ord_" + id.slice(-3);
}

const statusStyle: Record<PaymentStatus, string> = {
  Paid: "bg-green-100 text-green-700 border border-green-200",
  Pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  Cancelled: "bg-red-100 text-red-700 border border-red-200",
};

const statusLabel: Record<PaymentStatus, string> = {
  Paid: "Lunas",
  Pending: "Pending",
  Cancelled: "Dibatalkan",
};

// ─── Update Modal ─────────────────────────────────────────────────────────────
function UpdateModal({
  order,
  onClose,
  onUpdate,
}: {
  order: Order;
  onClose: () => void;
  onUpdate: (id: string, status: PaymentStatus) => Promise<void>;
}) {
  const [status, setStatus] = useState<PaymentStatus>(order.payment_status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    setLoading(true);
    setError("");
    try {
      await onUpdate(order.order_id, status);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengupdate order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Update Status Order</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <p className="text-xs text-gray-400 mb-1">ORDER ID</p>
        <p className="text-sm font-mono text-gray-700 mb-4">{shortId(order.order_id)}</p>
        <p className="text-xs text-gray-400 mb-1">PAYMENT STATUS</p>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as PaymentStatus)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
        >
          <option value="Paid">Lunas</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Dibatalkan</option>
        </select>
        {error && (
          <p className="text-xs text-red-500 mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
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
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({
  order,
  onClose,
  onDelete,
}: {
  order: Order;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await onDelete(order.order_id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-lg">Hapus Order</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Apakah Anda yakin ingin menghapus catatan order ini?<br />
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
export default function OrdersPage() {
  const [user, setUser] = useState<AuthUser | null | "guest">(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | PaymentStatus>("all");
  const [updateTarget, setUpdateTarget] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);

  useEffect(() => {
    const u = getUser();
    setUser(u ?? "guest");
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/order");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal mengambil data order.");
      }
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user !== null) fetchOrders();
  }, [user, fetchOrders]);

  if (user === null) return null;

  const currentUser = user === "guest" ? null : user;
  const role = currentUser?.role ?? "guest";
  const isAdmin = role === "admin";
  const navRole = role;

  const displayed = orders
    .filter((o) => {
      const matchSearch =
        search === "" ||
        shortId(o.order_id).includes(search.toLowerCase()) ||
        o.order_id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || o.payment_status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

  // Stats
  const totalOrders = orders.length;
  const totalPaid = orders.filter((o) => o.payment_status === "Paid").length;
  const totalPending = orders.filter((o) => o.payment_status === "Pending").length;
  const totalRevenue = orders
    .filter((o) => o.payment_status === "Paid")
    .reduce((s, o) => s + Number(o.total_amount), 0);

  const handleUpdate = async (id: string, status: PaymentStatus) => {
    const res = await fetch("/api/order", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: id, payment_status: status }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Gagal mengupdate order.");
    }
    const updated: Order = await res.json();
    setOrders((prev) =>
      prev.map((o) => (o.order_id === updated.order_id ? { ...o, ...updated } : o))
    );
  };

  const handleDelete = async (id: string) => {
    const res = await fetch("/api/order", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: id }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Gagal menghapus order.");
    }
    setOrders((prev) => prev.filter((o) => o.order_id !== id));
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <Navbar role={navRole} />

      {updateTarget && (
        <UpdateModal
          order={updateTarget}
          onClose={() => setUpdateTarget(null)}
          onUpdate={handleUpdate}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          order={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDelete={handleDelete}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Daftar Order</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {role === "customer" && "Riwayat pembelian tiket Anda"}
            {role === "organizer" && "Order dari event yang Anda selenggarakan"}
            {role === "admin" && "Semua order yang terdaftar pada sistem"}
          </p>
        </div>

        {/* Error State */}
        {fetchError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
            <span>{fetchError}</span>
            <button
              onClick={fetchOrders}
              className="ml-4 text-xs underline hover:no-underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Order</p>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? <span className="text-gray-300">—</span> : totalOrders}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Lunas</p>
            <p className="text-3xl font-bold text-green-600">
              {loading ? <span className="text-gray-300">—</span> : totalPaid}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-500">
              {loading ? <span className="text-gray-300">—</span> : totalPending}
            </p>
          </div>
          {isAdmin && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Revenue</p>
              <p className="text-xl font-bold text-blue-600">
                {loading ? <span className="text-gray-300">—</span> : formatRp(totalRevenue)}
              </p>
            </div>
          )}
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
                placeholder="Cari order ID..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | PaymentStatus)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 min-w-[140px]"
            >
              <option value="all">Semua Status</option>
              <option value="Paid">Lunas</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Dibatalkan</option>
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
                  <p className="text-sm text-gray-400">Memuat data order...</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                    <th className="text-left px-5 py-3 font-medium">Order ID</th>
                    {isAdmin && (
                      <th className="text-left px-5 py-3 font-medium">Pelanggan</th>
                    )}
                    <th className="text-left px-5 py-3 font-medium">Tanggal</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-right px-5 py-3 font-medium">Total</th>
                    {isAdmin && <th className="px-5 py-3 font-medium"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayed.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 4} className="text-center py-12 text-sm text-gray-400">
                        Tidak ada order ditemukan.
                      </td>
                    </tr>
                  ) : (
                    displayed.map((order) => (
                      <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-sm font-mono text-gray-600">
                            {shortId(order.order_id)}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                {(order.customer_name ?? "?").charAt(0)}
                              </span>
                              <span className="text-sm text-gray-700">
                                {order.customer_name ?? order.customer_id}
                              </span>
                            </div>
                          </td>
                        )}
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {order.order_date.slice(0, 16)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[order.payment_status]}`}
                          >
                            {statusLabel[order.payment_status]}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">
                          {formatRp(order.total_amount)}
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setUpdateTarget(order)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition-colors"
                                title="Update"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeleteTarget(order)}
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