"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoadingState from "@/components/LoadingState";

type EventDisplay = {
  event_id: string;
  event_datetime: string;
  event_title: string;
  venue_id?: string;
  venue_name?: string;
  organizer_name?: string;
  tags?: string[];
};

type TicketCategory = {
  category_id: string;
  category_name: string;
  price: number;
  quota: number;
  remaining_quota: number;
};

type Seat = {
  seat_id: string;
  section: string;
  seat_number: string;
  row_number: string;
  status: "Tersedia" | "Terisi";
};

type Promotion = {
  promotion_id: string;
  promo_code: string;
  discount_type: string;
  discount_value: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  usage_count: number;
};

function generateOrderId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function OrderPage() {
  const params = useSearchParams();
  const eventId = params.get("event_id") ?? "";

  const [event, setEvent] = useState<EventDisplay | null>(null);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<TicketCategory | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState<Promotion | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promoError, setPromoError] = useState("");
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderId] = useState(generateOrderId);

  // =====================================================
  // FETCH EVENT DETAIL
  // =====================================================

  useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      try {
        setLoadingEvent(true);
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();
        if (!response.ok) {
          console.error(data.message);
          return;
        }
        setEvent(data);
      } catch (error) {
        console.error("FETCH EVENT ERROR:", error);
      } finally {
        setLoadingEvent(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  // =====================================================
  // FETCH TICKET CATEGORIES
  // =====================================================

  useEffect(() => {
    if (!eventId) return;
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch("/api/ticket-categories/remaining-quota", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event_id: eventId }),
        });
        const data = await response.json();
        if (!response.ok) {
          console.error(data.message);
          return;
        }
        const cats: TicketCategory[] = (data as any[]).map((item) => ({
          category_id: item.category_id,
          category_name: item.category_name,
          price: Number(item.price),
          quota: item.quota,
          remaining_quota: Number(item.remaining_quota),
        }));
        setCategories(cats);
        setSelectedCategory(cats[0] ?? null);
      } catch (error) {
        console.error("FETCH CATEGORIES ERROR:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [eventId]);

  // =====================================================
  // FETCH SEATS BY VENUE
  // =====================================================

  useEffect(() => {
    if (!event?.venue_id) return;
    const fetchSeats = async () => {
      try {
        setLoadingSeats(true);
        const response = await fetch(
          `/api/seat/by-venue?venue_id=${event.venue_id}`
        );
        const data = await response.json();
        if (!response.ok) {
          console.error(data.message);
          return;
        }
        setSeats(data);
      } catch (error) {
        console.error("FETCH SEATS ERROR:", error);
      } finally {
        setLoadingSeats(false);
      }
    };
    fetchSeats();
  }, [event?.venue_id]);

  // =====================================================
  // FETCH PROMOTIONS
  // =====================================================

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch("/api/promotion");
        const data = await response.json();
        if (!response.ok) {
          console.error(data.error);
          return;
        }
        setPromotions(data);
      } catch (error) {
        console.error("FETCH PROMOTION ERROR:", error);
      }
    };
    fetchPromotions();
  }, []);

  // =====================================================
  // CALCULATION
  // =====================================================

  const subtotal = (selectedCategory?.price ?? 0) * quantity;

  let discountAmount = 0;
  if (promoApplied) {
    if (promoApplied.discount_type === "percentage") {
      discountAmount = subtotal * (promoApplied.discount_value / 100);
    } else {
      discountAmount = promoApplied.discount_value;
    }
  }

  const total = Math.max(subtotal - discountAmount, 0);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleSelectCategory = (cat: TicketCategory) => {
    setSelectedCategory(cat);
    setSelectedSeats([]);
  };

  const handleQty = (val: number) => {
    if (val < 1 || val > 10) return;
    const maxAllowed = selectedCategory
      ? Math.min(10, selectedCategory.remaining_quota)
      : 10;
    if (val > maxAllowed) return;
    setQuantity(val);
    if (selectedSeats.length > val) {
      setSelectedSeats(selectedSeats.slice(0, val));
    }
  };

  const toggleSeat = (seat: Seat) => {
    if (seat.status === "Terisi") return;
    if (selectedSeats.includes(seat.seat_id)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat.seat_id));
    } else if (selectedSeats.length < quantity) {
      setSelectedSeats([...selectedSeats, seat.seat_id]);
    }
  };

  // group seats by section
  const seatsBySection = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
    const section = seat.section || "Umum";
    if (!acc[section]) acc[section] = [];
    acc[section].push(seat);
    return acc;
  }, {});

  const handleApplyPromo = async () => {
    try {
      setPromoError("");
      setPromoApplied(null);
      const code = promo.trim().toUpperCase();
      const foundPromo = promotions.find(
        (p) => p.promo_code.toUpperCase() === code
      );
      if (!foundPromo) {
        setPromoError("Kode promo tidak ditemukan.");
        return;
      }
      const userId = params.get("user_id");
      if (!userId) {
        setPromoError("User tidak ditemukan.");
        return;
      }
      const customerResponse = await fetch(`/api/customer?user_id=${userId}`);
      const customerData = await customerResponse.json();
      if (!customerResponse.ok) {
        setPromoError(customerData.error);
        return;
      }
      const response = await fetch("/api/promotion/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerData.customer_id,
          promotion_id: foundPromo.promotion_id,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setPromoError(data.error);
        return;
      }
      setPromoApplied(foundPromo);
    } catch (error) {
      console.error(error);
      setPromoError("Terjadi kesalahan.");
    }
  };

  const handleBayar = async () => {
    if (!selectedCategory) return;
    try {
      const userId = params.get("user_id");
      if (!userId) {
        alert("User ID tidak ditemukan.");
        return;
      }
      const customerResponse = await fetch(`/api/customer?user_id=${userId}`);
      const customerData = await customerResponse.json();
      if (!customerResponse.ok) {
        alert(customerData.error || "Customer tidak ditemukan.");
        return;
      }
      const customerId = customerData.customer_id;
      const promotionId = promoApplied?.promotion_id ?? null;
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          total_amount: total,
          payment_status: "Pending",
          promotion_id: promotionId,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Gagal membuat order.");
        return;
      }
      console.log("ORDER SUCCESS:", data);
      setOrderSubmitted(true);
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);
      alert("Terjadi kesalahan saat checkout.");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loadingEvent || loadingCategories) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Navbar role="customer" />
        <LoadingState message="Memuat data event..." />
      </main>
    );
  }

  // =====================================================
  // EVENT NOT FOUND
  // =====================================================

  if (!event) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Navbar role="customer" />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-2xl font-bold text-slate-700">
            Event tidak ditemukan.
          </p>
          <a
            href="/events"
            className="mt-4 text-blue-600 hover:underline text-sm"
          >
            {"\u2190"} Kembali ke daftar event
          </a>
        </div>
      </main>
    );
  }

  // =====================================================
  // SUCCESS PAGE
  // =====================================================

  if (orderSubmitted) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Navbar role="customer" />
        <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Pesanan Berhasil!
          </h2>
          <p className="text-slate-500 text-sm mb-4">
            Order ID:
            <span className="font-mono font-semibold text-slate-700">
              {" "}
              {orderId}
            </span>
          </p>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 w-full text-left text-sm space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Event</span>
              <span className="font-semibold text-slate-800">
                {event.event_title}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kategori</span>
              <span>{selectedCategory?.category_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Jumlah</span>
              <span>{quantity} tiket</span>
            </div>
            {selectedSeats.length > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Kursi</span>
                <span>
                  {seats
                    .filter((s) => selectedSeats.includes(s.seat_id))
                    .map((s) => `${s.section}-${s.row_number}${s.seat_number}`)
                    .join(", ")}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <span className="text-yellow-600 font-semibold">Pending</span>
            </div>
            <hr className="border-slate-100" />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-blue-600">{formatRp(total)}</span>
            </div>
          </div>
          <a
            href="/events"
            className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors block"
          >
            {"\u2190"} Kembali ke Daftar Event
          </a>
        </div>
      </main>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100">
      <Navbar role="customer" />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-5 pb-1 flex justify-end">
        <nav className="text-sm flex items-center gap-1.5">
          <span className="text-blue-600 font-medium">Pilih</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-400">Bayar</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-400">Selesai</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-10 grid md:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="md:col-span-2 space-y-5">

          {/* EVENT INFO */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold shadow-sm">
                {event.event_title.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-lg font-bold text-gray-900">
                    {event.event_title}
                  </h2>
                  {event.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{event.event_datetime}</span>
                  {event.venue_name && <span>{event.venue_name}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* CATEGORY */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-1">
              Pilih Kategori Tiket
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Setiap kategori memiliki fasilitas berbeda
            </p>
            <div className="space-y-3">
              {categories.map((cat) => {
                const isSelected =
                  selectedCategory?.category_id === cat.category_id;
                const isSoldOut = cat.remaining_quota <= 0;
                return (
                  <div
                    key={cat.category_id}
                    onClick={() => !isSoldOut && handleSelectCategory(cat)}
                    className={`flex justify-between items-center p-4 border rounded-xl transition-all duration-150 ${
                      isSoldOut
                        ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "border-blue-500 bg-blue-50 cursor-pointer"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    <div>
                      <p
                        className={`font-semibold ${
                          isSelected ? "text-blue-700" : "text-gray-800"
                        }`}
                      >
                        {cat.category_name}
                      </p>
                      <p className="text-sm text-gray-400">
                        Sisa: {cat.remaining_quota} / {cat.quota} tiket
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSoldOut ? (
                        <span className="text-sm text-red-400 font-medium">
                          Habis
                        </span>
                      ) : (
                        <span
                          className={`font-semibold ${
                            isSelected ? "text-blue-600" : "text-gray-700"
                          }`}
                        >
                          {formatRp(cat.price)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* QTY + SEAT */}
          <div className="grid grid-cols-2 gap-5">

            {/* QUANTITY */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">
                Jumlah Tiket
              </h3>
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => handleQty(quantity - 1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {"\u2212"}
                </button>
                <span className="text-xl font-semibold w-6 text-center text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQty(quantity + 1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Max{" "}
                {selectedCategory
                  ? Math.min(10, selectedCategory.remaining_quota)
                  : 10}{" "}
                tiket untuk kategori ini
              </p>
            </div>

            {/* SEAT */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Pilih Kursi</h3>
              {loadingSeats ? (
                <LoadingState message="Memuat kursi..." />
              ) : seats.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Tidak ada data kursi.
                </p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {Object.entries(seatsBySection).map(
                    ([section, sectionSeats]) => (
                      <div key={section}>
                        <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                          {section}
                        </p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {sectionSeats.map((seat) => {
                            const isSelected = selectedSeats.includes(
                              seat.seat_id
                            );
                            const isTaken = seat.status === "Terisi";
                            return (
                              <button
                                key={seat.seat_id}
                                onClick={() => toggleSeat(seat)}
                                disabled={isTaken}
                                title={
                                  isTaken
                                    ? "Kursi sudah terisi"
                                    : `${seat.row_number}${seat.seat_number}`
                                }
                                className={`text-xs py-1.5 rounded-md border font-medium transition-all duration-150 ${
                                  isTaken
                                    ? "border-gray-100 bg-gray-100 text-gray-300 cursor-not-allowed"
                                    : isSelected
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {seat.row_number}
                                {seat.seat_number}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
              {selectedSeats.length > 0 && (
                <p className="mt-2 text-xs text-gray-400">
                  Dipilih:{" "}
                  {seats
                    .filter((s) => selectedSeats.includes(s.seat_id))
                    .map((s) => `${s.row_number}${s.seat_number}`)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* PROMO */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Kode Promo</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={promo}
                onChange={(e) => {
                  setPromo(e.target.value);
                  setPromoError("");
                  setPromoApplied(null);
                }}
                placeholder="CONTOH: TIKTAK20"
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
              />
              <button
                onClick={handleApplyPromo}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Terapkan
              </button>
            </div>
            {promoError && (
              <p className="text-sm text-red-500 mt-2">{promoError}</p>
            )}
            {promoApplied && (
              <p className="text-sm text-green-600 mt-2">
                {"\u2713"} Promo{" "}
                <strong>{promoApplied.promo_code}</strong> berhasil diterapkan
              </p>
            )}
          </div>
        </div>

        {/* RIGHT - ORDER SUMMARY */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-6">
          <h3 className="font-semibold text-gray-900 mb-6">
            Ringkasan Pesanan
          </h3>
          <div className="space-y-3 mb-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>
                {selectedCategory?.category_name} {" \u00d7 "} {quantity}
              </span>
              <span>{formatRp(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon ({promoApplied?.promo_code})</span>
                <span>{"\u2212"} {formatRp(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Biaya Layanan</span>
              <span>Rp 0</span>
            </div>
          </div>
          <hr className="border-gray-100 my-4" />
          <div className="flex justify-between items-center mb-6">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-2xl text-gray-900">
              {formatRp(total)}
            </span>
          </div>
          <button
            onClick={handleBayar}
            disabled={
              !selectedCategory || selectedCategory.remaining_quota <= 0
            }
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
          >
            Bayar Sekarang
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">
            Konfirmasi tiket akan dikirim ke email Anda
          </p>
        </div>
      </div>
    </main>
  );
}