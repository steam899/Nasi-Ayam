"use client"
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, QrCode, LogOut, MapPin, 
  CheckCircle, Plus, Store, UserPlus, Trash2, 
  BarChart3, Loader2, Edit3, Save, X, TrendingUp, Search
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
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/admin/login'); return; }

      const { data: prof } = await supabase.from('profiles').select('*, branches(name)').eq('id', user.id).maybeSingle();
      if (!prof) { alert("Profil tidak dijumpai."); return; }

      setProfile(prof);
      await fetchData(prof);
    } finally { setLoading(false); }
  }

  async function fetchData(prof: any) {
    setLoading(true);
    // 1. Ambil Tempahan
    let bQuery = supabase.from('bookings').select('*, branches(name)').order('created_at', { ascending: false });
    if (prof.role === 'staff') bQuery = bQuery.eq('branch_id', prof.branch_id);
    const { data: bData } = await bQuery;
    setBookings(bData || []);

    // 2. Ambil Data HQ (Master Only)
    if (prof.role === 'master') {
      const { data: brData } = await supabase.from('branches').select('*').order('name');
      setBranches(brData || []);
      const { data: stData } = await supabase.from('profiles').select('*, branches(name)').order('role');
      setStaffList(stData || []);
    }
    setLoading(false);
  }

  // --- LOGIK STAFF & MASTER ---
  const handleCheckIn = async (id: string) => {
    await supabase.from('bookings').update({ status: 'checked_in' }).eq('id', id);
    fetchData(profile);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // --- LOGIK KHAS MASTER (STAF MANAGEMENT) ---
  const handleAddStaff = async () => {
    if (!newStaff.email || !newStaff.password || !newStaff.branchId) return alert("Sila lengkapkan data staf!");
    setIsProcessing(true);
    const res = await fetch('/api/admin/create-staff', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff) 
    });
    const result = await res.json();
    if (result.success) { 
        alert("Staf Berjaya Didaftarkan!"); 
        setNewStaff({ email: '', password: '', fullName: '', branchId: '', role: 'staff' });
        fetchData(profile);
    }
    else alert("Gagal: " + result.error);
    setIsProcessing(false);
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff.full_name || !editingStaff.branch_id) return alert("Data tidak lengkap!");
    setIsProcessing(true);
    const res = await fetch('/api/admin/update-staff', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id: editingStaff.id, 
            fullName: editingStaff.full_name, 
            branchId: editingStaff.branch_id, 
            role: editingStaff.role 
        }) 
    });
    const result = await res.json();
    if (result.success) { 
        alert("Profil Staf Dikemaskini!"); 
        setEditingStaff(null); 
        fetchData(profile); 
    } else {
        alert("Gagal update staf.");
    }
    setIsProcessing(false);
  };

  const handleDeleteStaff = async (id: string) => {
    if (confirm("Hapus akses staf ini?")) {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if(!error) fetchData(profile);
    }
  };

  const handleAddBranch = async () => {
    if (!newBranch.name) return;
    const { error } = await supabase.from('branches').insert([newBranch]);
    if (!error) {
        setNewBranch({ name: '', address: '', whatsapp: '' });
        fetchData(profile);
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (confirm("Hapus cawangan ini?")) {
        await supabase.from('branches').delete().eq('id', id);
        fetchData(profile);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-300">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="font-black uppercase italic text-[10px] tracking-[4px]">Memuatkan Dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-72 bg-white border-r p-8 flex flex-col shadow-sm sticky top-0 h-screen z-50">
        <div className="flex items-center gap-3 mb-10">
            <img src="/logo.png" className="h-10" />
            <span className="font-black italic text-lg tracking-tighter uppercase leading-none">Haji Ali Panel</span>
        </div>

        <nav className="flex-grow space-y-2">
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'bookings' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <LayoutDashboard size={18}/> Tempahan
          </button>
          
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'reports' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <BarChart3 size={18}/> Laporan
          </button>

          {profile.role === 'master' && (
            <>
              <div className="pt-8 pb-2 text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4">HQ Central</div>
              <button onClick={() => setActiveTab('branches')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'branches' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Store size={18}/> Cawangan
              </button>
              <button onClick={() => setActiveTab('staff')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'staff' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Users size={18}/> Urus Staf
              </button>
            </>
          )}

          <div className="pt-8 mt-8 border-t border-slate-50">
              <button onClick={() => router.push('/admin/scan')} className="w-full flex items-center gap-3 p-4 text-slate-400 hover:text-red-600 font-bold text-sm transition-all">
                <QrCode size={18}/> Scan Tiket
              </button>
          </div>
        </nav>

        <div className="bg-slate-50 p-5 rounded-3xl mt-auto">
            <p className="text-[10px] font-black text-slate-400 uppercase truncate leading-none">{profile.full_name}</p>
            <p className="text-[8px] font-bold text-red-500 uppercase italic mb-4">{profile.role === 'master' ? 'MASTER ADMIN' : profile.branches?.name}</p>
            <button onClick={handleLogout} className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-red-600 underline transition-all">
                <LogOut size={12}/> Keluar Dashboard
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto">
        <header className="mb-10">
            <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">
                {activeTab === 'bookings' && 'Log Tempahan'}
                {activeTab === 'reports' && 'Analisis Laporan'}
                {activeTab === 'branches' && 'Urus Cawangan'}
                {activeTab === 'staff' && 'Pengurusan Staf'}
            </h1>
        </header>

        <AnimatePresence mode="wait">
          
          {/* TAB: REPORTS */}
          {activeTab === 'reports' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Total Tempahan</p>
                        <p className="text-4xl font-black text-slate-800 mt-2">{bookings.length}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Sudah Sampai</p>
                        <p className="text-4xl font-black text-green-500 mt-2">{bookings.filter(b => b.status === 'checked_in').length}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 text-amber-500">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic text-slate-300">Menunggu</p>
                        <p className="text-4xl font-black mt-2">{bookings.filter(b => b.status === 'confirmed').length}</p>
                    </div>
                </div>

                {profile?.role === 'master' && (
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <h3 className="font-black text-slate-800 uppercase italic mb-6 tracking-tight">Prestasi Outlet</h3>
                        <div className="space-y-4">
                            {branches.map(br => {
                                const count = bookings.filter(b => b.branch_id === br.id).length;
                                const percentage = bookings.length > 0 ? (count / bookings.length) * 100 : 0;
                                return (
                                    <div key={br.id} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase">
                                            <span>{br.name}</span>
                                            <span>{count} Tempahan</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                            <div className="bg-red-600 h-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </motion.div>
          )}

          {/* TAB: BOOKINGS */}
          {activeTab === 'bookings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <tr>
                            <th className="p-6">Pelanggan</th>
                            <th className="p-6">Cawangan</th>
                            <th className="p-6 text-center">Tindakan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {bookings.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50 transition-all">
                                <td className="p-6 font-bold uppercase text-sm text-slate-700 leading-none">
                                    {b.customer_name} <br/> <span className="text-[10px] text-slate-300 font-bold italic tracking-wider">+{b.customer_phone}</span>
                                </td>
                                <td className="p-6 italic font-bold text-slate-400 text-[10px] uppercase">{b.branches?.name}</td>
                                <td className="p-6 text-center">
                                    {b.status === 'confirmed' ? (
                                        <button onClick={() => handleCheckIn(b.id)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-green-600 transition-all mx-auto">
                                            <CheckCircle size={14}/> Check-in
                                        </button>
                                    ) : (
                                        <span className="text-[10px] font-black text-green-500 uppercase bg-green-50 px-4 py-2 rounded-full">Selesai</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && <div className="p-20 text-center text-slate-300 font-bold italic uppercase text-xs">Tiada rekod buat masa ini</div>}
            </motion.div>
          )}

          {/* TAB: STAFF (MASTER ONLY) */}
          {activeTab === 'staff' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Tambah/Edit Staf */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 h-fit">
                    <h3 className="font-black uppercase italic text-sm flex items-center gap-2 tracking-tight">
                        <div className="bg-red-50 p-2 rounded-lg text-red-600"><UserPlus size={18}/></div> {editingStaff ? 'Edit Staf' : 'Daftar Staf'}
                    </h3>
                    <div className="space-y-3">
                        <input type="text" placeholder="NAMA PENUH" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs uppercase" 
                            value={editingStaff ? editingStaff.full_name : newStaff.fullName}
                            onChange={e => editingStaff ? setEditingStaff({...editingStaff, full_name: e.target.value}) : setNewStaff({...newStaff, fullName: e.target.value})} />
                        
                        {!editingStaff && (
                            <>
                                <input type="email" placeholder="EMAIL LOGIN" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs" onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                                <input type="password" placeholder="PASSWORD" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs" onChange={e => setNewStaff({...newStaff, password: e.target.value})} />
                            </>
                        )}

                        <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-[10px] uppercase text-slate-500" 
                            value={editingStaff ? editingStaff.branch_id : newStaff.branchId}
                            onChange={e => editingStaff ? setEditingStaff({...editingStaff, branch_id: e.target.value}) : setNewStaff({...newStaff, branchId: e.target.value})}>
                            <option value="">-- TUGASKAN CAWANGAN --</option>
                            {branches.map(br => <option key={br.id} value={br.id}>{br.name.toUpperCase()}</option>)}
                        </select>
                    </div>
                    {editingStaff ? (
                        <div className="flex gap-2">
                            <button onClick={handleUpdateStaff} disabled={isProcessing} className="flex-grow bg-slate-900 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl flex justify-center items-center gap-2"><Save size={14}/> Simpan</button>
                            <button onClick={() => setEditingStaff(null)} className="bg-slate-100 p-4 rounded-2xl text-slate-400"><X size={14}/></button>
                        </div>
                    ) : (
                        <button onClick={handleAddStaff} disabled={isProcessing} className="w-full bg-red-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Daftarkan Staf</button>
                    )}
                </div>

                {/* Senarai Staf */}
                <div className="lg:col-span-2 space-y-4">
                    {staffList.map(st => (
                        <div key={st.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-100 flex justify-between items-center group">
                            <div className="flex items-center gap-5">
                                <div className={`p-5 rounded-2xl font-black text-lg ${st.role === 'master' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-300'}`}>{st.full_name.charAt(0)}</div>
                                <div>
                                    <h4 className="font-black uppercase text-slate-800 tracking-tight text-sm">{st.full_name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 rounded text-slate-400 uppercase">{st.role}</span>
                                        <span className="text-[9px] font-black text-red-500 uppercase italic">{st.role === 'master' ? 'HQ Central' : st.branches?.name}</span>
                                    </div>
                                </div>
                            </div>
                            {st.role !== 'master' && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => setEditingStaff(st)} className="p-3 text-slate-200 hover:text-blue-500"><Edit3 size={18}/></button>
                                    <button onClick={() => handleDeleteStaff(st.id)} className="p-3 text-slate-200 hover:text-red-500"><Trash2 size={18}/></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>
          )}

          {/* TAB: BRANCHES (MASTER ONLY) */}
          {activeTab === 'branches' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 h-fit">
                    <h3 className="font-black uppercase italic text-sm flex items-center gap-2 tracking-tight text-slate-800"><Plus className="text-red-600" /> Tambah Outlet</h3>
                    <div className="space-y-3">
                        <input type="text" placeholder="NAMA CAWANGAN" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs uppercase" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
                        <input type="text" placeholder="LOKASI RINGKAS" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs uppercase" value={newBranch.address} onChange={e => setNewBranch({...newBranch, address: e.target.value})} />
                        <input type="tel" placeholder="WHATSAPP (601...)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs" value={newBranch.whatsapp} onChange={e => setNewBranch({...newBranch, whatsapp: e.target.value})} />
                    </div>
                    <button onClick={handleAddBranch} className="w-full bg-red-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Simpan Cawangan</button>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {branches.map(br => (
                        <div key={br.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-50 flex justify-between items-center group">
                            <div className="flex items-center gap-5">
                                <div className="bg-slate-50 p-5 rounded-2xl text-slate-300 group-hover:text-red-600 transition-colors"><Store/></div>
                                <div>
                                    <h4 className="font-black uppercase text-slate-800 tracking-tight text-sm">{br.name}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{br.address}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteBranch(br.id)} className="p-3 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={20}/></button>
                        </div>
                    ))}
                </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
