"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

type EventDisplay = {
  event_id: string;
  event_datetime: string;
  event_title: string;
  venue_name: string;
  organizer_name: string;
  tags: string[];
};

type TicketCategory = {
  name: string;
  price: number;
  quota: number;
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

const eventData: EventDisplay[] = [
  {
    event_id: "550e8400-e29b-41d4-a716-446655441001",
    event_title: "The Weeknd After Hours Tour",
    event_datetime: "2025-08-15 19:00",
    venue_name: "Jakarta Convention Center",
    organizer_name: "Organizer Satu",
    tags: ["Pop", "R&B"],
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441002",
    event_title: "Justin Bieber World Tour",
    event_datetime: "2025-09-20 18:00",
    venue_name: "Jakarta Convention Center",
    organizer_name: "Organizer Dua",
    tags: ["Pop"],
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441003",
    event_title: "Olivia Rodrigo GUTS Tour",
    event_datetime: "2025-10-05 20:00",
    venue_name: "Sabuga Bandung",
    organizer_name: "Organizer Satu",
    tags: ["Pop", "Alt"],
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441004",
    event_title: "Kanye West Donda Live",
    event_datetime: "2025-11-12 19:30",
    venue_name: "Sabuga Bandung",
    organizer_name: "Organizer Dua",
    tags: ["Hip-Hop"],
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441005",
    event_title: "The Weeknd Starboy Festival",
    event_datetime: "2025-12-01 20:00",
    venue_name: "Sabuga Bandung",
    organizer_name: "Organizer Satu",
    tags: ["Pop", "R&B"],
  },
  {
    event_id: "550e8400-e29b-41d4-a716-446655441006",
    event_title: "Drake It's All A Blur Tour",
    event_datetime: "2026-01-10 19:00",
    venue_name: "Grand City Surabaya",
    organizer_name: "Organizer Dua",
    tags: ["Hip-Hop", "Rap"],
  },
];

const ticketsByEvent: Record<string, TicketCategory[]> = {
  "550e8400-e29b-41d4-a716-446655441001": [
    { name: "WVIP", price: 2500000, quota: 30 },
    { name: "VIP", price: 1500000, quota: 100 },
    { name: "Category 1", price: 750000, quota: 250 },
    { name: "Category 2", price: 350000, quota: 500 },
  ],
  "550e8400-e29b-41d4-a716-446655441002": [
    { name: "WVIP", price: 3000000, quota: 25 },
    { name: "VIP", price: 1750000, quota: 80 },
    { name: "Category 1", price: 900000, quota: 300 },
    { name: "Category 2", price: 450000, quota: 600 },
  ],
  "550e8400-e29b-41d4-a716-446655441003": [
    { name: "VIP", price: 1200000, quota: 100 },
    { name: "Category 1", price: 600000, quota: 300 },
    { name: "Category 2", price: 250000, quota: 500 },
  ],
  "550e8400-e29b-41d4-a716-446655441004": [
    { name: "WVIP", price: 2000000, quota: 40 },
    { name: "VIP", price: 1000000, quota: 120 },
    { name: "Category 1", price: 500000, quota: 400 },
  ],
  "550e8400-e29b-41d4-a716-446655441005": [
    { name: "WVIP", price: 2200000, quota: 35 },
    { name: "VIP", price: 1100000, quota: 150 },
    { name: "Category 1", price: 550000, quota: 350 },
    { name: "Category 2", price: 275000, quota: 700 },
  ],
  "550e8400-e29b-41d4-a716-446655441006": [
    { name: "VIP", price: 1800000, quota: 60 },
    { name: "Category 1", price: 800000, quota: 200 },
    { name: "Category 2", price: 400000, quota: 450 },
  ],
};

const SEATS = [
  "A1","A2","A3","A4",
  "A5","B1","B2","B3",
  "B4","B5","C1","C2"
];

function generateOrderId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (c) => {
      const r = (Math.random() * 16) | 0;

      return (
        c === "x"
          ? r
          : (r & 0x3) | 0x8
      ).toString(16);
    }
  );
}

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function OrderPage() {

  const params = useSearchParams();

  const eventId =
    params.get("event_id") ?? "";

  const event = useMemo(
    () =>
      eventData.find(
        (e) => e.event_id === eventId
      ) ?? null,
    [eventId]
  );

  const categories: TicketCategory[] =
    useMemo(
      () => ticketsByEvent[eventId] ?? [],
      [eventId]
    );

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<TicketCategory | null>(
    categories[0] ?? null
  );

  const [quantity, setQuantity] =
    useState(1);

  const [
    selectedSeats,
    setSelectedSeats,
  ] = useState<string[]>([]);

  const [promo, setPromo] =
    useState("");

  const [
    promoApplied,
    setPromoApplied,
  ] = useState<Promotion | null>(
    null
  );

  const [
    promotions,
    setPromotions,
  ] = useState<Promotion[]>([]);

  const [promoError, setPromoError] =
    useState("");

  const [
    orderSubmitted,
    setOrderSubmitted,
  ] = useState(false);

  const [orderId] =
    useState(generateOrderId);

  // =====================================================
  // FETCH PROMOTION FROM DB
  // =====================================================

  useEffect(() => {

    const fetchPromotions = async () => {

      try {

        const response =
          await fetch("/api/promotion");

        const data =
          await response.json();

        if (!response.ok) {

          console.error(data.error);

          return;
        }

        setPromotions(data);

      } catch (error) {

        console.error(
          "FETCH PROMOTION ERROR:",
          error
        );
      }
    };

    fetchPromotions();

  }, []);

  // =====================================================
  // CALCULATION
  // =====================================================

  const subtotal =
    (selectedCategory?.price ?? 0) *
    quantity;

  let discountAmount = 0;

  if (promoApplied) {

    if (
      promoApplied.discount_type ===
      "percentage"
    ) {

      discountAmount =
        subtotal *
        (promoApplied.discount_value / 100);

    } else {

      discountAmount =
        promoApplied.discount_value;
    }
  }

  const total =
    Math.max(
      subtotal - discountAmount,
      0
    );

  // =====================================================
  // CATEGORY
  // =====================================================

  const handleSelectCategory = (
    cat: TicketCategory
  ) => {

    setSelectedCategory(cat);

    setSelectedSeats([]);
  };

  // =====================================================
  // QUANTITY
  // =====================================================

  const handleQty = (val: number) => {

    if (val < 1 || val > 10) return;

    setQuantity(val);

    if (selectedSeats.length > val) {

      setSelectedSeats(
        selectedSeats.slice(0, val)
      );
    }
  };

  // =====================================================
  // SEAT
  // =====================================================

  const toggleSeat = (
    seat: string
  ) => {

    if (
      selectedSeats.includes(seat)
    ) {

      setSelectedSeats(
        selectedSeats.filter(
          (s) => s !== seat
        )
      );

    } else if (
      selectedSeats.length < quantity
    ) {

      setSelectedSeats([
        ...selectedSeats,
        seat,
      ]);
    }
  };

const handleApplyPromo = async () => {

  try {

    setPromoError("");

    setPromoApplied(null);

    const code =
      promo.trim().toUpperCase();

    const foundPromo =
      promotions.find(
        (p) =>
          p.promo_code.toUpperCase() ===
          code
      );

    if (!foundPromo) {
      setPromoError(
        "Kode promo tidak ditemukan."
      );
      return;
    }

    const userId =
      params.get("user_id");

    if (!userId) {

      setPromoError(
        "User tidak ditemukan."
      );

      return;
    }

    // ambil customer
    const customerResponse =
      await fetch(
        `/api/customer?user_id=${userId}`
      );

    const customerData =
      await customerResponse.json();

    if (!customerResponse.ok) {

      setPromoError(
        customerData.error
      );

      return;
    }

    // =====================================================
    // VALIDASI VIA TRIGGER
    // =====================================================

    const response =
      await fetch(
        "/api/promotion/apply",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            customer_id:
              customerData.customer_id,

            promotion_id:
              foundPromo.promotion_id,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      setPromoError(
        data.error
      );

      return;
    }

    setPromoApplied(
      foundPromo
    );

  } catch (error) {

    console.error(error);

    setPromoError(
      "Terjadi kesalahan."
    );
  }
};
  // =====================================================
  // CHECKOUT
  // =====================================================

  const handleBayar = async () => {

    if (!selectedCategory) return;

    try {

      const userId =
        params.get("user_id");

      if (!userId) {

        alert(
          "User ID tidak ditemukan."
        );

        return;
      }

      // ambil customer
      const customerResponse =
        await fetch(
          `/api/customer?user_id=${userId}`
        );

      const customerData =
        await customerResponse.json();

      if (!customerResponse.ok) {

        alert(
          customerData.error ||
          "Customer tidak ditemukan."
        );

        return;
      }

      const customerId =
        customerData.customer_id;

      // promotion id
      const promotionId =
        promoApplied?.promotion_id ??
        null;

      // create order
      const response =
        await fetch("/api/order", {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            customer_id:
              customerId,

            total_amount: total,

            payment_status:
              "Pending",

            promotion_id:
              promotionId,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {

        alert(
          data.error ||
          "Gagal membuat order."
        );

        return;
      }

      console.log(
        "ORDER SUCCESS:",
        data
      );

      setOrderSubmitted(true);

    } catch (error) {

      console.error(
        "CHECKOUT ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat checkout."
      );
    }
  };

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
            ← Kembali ke daftar event
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

              <span className="text-slate-500">
                Event
              </span>

              <span className="font-semibold text-slate-800">
                {event.event_title}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-500">
                Kategori
              </span>

              <span>
                {selectedCategory?.name}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-500">
                Jumlah
              </span>

              <span>
                {quantity} tiket
              </span>

            </div>

            {selectedSeats.length > 0 && (

              <div className="flex justify-between">

                <span className="text-slate-500">
                  Kursi
                </span>

                <span>
                  {selectedSeats.join(", ")}
                </span>

              </div>
            )}

            <div className="flex justify-between">

              <span className="text-slate-500">
                Status
              </span>

              <span className="text-yellow-600 font-semibold">
                Pending
              </span>

            </div>

            <hr className="border-slate-100" />

            <div className="flex justify-between font-bold text-base">

              <span>Total</span>

              <span className="text-blue-600">
                {formatRp(total)}
              </span>

            </div>

          </div>

          <a
            href="/events"
            className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors block"
          >
            ← Kembali ke Daftar Event
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

          <span className="text-blue-600 font-medium">
            Pilih
          </span>

          <span className="text-gray-400">
            &gt;
          </span>

          <span className="text-gray-400">
            Bayar
          </span>

          <span className="text-gray-400">
            &gt;
          </span>

          <span className="text-gray-400">
            Selesai
          </span>

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

                  {event.tags.map((tag) => (

                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium"
                    >
                      {tag}
                    </span>

                  ))}

                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">

                  <span className="flex items-center gap-1">

                    {event.event_datetime}

                  </span>

                  <span className="flex items-center gap-1">

                    {event.venue_name}

                  </span>

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
                  selectedCategory?.name ===
                  cat.name;

                return (

                  <div
                    key={cat.name}
                    onClick={() =>
                      handleSelectCategory(cat)
                    }
                    className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >

                    <div>

                      <p
                        className={`font-semibold ${
                          isSelected
                            ? "text-blue-700"
                            : "text-gray-800"
                        }`}
                      >
                        {cat.name}
                      </p>

                      <p className="text-sm text-gray-400">
                        Kuota: {cat.quota} tiket
                      </p>

                    </div>

                    <div className="flex items-center gap-2">

                      <span
                        className={`font-semibold ${
                          isSelected
                            ? "text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        {formatRp(cat.price)}
                      </span>

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

          {/* QTY + SEAT */}

          <div className="grid grid-cols-2 gap-5">

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

              <h3 className="font-semibold text-gray-900 mb-4">
                Jumlah Tiket
              </h3>

              <div className="flex items-center gap-4 mb-2">

                <button
                  onClick={() =>
                    handleQty(quantity - 1)
                  }
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  −
                </button>

                <span className="text-xl font-semibold w-6 text-center text-gray-900">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    handleQty(quantity + 1)
                  }
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  +
                </button>

              </div>

              <p className="text-xs text-gray-400">
                Max 10 tiket per transaksi
              </p>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

              <h3 className="font-semibold text-gray-900 mb-4">
                Pilih Kursi
              </h3>

              <div className="grid grid-cols-4 gap-2">

                {SEATS.map((seat) => {

                  const isSelected =
                    selectedSeats.includes(
                      seat
                    );

                  return (

                    <button
                      key={seat}
                      onClick={() =>
                        toggleSeat(seat)
                      }
                      className={`text-xs py-1.5 rounded-md border font-medium transition-all duration-150 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >

                      {seat}

                    </button>
                  );
                })}

              </div>

              {selectedSeats.length > 0 && (

                <p className="mt-2 text-xs text-gray-400">

                  Dipilih:
                  {" "}
                  {selectedSeats.join(", ")}

                </p>
              )}

            </div>

          </div>

          {/* PROMO */}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

            <h3 className="font-semibold text-gray-900 mb-4">
              Kode Promo
            </h3>

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

              <p className="text-sm text-red-500 mt-2">

                {promoError}

              </p>
            )}

            {promoApplied && (

              <p className="text-sm text-green-600 mt-2">

                ✓ Promo
                {" "}

                <strong>
                  {promoApplied.promo_code}
                </strong>

                {" "}
                berhasil diterapkan

              </p>
            )}

          </div>

        </div>

        {/* RIGHT */}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-6">

          <h3 className="font-semibold text-gray-900 mb-6">
            Ringkasan Pesanan
          </h3>

          <div className="space-y-3 mb-4 text-sm">

            <div className="flex justify-between text-gray-600">

              <span>
                {selectedCategory?.name}
                {" × "}
                {quantity}
              </span>

              <span>
                {formatRp(subtotal)}
              </span>

            </div>

            {discountAmount > 0 && (

              <div className="flex justify-between text-green-600">

                <span>

                  Diskon (
                  {promoApplied?.promo_code}
                  )

                </span>

                <span>
                  − {formatRp(discountAmount)}
                </span>

              </div>
            )}

            <div className="flex justify-between text-gray-600">

              <span>Biaya Layanan</span>

              <span>Rp 0</span>

            </div>

          </div>

          <hr className="border-gray-100 my-4" />

          <div className="flex justify-between items-center mb-6">

            <span className="font-semibold text-gray-900">
              Total
            </span>

            <span className="font-bold text-2xl text-gray-900">
              {formatRp(total)}
            </span>

          </div>

          <button
            onClick={handleBayar}
            disabled={!selectedCategory}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
          >
            Bayar Sekarang
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">

            Konfirmasi tiket akan dikirim ke admin@example.com

          </p>

        </div>

      </div>

    </main>
  );
}