"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Utensils, Calendar, Users, Clock, MapPin, CheckCircle, QrCode, ArrowRight, ChevronLeft, Star, Phone, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [bookingRef, setBookingRef] = useState('');

  const [form, setForm] = useState({
    branchId: '',
    branchName: '',
    date: '',
    time: '',
    guests: 2,
    name: '',
    phone: '',
  });

  useEffect(() => {
    const fetchBranches = async () => {
      const { data } = await supabase.from('branches').select('*');
      if (data) setBranches(data);
    };
    fetchBranches();
  }, []);

  const handleBooking = async () => {
    setLoading(true);
    const ref = `NHA-${Math.random().toString(36).toUpperCase().substring(2, 7)}`;
    const { error } = await supabase.from('bookings').insert([{
      booking_reference: ref,
      customer_name: form.name,
      customer_phone: form.phone,
      branch_id: form.branchId,
      booking_date: form.date,
      booking_time: form.time,
      guest_count: form.guests,
      status: 'pending'
    }]);

    if (!error) { setBookingRef(ref); setStep(5); }
    else { alert(error.message); }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 font-sans antialiased text-slate-900">
      
      {/* HEADER SECTION */}
      <header className="bg-white px-6 pt-12 pb-6 text-center border-b border-gray-100">
        <motion.img 
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          src="/logo.png" 
          alt="Logo" 
          className="h-24 w-24 mx-auto object-contain mb-4 rounded-full shadow-sm border border-gray-50" 
        />
        <h1 className="text-xl font-extrabold tracking-tight text-slate-800">Nasi Ayam Haji Ali</h1>
        <div className="flex justify-center items-center gap-1 mt-1">
          {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
          <span className="text-xs font-semibold text-slate-400 ml-1">4.9 (2.4k+ Reviews)</span>
        </div>
      </header>

      <main className="p-6">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: PILIH CAWANGAN (CLICKABLE CARDS) */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <div className="flex justify-between items-end mb-2">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 text-xs">Langkah 1: Pilih Cawangan</h2>
                <span className="text-xs font-bold text-[#D62828]">1/4</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { setForm({...form, branchId: b.id, branchName: b.name}); setStep(2); }}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${form.branchId === b.id ? 'border-[#D62828] bg-red-50' : 'border-white bg-white shadow-sm'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${form.branchId === b.id ? 'bg-[#D62828] text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{b.name}</p>
                        <p className="text-xs text-slate-400">{b.address || 'Johor, Malaysia'}</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className={form.branchId === b.id ? 'text-[#D62828]' : 'text-slate-300'} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: TARIKH & MASA */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 text-sm font-medium"><ChevronLeft size={18}/> Tukar Cawangan</button>
              <div className="bg-white p-6 rounded-3xl shadow-sm space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Calendar size={14}/> Tarikh Tempahan</label>
                  <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#D62828] transition-all" onChange={(e) => setForm({...form, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Clock size={14}/> Pilihan Masa</label>
                  <input type="time" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#D62828] transition-all" onChange={(e) => setForm({...form, time: e.target.value})} />
                </div>
                <button onClick={() => setStep(3)} disabled={!form.date || !form.time} className="w-full bg-[#D62828] text-white p-4 rounded-2xl font-bold shadow-lg shadow-red-100 transition-all active:scale-95 disabled:opacity-30">Teruskan</button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PAX SELECTION */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-center">
              <h2 className="text-xl font-bold text-slate-800">Berapa orang tetamu?</h2>
              <div className="grid grid-cols-4 gap-3">
                {[1,2,3,4,5,6,7,8].map(n => (
                  <button 
                    key={n}
                    onClick={() => { setForm({...form, guests: n}); setStep(4); }}
                    className={`p-4 rounded-2xl font-bold transition-all ${form.guests === n ? 'bg-[#D62828] text-white' : 'bg-white text-slate-400 shadow-sm'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="text-slate-400 text-sm font-medium underline">Kembali</button>
            </motion.div>
          )}

          {/* STEP 4: BUTIRAN DIRI */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
                <h2 className="font-bold text-slate-800 border-b pb-4 mb-4">Butiran Hubungan</h2>
                <div className="space-y-1">
                  <div className="relative">
                    <User className="absolute left-4 top-4 text-slate-300" size={20} />
                    <input type="text" placeholder="Nama Penuh" className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none border-none focus:ring-2 focus:ring-[#D62828]" onChange={(e) => setForm({...form, name: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 text-slate-300" size={20} />
                    <input type="tel" placeholder="60123456789" className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none border-none focus:ring-2 focus:ring-[#D62828]" onChange={(e) => setForm({...form, phone: e.target.value})} />
                  </div>
                </div>
                <button onClick={handleBooking} disabled={loading || !form.name || !form.phone} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold shadow-xl flex justify-center items-center gap-2 disabled:opacity-30">
                  {loading ? "Sila Tunggu..." : "Sahkan Tempahan Sekarang"} <ArrowRight size={18}/>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: SUCCESS & TICKET */}
          {step === 5 && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6 pb-10">
              <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl">
                <div className="bg-[#D62828] p-6 text-center text-white">
                  <CheckCircle className="mx-auto mb-2" size={40} />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Tempahan Berjaya</h2>
                  <p className="text-xs opacity-70 italic">Sila tangkap layar (screenshot) tiket ini</p>
                </div>
                <div className="p-8 text-center space-y-6">
                  <div className="p-3 border-4 border-slate-50 rounded-3xl inline-block bg-white shadow-inner">
                    <QRCodeSVG value={bookingRef} size={150} />
                  </div>
                  <div className="text-left space-y-3 bg-slate-50 p-4 rounded-2xl">
                    <div className="flex justify-between border-b border-white pb-2 text-sm">
                      <span className="text-slate-400">Rujukan:</span>
                      <span className="font-bold text-[#D62828]">{bookingRef}</span>
                    </div>
                    <div className="flex justify-between border-b border-white pb-2 text-sm">
                      <span className="text-slate-400">Cawangan:</span>
                      <span className="font-bold">{form.branchName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Tarikh/Masa:</span>
                      <span className="font-bold">{form.date} | {form.time}</span>
                    </div>
                  </div>
                  <button onClick={() => window.location.reload()} className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold text-sm">Kembali ke Utama</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="p-10 text-center opacity-20">
        <p className="text-[10px] font-black uppercase tracking-[4px]">Haji Ali &copy; 2025</p>
      </footer>
    </div>
  );
}
