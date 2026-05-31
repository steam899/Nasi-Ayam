"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Utensils, Calendar, Users, Clock, MapPin, CheckCircle, QrCode, ArrowRight, ChevronLeft, Star } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [bookingRef, setBookingRef] = useState('');

  const [form, setForm] = useState({
    branchId: '',
    date: '',
    time: '',
    guests: 2,
    name: '',
    phone: '',
    otp: ''
  });

  useEffect(() => {
    const fetchBranches = async () => {
      const { data } = await supabase.from('branches').select('*');
      if (data) setBranches(data);
    };
    fetchBranches();
  }, []);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

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

    if (error) {
      alert("Error: " + error.message);
    } else {
      setBookingRef(ref);
      setStep(4);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FDFDFD] pb-10">
      
      {/* HEADER & LOGO */}
      <div className="relative h-48 bg-[#D62828] flex flex-col items-center justify-center text-white px-6 rounded-b-[40px] shadow-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="grid grid-cols-4 gap-4 rotate-12 scale-150">
                {[...Array(12)].map((_, i) => <Utensils key={i} size={40} />)}
            </div>
        </div>
        
        {/* LOGO.PNG - Make sure to upload to public/logo.png */}
        <img src="/logo.png" alt="Nasi Ayam Haji Ali" className="h-20 w-auto mb-2 drop-shadow-lg" 
             onError={(e) => { (e.target as any).style.display = 'none' }} />
        
        <h1 className="text-2xl font-black tracking-tighter uppercase italic">Nasi Ayam Haji Ali</h1>
        <div className="flex items-center gap-1 mt-1 text-[#F4C542]">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#F4C542" />)}
            <span className="text-white text-xs ml-1 opacity-80">(4.9/5 stars)</span>
        </div>
      </div>

      <div className="px-6 -mt-10 relative z-10">
        
        {/* STEP INDICATOR */}
        <div className="flex justify-between mb-4 px-2">
            {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 w-[30%] rounded-full transition-all ${step >= s ? 'bg-[#F4C542]' : 'bg-white/30'}`} />
            ))}
        </div>

        <AnimatePresence mode="wait">
          
          {/* STEP 1: LOKASI & MASA */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-5">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800 border-b pb-3">
                <MapPin className="text-[#D62828]" size={20} /> Maklumat Slot
              </h2>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Pilih Cawangan</label>
                  <select 
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#D62828] outline-none"
                    onChange={(e) => setForm({...form, branchId: e.target.value})}
                  >
                    <option value="">-- Pilih Lokasi --</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Tarikh</label>
                    <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl ring-1 ring-gray-100 outline-none" 
                      onChange={(e) => setForm({...form, date: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Masa</label>
                    <input type="time" className="w-full p-4 bg-gray-50 rounded-2xl ring-1 ring-gray-100 outline-none" 
                      onChange={(e) => setForm({...form, time: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Bilangan Tetamu (Pax)</label>
                  <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl ring-1 ring-gray-100">
                     <button onClick={() => setForm({...form, guests: Math.max(1, form.guests - 1)})} className="w-12 h-12 bg-white rounded-xl shadow-sm text-xl font-bold">-</button>
                     <span className="flex-grow text-center font-bold text-lg">{form.guests} Pax</span>
                     <button onClick={() => setForm({...form, guests: form.guests + 1})} className="w-12 h-12 bg-white rounded-xl shadow-sm text-xl font-bold">+</button>
                  </div>
                </div>
              </div>

              <button onClick={nextStep} disabled={!form.branchId || !form.date || !form.time}
                className="w-full btn-primary p-4 rounded-2xl font-bold shadow-lg shadow-red-100 flex justify-center items-center gap-2">
                Seterusnya <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 2: MAKLUMAT PERIBADI */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-5">
              <button onClick={prevStep} className="flex items-center gap-1 text-sm text-gray-400 mb-2"><ChevronLeft size={16}/> Kembali</button>
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800 border-b pb-3">
                <Users className="text-[#D62828]" size={20} /> Butiran Pelanggan
              </h2>

              <div className="space-y-4">
                <input type="text" placeholder="Nama Penuh" className="w-full p-4 bg-gray-50 rounded-2xl ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-[#D62828]" 
                  onChange={(e) => setForm({...form, name: e.target.value})} />
                
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+60</span>
                    <input type="tel" placeholder="123456789" className="w-full p-4 pl-14 bg-gray-50 rounded-2xl ring-1 ring-gray-100 outline-none" 
                      onChange={(e) => setForm({...form, phone: e.target.value})} />
                </div>
              </div>

              <button onClick={nextStep} disabled={!form.name || !form.phone}
                className="w-full btn-primary p-4 rounded-2xl font-bold flex justify-center items-center gap-2">
                Hantar Kod Pengesahan <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 3: OTP VERIFICATION */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <Clock className="text-[#D62828] animate-pulse" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Pengesahan Nombor</h2>
                <p className="text-sm text-gray-400 mt-1">Kod 6-digit dihantar ke <b>+60{form.phone}</b></p>
              </div>
              
              <input type="text" placeholder="· · · · · ·" maxLength={6} 
                className="w-full text-center text-3xl font-mono tracking-[8px] p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 outline-none focus:border-[#D62828]"
                onChange={(e) => setForm({...form, otp: e.target.value})} />

              <button onClick={handleBooking} disabled={loading || form.otp.length < 6}
                className="w-full bg-black text-white p-4 rounded-2xl font-bold shadow-xl flex justify-center items-center">
                {loading ? "Menyimpan Tempahan..." : "Sahkan & Tempah Sekarang"}
              </button>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS & QR */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-6">
              <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-gray-100 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-800">Tempahan Sah!</h2>
                <p className="text-sm text-gray-500 mb-6">Sila tunjukkan tiket ini semasa ketibaan.</p>

                <div className="p-4 bg-white rounded-3xl border-[6px] border-[#F4C542] inline-block shadow-lg mb-6">
                    <QRCodeSVG value={bookingRef} size={160} />
                </div>

                <div className="bg-gray-50 p-5 rounded-[30px] text-left space-y-3 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 bg-[#F4C542] text-[10px] font-black rounded-bl-xl uppercase tracking-widest">Confirmed</div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">No. Rujukan</span>
                        <span className="font-black text-[#D62828] text-lg">{bookingRef}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase italic">Pelanggan</span>
                            <span className="font-bold truncate">{form.name}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Tarikh & Masa</span>
                            <span className="font-bold">{form.date} | {form.time}</span>
                        </div>
                    </div>
                </div>
              </div>

              <div className="bg-[#D62828] p-6 rounded-3xl text-white flex items-center justify-between shadow-xl">
                 <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl"><Utensils size={24}/></div>
                    <div>
                        <p className="text-[10px] font-bold uppercase opacity-80">Loyalty Poin</p>
                        <p className="font-black text-lg">+10 Poin Haji Ali</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-xs">Kumpul 50 poin untuk</p>
                    <p className="font-bold text-[#F4C542]">Nasi Ayam Percuma!</p>
                 </div>
              </div>

              <button onClick={() => window.location.reload()} className="w-full py-4 text-gray-400 text-sm font-medium">Buat Tempahan Baru</button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <footer className="mt-10 px-6 text-center">
        <p className="text-gray-300 text-[10px] font-bold tracking-[2px] uppercase">
            Nasi Ayam Haji Ali &copy; 2025 • Johor, Malaysia
        </p>
      </footer>
    </div>
  );
}
