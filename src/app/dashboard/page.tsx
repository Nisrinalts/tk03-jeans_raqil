"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getUser, AuthUser } from "@/lib/auth";

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
  venue_id: string;
  venue_name: string;
  organizer_id: string;
};

type Order = {
  order_id: string;
  order_date: string;
  payment_status: "Pending" | "Paid" | "Cancelled";
  total_amount: number | string;
  customer_id: string;
  customer_name: string;
  event_title: string;
  organizer_id: string;
};

type Ticket = {
  ticket_id: string;
  ticket_code: string;
  cust_user_id: string;
  customer_id: string;
  organizer_id: string;
  event_title: string;
  venue_name: string;
  category_name: string;
  booking_date?: string;
  status?: "Dipesan" | "Dipakai";
};

type Venue = {
  venue_id: string;
  venue_name?: string;
  name?: string;
  capacity: number;
  city?: string;
};

type Seat = {
  seat_id: string;
  status: "Terisi" | "Tersedia" | string;
};

type DashboardData = {
  events: EventDisplay[];
  orders: Order[];
  tickets: Ticket[];
  promotions: Promotion[];
  seats: Seat[];
  venues: Venue[];
  customerEntityId: string | null;
  loading: boolean;
};

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function toNum(v: number | string | undefined | null): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function useDashboardData(user: AuthUser | null): DashboardData {
  const [data, setData] = useState<DashboardData>({
    events: [],
    orders: [],
    tickets: [],
    promotions: [],
    seats: [],
    venues: [],
    customerEntityId: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const baseFetches: Promise<unknown>[] = [
          fetch("/api/events").then((r) => r.json()).catch(() => []),
          fetch("/api/order").then((r) => r.json()).catch(() => []),
          fetch("/api/ticket").then((r) => r.json()).catch(() => []),
          fetch("/api/promotion").then((r) => r.json()).catch(() => []),
          fetch("/api/seat").then((r) => r.json()).catch(() => []),
          fetch("/api/venues").then((r) => r.json()).catch(() => []),
        ];

        if (user.role === "customer") {
          baseFetches.push(
            fetch(`/api/customer?user_id=${encodeURIComponent(user.user_id)}`)
              .then((r) => r.json())
              .catch(() => null)
          );
        }

        const results = await Promise.all(baseFetches);
        if (cancelled) return;

        const [events, orders, tickets, promotions, seats, venues, customer] =
          results;

        setData({
          events: arr<EventDisplay>(events),
          orders: arr<Order>(orders),
          tickets: arr<Ticket>(tickets),
          promotions: arr<Promotion>(promotions),
          seats: arr<Seat>(seats),
          venues: arr<Venue>(venues),
          customerEntityId:
            user.role === "customer" &&
            customer &&
            typeof customer === "object" &&
            "customer_id" in customer
              ? (customer as { customer_id: string }).customer_id
              : null,
          loading: false,
        });
      } catch (e) {
        console.error("Dashboard fetch error:", e);
        if (!cancelled) setData((d) => ({ ...d, loading: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return data;
}

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

  const data = useDashboardData(user);

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

        {data.loading ? (
          <LoadingDashboard />
        ) : (
          <>
            {role === "admin" && <AdminDashboard data={data} />}
            {role === "organizer" && <OrganizerDashboard user={user} data={data} />}
            {role === "customer" && <CustomerDashboard user={user} data={data} />}
          </>
        )}
      </section>
    </main>
  );
}

function LoadingDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-3xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-[28px] border border-slate-200 bg-white" />
      <p className="text-center text-sm italic text-slate-400">Memuat data dashboard…</p>
    </div>
  );
}

function AdminDashboard({ data }: { data: DashboardData }) {
  const { events, orders, promotions, seats, venues } = data;

  const omset = orders
    .filter((o) => o.payment_status === "Paid")
    .reduce((sum, o) => sum + toNum(o.total_amount), 0);

  const reservedSeats = seats.filter((s) => s.status === "Terisi").length;
  const kapasitasTerbesar = venues.length
    ? Math.max(...venues.map((v) => toNum(v.capacity)))
    : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Pengguna" value="4" hint="3 user seed + 1 admin" color="from-blue-500 to-indigo-500" />
        <StatCard label="Total Acara" value={String(events.length)} hint="acara terjadwal" color="from-indigo-500 to-purple-500" />
        <StatCard label="Omset Platform" value={formatRp(omset)} hint="total transaksi Paid" color="from-emerald-500 to-teal-500" />
        <StatCard label="Promosi Aktif" value={String(promotions.length)} hint="kode promo terdaftar" color="from-amber-500 to-orange-500" />
      </div>

      <Section title="Infrastruktur Venue" desc="Ringkasan kapasitas venue yang terdaftar di platform.">
        <div className="grid gap-4 md:grid-cols-3">
          <MiniStat label="Total Venue Terdaftar" value={String(venues.length)} />
          <MiniStat label="Reserved Seating" value={String(reservedSeats)} hint="kursi terisi" />
          <MiniStat label="Kapasitas Terbesar" value={kapasitasTerbesar.toLocaleString("id-ID")} hint="kursi" />
        </div>
        <div className="mt-5">
          <Link href="/venues" className="inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
            Kelola Venue
          </Link>
        </div>
      </Section>

      <Section title="Marketing & Promosi" desc="Pantau performa kampanye promo platform.">
        <div className="grid gap-4 md:grid-cols-3">
          <MiniStat
            label="Promo Persentase Aktif"
            value={String(promotions.filter((p) => p.discount_type === "PERCENTAGE").length)}
            hint="kode diskon %"
          />
          <MiniStat
            label="Promo Potongan Nominal Aktif"
            value={String(promotions.filter((p) => p.discount_type === "NOMINAL").length)}
            hint="kode diskon Rp"
          />
          <MiniStat
            label="Total Penggunaan"
            value={`${promotions.reduce((sum, p) => sum + toNum(p.usage_count), 0)}×`}
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

function OrganizerDashboard({ user, data }: { user: AuthUser; data: DashboardData }) {
  const { events, orders, tickets } = data;

  const myEvents = events.filter((e) => e.organizer_id === user.organizer_id);
  const venuesUsed = new Set(myEvents.map((e) => e.venue_name)).size;

  const myTicketsSold = tickets.filter(
    (t) => t.organizer_id === user.organizer_id && (t.status === "Dipakai" || !t.status)
  ).length;

  const totalRevenue = orders
    .filter((o) => o.organizer_id === user.organizer_id && o.payment_status === "Paid")
    .reduce((sum, o) => sum + toNum(o.total_amount), 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Acara Aktif" value={String(myEvents.length)} hint="event milik anda" color="from-blue-500 to-indigo-500" />
        <StatCard label="Total Tiket Terjual" value={String(myTicketsSold)} hint="tiket terdata" color="from-emerald-500 to-teal-500" />
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
                    const sold = tickets.filter(
                      (t) =>
                        t.event_title === e.event_title &&
                        (t.status === "Dipakai" || !t.status)
                    ).length;
                    const rev = orders
                      .filter(
                        (o) => o.event_title === e.event_title && o.payment_status === "Paid"
                      )
                      .reduce((sum, o) => sum + toNum(o.total_amount), 0);
                    return (
                      <tr key={e.event_id} className="text-sm text-slate-700">
                        <td className="px-6 py-4 font-semibold text-slate-900">{e.event_title}</td>
                        <td className="px-6 py-4">{String(e.event_datetime).replace("T", " ")}</td>
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

function CustomerDashboard({ user, data }: { user: AuthUser; data: DashboardData }) {
  const { tickets, orders, promotions, customerEntityId } = data;

  const myTickets = tickets.filter((t) => t.cust_user_id === user.user_id);
  const tiketAktif = myTickets.filter((t) => t.status === "Dipesan" || !t.status);
  const acaraDiikuti = new Set(myTickets.map((t) => t.event_title)).size;

  const totalBelanja = orders
    .filter(
      (o) =>
        customerEntityId != null &&
        o.customer_id === customerEntityId &&
        o.payment_status === "Paid"
    )
    .reduce((sum, o) => sum + toNum(o.total_amount), 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tiket Aktif" value={String(tiketAktif.length)} hint="tiket belum dipakai" color="from-blue-500 to-indigo-500" />
        <StatCard label="Acara Diikuti" value={String(acaraDiikuti)} hint="event unik" color="from-indigo-500 to-purple-500" />
        <StatCard label="Kode Promo Tersedia" value={String(promotions.length)} hint="promo aktif di platform" color="from-amber-500 to-orange-500" />
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
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tiketAktif.map((t) => (
                    <tr key={t.ticket_id ?? t.ticket_code} className="text-sm text-slate-700">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{t.ticket_code}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{t.event_title}</td>
                      <td className="px-6 py-4">{t.venue_name}</td>
                      <td className="px-6 py-4">{t.category_name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                          {t.status ?? "Dipesan"}
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
