"use client"
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Users, QrCode, LogOut, MapPin, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, arrived: 0 });

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data: prof } = await supabase.from('profiles').select('*, branches(name)').eq('id', user.id).single();
      setProfile(prof);
      fetchBookings(prof);
    }
  }

  async function fetchBookings(prof: any) {
    let query = supabase.from('bookings').select('*, branches(name)').order('created_at', { ascending: false });
    
    // PENAPISAN: Jika staff, filter ikut branch_id mereka
    if (prof.role === 'staff') {
      query = query.eq('branch_id', prof.branch_id);
    }

    const { data } = await query;
    if (data) {
      setBookings(data);
      setStats({
        total: data.length,
        pending: data.filter(b => b.status === 'confirmed').length,
        arrived: data.filter(b => b.status === 'checked_in').length
      });
    }
  }

  const handleCheckIn = async (id: string) => {
    await supabase.from('bookings').update({ status: 'checked_in' }).eq('id', id);
    alert("Pelanggan telah Check-in!");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-white border-r p-6 space-y-8">
        <img src="/logo.png" className="h-12" />
        <nav className="space-y-2">
          <button className="w-full flex items-center gap-3 p-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm">
            <LayoutDashboard size={20}/> Dashboard
          </button>
          <a href="/admin/scan" className="w-full flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-50 rounded-xl font-bold text-sm">
            <QrCode size={20}/> Scan QR Tiket
          </a>
        </nav>
        <div className="pt-10 border-t">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akaun Anda</p>
            <p className="font-bold text-sm mt-1">{profile?.full_name}</p>
            <p className="text-xs text-red-600 font-bold uppercase italic">{profile?.role === 'master' ? 'Master Admin' : profile?.branches?.name}</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow p-6 md:p-10 space-y-8">
        <header className="flex justify-between items-center">
            <h1 className="text-2xl font-black italic uppercase">Senarai Tempahan</h1>
            <button onClick={() => supabase.auth.signOut()} className="text-slate-400 hover:text-red-600"><LogOut/></button>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-blue-500">
                <p className="text-slate-400 text-xs font-bold uppercase">Jumlah Tempahan</p>
                <p className="text-3xl font-black mt-2">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-amber-500">
                <p className="text-slate-400 text-xs font-bold uppercase">Menunggu Ketibaan</p>
                <p className="text-3xl font-black mt-2 text-amber-500">{stats.pending}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-green-500">
                <p className="text-slate-400 text-xs font-bold uppercase">Sudah Sampai</p>
                <p className="text-3xl font-black mt-2 text-green-500">{stats.arrived}</p>
            </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[35px] shadow-sm overflow-hidden border">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                    <tr>
                        <th className="p-4">Pelanggan</th>
                        <th className="p-4">Cawangan</th>
                        <th className="p-4">Masa</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Tindakan</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                                <p className="font-bold text-sm uppercase">{b.customer_name}</p>
                                <p className="text-[10px] text-slate-400">{b.customer_phone}</p>
                            </td>
                            <td className="p-4">
                                <span className="text-xs font-bold flex items-center gap-1 text-slate-500 uppercase italic">
                                    <MapPin size={12}/> {b.branches?.name}
                                </span>
                            </td>
                            <td className="p-4 text-xs font-medium">
                                {b.booking_date} <br/> <span className="text-slate-400">{b.booking_time}</span>
                            </td>
                            <td className="p-4">
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${b.status === 'checked_in' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {b.status}
                                </span>
                            </td>
                            <td className="p-4">
                                {b.status === 'confirmed' && (
                                    <button onClick={() => handleCheckIn(b.id)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-600 transition-colors flex items-center gap-2">
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
    </div>
  );
}
