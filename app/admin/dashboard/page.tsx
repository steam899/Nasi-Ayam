"use client"
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Users, QrCode, LogOut, MapPin, 
  CheckCircle, Plus, Store, UserPlus, Trash2, BarChart3,
  Edit3, Save, X, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase.from('profiles').select('*, branches(name)').eq('id', user.id).single();
      if (!prof) {
          router.push('/admin/login');
          return;
      }
      setProfile(prof);
      fetchData(prof);
    } else {
      router.push('/admin/login');
    }
  }

  async function fetchData(prof: any) {
    setLoading(true);
    // 1. Fetch Bookings
    let bQuery = supabase.from('bookings').select('*, branches(name)').order('created_at', { ascending: false });
    if (prof.role === 'staff') bQuery = bQuery.eq('branch_id', prof.branch_id);
    const { data: bData } = await bQuery;
    setBookings(bData || []);

    // 2. Fetch Branches & Staff (Master Only)
    if (prof.role === 'master') {
      const { data: brData } = await supabase.from('branches').select('*');
      setBranches(brData || []);
      
      const { data: stData } = await supabase.from('profiles').select('*, branches(name)').order('role', { ascending: false });
      setStaffList(stData || []);
    }
    setLoading(false);
  }

  // --- LOGIK STAFF & MASTER ---
  const handleCheckIn = async (id: string) => {
    await supabase.from('bookings').update({ status: 'checked_in' }).eq('id', id);
    alert("Pelanggan Check-in!");
    fetchData(profile);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // --- LOGIK MASTER: PENGURUSAN STAF ---
  const handleAddStaff = async () => {
    if (!newStaff.email || !newStaff.password || !newStaff.branchId) return alert("Sila lengkapkan data!");
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
    } else {
        alert("Error: " + result.error);
    }
    setIsProcessing(false);
  };

  const handleUpdateStaff = async () => {
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
        alert("Data staf dikemaskini!");
        setEditingStaff(null);
        fetchData(profile);
    }
    setIsProcessing(false);
  };

  const handleDeleteStaff = async (id: string) => {
    if(confirm("Hapus akses staf ini?")) {
        await supabase.from('profiles').delete().eq('id', id);
        fetchData(profile);
    }
  };

  // --- LOGIK MASTER: CAWANGAN ---
  const handleAddBranch = async () => {
    await supabase.from('branches').insert([{ name: newBranch.name, address: newBranch.address, whatsapp_number: newBranch.whatsapp }]);
    alert("Cawangan ditambah!");
    fetchData(profile);
  };

  const handleDeleteBranch = async (id: string) => {
    if(confirm("Hapus cawangan ini?")) {
        await supabase.from('branches').delete().eq('id', id);
        fetchData(profile);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold uppercase tracking-widest text-slate-300 animate-pulse text-xs">Memuatkan Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-72 bg-white border-r p-8 space-y-10 shadow-sm z-20">
        <div className="flex items-center gap-3">
            <img src="/logo.png" className="h-10" />
            <span className="font-black italic text-lg tracking-tighter uppercase">Haji Ali Panel</span>
        </div>

        <nav className="space-y-2">
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'bookings' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <LayoutDashboard size={18}/> Tempahan
          </button>

          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'reports' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <BarChart3 size={18}/> Laporan
          </button>

          {profile?.role === 'master' && (
            <>
              <button onClick={() => setActiveTab('branches')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'branches' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Store size={18}/> Urus Cawangan
              </button>
              <button onClick={() => setActiveTab('staff')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'staff' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Users size={18}/> Pengurusan Staf
              </button>
            </>
          )}
          
          <a href="/admin/scan" className="w-full flex items-center gap-3 p-4 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-2xl font-bold text-sm transition-all">
            <QrCode size={18}/> Scan QR Tiket
          </a>
        </nav>

        <div className="pt-10 border-t">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Akaun Login</p>
            <p className="font-bold text-slate-700 mt-1 truncate uppercase">{profile?.full_name}</p>
            <div className="mt-4 flex items-center justify-between">
                <button onClick={handleLogout} className="text-xs font-bold text-red-500 flex items-center gap-2 hover:underline"><LogOut size={14}/> Log Keluar</button>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow p-6 md:p-12 overflow-y-auto pb-20">
        
        <header className="mb-10 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black text-slate-800 uppercase italic">
                    {activeTab === 'bookings' && 'Senarai Tempahan'}
                    {activeTab === 'branches' && 'Urus Cawangan'}
                    {activeTab === 'staff' && 'Akses Staf'}
                    {activeTab === 'reports' && 'Analisis Laporan'}
                </h1>
                <p className="text-slate-400 font-medium text-sm">Log masuk sebagai <span className="text-red-600 font-bold uppercase underline italic">{profile?.role === 'master' ? 'Master Admin' : profile?.branches?.name}</span></p>
            </div>
        </header>

        {/* TAB: REPORTS */}
        {activeTab === 'reports' && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Total Tempahan</p>
                        <p className="text-4xl font-black text-slate-800 mt-2">{bookings.length}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Pelanggan Sampai</p>
                        <p className="text-4xl font-black text-green-500 mt-2">{bookings.filter(b => b.status === 'checked_in').length}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Menunggu Slot</p>
                        <p className="text-4xl font-black text-amber-500 mt-2">{bookings.filter(b => b.status === 'confirmed').length}</p>
                    </div>
                </div>

                {profile?.role === 'master' && (
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <h3 className="font-black text-slate-800 uppercase italic mb-6 tracking-tight">Prestasi Mengikut Cawangan</h3>
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
            </div>
        )}

        {/* TAB: BOOKINGS */}
        {activeTab === 'bookings' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2">
                <div className="bg-white rounded-[35px] shadow-sm border border-slate-100 overflow-hidden">
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
                                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-6">
                                        <p className="font-bold text-slate-700 uppercase text-sm leading-none mb-1">{b.customer_name}</p>
                                        <p className="text-[10px] text-slate-300 font-bold italic">+{b.customer_phone}</p>
                                    </td>
                                    <td className="p-6 italic font-bold text-slate-400 text-[10px] uppercase">{b.branches?.name}</td>
                                    <td className="p-6 text-center">
                                        {b.status === 'confirmed' ? (
                                            <button onClick={() => handleCheckIn(b.id)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-green-600 transition-all mx-auto flex items-center gap-2">
                                                <CheckCircle size={14}/> Check-in
                                            </button>
                                        ) : (
                                            <span className="text-[9px] font-black text-green-500 uppercase bg-green-50 px-4 py-2 rounded-full italic tracking-widest">Selesai</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* TAB: BRANCHES */}
        {activeTab === 'branches' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border h-fit space-y-6">
                    <h3 className="font-black uppercase italic text-sm flex items-center gap-2 tracking-tight text-slate-800"><Plus className="text-red-600" /> Tambah Outlet</h3>
                    <input type="text" placeholder="NAMA CAWANGAN" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs uppercase" onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
                    <input type="text" placeholder="ALAMAT RINGKAS" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs uppercase" onChange={e => setNewBranch({...newBranch, address: e.target.value})} />
                    <input type="tel" placeholder="WHATSAPP (601...)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs" onChange={e => setNewBranch({...newBranch, whatsapp: e.target.value})} />
                    <button onClick={handleAddBranch} className="w-full bg-red-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Simpan Cawangan</button>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {branches.map(br => (
                        <div key={br.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-50 flex justify-between items-center group transition-all hover:border-red-100">
                            <div className="flex items-center gap-5">
                                <div className="bg-slate-50 p-5 rounded-2xl text-slate-300 group-hover:text-red-600 transition-colors"><Store/></div>
                                <div>
                                    <h4 className="font-black uppercase text-slate-800 tracking-tight">{br.name}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{br.address}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteBranch(br.id)} className="p-3 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* TAB: STAFF (MASTER ONLY - FULL MANAGEMENT) */}
        {activeTab === 'staff' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Register/Edit Staff */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 h-fit">
                    <h3 className="font-black uppercase italic text-sm flex items-center gap-2 tracking-tight">
                        <div className="bg-red-50 p-2 rounded-lg text-red-600"><UserPlus size={18}/></div> 
                        {editingStaff ? 'Edit Maklumat Staf' : 'Daftar Staf Baru'}
                    </h3>
                    
                    <div className="space-y-3">
                        <input type="text" placeholder="NAMA PENUH" 
                            className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs uppercase" 
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
                            <button onClick={handleUpdateStaff} disabled={isProcessing} className="flex-grow bg-slate-900 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl flex justify-center items-center gap-2">
                                {isProcessing ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} Simpan
                            </button>
                            <button onClick={() => setEditingStaff(null)} className="bg-slate-100 p-4 rounded-2xl text-slate-400 hover:text-red-500 transition-colors"><X size={14}/></button>
                        </div>
                    ) : (
                        <button onClick={handleAddStaff} disabled={isProcessing} className="w-full bg-red-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">
                            {isProcessing ? "Memproses..." : "Daftarkan Staf"}
                        </button>
                    )}
                </div>

                {/* List Staff */}
                <div className="lg:col-span-2 space-y-4">
                    {staffList.map(st => (
                        <div key={st.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-50 flex justify-between items-center group transition-all hover:border-red-100">
                            <div className="flex items-center gap-5">
                                <div className={`p-5 rounded-2xl font-black text-lg ${st.role === 'master' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-300'}`}>{st.full_name.charAt(0)}</div>
                                <div>
                                    <h4 className="font-black uppercase text-slate-800 tracking-tight text-sm leading-none mb-1">{st.full_name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${st.role === 'master' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{st.role}</span>
                                        <span className="text-[9px] font-black text-slate-300 uppercase italic">{st.role === 'master' ? 'All HQ Access' : st.branches?.name}</span>
                                    </div>
                                </div>
                            </div>
                            {st.role !== 'master' && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => setEditingStaff(st)} className="p-3 text-slate-200 hover:text-blue-500 transition-colors"><Edit3 size={18}/></button>
                                    <button onClick={() => handleDeleteStaff(st.id)} className="p-3 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
                                  }
