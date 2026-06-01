"use client"
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';

export default function MasterRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Daftar User di Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Simpan profil sebagai MASTER
        const { error: profError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            full_name: fullName,
            email: email,
            role: 'master'
          }]);

        if (profError) throw profError;

        alert("Pendaftaran Master Berjaya! Anda akan dibawa ke Dashboard.");
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Berlaku ralat yang tidak dijangka.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 space-y-8 border border-slate-100">
        <div className="text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800 leading-none">Master Access</h1>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[4px] mt-2">Nasi Ayam Haji Ali HQ</p>
        </div>

        {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 text-red-700 text-xs font-bold animate-pulse">
                <AlertTriangle size={20} /> {errorMsg}
            </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" required placeholder="NAMA PENUH" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold text-xs uppercase" 
            onChange={e => setFullName(e.target.value)} />
          
          <input type="email" required placeholder="EMAIL HQ" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold text-xs uppercase" 
            onChange={e => setEmail(e.target.value)} />

          <input type="password" required placeholder="PASSWORD" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold text-xs" 
            onChange={e => setPassword(e.target.value)} />

          <button disabled={loading} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex justify-center items-center gap-2 hover:bg-red-600 transition-all shadow-xl disabled:bg-slate-200">
            {loading ? <Loader2 className="animate-spin" /> : "Daftar Akaun Master"} <ArrowRight size={16}/>
          </button>
        </form>

        <p className="text-center text-[8px] text-slate-200 font-black uppercase tracking-[5px]">Admin System v1.0</p>
      </div>
    </div>
  );
}
