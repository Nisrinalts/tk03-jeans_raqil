'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { AuthUser, getUser } from "@/lib/auth";

// --- Dummy Data ---
// In a real application, this data will be fetched from the backend

interface Venue {
  id: string;
  name: string;
}

const DUMMY_VENUES: Venue[] = [
  { id: "V-001", name: "Jakarta Convention Center" },
  { id: "V-002", name: "Sabuga Bandung" },
  { id: "V-003", name: "Grand City Surabaya" },
];

interface Seat {
  id: string;
  venue_id: string;
  venue_name: string;
  section: string;
  row_name: string;
  seat_number: string;
  status: "Terisi" | "Tersedia";
}

const INITIAL_SEATS: Seat[] = [
  { id: "S-1", venue_id: "V-001", venue_name: "Jakarta Convention Center", section: "VIP", row_name: "A", seat_number: "1", status: "Terisi" },
  { id: "S-2", venue_id: "V-001", venue_name: "Jakarta Convention Center", section: "VIP", row_name: "A", seat_number: "2", status: "Tersedia" },
  { id: "S-3", venue_id: "V-002", venue_name: "Sabuga Bandung", section: "Tribune West", row_name: "10", seat_number: "15", status: "Tersedia" },
  { id: "S-4", venue_id: "V-002", venue_name: "Sabuga Bandung", section: "Festival", row_name: "-", seat_number: "1", status: "Terisi" },
];

export default function SeatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const [seats, setSeats] = useState<Seat[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null);

  // Form states
  const [formVenueId, setFormVenueId] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formRow, setFormRow] = useState("");
  const [formSeatNumber, setFormSeatNumber] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
    } else {
      setUser(u);
    }
    setSeats(INITIAL_SEATS);
    setIsChecking(false);
  }, [router]);

  if (isChecking) return null;
  if (!user) return null;

  const isStaff = user.role === "admin" || user.role === "organizer";

  // Statistics
  const totalSeats = seats.length;
  const availableSeats = seats.filter((s) => s.status === "Tersedia").length;
  const occupiedSeats = seats.filter((s) => s.status === "Terisi").length;

  const openCreateModal = () => {
    setModalMode("create");
    setFormVenueId("");
    setFormSection("");
    setFormRow("");
    setFormSeatNumber("");
    setIsModalOpen(true);
  };

  const openUpdateModal = (seat: Seat) => {
    setModalMode("update");
    setEditingSeatId(seat.id);
    setFormVenueId(seat.venue_id);
    setFormSection(seat.section);
    setFormRow(seat.row_name);
    setFormSeatNumber(seat.seat_number);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSeatId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedVenue = DUMMY_VENUES.find((v) => v.id === formVenueId);
    if (!selectedVenue) {
      alert("Pilih venue terlebih dahulu");
      return;
    }

    if (modalMode === "create") {
      const newSeat: Seat = {
        id: `S-NEW-${Date.now()}`,
        venue_id: formVenueId,
        venue_name: selectedVenue.name,
        section: formSection,
        row_name: formRow,
        seat_number: formSeatNumber,
        status: "Tersedia", // Defaults to available upon creation
      };
      setSeats([...seats, newSeat]);
    } else if (modalMode === "update" && editingSeatId) {
      setSeats(seats.map(s => {
        if (s.id === editingSeatId) {
          return {
            ...s,
            venue_id: formVenueId,
            venue_name: selectedVenue.name,
            section: formSection,
            row_name: formRow,
            seat_number: formSeatNumber,
          };
        }
        return s;
      }));
    }

    handleCloseModal();
  };

  const handleDelete = (seat: Seat) => {
    if (seat.status === "Terisi") {
      alert("Kursi ini sudah di-assign ke tiket dan tidak dapat dihapus. Hapus atau ubah tiket terlebih dahulu.");
      return;
    }

    if (confirm("Apakah Anda yakin ingin menghapus kursi ini?")) {
      setSeats(seats.filter((s) => s.id !== seat.id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar role={user.role} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Manajemen Kursi</h1>
            <p className="text-sm text-slate-500 mt-2">
              Daftar seluruh kursi yang tersedia di berbagai Venue.
            </p>
          </div>
          
          {isStaff && (
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm shadow-blue-200"
            >
              <span>+</span>
              Tambah Kursi
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Kursi</p>
              <h2 className="text-3xl font-black text-slate-800 mt-2">{totalSeats}</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Tersedia</p>
              <h2 className="text-3xl font-black text-slate-800 mt-2">{availableSeats}</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-orange-600 uppercase tracking-wider">Terisi</p>
              <h2 className="text-3xl font-black text-slate-800 mt-2">{occupiedSeats}</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-6 py-4">Section (Area)</th>
                  <th className="px-6 py-4">Venue</th>
                  <th className="px-6 py-4">Baris</th>
                  <th className="px-6 py-4">No. Kursi</th>
                  <th className="px-6 py-4">Status</th>
                  {isStaff && <th className="px-6 py-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {seats.map(seat => (
                  <tr key={seat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold">{seat.section}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {seat.venue_name}
                    </td>
                    <td className="px-6 py-4 font-mono">{seat.row_name}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">{seat.seat_number}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        seat.status === 'Tersedia' 
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${seat.status === 'Tersedia' ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                        {seat.status}
                      </span>
                    </td>
                    {isStaff && (
                      <td className="px-6 py-4 flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openUpdateModal(seat)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Kursi"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>

                        <button 
                          onClick={() => handleDelete(seat)}
                          disabled={seat.status === "Terisi"}
                          className={`p-2 rounded-lg transition-colors ${
                            seat.status === "Terisi" 
                              ? "text-slate-300 cursor-not-allowed" 
                              : "text-red-500 hover:bg-red-50"
                          }`}
                          title={seat.status === "Terisi" ? "Kursi ini sudah di-assign ke tiket dan tidak dapat dihapus." : "Hapus Kursi"}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {seats.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Belum ada kursi yang terdaftar.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Form for Create / Update */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">
                {modalMode === "create" ? "Tambah Kursi Baru" : "Update Kursi"}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="seatForm" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Venue</label>
                  <select 
                    required
                    value={formVenueId}
                    onChange={(e) => setFormVenueId(e.target.value)}
                    className="w-full border-2 border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                  >
                    <option value="" disabled>Pilih Venue...</option>
                    {DUMMY_VENUES.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Section</label>
                  <input 
                    type="text" 
                    required
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    placeholder="Contoh: VIP, Tribune West"
                    className="w-full border-2 border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Baris</label>
                    <input 
                      type="text" 
                      required
                      value={formRow}
                      onChange={(e) => setFormRow(e.target.value)}
                      placeholder="Cth: A, B, 1, 2"
                      className="w-full border-2 border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">No. Kursi</label>
                    <input 
                      type="text" 
                      required
                      value={formSeatNumber}
                      onChange={(e) => setFormSeatNumber(e.target.value)}
                      placeholder="Cth: 1, 2, 3"
                      className="w-full border-2 border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                form="seatForm"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-200"
              >
                {modalMode === "create" ? "Tambah" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}