'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { AuthUser, getUser } from "@/lib/auth";

// Dummy Interfaces
export interface DummyTicket {
  ticket_id: string;
  ticker_code: string;
  event_name: string;
  venue_name: string;
  category_name: string;
  booking_date: string;
  status: "Dipesan" | "Dipakai";
  customer_name: string;
  customer_id: string;
  organizer_id: string;
  seat_id?: string;
}

export const DUMMY_TICKETS: DummyTicket[] = [
  {
    ticket_id: "TKT-001",
    ticker_code: "TKT-JEANS-001",
    customer_id: "550e8400-e29b-41d4-a716-446655443004",
    customer_name: "Budi Santoso",
    event_name: "The Weeknd After Hours Tour",
    venue_name: "Jakarta Convention Center",
    category_name: "VIP",
    booking_date: "2025-08-01 14:30",
    status: "Dipesan",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
  },
  {
    ticket_id: "TKT-002",
    ticker_code: "TKT-JEANS-002",
    customer_id: "550e8400-e29b-41d4-a716-446655443004",
    customer_name: "Budi Santoso",
    event_name: "Justin Bieber World Tour",
    venue_name: "Jakarta Convention Center",
    category_name: "Regular",
    booking_date: "2025-08-05 10:15",
    status: "Dipakai",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
  },
  {
    ticket_id: "TKT-003",
    ticker_code: "TKT-JEANS-003",
    customer_id: "cust_other",
    customer_name: "Siti Rahayu",
    event_name: "Olivia Rodrigo GUTS Tour",
    venue_name: "Sabuga Bandung",
    category_name: "Festival",
    booking_date: "2025-09-12 09:00",
    status: "Dipesan",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
  },
  {
    ticket_id: "TKT-004",
    ticker_code: "TKT-JEANS-004",
    customer_id: "cust_other_01",
    customer_name: "Andi Pratama",
    event_name: "Kanye West Donda Live",
    venue_name: "Sabuga Bandung",
    category_name: "Platinum",
    booking_date: "2025-09-15 13:20",
    status: "Dipakai",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
  },
  {
    ticket_id: "TKT-005",
    ticker_code: "TKT-JEANS-005",
    customer_id: "550e8400-e29b-41d4-a716-446655443004",
    customer_name: "Budi Santoso",
    event_name: "The Weeknd Starboy Festival",
    venue_name: "Sabuga Bandung",
    category_name: "Festival",
    booking_date: "2025-09-20 09:45",
    status: "Dipesan",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
  },
  {
    ticket_id: "TKT-006",
    ticker_code: "TKT-JEANS-006",
    customer_id: "cust_other_02",
    customer_name: "Nadia Putri",
    event_name: "Drake It's All A Blur Tour",
    venue_name: "Grand City Surabaya",
    category_name: "VIP",
    booking_date: "2025-09-25 16:10",
    status: "Dipakai",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
  },
  {
    ticket_id: "TKT-007",
    ticker_code: "TKT-JEANS-007",
    customer_id: "550e8400-e29b-41d4-a716-446655443004",
    customer_name: "Budi Santoso",
    event_name: "The Weeknd After Hours Tour",
    venue_name: "Jakarta Convention Center",
    category_name: "VIP",
    booking_date: "2025-10-01 11:30",
    status: "Dipesan",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
  },
  {
    ticket_id: "TKT-008",
    ticker_code: "TKT-JEANS-008",
    customer_id: "cust_other_03",
    customer_name: "Rizky Maulana",
    event_name: "Justin Bieber World Tour",
    venue_name: "Jakarta Convention Center",
    category_name: "Regular",
    booking_date: "2025-10-03 14:00",
    status: "Dipakai",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
  },
  {
    ticket_id: "TKT-009",
    ticker_code: "TKT-JEANS-009",
    customer_id: "550e8400-e29b-41d4-a716-446655443004",
    customer_name: "Budi Santoso",
    event_name: "Olivia Rodrigo GUTS Tour",
    venue_name: "Sabuga Bandung",
    category_name: "CAT 1",
    booking_date: "2025-10-07 08:15",
    status: "Dipesan",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
  },
  {
    ticket_id: "TKT-010",
    ticker_code: "TKT-JEANS-010",
    customer_id: "cust_other_04",
    customer_name: "Maya Sari",
    event_name: "Kanye West Donda Live",
    venue_name: "Sabuga Bandung",
    category_name: "CAT 2",
    booking_date: "2025-10-10 15:40",
    status: "Dipakai",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
  },
  {
    ticket_id: "TKT-011",
    ticker_code: "TKT-JEANS-011",
    customer_id: "550e8400-e29b-41d4-a716-446655443004",
    customer_name: "Budi Santoso",
    event_name: "The Weeknd Starboy Festival",
    venue_name: "Sabuga Bandung",
    category_name: "Front Row",
    booking_date: "2025-10-12 12:00",
    status: "Dipesan",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
  },
  {
    ticket_id: "TKT-012",
    ticker_code: "TKT-JEANS-012",
    customer_id: "cust_other_05",
    customer_name: "Dimas Akbar",
    event_name: "Drake It's All A Blur Tour",
    venue_name: "Grand City Surabaya",
    category_name: "Regular",
    booking_date: "2025-10-15 10:25",
    status: "Dipakai",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
  },
  {
    ticket_id: "TKT-013",
    ticker_code: "TKT-JEANS-013",
    customer_id: "550e8400-e29b-41d4-a716-446655443004",
    customer_name: "Budi Santoso",
    event_name: "The Weeknd After Hours Tour",
    venue_name: "Jakarta Convention Center",
    category_name: "WVIP",
    booking_date: "2025-10-18 13:55",
    status: "Dipesan",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
  },
  {
    ticket_id: "TKT-014",
    ticker_code: "TKT-JEANS-014",
    customer_id: "cust_other_06",
    customer_name: "Salsa Nabila",
    event_name: "Justin Bieber World Tour",
    venue_name: "Jakarta Convention Center",
    category_name: "VIP",
    booking_date: "2025-10-20 17:05",
    status: "Dipakai",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
  },
  {
    ticket_id: "TKT-015",
    ticker_code: "TKT-JEANS-015",
    customer_id: "550e8400-e29b-41d4-a716-446655443004",
    customer_name: "Budi Santoso",
    event_name: "Olivia Rodrigo GUTS Tour",
    venue_name: "Sabuga Bandung",
    category_name: "CAT 1",
    booking_date: "2025-10-22 09:30",
    status: "Dipesan",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
  },
  {
    ticket_id: "TKT-016",
    ticker_code: "TKT-JEANS-016",
    customer_id: "cust_other_07",
    customer_name: "Fahri Ramadhan",
    event_name: "Kanye West Donda Live",
    venue_name: "Sabuga Bandung",
    category_name: "Gold",
    booking_date: "2025-10-24 14:15",
    status: "Dipakai",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
  },
  {
    ticket_id: "TKT-017",
    ticker_code: "TKT-JEANS-017",
    customer_id: "550e8400-e29b-41d4-a716-446655443004",
    customer_name: "Budi Santoso",
    event_name: "The Weeknd Starboy Festival",
    venue_name: "Sabuga Bandung",
    category_name: "Silver",
    booking_date: "2025-10-26 11:45",
    status: "Dipesan",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
  },
  {
    ticket_id: "TKT-018",
    ticker_code: "TKT-JEANS-018",
    customer_id: "cust_other_08",
    customer_name: "Tasya Aulia",
    event_name: "Drake It's All A Blur Tour",
    venue_name: "Grand City Surabaya",
    category_name: "Front Row",
    booking_date: "2025-10-28 16:20",
    status: "Dipakai",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
  },
  {
    ticket_id: "TKT-019",
    ticker_code: "TKT-JEANS-019",
    customer_id: "550e8400-e29b-41d4-a716-446655443004",
    customer_name: "Budi Santoso",
    event_name: "The Weeknd After Hours Tour",
    venue_name: "Jakarta Convention Center",
    category_name: "Festival",
    booking_date: "2025-10-30 13:00",
    status: "Dipesan",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
  },
  {
    ticket_id: "TKT-020",
    ticker_code: "TKT-JEANS-020",
    customer_id: "cust_other_09",
    customer_name: "Reza Nugraha",
    event_name: "Justin Bieber World Tour",
    venue_name: "Jakarta Convention Center",
    category_name: "Regular",
    booking_date: "2025-11-01 08:50",
    status: "Dipakai",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
  },
];

