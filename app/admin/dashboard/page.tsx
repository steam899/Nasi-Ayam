"use client"
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, QrCode, LogOut, MapPin, 
  CheckCircle, Plus, Store, UserPlus, Trash2, 
  BarChart3, Search, Calendar, ChevronRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push('/admin/login');
        return;
      }

      const { data: prof, error: profError } = await supabase
        .from('profiles')
        .select('*, branches(name)')
        .eq('id', user.id)
        .single();

      if (profError || !prof) {
        setLoading(false);
        return;
      }

      setProfile(prof);
      await fetchData(prof);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchData(prof: any) {
    // 1. Ambil Tempahan (Jika staf, filter ikut cawangan)
    let bQuery = supabase.from('bookings').select('*, branches(name)').order('created_at', { ascending: false });
    if (prof.role === 'staff') bQuery = bQuery.eq('branch_id', prof.branch_id);
    const { data: bData } = await bQuery;
    setBookings(bData || []);

    // 2. Ambil Cawangan & Staf (Hanya untuk Master)
    if (prof.role === 'master') {
      const { data: brData } = await supabase.from('branches').select('*').order('name');
      setBranches(brData || []);
      const { data: stData } = await supabase.from('profiles').select('*, branches(name)').order('role');
      setStaffList(stData || []);
    }
  }

  // --- LOGIK URUS TEMPAHAN ---
  const handleCheckIn = async (id: string) => {
    const { error } = await supabase.from('bookings').update({ status: 'checked_in' }).eq('id', id);
    if (!error) {
        alert("Pelanggan Berjaya Check-in!");
        fetchData(profile);
    }
  };

  // --- LOGIK URUS CAWANGAN (MASTER) ---
  const handleAddBranch = async () => {
    if (!newBranch.name) return;
    setIsProcessing(true);
    await supabase.from('branches').insert([{ name: newBranch.name, address: newBranch.address, whatsapp_number: newBranch.whatsapp }]);
    alert("Cawangan Berjaya Ditambah!");
    window.location.reload();
  };

  const handleDeleteBranch = async (id: string) => {
    if (confirm("Hapus cawangan ini? Semua data berkaitan akan hilang.")) {
      await supabase.from('branches').delete().eq('id', id);
      window.location.reload();
    }
  };

  // --- LOGIK URUS STAF (MASTER) ---
  const handleAddStaff = async () => {
    if (!newStaff.email || !newStaff.branchId) return alert("Sila isi maklumat staf dan pilih cawangan!");
    setIsProcessing(true);
    const res = await fetch('/api/admin/create-staff', {
      method: 'POST',
      body: JSON.stringify(newStaff)
    });
    const result = await res.json();
    if (result.success) {
      alert("Staf Berjaya Didaftarkan!");
      window.location.reload();
    } else {
      alert("Error: " + result.error);
    }
    setIsProcessing(false);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-400">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="font-black uppercase italic text-[10px] tracking-[4px]">Memuatkan Data HQ...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-100 p-8 flex flex-col shadow-sm z-20">
        <div className="flex items-center gap-3 mb-12">
            <img src="/logo.png" className="h-10 w-10 object-contain rounded-full border shadow-sm" />
            <div>
                <p className="font-black italic text-lg leading-none tracking-tighter">HAJI ALI</p>
                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">HQ Admin</p>
            </div>
        </div>

        <nav className="flex-grow space-y-2">
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'bookings' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-slate-400 hover:bg-slate-50'}`}>
            <LayoutDashboard size={18}/> Dashboard
          </button>

          {profile?.role === 'master' && (
            <>
              <button onClick={() => setActiveTab('branches')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'branches' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Store size={18}/> Urus Cawangan
              </button>
              <button onClick={() => setActiveTab('staff')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'staff' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Users size={18}/> Pengurusan Staf
              </button>
            </>
          )}

          <button onClick={() => router.push('/admin/scan')} className="w-full flex items-center gap-3 p-4 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-2xl font-bold text-sm transition-all mt-10">
            <QrCode size={18}/> Scan QR Tiket
          </button>
        </nav>

        <div className="pt-8 border-t border-slate-50">
            <div className="bg-slate-50 p-4 rounded-2xl relative overflow-hidden">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Profil Aktif</p>
                <p className="font-bold text-slate-700 text-sm mt-1 truncate uppercase">{profile?.full_name}</p>
                <p className="text-[9px] font-black text-red-500 uppercase italic mt-0.5">
                    {profile?.role === 'master' ? 'Master HQ' : profile?.branches?.name}
                </p>
                <button onClick={() => supabase.auth.signOut().then(() => router.push('/admin/login'))} className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-red-600 transition-colors uppercase tracking-widest underline">
                    <LogOut size={12}/> Log Keluar
                </button>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto">
        
        <header className="mb-10">
            <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">
                {activeTab === 'bookings' && 'Log Tempahan'}
                {activeTab === 'branches' && 'Pengurusan Outlet'}
                {activeTab === 'staff' && 'Kakitangan & Akses'}
            </h1>
            <p className="text-slate-400 text-sm font-medium">Uruskan operasi Nasi Ayam Haji Ali dari sini.</p>
        </header>

        <AnimatePresence mode="wait">
          
          {/* TAB: BOOKINGS */}
          {activeTab === 'bookings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white rounded-[35px] shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                            <tr>
                                <th className="p-6 text-center">Tiket</th>
                                <th className="p-6">Pelanggan</th>
                                <th className="p-6">Outlet</th>
                                <th className="p-6">Masa</th>
                                <th className="p-6">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {bookings.map((b) => (
                                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-6 text-center">
                                        <div className="bg-slate-50 w-10 h-10 rounded-xl flex items-center justify-center mx-auto text-slate-300 font-bold text-[10px]">
                                            <QrCode size={16}/>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="font-black text-slate-800 uppercase text-sm">{b.customer_name}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{b.customer_phone}</p>
                                    </td>
                                    <td className="p-6 font-bold text-slate-500 text-xs uppercase italic">{b.branches?.name}</td>
                                    <td className="p-6">
                                        <p className="text-xs font-bold text-slate-700">{b.booking_date}</p>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{b.booking_time}</p>
                                    </td>
                                    <td className="p-6">
                                        {b.status === 'confirmed' ? (
                                            <button onClick={() => handleCheckIn(b.id)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-green-600 transition-all flex items-center gap-2">
                                                <CheckCircle size={14}/> Check-in
                                            </button>
                                        ) : (
                                            <span className="text-[10px] font-black text-green-500 uppercase bg-green-50 px-4 py-2 rounded-full">Sudah Sampai</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
          )}

          {/* TAB: BRANCHES (MASTER ONLY) */}
          {activeTab === 'branches' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 h-fit">
                    <h3 className="font-black uppercase italic text-sm flex items-center gap-2 tracking-tight">
                        <div className="bg-red-50 p-2 rounded-lg text-red-600"><Plus size={18}/></div> Tambah Outlet Baru
                    </h3>
                    <div className="space-y-4">
                        <input type="text" placeholder="NAMA CAWANGAN" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs uppercase" onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
                        <input type="text" placeholder="ALAMAT RINGKAS" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs uppercase" onChange={e => setNewBranch({...newBranch, address: e.target.value})} />
                        <input type="tel" placeholder="WHATSAPP (601...)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs" onChange={e => setNewBranch({...newBranch, whatsapp: e.target.value})} />
                    </div>
                    <button onClick={handleAddBranch} disabled={isProcessing} className="w-full bg-red-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Simpan Outlet</button>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {branches.map(br => (
                        <div key={br.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-50 flex justify-between items-center group transition-all hover:border-red-100">
                            <div className="flex items-center gap-5">
                                <div className="bg-slate-50 p-5 rounded-2xl text-slate-300 group-hover:bg-red-50 group-hover:text-red-600 transition-colors"><Store/></div>
                                <div>
                                    <h4 className="font-black uppercase text-slate-800 tracking-tight">{br.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{br.address || 'Haji Ali Outlet'}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteBranch(br.id)} className="p-4 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                        </div>
                    ))}
                </div>
            </motion.div>
          )}

          {/* TAB: STAFF (MASTER ONLY) */}
          {activeTab === 'staff' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-sans">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 h-fit">
                    <h3 className="font-black uppercase italic text-sm flex items-center gap-2 tracking-tight">
                        <div className="bg-red-50 p-2 rounded-lg text-red-600"><UserPlus size={18}/></div> Daftarkan Staf
                    </h3>
                    <div className="space-y-4">
                        <input type="text" placeholder="NAMA PENUH" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs uppercase" onChange={e => setNewStaff({...newStaff, fullName: e.target.value})} />
                        <input type="email" placeholder="EMAIL LOGIN" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs uppercase" onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                        <input type="password" placeholder="PASSWORD" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs uppercase" onChange={e => setNewStaff({...newStaff, password: e.target.value})} />
                        <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest text-slate-500" onChange={e => setNewStaff({...newStaff, branchId: e.target.value})}>
                            <option value="">-- TUGASKAN KE CAWANGAN --</option>
                            {branches.map(br => (
                                <option key={br.id} value={br.id}>{br.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={handleAddStaff} disabled={isProcessing} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Daftarkan Akses Staf</button>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {staffList.map(st => (
                        <div key={st.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-50 flex justify-between items-center group transition-all hover:border-red-100">
                            <div className="flex items-center gap-5">
                                <div className={`p-5 rounded-2xl font-black text-lg ${st.role === 'master' ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-300'}`}>
                                    {st.full_name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-black uppercase text-slate-800 tracking-tight">{st.full_name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 rounded text-slate-400 uppercase">{st.role}</span>
                                        <span className="text-[9px] font-black text-red-500 uppercase italic">
                                            {st.role === 'master' ? 'Semua Akses HQ' : st.branches?.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
      
      {/* Footer Mobile */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 flex justify-around items-center z-50 shadow-2xl">
          <button onClick={() => setActiveTab('bookings')} className={`p-2 rounded-xl ${activeTab === 'bookings' ? 'text-red-600' : 'text-slate-300'}`}><LayoutDashboard/></button>
          {profile?.role === 'master' && (
              <>
                <button onClick={() => setActiveTab('branches')} className={`p-2 rounded-xl ${activeTab === 'branches' ? 'text-red-600' : 'text-slate-300'}`}><Store/></button>
                <button onClick={() => setActiveTab('staff')} className={`p-2 rounded-xl ${activeTab === 'staff' ? 'text-red-600' : 'text-slate-300'}`}><Users/></button>
              </>
          )}
          <button onClick={() => router.push('/admin/scan')} className="p-2 text-slate-300"><QrCode/></button>
      </footer>
    </div>
  );
}
