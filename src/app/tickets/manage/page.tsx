'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { AuthUser, getUser } from "@/lib/auth";

// Re-using the dummy data
import { DUMMY_TICKETS, DummyTicket, DUMMY_SEATS } from "../../my-tickets/page";

export default function ManageTicketsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tickets, setTickets] = useState<DummyTicket[]>([]);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState<DummyTicket | null>(null);
  const [editStatus, setEditStatus] = useState<"Dipesan" | "Dipakai">("Dipesan");
  const [editSeat, setEditSeat] = useState<string>("");

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
    } else if (u.role !== "admin") {
      router.replace("/my-tickets"); // non-admin user fallback
    } else {
      setUser(u);
    }
    setTickets(DUMMY_TICKETS);
  }, [router]);

  if (!user || user.role !== "admin") return null;

  const handleOpenEditModal = (ticket: DummyTicket) => {
    setTicketToEdit(ticket);
    setEditStatus(ticket.status);
    setEditSeat(ticket.seat_id || "");
    setIsEditModalOpen(true);
  };

  const handleUpdateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketToEdit) return;
    
    const updatedTickets = tickets.map(t => {
      if (t.ticket_id === ticketToEdit.ticket_id) {
        return { ...t, status: editStatus, seat_id: editSeat === "" ? undefined : editSeat };
      }
      return t;
    });

    setTickets(updatedTickets);
    // In a real app we would update it to the API here
    setIsEditModalOpen(false);
    setTicketToEdit(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar role={user.role} />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        
        <div className="mb-6 border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Daftar Tiket Pelanggan</h1>
          <p className="text-sm text-slate-500 mt-2">
            Kelola status dan alokasi kursi untuk tiket yang telah dipesan oleh pelanggan.
          </p>
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
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map(ticket => (
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
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleOpenEditModal(ticket)}
                        className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                      >
                        Edit
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
    </div>
  );
}