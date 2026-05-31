"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Calendar, Clock, Users, CheckCircle, QrCode, ArrowRight, Star, ShieldCheck, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  const [form, setForm] = useState({ 
    branchId: '', branchName: '', date: '', time: '', guests: 2, name: '', phone: '', otpInput: '' 
  });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('branches').select('*');
      if (data) setBranches(data);
    };
    fetch();
  }, []);

  // FUNGSI 1: JANA & HANTAR OTP
  const requestOtp = async () => {
    if (!form.phone || !form.name) return alert("Sila isi nama dan telefon");
    setLoading(true);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    // Simpan OTP ke Supabase untuk verifikasi
    await supabase.from('otp_verifications').insert([{ phone: form.phone, otp_code: otp }]);

    // Hantar menerusi API WhatsApp
    await fetch('/api/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ type: 'send_otp', phone: form.phone, otp: otp })
    });

    setLoading(false);
    setStep(4); // Pergi ke skrin masukkan OTP
  };

  // FUNGSI 2: SAHKAN OTP & SIMPAN BOOKING
  const verifyAndBook = async () => {
    if (form.otpInput !== generatedOtp) return alert("Kod OTP salah! Sila cuba lagi.");
    
    setLoading(true);
    const ref = `NHA-${Math.random().toString(36).toUpperCase().substring(2, 7)}`;
    
    // 1. Simpan ke Database
    const { error } = await supabase.from('bookings').insert([{
      booking_reference: ref, customer_name: form.name, customer_phone: form.phone,
      branch_id: form.branchId, booking_date: form.date, booking_time: form.time, guest_count: form.guests,
      status: 'confirmed'
    }]);

    if (!error) {
      setBookingRef(ref);
      
      // 2. Hantar Notifikasi ke WhatsApp Outlet
      await fetch('/api/whatsapp', {
        method: 'POST',
        body: JSON.stringify({ 
          type: 'confirm_booking', 
          phone: form.phone, 
          name: form.name,
          details: { branch: form.branchName, date: form.date, time: form.time, guests: form.guests }
        })
      });

      setStep(5);
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-10">
      {/* Header Premium */}
      <div className="bg-white border-b border-slate-100 p-8 text-center shadow-sm">
        <motion.img initial={{ y: -10 }} animate={{ y: 0 }} src="/logo.png" alt="Logo" className="h-24 w-24 mx-auto mb-3 object-contain rounded-full shadow-md" />
        <h1 className="text-xl font-black text-slate-800 tracking-tight">NASI AYAM HAJI ALI</h1>
        <div className="flex justify-center items-center gap-1 mt-1 text-amber-400">
           <Star size={12} fill="currentColor" /> <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistem Tempahan Sah</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: PILIH LOKASI */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[2px] mb-2 text-center">Pilih Cawangan</p>
              <div className="grid gap-3">
                {branches.map(b => (
                  <button key={b.id} onClick={() => { setForm({...form, branchId: b.id, branchName: b.name}); setStep(2); }}
                    className="group flex items-center justify-between p-5 bg-white rounded-3xl shadow-sm border-2 border-transparent hover:border-[#D62828] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="bg-red-50 p-3 rounded-2xl text-[#D62828] group-hover:bg-[#D62828] group-hover:text-white transition-colors"><MapPin size={22} /></div>
                      <span className="font-bold text-lg">{b.name}</span>
                    </div>
                    <ArrowRight size={18} className="text-slate-200" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: TARIKH & MASA */}
          {step === 2 && (
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white p-8 rounded-[35px] shadow-xl space-y-6">
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tarikh</label>
                    <input type="date" className="w-full bg-transparent font-bold outline-none" onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Masa</label>
                    <input type="time" className="w-full bg-transparent font-bold outline-none" onChange={e => setForm({...form, time: e.target.value})} />
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl font-bold">
                    <span className="text-sm text-slate-400 uppercase text-[10px]">Bilangan Pax</span>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setForm({...form, guests: Math.max(1, form.guests-1)})} className="bg-white w-8 h-8 rounded-lg shadow-sm">-</button>
                        <span>{form.guests}</span>
                        <button onClick={() => setForm({...form, guests: form.guests+1})} className="bg-white w-8 h-8 rounded-lg shadow-sm">+</button>
                    </div>
                </div>
              </div>
              <button onClick={() => setStep(3)} disabled={!form.date || !form.time} className="w-full bg-[#D62828] text-white p-5 rounded-2xl font-bold shadow-lg shadow-red-100 transition-transform active:scale-95">Seterusnya</button>
            </motion.div>
          )}

          {/* STEP 3: INFO PELANGGAN */}
          {step === 3 && (
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white p-8 rounded-[35px] shadow-xl space-y-5 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2"><ShieldCheck size={32}/></div>
              <h2 className="text-xl font-bold">Langkah Keselamatan</h2>
              <p className="text-xs text-slate-400">Masukkan nombor telefon untuk menerima kod OTP menerusi WhatsApp.</p>
              <input type="text" placeholder="Nama Anda" className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-none focus:ring-2 focus:ring-[#D62828]" onChange={e => setForm({...form, name: e.target.value})} />
              <input type="tel" placeholder="60186140630" className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-none focus:ring-2 focus:ring-[#D62828]" onChange={e => setForm({...form, phone: e.target.value})} />
              <button onClick={requestOtp} disabled={loading} className="w-full bg-[#D62828] text-white p-5 rounded-2xl font-bold shadow-lg">
                 {loading ? "Menghantar OTP..." : "Hantar OTP Ke WhatsApp"}
              </button>
            </motion.div>
          )}

          {/* STEP 4: SAHKAN OTP */}
          {step === 4 && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-[35px] shadow-xl text-center space-y-6">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto"><Smartphone size={32} className="animate-bounce"/></div>
              <h2 className="text-xl font-bold">Masukkan Kod OTP</h2>
              <p className="text-xs text-slate-400">Kod dihantar ke WhatsApp <b>{form.phone}</b></p>
              <input type="text" maxLength={6} placeholder="------" className="w-full text-center text-3xl font-black tracking-[10px] outline-none" onChange={e => setForm({...form, otpInput: e.target.value})} />
              <button onClick={verifyAndBook} disabled={loading || form.otpInput.length < 6} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-bold">
                 {loading ? "Mengesahkan..." : "Sahkan & Confirm Booking"}
              </button>
            </motion.div>
          )}

          {/* STEP 5: SUCCESS TICKETING */}
          {step === 5 && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
                <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100">
                    <div className="bg-[#D62828] p-8 text-center text-white">
                        <CheckCircle size={50} className="mx-auto mb-3" />
                        <h2 className="text-2xl font-black italic tracking-tight uppercase">Tempahan Berjaya!</h2>
                        <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Tiket anda telah disahkan</p>
                    </div>
                    <div className="p-8 text-center bg-white space-y-6">
                        <div className="p-4 bg-slate-50 rounded-[40px] inline-block border-8 border-white shadow-inner">
                            <QRCodeSVG value={bookingRef} size={160} />
                        </div>
                        <div className="text-left space-y-3 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                            <div className="flex justify-between border-b border-white pb-2 font-bold text-sm">
                                <span className="text-slate-400 uppercase text-[10px]">Reference</span>
                                <span className="text-[#D62828]">{bookingRef}</span>
                            </div>
                            <div className="flex justify-between border-b border-white pb-2 font-bold text-sm">
                                <span className="text-slate-400 uppercase text-[10px]">Cawangan</span>
                                <span>{form.branchName}</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm">
                                <span className="text-slate-400 uppercase text-[10px]">Masa</span>
                                <span>{form.date} | {form.time}</span>
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Sila tunjukkan tiket ini semasa sampai di kaunter</p>
                        <button onClick={() => window.location.reload()} className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-widest">Tutup</button>
                    </div>
                </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <footer className="mt-10 text-center opacity-30">
        <p className="text-[9px] font-black uppercase tracking-[5px]">Nasi Ayam Haji Ali &copy; 2025</p>
      </footer>
    </div>
  );
}