// Dummy config forms
export const DUMMY_ORDERS = [
  { id: "ORD-001", customer: "Budi Santoso", event: "The Weeknd After Hours Tour" },
  { id: "ORD-002", customer: "Siti Rahayu", event: "Olivia Rodrigo GUTS Tour" },
];
export const DUMMY_CATEGORIES = [
  { id: "CAT-1", name: "WVIP", price: 1500000, max_quota: 100, used_quota: 100 },
  { id: "CAT-2", name: "VIP", price: 1000000, max_quota: 200, used_quota: 150 },
  { id: "CAT-3", name: "Regular", price: 500000, max_quota: 500, used_quota: 200 },
];
export const DUMMY_SEATS = [
  { id: "S-1", display: "Section A - Baris 1, No. 1" },
  { id: "S-2", display: "Section A - Baris 1, No. 2" },
  { id: "S-3", display: "Section A - Baris 1, No. 3" },
  { id: "S-4", display: "Section A - Baris 2, No. 1" },
  { id: "S-5", display: "Section A - Baris 2, No. 2" },
  { id: "S-6", display: "Section A - Baris 2, No. 3" },
  { id: "S-7", display: "Section A - Baris 3, No. 1" },
  { id: "S-8", display: "Section A - Baris 3, No. 2" },
  { id: "S-9", display: "Section A - Baris 3, No. 3" },
  { id: "S-10", display: "Section A - Baris 4, No. 1" },
  { id: "S-11", display: "Section B - Baris 1, No. 1" },
  { id: "S-12", display: "Section B - Baris 1, No. 2" },
  { id: "S-13", display: "Section B - Baris 1, No. 3" },
  { id: "S-14", display: "Section B - Baris 2, No. 1" },
  { id: "S-15", display: "Section B - Baris 2, No. 2" },
  { id: "S-16", display: "Section B - Baris 2, No. 3" },
  { id: "S-17", display: "Section B - Baris 3, No. 1" },
  { id: "S-18", display: "Section B - Baris 3, No. 2" },
  { id: "S-19", display: "Section B - Baris 3, No. 3" },
  { id: "S-20", display: "Section B - Baris 4, No. 1" },
  { id: "S-21", display: "Section C - Baris 1, No. 1" },
  { id: "S-22", display: "Section C - Baris 1, No. 2" },
  { id: "S-23", display: "Section C - Baris 1, No. 3" },
  { id: "S-24", display: "Section C - Baris 2, No. 1" },
  { id: "S-25", display: "Section C - Baris 2, No. 2" },
  { id: "S-26", display: "Section C - Baris 2, No. 3" },
  { id: "S-27", display: "Section C - Baris 3, No. 1" },
  { id: "S-28", display: "Section C - Baris 3, No. 2" },
  { id: "S-29", display: "Section C - Baris 3, No. 3" },
  { id: "S-30", display: "Section C - Baris 4, No. 1" },
];

