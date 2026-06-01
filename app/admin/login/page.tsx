"use client"
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-[30px] shadow-xl space-y-6">
        <img src="/logo.png" className="h-20 mx-auto mb-4" />
        <h1 className="text-xl font-black text-center uppercase italic">Staff Login</h1>
        <input type="email" placeholder="Email Staf" className="w-full p-4 bg-slate-50 rounded-2xl outline-none border" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-2xl outline-none border" onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold">Masuk Dashboard</button>
      </form>
    </div>
  );
}
