"use client"
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, QrCode, LogOut, MapPin, 
  CheckCircle, Plus, Store, UserPlus, Trash2, 
  BarChart3, Loader2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const router = useRouter();

  // Form States
  const [newBranch, setNewBranch] = useState({ name: '', address: '', whatsapp: '' });
  const [newStaff, setNewStaff] = useState({ email: '', password: '', fullName: '', branchId: '', role: 'staff' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/admin/login');
        return;
      }

      // 1. Ambil Profile
      const { data: prof, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profError) throw new Error("Gagal ambil profil: " + profError.message);
      if (!prof) throw new Error("Profil tidak dijumpai di table 'profiles'. Sila register semula.");

      setProfile(prof);
      await fetchData(prof);
    } catch (err: any) {
      setDbError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchData(prof: any) {
    setDbError(null);
    try {
      // 2. Ambil Bookings (Gunakan query ringkas dahulu untuk test)
      let bQuery = supabase.from('bookings').select('*, branches(name)').order('created_at', { ascending: false });
      
      // Jika staf, filter ikut cawangan
      if (prof.role !== 'master' && prof.branch_id) {
        bQuery = bQuery.eq('branch_id', prof.branch_id);
      }

      const { data: bData, error: bError } = await bQuery;
      if (bError) throw new Error("Gagal ambil tempahan: " + bError.message);
      setBookings(bData || []);

      // 3. Ambil Data HQ (Master Only)
      if (prof.role === 'master') {
        const { data: brData, error: brError } = await supabase.from('branches').select('*').order('name');
        if (brError) throw new Error("Gagal ambil cawangan: " + brError.message);
        setBranches(brData || []);
        
        const { data: stData, error: stError } = await supabase.from('profiles').select('*, branches(name)').order('role');
        if (stError) throw new Error("Gagal ambil staf: " + stError.message);
        setStaffList(stData || []);
      }
    } catch (err: any) {
      setDbError(err.message);
    }
  }

  const handleCheckIn = async (id: string) => {
    await supabase.from('bookings').update({ status: 'checked_in' }).eq('id', id);
    fetchData(profile);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Menyambung ke HQ...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-72 bg-white border-r p-8 flex flex-col shadow-sm sticky top-0 h-screen z-50">
        <div className="flex items-center gap-3 mb-12">
            <img src="/logo.png" className="h-10 rounded-full border shadow-sm" />
            <div>
                <p className="font-black italic uppercase tracking-tighter leading-none">Haji Ali</p>
                <p className="text-[8px] font-black text-red-600 uppercase tracking-widest">{profile?.role}</p>
            </div>
        </div>

        <nav className="flex-grow space-y-2 font-bold text-sm">
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === 'bookings' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <LayoutDashboard size={18}/> Tempahan
          </button>
          
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === 'reports' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <BarChart3 size={18}/> Laporan
          </button>

          {profile?.role === 'master' && (
            <>
              <div className="pt-8 pb-2 text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4">HQ Admin</div>
              <button onClick={() => setActiveTab('branches')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === 'branches' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Store size={18}/> Cawangan
              </button>
              <button onClick={() => setActiveTab('staff')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === 'staff' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Users size={18}/> Urus Staf
              </button>
            </>
          )}

          <div className="pt-8 mt-8 border-t border-slate-50">
              <button onClick={() => router.push('/admin/scan')} className="w-full flex items-center gap-3 p-4 text-slate-400 hover:text-red-600 transition-all">
                <QrCode size={18}/> Scan Tiket
              </button>
          </div>
        </nav>

        <div className="bg-slate-50 p-5 rounded-3xl mt-auto">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{profile?.full_name}</p>
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/admin/login'))} className="mt-3 text-[10px] font-black text-red-500 uppercase flex items-center gap-2 hover:underline">
                <LogOut size={12}/> Log Keluar
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto">
        
        {/* DEBUG ERROR DISPLAY */}
        {dbError && (
            <div className="mb-6 bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-in fade-in">
                <AlertTriangle size={20} />
                <div className="flex-grow">
                    <p className="uppercase tracking-widest text-[10px]">Ralat Database Terdeteksi:</p>
                    <p>{dbError}</p>
                </div>
                <button onClick={() => fetchData(profile)} className="bg-red-600 text-white p-2 rounded-lg"><RefreshCw size={14}/></button>
            </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* TAB: BOOKINGS */}
          {activeTab === 'bookings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Log Tempahan</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Status: {bookings.length} Rekod Dijumpai</p>
                </header>

                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Pelanggan</th>
                                <th className="p-6">Outlet</th>
                                <th className="p-6">Status</th>
                                <th className="p-6">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {bookings.length > 0 ? bookings.map((b) => (
                                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-6 font-bold text-sm uppercase text-slate-700">
                                        {b.customer_name} <br/> <span className="text-[10px] text-slate-300">+{b.customer_phone}</span>
                                    </td>
                                    <td className="p-6 text-xs font-black text-slate-400 uppercase italic">{b.branches?.name || 'Unknown'}</td>
                                    <td className="p-6">
                                        <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full ${b.status === 'checked_in' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        {b.status === 'confirmed' && (
                                            <button onClick={() => handleCheckIn(b.id)} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-green-600 transition-all">
                                                <CheckCircle size={14}/> Check-in
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center text-slate-300 font-bold uppercase italic text-xs tracking-[4px]">Tiada data untuk dipaparkan</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
          )}

          {/* TAB: STAFF, BRANCHES, REPORTS (Logic follow existing pattern) */}
          {/* ... Sila pastikan anda masukkan semula UI untuk tab lain mengikut format yang sama ... */}

        </AnimatePresence>
      </main>
    </div>
  );
}