export default function TicketPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<"Semua" | "Dipesan" | "Dipakai">("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [tickets, setTickets] = useState<DummyTicket[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formOrder, setFormOrder] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formSeat, setFormSeat] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
    } else {
      setUser(prev => prev?.user_id === u.user_id ? prev : u);
    }
    setTickets(DUMMY_TICKETS);
    setIsChecking(false);
  }, [router]); 

  if (isChecking) return null;
  if (!user) return null;

  const role = user.role;
  const isStaff = role === "admin" || role === "organizer";
  const isAdmin = role === "admin";

  const visibleTickets = tickets.filter((t) => {
    if (role === "customer" && t.customer_id !== user.user_id) return false;
    if (role === "organizer" && t.organizer_id !== user.organizer_id) return false;
    if (filterStatus !== "Semua" && t.status !== filterStatus) return false;
    const searchLower = searchQuery.toLowerCase();
    if (
      searchQuery &&
      !t.ticker_code.toLowerCase().includes(searchLower) &&
      !t.event_name.toLowerCase().includes(searchLower)
    ) {
      return false;
    }
    return true;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOrder || !formCategory) return;
    
    const selectedOrder = DUMMY_ORDERS.find(o => o.id === formOrder);
    const selectedCat = DUMMY_CATEGORIES.find(c => c.id === formCategory);

    const newTicket: DummyTicket = {
      ticket_id: `TKT-NEW-${Date.now()}`,
      ticker_code: `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      event_name: selectedOrder?.event || "Unknown Event",
      venue_name: "Venue Selected By Organizer",
      category_name: selectedCat?.name || "Unknown Category",
      booking_date: new Date().toISOString().split('T')[0] + " 00:00",
      status: "Dipesan",
      customer_name: selectedOrder?.customer || "Unknown Customer",
      customer_id: "user_new", 
      organizer_id: "org_new",
      seat_id: formSeat === "" ? undefined : formSeat
    };

    setTickets([newTicket, ...tickets]);
    setIsModalOpen(false);
    
    setFormOrder("");
    setFormCategory("");
    setFormSeat("");
  };

  const handleDeleteTicket = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus tiket ini?")) {
      setTickets(tickets.filter(t => t.ticket_id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar role={role} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              {isStaff ? "Manajemen Tiket" : "Tiket Saya"}
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              {isStaff 
                ? "Kelola semua tiket customer dengan mudah dari satu dashboard" 
                : "Daftar tiket yang telah Anda pesan dan gunakan"}
            </p>
          </div>
          
          {isStaff && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm shadow-blue-200"
            >
              <span>+</span>
              Tambah Tiket
            </button>
          )}
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input
              type="text"
              placeholder="Filter by kode atau nama event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl overflow-x-auto">
            {["Semua", "Dipesan", "Dipakai"].map((f) => (
              <button
                key={f}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setFilterStatus(f as any)}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  filterStatus === f
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {visibleTickets.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th scope="col" className="px-6 py-4">Kode Tiket</th>
                    <th scope="col" className="px-6 py-4">Event & Venue</th>
                    {isStaff && <th scope="col" className="px-6 py-4">Pelanggan</th>}
                    <th scope="col" className="px-6 py-4">Kategori & Tgl</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    {isAdmin && <th scope="col" className="px-6 py-4 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {visibleTickets.map((ticket) => (
                    <tr 
                      key={ticket.ticket_id} 
                      className={`hover:bg-slate-50/50 transition-colors ${ticket.status === 'Dipakai' ? 'opacity-70' : ''}`}
                    >
                      <td className="px-6 py-5 align-top">
                        <span className="font-mono font-semibold text-slate-900">{ticket.ticker_code}</span>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="font-bold text-slate-900 mb-1">{ticket.event_name}</div>
                        <div className="text-slate-500 text-xs">{ticket.venue_name}</div>
                      </td>
                      {isStaff && (
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                              {ticket.customer_name.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-800 break-words line-clamp-1">{ticket.customer_name}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-5 align-top">
                        <div className="inline-flex py-1 px-2.5 bg-slate-100 rounded-lg text-slate-700 font-medium mb-2 w-max text-xs">
                          {ticket.category_name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 break-words line-clamp-1">
                          {ticket.booking_date}
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            ticket.status === "Dipakai"
                              ? "bg-slate-100 text-slate-500 border border-slate-200"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          }`}
                        >
                          {ticket.status === "Dipakai" ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                          )}
                          {ticket.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-5 align-top text-right whitespace-nowrap">
                          <button
                            onClick={() => router.push(`/my-tickets/${ticket.ticket_id}/edit`)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors mr-2 border border-slate-300 shadow-sm"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteTicket(ticket.ticket_id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-red-200 shadow-sm"
                          >
                            Hapus
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Tidak ada tiket</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              Belum ada data tiket yang tersedia untuk ditampilkan.
            </p>
          </div>
        )}
      </main>

      {/* Modal Tambah Tiket */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-full overflow-y-auto relative p-0 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Buat Tiket Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 bg-slate-50 rounded-full hover:bg-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">1</span>
                    Pilih Order
                  </label>
                  <select 
                    value={formOrder}
                    onChange={(e) => setFormOrder(e.target.value)}
                    required
                    className="w-full border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer bg-slate-50"
                  >
                    <option value="" disabled>Pilih transaksi customer...</option>
                    {DUMMY_ORDERS.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.id} — {o.customer} — {o.event}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">2</span>
                    Kategori Tiket
                  </label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    required
                    className="w-full border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:bg-slate-50 cursor-pointer bg-slate-50"
                  >
                    <option value="" disabled>Pilih kategori & cek kuota...</option>
                    {DUMMY_CATEGORIES.map(c => {
                      const isFull = c.used_quota >= c.max_quota;
                      return (
                         <option key={c.id} value={c.id} disabled={isFull} className={isFull ? "text-slate-400" : ""}>
                          {c.name} — Rp {c.price.toLocaleString('id-ID')} — ({c.used_quota}/{c.max_quota}) {isFull ? "[PENUH]" : ""}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                  <label className="flex items-center justify-between text-sm font-semibold text-slate-800 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500 border border-slate-200">3</span>
                      Kursi (Reserved Seating)
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-200 text-slate-500">Opsional</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-3 pl-7">Abaikan jika venue tidak menggunakan format reserved seating.</p>
                  <div className="pl-7">
                    <select 
                      value={formSeat}
                      onChange={(e) => setFormSeat(e.target.value)}
                      className="w-full border border-slate-300 text-slate-700 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer bg-white"
                    >
                      <option value="">Tidak assign kursi</option>
                      {DUMMY_SEATS.map(s => (
                        <option key={s.id} value={s.id}>{s.display}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button
                   type="button"
                  onClick={() => setIsModalOpen(false)}
                   className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                   className="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                >
                  Buat Tiket Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}