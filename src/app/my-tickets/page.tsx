'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { AuthUser, getUser } from "@/lib/auth";
import { Ticket } from "@/types/ticket";


const retrieveEvents = async () => {
  try {
    const response = await fetch("/api/ticket-categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Event Response Status:", response.status);
    if (response.ok) {
      const data = await response.json();
      const events = data["events"] || [];
      return events;
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  } 
};

const retrieveOrder = async () => {
  try {
    const response = await fetch("/api/order", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Order Response Status:", response.status);
    if (response.ok) {
      const data = await response.json();
      const orders = data;
      return orders;
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  } 
};
const retrieveCust = async (user : any) => {
  try {
    const response = await fetch(`/api/customer?user_id=${user.user_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("cust Response Status:", response.status);
    if (response.ok) {
      const data = await response.json();
      const customers = data;
      return customers;
    }
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  } 
};

const retrieveTickets = async () => {
  try {
    const response = await fetch("/api/ticket", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("API Response Status:", response.status);
    if (response.ok) {
      const data = await response.json();
      const tickets = data
      return tickets;
    }
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return [];
  } 
};

const retrieveCategories = async () => {
  try {
    const response = await fetch("/api/ticket-categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("API Response Status (Categories):", response.status);
    if (response.ok) {
      const data = await response.json();
      return data["ticketCategories"] || [];
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export default function TicketPage() {
    // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createOrderId, setCreateOrderId] = useState("");
  const [createCategoryId, setCreateCategoryId] = useState("");
  const [createSeat, setCreateSeat] = useState<string>("");
  const [createStatus, setCreateStatus] = useState<"Dipesan" | "Dipakai">("Dipesan");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);
  const [editStatus, setEditStatus] = useState<"Dipesan" | "Dipakai">("Dipesan");
  const [editSeat, setEditSeat] = useState<string>("");

  const [order, setOrder] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]); 
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);

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
    const loadData = async () => {
      const data = await retrieveTickets(); // Tunggu promise selesai
      if (data) {
        setTickets(data); // Simpan hasil objek normal ke state
      }
      setIsChecking(false);
    };

    const loadCategories = async () => {
      const data = await retrieveCategories();
      setCategories(data);
      // Simpan kategori jika diperlukan
    };

    const loadEvents = async () => {
      const data = await retrieveEvents();
      setEvents(data);
    };

    const loadOrders = async () => {
      const data = await retrieveOrder();
      setOrder(data);
    };

    const loadCustomer = async (u: any) => {
      const data = await retrieveCust(u);
      setCustomer(data);
    };

    loadEvents();
    loadOrders();
    if (u){
      loadCustomer(u);
    }
    loadCategories();
    loadData();
  }, [router]);

  if (isChecking) return null;
  if (!user) return null;

  const role = user.role;
  console.log("User Role:", role);
  const isStaff = role === "admin" || role === "organizer";
  const isAdmin = role === "admin";

  tickets.forEach((t) => {
     categories.forEach((c) => {
       if (t.tcategory_id == c.category_id) {
         t.tcategory_name = c.category_name;
         events.forEach((e) => {
            if (c.event_id == e.event_id) {
              t.event_name = e.event_title;
            }
         });
       }
       order.forEach((o) => {
         if (t.torder_id == o.order_id) {
           t.customer_id = o.customer_id;
         }
         if (t.customer_id == customer.customer_id) {
           t.user_id = customer.user_id;
         }
       });
     });
   });
  const visibleTickets = tickets.filter((t) => {
    if (role === "customer" && t.user_id !== user.user_id) return false;
      if (role === "organizer" && t.user_id !== user.organizer_id) return false;
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

  // .filter((t) => {
  //   if (role === "customer" && t.customer_id !== user.user_id) return false;
  //   if (role === "organizer" && t.organizer_id !== user.organizer_id) return false;
  //   if (filterStatus !== "Semua" && t.status !== filterStatus) return false;
  //   const searchLower = searchQuery.toLowerCase();
  //   if (
  //     searchQuery &&
  //     !t.ticker_code.toLowerCase().includes(searchLower) &&
  //     !t.event_name.toLowerCase().includes(searchLower)
  //   ) {
  //     return false;
  //   }
  //   return true;
  // });

  // const handleOpenEditModal = (ticket: DummyTicket) => {
  //   setTicketToEdit(ticket);
  //   setEditStatus(ticket.status);
  //   setEditSeat(ticket.seat_id || "");
  //   setIsEditModalOpen(true);
  // };

  // const handleUpdateTicket = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!ticketToEdit) return;
    
  //   const updatedTickets = tickets.map(t => {
  //     if (t.ticket_id === ticketToEdit.ticket_id) {
  //       return { ...t, status: editStatus, seat_id: editSeat === "" ? undefined : editSeat };
  //     }
  //     return t;
  //   });

  //   setTickets(updatedTickets);
  //   setIsEditModalOpen(false);
  //   setTicketToEdit(null);
  // };
  
  // const handleCreateTicket = (e: React.FormEvent) => {
    // e.preventDefault();
    // if (!formOrder || !formCategory) return;
    
    // const selectedOrder = DUMMY_ORDERS.find(o => o.id === formOrder);
    // const selectedCat = DUMMY_CATEGORIES.find(c => c.id === formCategory);

    // const newTicket: Ticket = {
    //   ticket_id: `TKT-NEW-${Date.now()}`,
    //   ticket_code: `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    //   event_name: selectedOrder?.event || "Unknown Event",
    //   venue_name: "Venue Selected By Organizer",
    //   category_name: selectedCat?.name || "Unknown Category",
    //   booking_date: new Date().toISOString().split('T')[0] + " 00:00",
    //   status: "Dipesan",
    //   customer_name: selectedOrder?.customer || "Unknown Customer",
    //   customer_id: "user_new", 
    //   organizer_id: "org_new",
    //   seat_id: formSeat === "" ? undefined : formSeat
    // };

  //   setTickets([newTicket, ...tickets]);
  //   setIsModalOpen(false);
    
  //   setFormOrder("");
  //   setFormCategory("");
  //   setFormSeat("");
  // };

  // const handleDeleteTicket = (id: string) => {
  //   if (confirm("Apakah Anda yakin ingin menghapus tiket ini?")) {
  //     setTickets(visibleTickets.filter(t => t.ticket_id !== id));
  //   }
  // };
  if (!isStaff && !isAdmin) {
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
                className="w-full text-sm text-gray-600 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
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
                      <th scope="col" className="px-6 py-4">Order ID</th>
                      <th scope="col" className="px-6 py-4">Event</th>
                      <th scope="col" className="px-6 py-4">Kategori</th>
                      {/* <th scope="col" className="px-6 py-4">Status</th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {visibleTickets.map((ticket) => (
                      <tr 
                        key={ticket.ticket_id} 
                        className={`hover:bg-slate-50/50 transition-colors ${ticket.status === 'Dipakai' ? 'opacity-70' : ''}`}
                      >
                        <td className="px-6 py-5 align-top">
                          <span className="font-mono font-semibold text-slate-900">{ticket.ticket_code}</span>
                        </td>
                        <td className="px-6 py-5 align-top">
                          {/* <div className="font-bold text-slate-900 mb-1">{ticket.event_name}</div>
                          <div className="text-slate-500 text-xs">{ticket.venue_name}</div> */}
                          <span className="font-bold text-slate-900 mb-1">{ticket.torder_id}</span>
                        </td>

                        <td className="px-6 py-5 align-top">
                          {/* <div className="font-bold text-slate-900 mb-1">{ticket.event_name}</div>
                          <div className="text-slate-500 text-xs">{ticket.venue_name}</div> */}
                          <span className="font-bold text-slate-900 mb-1">{ticket.event_name}</span>
                        </td>
                        
                        <td className="px-6 py-5 align-top">
                          {/* <div className="inline-flex py-1 px-2.5 bg-slate-100 rounded-lg text-slate-700 font-medium mb-2 w-max text-xs">
                            {ticket.category_name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 break-words line-clamp-1">
                            {ticket.booking_date}
                          </div> */}
                          <span className="font-medium text-slate-900 mb-1">{ticket.tcategory_name}</span>
                        </td>
                        {/* <td className="px-6 py-5 align-top">
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
                        </td> */}
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
      </div>
    );
  } else {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar role={user.role} />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
          
          <div className="mb-6 border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Daftar Tiket Pelanggan</h1>
              <p className="text-sm text-slate-500 mt-2">
                Kelola status dan alokasi kursi untuk tiket yang telah dipesan oleh pelanggan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              <span className="text-base leading-none">+</span>
              Tambah Tiket
            </button>
          </div>
  
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="px-6 py-4">Kode Tiket</th>
                    <th className="px-6 py-4">Pelanggan</th>
                    <th className="px-6 py-4">Event & Kategori</th>
                    <th className="px-6 py-4">Status</th>
                    {isAdmin && <th className="px-6 py-4 text-right">Organizer</th>}
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleTickets.map(ticket => (
                    <tr key={ticket.ticket_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-slate-800">
                        {ticket.ticker_code}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {ticket.customer_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{ticket.event_name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{ticket.venue_name} - {ticket.category_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          ticket.status === 'Dipesan' 
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'Dipesan' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                          {ticket.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right text-sm text-slate-600">
                          {ticket.organizer_id === "550e8400-e29b-41d4-a716-446655446001" ? "Organizer A" : "Organizer B"}
                        </td>
                      )}
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleOpenEditModal(ticket)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Kursi"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                         <button 
                          onClick={() => handleDeleteTicket(ticket.ticket_id)}
                          disabled={ticket.status === "Dipakai"}
                          className={`p-2 rounded-lg transition-colors ${
                            ticket.status === "Dipakai" 
                              ? "text-slate-300 cursor-not-allowed" 
                              : "text-red-500 hover:bg-red-50"
                          }`}
                          title={ticket.status === "Dipakai" ? "Tiket telah dipakai dan tidak dapat dihapus." : "Hapus Tiket"}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tickets.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Belum ada tiket yang terdaftar.
              </div>
            )}
          </div>
        </main>
  
        {/* Edit Modal */}
        {isEditModalOpen && ticketToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800">Update Tiket</h2>
                <button 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setTicketToEdit(null);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <form id="editTicketForm" onSubmit={handleUpdateTicket} className="space-y-6">
                  
                  {/* Read Only Info Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kode Tiket</label>
                      <p className="font-mono font-bold text-slate-800">{ticketToEdit.ticker_code}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pelanggan</label>
                      <p className="font-medium text-slate-800">{ticketToEdit.customer_name}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Event & Kategori</label>
                      <p className="font-semibold text-slate-800">{ticketToEdit.event_name}</p>
                      <p className="text-slate-600 text-xs mt-0.5">{ticketToEdit.venue_name} \&mdash; {ticketToEdit.category_name}</p>
                    </div>
                  </div>
  
                  <div className="h-px bg-slate-100 w-full" />
  
                  {/* Editable Fields */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Status Tiket</label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={`
                          flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all
                          ${editStatus === 'Dipesan' 
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' 
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}
                        `}>
                          <input 
                            type="radio" 
                            name="status" 
                            value="Dipesan"
                            checked={editStatus === 'Dipesan'}
                            onChange={() => setEditStatus('Dipesan')}
                            className="hidden"
                          />
                          <span className="font-bold text-sm flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${editStatus === 'Dipesan' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            Dipesan
                          </span>
                        </label>
  
                        <label className={`
                          flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all
                          ${editStatus === 'Dipakai' 
                            ? 'border-slate-800 bg-slate-100 text-slate-800' 
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}
                        `}>
                          <input 
                            type="radio" 
                            name="status" 
                            value="Dipakai"
                            checked={editStatus === 'Dipakai'}
                            onChange={() => setEditStatus('Dipakai')}
                            className="hidden"
                          />
                          <span className="font-bold text-sm flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${editStatus === 'Dipakai' ? 'bg-slate-700' : 'bg-slate-300'}`} />
                            Dipakai
                          </span>
                        </label>
                      </div>
                    </div>
  
                    <div>
                      <label className="flex items-center justify-between text-sm font-semibold text-slate-800 mb-2">
                        Alokasi Kursi
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">Opsional</span>
                      </label>
                      <select 
                        value={editSeat}
                        onChange={(e) => setEditSeat(e.target.value)}
                        className="w-full border-2 border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none cursor-pointer bg-white transition-all font-medium appearance-none"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                      >
                        <option value="">Tanpa Kursi (General Admission)</option>
                        {DUMMY_SEATS.map(s => (
                          <option key={s.id} value={s.id}>{s.display}</option>
                        ))}
                      </select>
                    </div>
                  </div>
  
                </form>
              </div>
              
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setTicketToEdit(null);
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="editTicketForm"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-200"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800">Tambah Tiket Baru</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
  
              <div className="p-6 overflow-y-auto flex-1">
                <form id="createTicketForm" onSubmit={handleCreateTicket} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Order</label>
                    <select
                      required
                      value={createOrderId}
                      onChange={(e) => setCreateOrderId(e.target.value)}
                      className="w-full border-2 border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none cursor-pointer bg-white transition-all font-medium"
                    >
                      <option value="">Pilih order</option>
                      {DUMMY_ORDERS.map((order) => (
                        <option key={order.id} value={order.id}>{order.id} - {order.customer} ({order.event})</option>
                      ))}
                    </select>
                  </div>
  
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Kategori Tiket</label>
                    <select
                      required
                      value={createCategoryId}
                      onChange={(e) => setCreateCategoryId(e.target.value)}
                      className="w-full border-2 border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none cursor-pointer bg-white transition-all font-medium"
                    >
                      <option value="">Pilih kategori</option>
                      {DUMMY_CATEGORIES.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
  
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Status</label>
                    <select
                      value={createStatus}
                      onChange={(e) => setCreateStatus(e.target.value as "Dipesan" | "Dipakai")}
                      className="w-full border-2 border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none cursor-pointer bg-white transition-all font-medium"
                    >
                      <option value="Dipesan">Dipesan</option>
                      <option value="Dipakai">Dipakai</option>
                    </select>
                  </div>
  
                  <div>
                    <label className="flex items-center justify-between text-sm font-semibold text-slate-800 mb-2">
                      Alokasi Kursi
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">Opsional</span>
                    </label>
                    <select
                      value={createSeat}
                      onChange={(e) => setCreateSeat(e.target.value)}
                      className="w-full border-2 border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none cursor-pointer bg-white transition-all font-medium"
                    >
                      <option value="">Tanpa Kursi (General Admission)</option>
                      {DUMMY_SEATS.map((seat) => (
                        <option key={seat.id} value={seat.id}>{seat.display}</option>
                      ))}
                    </select>
                  </div>
                </form>
              </div>
  
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="createTicketForm"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-200"
                >
                  Simpan Tiket
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}