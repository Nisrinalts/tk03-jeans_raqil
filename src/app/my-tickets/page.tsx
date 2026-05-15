'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { AuthUser, getUser } from "@/lib/auth";
import LoadingState from "@/components/LoadingState";
import toast from "react-hot-toast";

const retrievHaseRelationship = async () => {
  try {
    const response = await fetch("/api/has-relationship", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("API Response Status:", response.status);
    if (response.ok) {
      const data = await response.json();
      const relationships = data
      return relationships;
    }
  } catch (error) {
    console.error("Error fetching has-relationship:", error);
    return [];
  }
}

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
    return error;
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
    console.log("API Response Status:", response.status);
    if (response.ok) {
      const data = await response.json();
      const categories = data["ticketCategories"];
      return categories;
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
const retrieveOrders = async () => {
  try {
    const response = await fetch("/api/order", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("API Response Status:", response.status);
    if (response.ok) {
      const data = await response.json();
      const orders = data
      return orders;
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

const retrieveSeats = async () => {
  try {
    const res = await fetch("/api/seat");
    if (res.ok) {
      const data = await res.json();
      console.log("Seats fetch status:", res.status);
      return data;
    }
  } catch (error) {
    console.error("Error fetching seats:", error);
    throw error;
  }
};

interface ExtendedTicket {
  ticket_id: string;
  ticket_code: string;
  status: string;
  seat_id?: string;
  tcategory_id?: string;
  torder_id?: string;
  event_title: string;
  venue_name: string;
  category_name: string;
  cust_user_id?: string;
  org_user_id?: string;
  full_name?: string;
  organizer_id?: string;
  [key: string]: any;
}

export default function TicketPage() {
    // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createOrderId, setCreateOrderId] = useState("");
  const [createCategoryId, setCreateCategoryId] = useState("");
  const [createSeat, setCreateSeat] = useState<string>("");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState<ExtendedTicket | null>(null);
  const [editStatus, setEditStatus] = useState<string>("Valid");
  const [editSeat, setEditSeat] = useState<string>("");

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<ExtendedTicket | null>(null);

  const [hasRelationships, setHasRelationships] = useState<Record<string, any>[]>([]);
  const [seats, setSeats] = useState<Record<string, any>[]>([]);
  const [orders, setOrders] = useState<Record<string, any>[]>([]);
  const [tickets, setTickets] = useState<ExtendedTicket[]>([]); 
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const [categories, setCategories] = useState<Record<string, any>[]>([]);

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
        for (let i = 0; i < data.length; i++) {
          if (i % 3 == 0) {
            data[i].status = "Dipakai";
          }else {
            data[i].status = "Dipesan";
          }
        }
        data.sort((a: ExtendedTicket, b: ExtendedTicket) => (a.ticket_code > b.ticket_code ? 1 : -1));
        setTickets(data); 
      } // 
      setLoading(false);
      setIsChecking(false);
    };

    const loadCategories = async () => {
      const data = await retrieveCategories();
      if (data) {
        setCategories(data);
      }
    }

    const loadRelationships = async () => {
      const data = await retrievHaseRelationship();
      if (data) {
        setHasRelationships(data);
      }
    }

    const loadOrders = async () => {
      const data = await retrieveOrders();
      if (data) {
        setOrders(data);
      }
    }

    const loadSeats = async () => {
      try {
        const data = await retrieveSeats();
        if (data) {
          setSeats(data);
        }
      } catch (error) {
        console.error("Failed to load seats:", error);
      }
    }

    loadData();
    loadCategories();
    loadOrders();
    loadSeats();
    loadRelationships();
  }, [router]);

  if (!user) return null;
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar role={user.role} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
          <LoadingState message="Memuat data tiket..." />
        </main>
      </div>
    );
  }

  const role = user.role;
  console.log("User Role:", role);
  const isStaff = role === "admin" || role === "organizer";
  const isAdmin = role === "admin";

  const visibleTickets = tickets.filter((t) => {
    const searchLower = searchQuery.toLowerCase();
    if (
      searchQuery &&
      !t.ticket_code.toLowerCase().includes(searchLower) &&
      !t.event_title.toLowerCase().includes(searchLower)
    ) {
      return false;
    }

    // Terapkan filter status
    if (role === "admin") return true;
    if (role === "customer" && t.cust_user_id !== user.user_id) return false;
    if (role === "organizer" && t.org_user_id !== user.user_id) return false;
    if (filterStatus == "Semua") return true;
    if (filterStatus === "Dipakai" && t.status == "Dipakai") return true;
    if (filterStatus === "Dipesan" && t.status == "Dipesan") return true; 
    

    
  });

  const handleOpenEditModal = (ticket: ExtendedTicket) => {
    setTicketToEdit(ticket);
    setEditStatus(ticket.status);
    setEditSeat(ticket.seat_id || "");
    setIsEditModalOpen(true);
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketToEdit) return;
    
    const updatedTickets = tickets.map(t => {
      if (t.ticket_id === ticketToEdit.ticket_id) {
        return { ...t, status: editStatus, seat_id: editSeat === "" ? undefined : editSeat };
      }
      return t;
    });

    const payload = {
      ticket_id: ticketToEdit.ticket_id,
      status: editStatus,
      seat_id: editSeat === "" ? null : editSeat
    };

    if (editSeat !== "") {
      const postPayload = {
        seat_id: editSeat,
        ticket_id: ticketToEdit.ticket_id
      };
      try {
        const response = await fetch("/api/has-relationship", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(postPayload)
        });
      } catch (error) {
        console.error("Error updating has-relationship:", error);
      }
    } else {
      try {
        const response = await fetch("/api/has-relationship", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ ticket_id: ticketToEdit.ticket_id })
        });
      } catch (error) {
        console.error("Error deleting has-relationship:", error);
      }
    }

    try {
      const response = await fetch("/api/ticket", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    }
    catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Gagal memperbarui tiket. Silakan coba lagi.");
      return;
    }
    setTickets(updatedTickets);
    setIsEditModalOpen(false);
    toast.success("Tiket berhasil diperbarui!");
    setTicketToEdit(null);
  };
  
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createOrderId || !createCategoryId) {
      toast.error("Pilih kategori dan order terlebih dahulu.");
      return;
    }

    let serNum = "001";
    const lastTicketCode = tickets[tickets.length - 1]?.ticket_code; 
    if (lastTicketCode) {
      serNum = (parseInt(lastTicketCode.slice(-3)) + 1).toString().padStart(3, '0');
    }
    try {
      const ticketCode = `TKT-JEANS-${serNum.toString().padStart(3, '0')}`;
      const payload = {
        ticket_code: ticketCode,
        tcategory_id: createCategoryId,
        torder_id: createOrderId
      };
      let response;
      try {
          response = await fetch("/api/ticket", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.error("Error creating ticket:", error);
        toast.error(String(error.message || "Gagal membuat tiket. Silakan coba lagi."));
        return;
      }

      if (response.ok) {
        const updatedTickets = await retrieveTickets();
        setTickets(updatedTickets || []);
        const recent = updatedTickets.filter((t: ExtendedTicket) => t.ticket_code === ticketCode)[0];
        // Refresh \
        if (createSeat !== "") {
          const responseSeat = await fetch("/api/has-relationship", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              seat_id: createSeat,
              ticket_id: recent?.ticket_id
            })
          });
        }
        
        setIsCreateModalOpen(false);
        setCreateOrderId("");
        setCreateCategoryId("");
        toast.success("Tiket berhasil dibuat!");
      } else {
        const errorData = await response.json();
        toast.error(`${errorData.detail}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan.");
    }
  };

  const handleDeleteTicket = (ticket: ExtendedTicket) => {
    setTicketToDelete(ticket);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return;
    
    setLoading(true);
    setIsDeleteModalOpen(false);
    try {
      const response = await fetch(`/api/ticket`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ticket_id: ticketToDelete.ticket_id }) 
      });
      
      if (response.ok) {
        toast.success("Tiket berhasil dihapus.");
        setTickets(tickets.filter(t => t.ticket_id !== ticketToDelete.ticket_id));
      } else {
        toast.error("Gagal menghapus tiket.");
      }
      
      const updatedTickets = await retrieveTickets();
      if (updatedTickets) setTickets(updatedTickets);
    } catch (error) {
      console.error("Error menghapus:", error);
      toast.error("Terjadi kesalahan sistem saat menghapus.");
    } finally {
      setLoading(false);
      setTicketToDelete(null);
    }
  };

  const cancelDeleteTicket = () => {
    setIsDeleteModalOpen(false);
    setTicketToDelete(null);
  };

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
                      <th scope="col" className="px-6 py-4">Event</th>
                      <th scope="col" className="px-6 py-4">Venue</th>
                      <th scope="col" className="px-6 py-4">Kategori</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {visibleTickets.map((ticket) => (
                      <tr 
                        key={ticket.ticket_id} 
                        className={`hover:bg-slate-50/50 transition-colors ${ticket.status === 'Dipakai' ? 'opacity-70' : ''}`}>
                        <td className="px-6 py-5 align-top">
                          <span className="font-mono font-semibold text-slate-900">{ticket.ticket_code}</span>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <span className="font-bold text-slate-900 mb-1">{ticket.event_title}</span>
                        </td>

                        <td className="px-6 py-5 align-top">
                          <span className="font-bold text-slate-900 mb-1">{ticket.venue_name}</span>
                        </td>

                        
                        <td className="px-6 py-5 align-top">
                          <span className="font-bold text-slate-900 mb-1">{ticket.  category_name}</span>
                        </td>
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
                    {isAdmin && <th className="px-6 py-4 text-right">Organizer</th>}
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {visibleTickets.length > 0 ?  (
                  visibleTickets.map(ticket => (
                    <tr key={ticket.ticket_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-slate-800">
                        {ticket.ticket_code}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {ticket.full_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{ticket.event_title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{ticket.venue_name} - {ticket.category_name}</div>
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
                          onClick={() => handleDeleteTicket(ticket)}
                          className="p-2 rounded-lg transition-colors 
                               text-red-500 hover:bg-red-50"
                          
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))

                ) : (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-slate-500">
                        Belum ada tiket yang terdaftar.
                      </td>
                    </tr>
                )}
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
                      <p className="font-mono font-bold text-slate-800">{ticketToEdit.ticket_code}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pelanggan</label>
                      <p className="font-medium text-slate-800">{ticketToEdit.full_name}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Event & Kategori</label>
                      <p className="font-semibold text-slate-800">{ticketToEdit.event_title}</p>
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
                          ${editStatus === 'Valid' 
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' 
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}
                        `}>
                          <input 
                            type="radio" 
                            name="status" 
                            value="Valid"
                            checked={editStatus === 'Valid'}
                            onChange={() => setEditStatus('Valid')}
                            className="hidden"
                          />
                          <span className="font-bold text-sm flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${editStatus === 'Valid' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            Valid
                          </span>
                        </label>
  
                        <label className={`
                          flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all
                          ${editStatus === 'Invalid' 
                            ? 'border-rose-500 bg-rose-50/50 text-rose-800' 
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}
                        `}>
                          <input 
                            type="radio" 
                            name="status" 
                            value="Invalid"
                            checked={editStatus === 'Invalid'}
                            onChange={() => setEditStatus('Invalid')}
                            className="hidden"
                          />
                          <span className="font-bold text-sm flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${editStatus === 'Invalid' ? 'bg-rose-500' : 'bg-slate-300'}`} />
                            Invalid
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
                        {seats.filter((s) => {if (s.status == "Tersedia") return true; }).map(s => (
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
                      {orders.map((order) => (
                        <option key={order.order_id} value={order.order_id}>{order.order_id} - {order.customer_name} - {order.event_title}</option>
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
                      <option id="1" value="">Pilih kategori</option>
                      {categories.
                      filter((cat) => {
                        if (!createOrderId) {
                          return true;
                        }
                        const selectedOrder = orders.find(o => o.order_id === createOrderId);
                        return selectedOrder ? selectedOrder.event_title === cat.event_title : true;
                      }).map((category) => (
                        <option key={category.category_id} value={category.category_id}>{category.event_title} - {category.category_name} - Rp.{category.price}</option>
                      ))}
                    </select>
                  </div>
                  <div >
                      <label className="flex items-center justify-between text-sm font-semibold text-slate-800 mb-2">
                        Alokasi Kursi
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">Opsional</span>
                      </label>
                      <select 
                        value={createSeat}
                        onChange={(e) => setCreateSeat(e.target.value)}
                        className="w-full border-2 border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none cursor-pointer bg-white transition-all font-medium appearance-none"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}>
                        <option value="">Tanpa Kursi (General Admission)</option>
                       {seats.filter((s) => {if (s.status == "Tersedia") return true; }).map(s => (
                          <option key={s.seat_id} value={s.seat_id}>{s.section} - Row {s.row_number} - No.{s.seat_number}</option>
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

        {isDeleteModalOpen && ticketToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100 border border-slate-100">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Tiket</h3>
                <p className="text-slate-500 mb-6">
                  Apakah Anda yakin ingin menghapus tiket ini? Tindakan ini tidak dapat dibatalkan dan tiket yang telah dihapus tidak dapat dipulihkan.
                </p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={cancelDeleteTicket}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm flex-1"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmDeleteTicket}
                    disabled={loading}
                    className={`px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm shadow-red-200 flex-1 flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menghapus...
                      </span>
                    ) : (
                      "Ya, Hapus"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }
}