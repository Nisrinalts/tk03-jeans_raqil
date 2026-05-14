'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { AuthUser, getUser } from "@/lib/auth";
import LoadingState from "@/components/LoadingState";
import toast from "react-hot-toast";

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

const retrieveVenues = async () => {
  try {
    const res = await fetch("/api/venues");
    if (res.ok) {
      const data = await res.json();
      console.log("Venues fetch status:", res.status);
      return data;
    }
  } catch (error) {
    console.error("Error fetching venues:", error);
    throw error;
  }
}


export default function SeatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const [venues, setVenues] = useState<any[]>([]);
  const [seats, setSeats] = useState<any[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [seatToDelete, setSeatToDelete] = useState<any | null>(null);

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
      setUser(prev => prev?.user_id === u.user_id ? prev : u);
    }

    const loadSeats = async () => {
      try {
        const data = await retrieveSeats();
          // Dedupe by seat_id sebagai safety net kalau API masih kasih duplikat
          const list = Array.isArray(data) ? data : [];
          const seen = new Set<string>();
          const unique = list.filter((s: { seat_id: string }) => {
            if (!s?.seat_id || seen.has(s.seat_id)) return false;
            seen.add(s.seat_id);
            return true;
          });
          setSeats(unique);
        } catch (error) {
          console.error("Error loading seats:", error);
        } finally {
          setIsChecking(false);
        }
      };

      const loadVenue = async () => {
        try {
          const data = await retrieveVenues();
            setVenues(data || []);
        } catch (error) {
          console.error("Error loading venues:", error);
        }
      }

      loadSeats();
      loadVenue();
    }, [router]);
  const role = user?.role || "guest";
  const isStaff = user?.role === "admin" || user?.role === "organizer";

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

  const openUpdateModal = (seat: any) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedVenue = venues.find((v) => v.venue_id === formVenueId);
    if (!selectedVenue) {
      toast.error("Pilih venue terlebih dahulu");
      return;
    }

    if (modalMode === "create") {
      const newSeat = {
        seat_id: crypto.randomUUID(),
        venue_id: formVenueId,
        section: formSection,
        row_number: formRow,
        seat_number: formSeatNumber,
      }

      const result = await fetch("/api/seat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSeat),
      });
      
      if (result.ok) {
        toast.success("Kursi berhasil ditambahkan!");
      } else {
        toast.error("Gagal menambahkan kursi");
      }
      
      const updatedSeats = await retrieveSeats();
      setSeats(updatedSeats);
      handleCloseModal();

    } else if (modalMode === "update" && editingSeatId) {
      setSeats(seats.map(s => {
        if (s.id === editingSeatId) {
          const updatedSeat = {
            ...s,
            venue_id: formVenueId,
            section: formSection,
            row_name: formRow,
            seat_number: formSeatNumber,
          };

          fetch("/api/seat", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ updatedSeat })
          }).then(res => {
            if (res.ok) toast.success("Kursi berhasil diperbarui!");
            else toast.error("Gagal memperbarui kursi");
          }).catch(() => toast.error("Gagal memperbarui kursi"));
          
          return updatedSeat;
        }
        return s;
      }));
      
      const updatedSeats = await retrieveSeats();
      setSeats(updatedSeats);
      handleCloseModal();
    }
    };

  const handleDelete = (seat: any) => {
    if (seat.status === "Terisi") {
      toast.error("Kursi ini sudah di-assign ke tiket dan tidak dapat dihapus. Hapus atau ubah tiket terlebih dahulu.");
      return;
    }
    setSeatToDelete(seat);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (seatToDelete) {
      setIsChecking(true);
      try {
        const response = await fetch("/api/seat", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seat_id: seatToDelete.seat_id })
        });

        if (response.ok) {
          toast.success("Kursi berhasil dihapus.");
          setSeats(seats.filter((s) => s.seat_id !== seatToDelete.seat_id));
        } else {
          toast.error("Gagal menghapus kursi.");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan sistem saat menghapus.");
      } finally {
        setIsChecking(false);
        setIsDeleteModalOpen(false);
        setSeatToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSeatToDelete(null);
  };

  if (!user) return null;

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar role={user?.role || ""} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
          <LoadingState message="Memuat data kursi..." />
        </main>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar role={user?.role || ""} />
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
                  <tr key={seat.seat_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold">{seat.section}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {seat.venue_name}
                    </td>
                    <td className="px-6 py-4 font-mono">{seat.row_number}</td>
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
                    {venues.map(v => (
                      <option key={v.id} value={v.venue_id}>{v.venue_name}</option>
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-6 pb-2 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 mx-auto flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Hapus Kursi</h2>
              <p className="text-sm text-slate-500">
                Apakah Anda yakin ingin menghapus kursi <strong className="text-slate-700">{seatToDelete?.seat_number}</strong> di area <strong className="text-slate-700">{seatToDelete?.section}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="p-6 flex items-center gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm shadow-red-200"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}