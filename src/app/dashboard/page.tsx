"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

type EventDisplay = {
  event_id: string;
  event_title: string;
  event_datetime: string;
  venue_name: string;
  organizer_id: string;
};

type Order = {
  order_id: string;
  order_date: string;
  payment_status: "Pending" | "Paid" | "Cancelled";
  total_amount: number;
  customer_id: string;
  customer_name: string;
  event_title: string;
  organizer_id: string;
};

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const eventData: EventDisplay[] = [
  { event_id: "550e8400-e29b-41d4-a716-446655441001", event_title: "The Weeknd After Hours Tour", event_datetime: "2025-08-15 19:00", venue_name: "Jakarta Convention Center", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { event_id: "550e8400-e29b-41d4-a716-446655441002", event_title: "Justin Bieber World Tour", event_datetime: "2025-09-20 18:00", venue_name: "Jakarta Convention Center", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { event_id: "550e8400-e29b-41d4-a716-446655441003", event_title: "Olivia Rodrigo GUTS Tour", event_datetime: "2025-10-05 20:00", venue_name: "Sabuga Bandung", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { event_id: "550e8400-e29b-41d4-a716-446655441004", event_title: "Kanye West Donda Live", event_datetime: "2025-11-12 19:30", venue_name: "Sabuga Bandung", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { event_id: "550e8400-e29b-41d4-a716-446655441005", event_title: "The Weeknd Starboy Festival", event_datetime: "2025-12-01 20:00", venue_name: "Sabuga Bandung", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { event_id: "550e8400-e29b-41d4-a716-446655441006", event_title: "Drake It's All A Blur Tour", event_datetime: "2026-01-10 19:00", venue_name: "Grand City Surabaya", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
];

const initialPromotions: Promotion[] = [
  { promotion_id: "550e8400-e29b-41d4-a716-44665544b001", promo_code: "TIKTAK20", discount_type: "PERCENTAGE", discount_value: 20, start_date: "2025-01-01", end_date: "2025-12-31", usage_limit: 100, usage_count: 45 },
  { promotion_id: "550e8400-e29b-41d4-a716-44665544b002", promo_code: "HEMAT10", discount_type: "PERCENTAGE", discount_value: 10, start_date: "2025-01-01", end_date: "2025-12-31", usage_limit: 200, usage_count: 87 },
  { promotion_id: "550e8400-e29b-41d4-a716-44665544b003", promo_code: "HEMAT50K", discount_type: "NOMINAL", discount_value: 50000, start_date: "2025-03-01", end_date: "2025-06-30", usage_limit: 50, usage_count: 12 },
  { promotion_id: "550e8400-e29b-41d4-a716-44665544b004", promo_code: "NEWUSER30", discount_type: "PERCENTAGE", discount_value: 30, start_date: "2025-06-01", end_date: "2025-09-30", usage_limit: 150, usage_count: 63 },
  { promotion_id: "550e8400-e29b-41d4-a716-44665544b005", promo_code: "WEEKNDFEST", discount_type: "NOMINAL", discount_value: 100000, start_date: "2025-11-01", end_date: "2025-12-31", usage_limit: 75, usage_count: 20 },
  { promotion_id: "550e8400-e29b-41d4-a716-44665544b006", promo_code: "FLASH15", discount_type: "PERCENTAGE", discount_value: 15, start_date: "2025-08-01", end_date: "2025-08-31", usage_limit: 80, usage_count: 55 },
];

// Duplikasi dari src/app/my-tickets/page.tsx
// (tidak bisa import langsung — Next.js melarang non-default export dari page file)
type DummyTicket = {
  ticket_id: string;
  ticker_code: string;
  event_name: string;
  venue_name: string;
  category_name: string;
  booking_date: string;
  status: "Dipesan" | "Dipakai";
  customer_id: string;
  organizer_id: string;
};

const DUMMY_TICKETS: DummyTicket[] = [
  { ticket_id: "TKT-001", ticker_code: "TKT-JEANS-001", customer_id: "550e8400-e29b-41d4-a716-446655443004", event_name: "The Weeknd After Hours Tour",   venue_name: "Jakarta Convention Center", category_name: "VIP",       booking_date: "2025-08-01 14:30", status: "Dipesan", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { ticket_id: "TKT-002", ticker_code: "TKT-JEANS-002", customer_id: "550e8400-e29b-41d4-a716-446655443004", event_name: "Justin Bieber World Tour",      venue_name: "Jakarta Convention Center", category_name: "Regular",    booking_date: "2025-08-05 10:15", status: "Dipakai", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { ticket_id: "TKT-003", ticker_code: "TKT-JEANS-003", customer_id: "cust_other",                           event_name: "Olivia Rodrigo GUTS Tour",      venue_name: "Sabuga Bandung",            category_name: "Festival",   booking_date: "2025-09-12 09:00", status: "Dipakai", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { ticket_id: "TKT-004", ticker_code: "TKT-JEANS-004", customer_id: "cust_other_01",                        event_name: "Kanye West Donda Live",         venue_name: "Sabuga Bandung",            category_name: "Platinum",   booking_date: "2025-09-15 13:20", status: "Dipakai", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { ticket_id: "TKT-005", ticker_code: "TKT-JEANS-005", customer_id: "550e8400-e29b-41d4-a716-446655443004", event_name: "The Weeknd Starboy Festival",   venue_name: "Sabuga Bandung",            category_name: "Festival",   booking_date: "2025-09-20 09:45", status: "Dipakai", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { ticket_id: "TKT-006", ticker_code: "TKT-JEANS-006", customer_id: "cust_other_02",                        event_name: "Drake It's All A Blur Tour",    venue_name: "Grand City Surabaya",       category_name: "VIP",        booking_date: "2025-09-25 16:10", status: "Dipakai", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { ticket_id: "TKT-007", ticker_code: "TKT-JEANS-007", customer_id: "550e8400-e29b-41d4-a716-446655443004", event_name: "The Weeknd After Hours Tour",   venue_name: "Jakarta Convention Center", category_name: "VIP",        booking_date: "2025-10-01 11:30", status: "Dipesan", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { ticket_id: "TKT-008", ticker_code: "TKT-JEANS-008", customer_id: "cust_other_03",                        event_name: "Justin Bieber World Tour",      venue_name: "Jakarta Convention Center", category_name: "Regular",    booking_date: "2025-10-03 14:00", status: "Dipakai", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { ticket_id: "TKT-009", ticker_code: "TKT-JEANS-009", customer_id: "550e8400-e29b-41d4-a716-446655443004", event_name: "Olivia Rodrigo GUTS Tour",      venue_name: "Sabuga Bandung",            category_name: "CAT 1",      booking_date: "2025-10-07 08:15", status: "Dipesan", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { ticket_id: "TKT-010", ticker_code: "TKT-JEANS-010", customer_id: "cust_other_04",                        event_name: "Kanye West Donda Live",         venue_name: "Sabuga Bandung",            category_name: "CAT 2",      booking_date: "2025-10-10 15:40", status: "Dipakai", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { ticket_id: "TKT-011", ticker_code: "TKT-JEANS-011", customer_id: "550e8400-e29b-41d4-a716-446655443004", event_name: "The Weeknd Starboy Festival",   venue_name: "Sabuga Bandung",            category_name: "Front Row",  booking_date: "2025-10-12 12:00", status: "Dipesan", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { ticket_id: "TKT-012", ticker_code: "TKT-JEANS-012", customer_id: "cust_other_05",                        event_name: "Drake It's All A Blur Tour",    venue_name: "Grand City Surabaya",       category_name: "Regular",    booking_date: "2025-10-15 10:25", status: "Dipakai", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { ticket_id: "TKT-013", ticker_code: "TKT-JEANS-013", customer_id: "550e8400-e29b-41d4-a716-446655443004", event_name: "The Weeknd After Hours Tour",   venue_name: "Jakarta Convention Center", category_name: "WVIP",       booking_date: "2025-10-18 13:55", status: "Dipesan", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { ticket_id: "TKT-014", ticker_code: "TKT-JEANS-014", customer_id: "cust_other_06",                        event_name: "Justin Bieber World Tour",      venue_name: "Jakarta Convention Center", category_name: "VIP",        booking_date: "2025-10-20 17:05", status: "Dipakai", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { ticket_id: "TKT-015", ticker_code: "TKT-JEANS-015", customer_id: "550e8400-e29b-41d4-a716-446655443004", event_name: "Olivia Rodrigo GUTS Tour",      venue_name: "Sabuga Bandung",            category_name: "CAT 1",      booking_date: "2025-10-22 09:30", status: "Dipesan", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { ticket_id: "TKT-016", ticker_code: "TKT-JEANS-016", customer_id: "cust_other_07",                        event_name: "Kanye West Donda Live",         venue_name: "Sabuga Bandung",            category_name: "Gold",       booking_date: "2025-10-24 14:15", status: "Dipakai", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { ticket_id: "TKT-017", ticker_code: "TKT-JEANS-017", customer_id: "550e8400-e29b-41d4-a716-446655443004", event_name: "The Weeknd Starboy Festival",   venue_name: "Sabuga Bandung",            category_name: "Silver",     booking_date: "2025-10-26 11:45", status: "Dipesan", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { ticket_id: "TKT-018", ticker_code: "TKT-JEANS-018", customer_id: "cust_other_08",                        event_name: "Drake It's All A Blur Tour",    venue_name: "Grand City Surabaya",       category_name: "Front Row",  booking_date: "2025-10-28 16:20", status: "Dipakai", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { ticket_id: "TKT-019", ticker_code: "TKT-JEANS-019", customer_id: "550e8400-e29b-41d4-a716-446655443004", event_name: "The Weeknd After Hours Tour",   venue_name: "Jakarta Convention Center", category_name: "Festival",   booking_date: "2025-10-30 13:00", status: "Dipesan", organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { ticket_id: "TKT-020", ticker_code: "TKT-JEANS-020", customer_id: "cust_other_09",                        event_name: "Justin Bieber World Tour",      venue_name: "Jakarta Convention Center", category_name: "Regular",    booking_date: "2025-11-01 08:50", status: "Dipakai", organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
];

// Duplikasi dari src/app/order/page.tsx (tidak di-export di sumbernya)
const dummyOrders: Order[] = [
  { order_id: "550e8400-e29b-41d4-a716-446655449001", order_date: "2025-08-20 10:30:00", payment_status: "Paid",      total_amount: 1500000, customer_id: "550e8400-e29b-41d4-a716-446655443004", customer_name: "Customer Satu",   event_title: "The Weeknd After Hours Tour",   organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { order_id: "550e8400-e29b-41d4-a716-446655449002", order_date: "2025-08-22 14:15:00", payment_status: "Pending",   total_amount: 750000,  customer_id: "550e8400-e29b-41d4-a716-446655445001", customer_name: "Customer Satu",   event_title: "The Weeknd After Hours Tour",   organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { order_id: "550e8400-e29b-41d4-a716-446655449003", order_date: "2025-09-01 09:00:00", payment_status: "Paid",      total_amount: 3000000, customer_id: "550e8400-e29b-41d4-a716-446655445002", customer_name: "Budi Santoso",    event_title: "Justin Bieber World Tour",      organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { order_id: "550e8400-e29b-41d4-a716-446655449004", order_date: "2025-09-05 16:45:00", payment_status: "Cancelled", total_amount: 450000,  customer_id: "550e8400-e29b-41d4-a716-446655445003", customer_name: "Siti Rahayu",    event_title: "Justin Bieber World Tour",      organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { order_id: "550e8400-e29b-41d4-a716-446655449005", order_date: "2025-10-10 11:20:00", payment_status: "Paid",      total_amount: 1200000, customer_id: "550e8400-e29b-41d4-a716-446655445002", customer_name: "Budi Santoso",    event_title: "Olivia Rodrigo GUTS Tour",      organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { order_id: "550e8400-e29b-41d4-a716-446655449006", order_date: "2025-10-12 08:00:00", payment_status: "Pending",   total_amount: 600000,  customer_id: "550e8400-e29b-41d4-a716-446655445004", customer_name: "Andi Pratama",    event_title: "Olivia Rodrigo GUTS Tour",      organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { order_id: "550e8400-e29b-41d4-a716-446655449007", order_date: "2025-11-15 20:00:00", payment_status: "Paid",      total_amount: 2000000, customer_id: "550e8400-e29b-41d4-a716-446655445003", customer_name: "Siti Rahayu",    event_title: "Kanye West Donda Live",         organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { order_id: "550e8400-e29b-41d4-a716-446655449008", order_date: "2025-11-18 13:30:00", payment_status: "Paid",      total_amount: 500000,  customer_id: "550e8400-e29b-41d4-a716-446655445005", customer_name: "Rina Wulandari", event_title: "Kanye West Donda Live",         organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { order_id: "550e8400-e29b-41d4-a716-446655449009", order_date: "2025-12-05 17:00:00", payment_status: "Pending",   total_amount: 1100000, customer_id: "550e8400-e29b-41d4-a716-446655445001", customer_name: "Customer Satu",   event_title: "The Weeknd Starboy Festival",   organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { order_id: "550e8400-e29b-41d4-a716-446655449010", order_date: "2025-12-07 10:10:00", payment_status: "Cancelled", total_amount: 825000,  customer_id: "550e8400-e29b-41d4-a716-446655445004", customer_name: "Andi Pratama",    event_title: "The Weeknd Starboy Festival",   organizer_id: "550e8400-e29b-41d4-a716-446655446001" },
  { order_id: "550e8400-e29b-41d4-a716-446655449011", order_date: "2026-01-12 19:30:00", payment_status: "Paid",      total_amount: 1800000, customer_id: "550e8400-e29b-41d4-a716-446655445002", customer_name: "Budi Santoso",    event_title: "Drake It's All A Blur Tour",   organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
  { order_id: "550e8400-e29b-41d4-a716-446655449012", order_date: "2026-01-13 09:45:00", payment_status: "Pending",   total_amount: 400000,  customer_id: "550e8400-e29b-41d4-a716-446655445005", customer_name: "Rina Wulandari", event_title: "Drake It's All A Blur Tour",   organizer_id: "550e8400-e29b-41d4-a716-446655446002" },
];

// Duplikasi dari src/app/seats/page.tsx
const seatData = [
  { status: "Terisi" as const },
  { status: "Tersedia" as const },
  { status: "Tersedia" as const },
  { status: "Terisi" as const },
];

// Kapasitas venue (dari src/app/venues/page.tsx)
const venueCapacities = [500, 500, 300];

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
    } else {
      setUser((prev) => (prev?.user_id === u.user_id ? prev : u));
    }
  }, [router]);

  if (!user) return null;

  const role = user.role;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <Navbar role={role} />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-2 text-base text-slate-500">
            Selamat datang,{" "}
            <span className="font-semibold text-slate-700">{user.username}</span>.{" "}
            Role:{" "}
            <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
              {role}
            </span>
          </p>
        </div>

        {role === "admin" && <AdminDashboard />}
        {role === "organizer" && <OrganizerDashboard user={user} />}
        {role === "customer" && <CustomerDashboard user={user} />}
      </section>
    </main>
  );
}

// ─── Admin ────────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const omset = dummyOrders
    .filter((o) => o.payment_status === "Paid")
    .reduce((sum, o) => sum + o.total_amount, 0);

  const reservedSeats = seatData.filter((s) => s.status === "Terisi").length;
  const kapasitasTerbesar = Math.max(...venueCapacities);

  return (
    <div className="space-y-8">
      {/* top stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Pengguna" value="4" hint="3 user seed + 1 admin" color="from-blue-500 to-indigo-500" />
        <StatCard label="Total Acara" value={String(eventData.length)} hint="acara terjadwal" color="from-indigo-500 to-purple-500" />
        <StatCard label="Omset Platform" value={formatRp(omset)} hint="total transaksi Paid" color="from-emerald-500 to-teal-500" />
        <StatCard label="Promosi Aktif" value={String(initialPromotions.length)} hint="kode promo terdaftar" color="from-amber-500 to-orange-500" />
      </div>

      {/* infrastruktur venue */}
      <Section title="Infrastruktur Venue" desc="Ringkasan kapasitas venue yang terdaftar di platform.">
        <div className="grid gap-4 md:grid-cols-3">
          <MiniStat label="Total Venue Terdaftar" value={String(venueCapacities.length)} />
          <MiniStat label="Reserved Seating" value={String(reservedSeats)} hint="kursi terisi" />
          <MiniStat label="Kapasitas Terbesar" value={kapasitasTerbesar.toLocaleString("id-ID")} hint="kursi" />
        </div>
        <div className="mt-5">
          <Link href="/venues" className="inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
            Kelola Venue
          </Link>
        </div>
      </Section>

      {/* marketing & promosi */}
      <Section title="Marketing & Promosi" desc="Pantau performa kampanye promo platform.">
        <div className="grid gap-4 md:grid-cols-3">
          <MiniStat
            label="Promo Persentase Aktif"
            value={String(initialPromotions.filter((p) => p.discount_type === "PERCENTAGE").length)}
            hint="kode diskon %"
          />
          <MiniStat
            label="Promo Potongan Nominal Aktif"
            value={String(initialPromotions.filter((p) => p.discount_type === "NOMINAL").length)}
            hint="kode diskon Rp"
          />
          <MiniStat
            label="Total Penggunaan"
            value={`${initialPromotions.reduce((sum, p) => sum + p.usage_count, 0)}×`}
            hint="kali digunakan"
          />
        </div>
        <div className="mt-5">
          <Link href="/promotion" className="inline-flex rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
            Kelola Promosi
          </Link>
        </div>
      </Section>
    </div>
  );
}

// ─── Organizer ────────────────────────────────────────────────────────────────
function OrganizerDashboard({ user }: { user: AuthUser }) {
  const myEvents = eventData.filter((e) => e.organizer_id === user.organizer_id);
  const venuesUsed = new Set(myEvents.map((e) => e.venue_name)).size;

  const myTicketsSold = DUMMY_TICKETS.filter(
    (t) => t.organizer_id === user.organizer_id && t.status === "Dipakai"
  ).length;

  const totalRevenue = dummyOrders
    .filter((o) => o.organizer_id === user.organizer_id && o.payment_status === "Paid")
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Acara Aktif" value={String(myEvents.length)} hint="event milik anda" color="from-blue-500 to-indigo-500" />
        <StatCard label="Total Tiket Terjual" value={String(myTicketsSold)} hint="tiket sudah dipakai" color="from-emerald-500 to-teal-500" />
        <StatCard label="Total Revenue" value={formatRp(totalRevenue)} hint="dari transaksi Paid" color="from-amber-500 to-orange-500" />
        <StatCard label="Venue Mitra Aktif" value={String(venuesUsed)} hint="venue yang dipakai" color="from-rose-500 to-pink-500" />
      </div>

      <Section title="Performa Acara" desc="Daftar event yang Anda kelola beserta data tiket dan revenue.">
        {myEvents.length === 0 ? (
          <EmptyState text="Belum ada acara yang Anda buat." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Judul Event</th>
                    <th className="px-6 py-4">Tanggal & Waktu</th>
                    <th className="px-6 py-4">Venue</th>
                    <th className="px-6 py-4">Tiket Terjual</th>
                    <th className="px-6 py-4">Revenue (Paid)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myEvents.map((e) => {
                    const sold = DUMMY_TICKETS.filter(
                      (t) => t.event_name === e.event_title && t.status === "Dipakai"
                    ).length;
                    const rev = dummyOrders
                      .filter((o) => o.event_title === e.event_title && o.payment_status === "Paid")
                      .reduce((sum, o) => sum + o.total_amount, 0);
                    return (
                      <tr key={e.event_id} className="text-sm text-slate-700">
                        <td className="px-6 py-4 font-semibold text-slate-900">{e.event_title}</td>
                        <td className="px-6 py-4">{e.event_datetime}</td>
                        <td className="px-6 py-4">{e.venue_name}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{sold}</td>
                        <td className="px-6 py-4 font-semibold text-emerald-700">{formatRp(rev)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/events" className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
            Kelola Event Saya
          </Link>
          <Link href="/venues" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Lihat Venue Mitra
          </Link>
        </div>
      </Section>
    </div>
  );
}

// ─── Customer ─────────────────────────────────────────────────────────────────
function CustomerDashboard({ user }: { user: AuthUser }) {
  const myTickets = DUMMY_TICKETS.filter((t) => t.customer_id === user.user_id);
  const tiketAktif = myTickets.filter((t) => t.status === "Dipesan");
  const acaraDiikuti = new Set(myTickets.map((t) => t.event_name)).size;
  const totalBelanja = dummyOrders
    .filter((o) => o.customer_id === user.user_id && o.payment_status === "Paid")
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tiket Aktif" value={String(tiketAktif.length)} hint="tiket belum dipakai" color="from-blue-500 to-indigo-500" />
        <StatCard label="Acara Diikuti" value={String(acaraDiikuti)} hint="event unik" color="from-indigo-500 to-purple-500" />
        <StatCard label="Kode Promo Tersedia" value={String(initialPromotions.length)} hint="promo aktif di platform" color="from-amber-500 to-orange-500" />
        <StatCard label="Total Belanja" value={formatRp(totalBelanja)} hint="dari transaksi Paid" color="from-emerald-500 to-teal-500" />
      </div>

      <Section title="Tiket Mendatang" desc="Tiket Anda yang sudah dipesan dan belum dipakai.">
        {tiketAktif.length === 0 ? (
          <EmptyState text="Belum ada tiket aktif." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Kode Tiket</th>
                    <th className="px-6 py-4">Event</th>
                    <th className="px-6 py-4">Venue</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Tgl Pesan</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tiketAktif.map((t) => (
                    <tr key={t.ticket_id} className="text-sm text-slate-700">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{t.ticker_code}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{t.event_name}</td>
                      <td className="px-6 py-4">{t.venue_name}</td>
                      <td className="px-6 py-4">{t.category_name}</td>
                      <td className="px-6 py-4">{t.booking_date}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/events" className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
            Cari Event
          </Link>
          <Link href="/my-tickets" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Lihat Semua Tiket
          </Link>
        </div>
      </Section>
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  hint,
  color,
  placeholder,
}: {
  label: string;
  value: string;
  hint?: string;
  color: string;
  placeholder?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-1.5 w-full bg-gradient-to-r ${color}`} />
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`mt-3 text-4xl font-bold ${placeholder ? "text-slate-300" : "text-slate-900"}`}>
          {value}
        </p>
        {hint && (
          <p className={`mt-1 text-xs ${placeholder ? "italic text-slate-400" : "text-slate-500"}`}>
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value, hint, placeholder }: { label: string; value: string; hint?: string; placeholder?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${placeholder ? "text-slate-300" : "text-slate-900"}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {placeholder && <p className="mt-1 text-xs italic text-slate-400">dalam pengembangan</p>}
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <p className="text-sm italic text-slate-500">{text}</p>
    </div>
  );
}
