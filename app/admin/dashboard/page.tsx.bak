"use client"
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Users, QrCode, LogOut, MapPin, 
  CheckCircle, Plus, Store, UserPlus, Trash2, BarChart3 
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [newBranch, setNewBranch] = useState({ name: '', address: '', whatsapp: '' });

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase.from('profiles').select('*, branches(name)').eq('id', user.id).single();
      setProfile(prof);
      fetchData(prof);
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
      
      const { data: stData } = await supabase.from('profiles').select('*, branches(name)');
      setStaffList(stData || []);
    }
    setLoading(false);
  }

  // --- LOGIK MASTER ADMIN ---
  const handleAddBranch = async () => {
    await supabase.from('branches').insert([{ name: newBranch.name, address: newBranch.address, whatsapp_number: newBranch.whatsapp }]);
    alert("Cawangan ditambah!");
    window.location.reload();
  };

  const handleDeleteBranch = async (id: string) => {
    if(confirm("Hapus cawangan ini? Semua data berkaitan akan hilang.")) {
        await supabase.from('branches').delete().eq('id', id);
        window.location.reload();
    }
  };

  // --- LOGIK STAFF ---
  const handleCheckIn = async (id: string) => {
    await supabase.from('bookings').update({ status: 'checked_in' }).eq('id', id);
    alert("Pelanggan Check-in!");
    fetchData(profile);
  };

  if (loading) return <div className="p-20 text-center font-bold">Memuatkan Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-72 bg-white border-r p-8 space-y-10 shadow-sm z-20">
        <div className="flex items-center gap-3">
            <img src="/logo.png" className="h-10" />
            <span className="font-black italic text-lg tracking-tighter">HQ PANEL</span>
        </div>

        <nav className="space-y-2">
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'bookings' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <LayoutDashboard size={18}/> Tempahan
          </button>

          {profile?.role === 'master' && (
            <>
              <button onClick={() => setActiveTab('branches')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'branches' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Store size={18}/> Urus Cawangan
              </button>
              <button onClick={() => setActiveTab('staff')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'staff' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Users size={18}/> Pengurusan Staf
              </button>
              <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'reports' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                <BarChart3 size={18}/> Laporan Jualan
              </button>
            </>
          )}
          
          <a href="/admin/scan" className="w-full flex items-center gap-3 p-4 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-2xl font-bold text-sm transition-all">
            <QrCode size={18}/> Scan QR Tiket
          </a>
        </nav>

        <div className="pt-10 border-t">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Akaun Login</p>
            <p className="font-bold text-slate-700 mt-1 truncate">{profile?.full_name}</p>
            <div className="mt-4 flex items-center justify-between">
                <button onClick={() => supabase.auth.signOut()} className="text-xs font-bold text-red-500 flex items-center gap-2 hover:underline"><LogOut size={14}/> Log Keluar</button>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow p-6 md:p-12 overflow-y-auto">
        
        {/* HEADER */}
        <header className="mb-10 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black text-slate-800 uppercase italic">
                    {activeTab === 'bookings' && 'Senarai Tempahan'}
                    {activeTab === 'branches' && 'Urus Cawangan'}
                    {activeTab === 'staff' && 'Akses Staf'}
                    {activeTab === 'reports' && 'Analisis Data'}
                </h1>
                <p className="text-slate-400 font-medium text-sm">Selamat kembali, anda log masuk sebagai <span className="text-red-600 font-bold uppercase underline italic">{profile?.role}</span></p>
            </div>
        </header>

        {/* TAB: BOOKINGS (Untuk Semua) */}
        {activeTab === 'bookings' && (
            <div className="space-y-6">
                <div className="bg-white rounded-[35px] shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Pelanggan</th>
                                <th className="p-6">Cawangan</th>
                                <th className="p-6">Status</th>
                                <th className="p-6">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {bookings.map((b) => (
                                <tr key={b.id} className="hover:bg-slate-50/50">
                                    <td className="p-6">
                                        <p className="font-bold text-slate-700 uppercase">{b.customer_name}</p>
                                        <p className="text-xs text-slate-400">{b.customer_phone}</p>
                                    </td>
                                    <td className="p-6 italic font-bold text-slate-500 text-xs uppercase">{b.branches?.name}</td>
                                    <td className="p-6">
                                        <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full ${b.status === 'checked_in' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        {b.status === 'confirmed' && (
                                            <button onClick={() => handleCheckIn(b.id)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-green-600 transition-all">
                                                <CheckCircle size={14}/> Check-in
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* TAB: BRANCHES (Master Only) */}
        {activeTab === 'branches' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
                {/* Form Tambah Cawangan */}
                <div className="bg-white p-8 rounded-[35px] shadow-sm border h-fit space-y-6">
                    <h3 className="font-black uppercase italic flex items-center gap-2"><Plus className="text-red-600" /> Tambah Outlet</h3>
                    <input type="text" placeholder="Nama Cawangan" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-600" onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
                    <input type="text" placeholder="Alamat" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setNewBranch({...newBranch, address: e.target.value})} />
                    <input type="tel" placeholder="WhatsApp (601...)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setNewBranch({...newBranch, whatsapp: e.target.value})} />
                    <button onClick={handleAddBranch} className="w-full bg-red-600 text-white p-4 rounded-2xl font-bold shadow-lg">Simpan Cawangan</button>
                </div>

                {/* Senarai Cawangan */}
                <div className="lg:col-span-2 space-y-4">
                    {branches.map(br => (
                        <div key={br.id} className="bg-white p-6 rounded-[30px] shadow-sm border flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-100 p-4 rounded-2xl text-slate-400"><Store/></div>
                                <div>
                                    <h4 className="font-black uppercase text-slate-800">{br.name}</h4>
                                    <p className="text-xs text-slate-400 italic">{br.address}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteBranch(br.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={20}/></button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* TAB: STAFF (Master Only) */}
        {activeTab === 'staff' && (
            <div className="space-y-6">
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 text-amber-700 text-sm font-medium">
                    Info: Sila daftar akaun staf di <b>Supabase Auth</b> terlebih dahulu sebelum menguruskan akses mereka di sini.
                </div>
                <div className="bg-white rounded-[35px] shadow-sm border overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Nama Staf</th>
                                <th className="p-6">Role</th>
                                <th className="p-6">Cawangan Bertugas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {staffList.map(st => (
                                <tr key={st.id}>
                                    <td className="p-6 font-bold text-slate-700 uppercase">{st.full_name}</td>
                                    <td className="p-6">
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full ${st.role === 'master' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {st.role}
                                        </span>
                                    </td>
                                    <td className="p-6 text-xs font-bold text-slate-500 italic uppercase">
                                        {st.role === 'master' ? 'SEMUA OUTLET' : (st.branches?.name || 'BELUM SET')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
