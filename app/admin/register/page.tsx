"use client"
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { UserPlus, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function MasterRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // 1. Daftar User di Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Simpan profil sebagai MASTER dalam table profiles
      const { error: profError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          full_name: fullName,
          email: email,
          role: 'master'
        }]);

      if (profError) {
        alert("Auth berjaya, tapi gagal simpan profil: " + profError.message);
      } else {
        alert("Pendaftaran Master Berjaya! Sila login.");
        router.push('/admin/login');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 space-y-8 border border-slate-100">
        <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">Master Registration</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nasi Ayam Haji Ali HQ</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Nama Penuh</label>
            <input type="text" required placeholder="CONTOH: HAJI ALI" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold" 
              onChange={e => setFullName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Email HQ</label>
            <input type="email" required placeholder="admin@hajiali.com" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold" 
              onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Password</label>
            <input type="password" required placeholder="••••••••" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold" 
              onChange={e => setPassword(e.target.value)} />
          </div>

          <button disabled={loading} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 hover:bg-red-600 transition-all shadow-xl">
            {loading ? <Loader2 className="animate-spin" /> : "Daftar Akaun Master"} <ArrowRight size={16}/>
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">Haji Ali Admin System v1.0</p>
      </div>
    </div>
  );
} 
