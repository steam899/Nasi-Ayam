"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  MapPin, Calendar, Clock, Users, CheckCircle, 
  QrCode, ArrowRight, Star, ShieldCheck, 
  Smartphone, ChevronLeft, User, Phone 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  const [form, setForm] = useState({ 
    branchId: '', 
    branchName: '', 
    date: '', 
    time: '', 
    guests: 2, 
    name: '', 
    phone: '', 
    otpInput: '' 
  });

  // Ambil senarai cawangan dari Supabase
  useEffect(() => {
    const fetchBranches = async () => {
      const { data } = await supabase.from('branches').select('*');
      if (data) setBranches(data);
    };
    fetchBranches();
  }, []);

  // 1. JANA OTP & HANTAR WHATSAPP KE PELANGGAN
  const handleRequestOtp = async () => {
    if (!form.phone || !form.name) return alert("Sila isi nama dan telefon!");
    setLoading(true);

    // Jana 6 angka rawak
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    try {
      // Panggil API Route untuk hantar WhatsApp menerusi Gateway (Fonnte/Wapi)
      await fetch('/api/whatsapp', {
        method: 'POST',
        body: JSON.stringify({ 
          type: 'send_otp', 
          phone: form.phone, 
          otp: otp 
        })
      });
      setStep(5); // Pergi ke skrin masukkan OTP
    } catch (e) {
      alert("Gagal menghantar OTP. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // 2. SAHKAN OTP & SIMPAN TEMPAHAN
  const handleVerifyAndBook = async () => {
    if (form.otpInput !== generatedOtp) {
      return alert("Kod OTP salah! Sila periksa WhatsApp anda.");
    }

    setLoading(true);
    const ref = `NHA-${Math.random().toString(36).toUpperCase().substring(2, 7)}`;
    
    // Simpan ke Supabase
    const { error } = await supabase.from('bookings').insert([{
      booking_reference: ref,
      customer_name: form.name,
      customer_phone: form.phone,
      branch_id: form.branchId,
      booking_date: form.date,
      booking_time: form.time,
      guest_count: form.guests,
      status: 'confirmed'
    }]);

    if (!error) {
      setBookingRef(ref);
      
      // Hantar WhatsApp Pengesahan kepada Pelanggan & Outlet (601110309430)
      const details = { ref, branch: form.branchName, date: form.date, time: form.time, guests: form.guests };
      
      // Ke Pelanggan
      fetch('/api/whatsapp', { method: 'POST', body: JSON.stringify({ type: 'confirm_booking', phone: form.phone, name: form.name, details }) });
      
      // Ke Outlet
      fetch('/api/whatsapp', { method: 'POST', body: JSON.stringify({ type: 'confirm_booking', phone: '601110309430', name: form.name, details }) });

      setStep(6); // Skrin Berjaya
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-10 selection:bg-red-100">
      
      {/* HEADER SECTION */}
      <header className="bg-white px-6 pt-12 pb-8 text-center border-b border-slate-100 shadow-sm">
        <motion.img 
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          src="/logo.png" 
          alt="Nasi Ayam Haji Ali" 
          className="h-24 w-24 mx-auto object-contain mb-4 rounded-full shadow-md border-4 border-slate-50" 
          onError={(e) => { (e.target as any).style.display = 'none' }}
        />
        <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase italic">Nasi Ayam Haji Ali</h1>
        <div className="flex justify-center items-center gap-1 mt-1 text-amber-400">
          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
          <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest italic">Authentic Since 1990</span>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: PILIH CAWANGAN */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] text-center mb-4">Langkah 1: Pilih Lokasi</p>
              <div className="grid gap-3">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { setForm({...form, branchId: b.id, branchName: b.name}); setStep(2); }}
                    className="group flex items-center justify-between p-5 bg-white rounded-[24px] shadow-sm border-2 border-transparent hover:border-[#D62828] transition-all active:scale-95 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-red-50 p-3 rounded-2xl text-[#D62828] group-hover:bg-[#D62828] group-hover:text-white transition-colors">
                        <MapPin size={22} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{b.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{b.address || 'Johor, Malaysia'}</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-200 group-hover:text-[#D62828] transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: TARIKH & MASA */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest"><ChevronLeft size={16}/> Tukar Lokasi</button>
              <div className="bg-white p-8 rounded-[35px] shadow-xl space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Calendar size={14}/> Tarikh</label>
                  <input type="date" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#D62828] font-bold" onChange={(e) => setForm({...form, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Clock size={14}/> Masa</label>
                  <input type="time" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#D62828] font-bold" onChange={(e) => setForm({...form, time: e.target.value})} />
                </div>
                <button onClick={() => setStep(3)} disabled={!form.date || !form.time} className="w-full bg-[#D62828] text-white p-5 rounded-2xl font-bold shadow-lg shadow-red-100 active:scale-95 transition-all">Seterusnya</button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PILIH BILANGAN TETAMU (PAX) */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center">
               <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest"><ChevronLeft size={16}/> Kembali</button>
               <h2 className="text-xl font-black text-slate-800">Berapa orang tetamu?</h2>
               <div className="grid grid-cols-4 gap-3">
                {[1,2,3,4,5,6,7,8].map(n => (
                  <button 
                    key={n}
                    onClick={() => { setForm({...form, guests: n}); setStep(4); }}
                    className={`p-5 rounded-[20px] font-black text-lg transition-all active:scale-90 ${form.guests === n ? 'bg-[#D62828] text-white shadow-lg shadow-red-100' : 'bg-white text-slate-400 shadow-sm'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: BUTIRAN PERIBADI & HANTAR OTP */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white p-8 rounded-[35px] shadow-xl text-center space-y-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto"><ShieldCheck size={32}/></div>
                <h2 className="text-xl font-black text-slate-800">Pengesahan Selamat</h2>
                <div className="space-y-3">
                  <div className="relative text-left">
                    <User className="absolute left-4 top-4 text-slate-300" size={20} />
                    <input type="text" placeholder="Nama Penuh" className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#D62828] font-bold" onChange={(e) => setForm({...form, name: e.target.value})} />
                  </div>
                  <div className="relative text-left">
                    <Phone className="absolute left-4 top-4 text-slate-300" size={20} />
                    <input type="tel" placeholder="60123456789" className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#D62828] font-bold" onChange={(e) => setForm({...form, phone: e.target.value})} />
                  </div>
                </div>
                <button onClick={handleRequestOtp} disabled={loading || !form.name || !form.phone} className="w-full bg-[#D62828] text-white p-5 rounded-2xl font-bold shadow-xl flex justify-center items-center gap-2">
                  {loading ? "Menghantar..." : "Hantar OTP Ke WhatsApp"} <ArrowRight size={18}/>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: MASUKKAN OTP */}
          {step === 5 && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-[35px] shadow-xl text-center space-y-8">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto animate-bounce"><Smartphone size={32}/></div>
              <div>
                <h2 className="text-xl font-black">Kod Pengesahan</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Kod dihantar ke WhatsApp <br/> <span className="text-slate-800">+{form.phone}</span></p>
              </div>
              <input 
                type="text" 
                maxLength={6} 
                placeholder="0 0 0 0 0 0" 
                className="w-full text-center text-4xl font-black tracking-[8px] bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 outline-none focus:border-[#D62828] focus:bg-white transition-all"
                onChange={(e) => setForm({...form, otpInput: e.target.value})} 
              />
              <button onClick={handleVerifyAndBook} disabled={loading || form.otpInput.length < 6} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-bold shadow-2xl active:scale-95 transition-all">
                {loading ? "Mengesahkan..." : "Sahkan & Tempah Sekarang"}
              </button>
              <button onClick={() => setStep(4)} className="text-xs font-bold text-slate-300 uppercase tracking-widest">Ganti Nombor Telefon</button>
            </motion.div>
          )}

          {/* STEP 6: TIKET QR BERJAYA */}
          {step === 6 && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6 pb-10">
              <div className="bg-white rounded-[45px] overflow-hidden shadow-2xl border border-slate-100 relative">
                <div className="bg-[#D62828] p-10 text-center text-white relative">
                  <CheckCircle size={54} className="mx-auto mb-4 drop-shadow-lg" />
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase">Tempahan Berjaya!</h2>
                  <p className="text-[10px] font-black uppercase tracking-[3px] opacity-60">Sila Simpan Tiket Ini</p>
                  {/* Decorative Cutouts */}
                  <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-[#F8FAFC] rounded-full"></div>
                  <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-[#F8FAFC] rounded-full"></div>
                </div>
                
                <div className="p-8 text-center bg-white space-y-8">
                  <div className="p-4 bg-white rounded-[40px] inline-block border-[10px] border-slate-50 shadow-inner">
                    <QRCodeSVG value={bookingRef} size={170} />
                  </div>

                  <div className="text-left space-y-4 bg-slate-50 p-6 rounded-[30px] border border-slate-100">
                    <div className="flex justify-between items-center border-b border-white pb-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rujukan</span>
                      <span className="font-black text-[#D62828] text-lg tracking-tight">{bookingRef}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white pb-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lokasi</span>
                      <span className="font-bold text-slate-700">{form.branchName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tarikh/Masa</span>
                      <span className="font-bold text-slate-700 uppercase text-xs">{form.date} | {form.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-slate-300 italic">
                    <QrCode size={14} />
                    <p className="text-[9px] font-bold uppercase tracking-widest">Tunjukkan Kod Semasa Ketibaan</p>
                  </div>

                  <button onClick={() => window.location.reload()} className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-[4px]">Tutup</button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="mt-6 text-center opacity-20">
        <p className="text-[8px] font-black uppercase tracking-[6px] text-slate-900">Nasi Ayam Haji Ali &copy; 2025</p>
      </footer>
    </div>
  );
      }
