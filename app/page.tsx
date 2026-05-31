"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  MapPin, Calendar, Clock, Users, CheckCircle, 
  QrCode, ArrowRight, Star, ShieldCheck, 
  Smartphone, ChevronLeft, User, Phone, MessageCircle 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  
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

  useEffect(() => {
    const fetchBranches = async () => {
      const { data } = await supabase.from('branches').select('*');
      if (data) setBranches(data);
    };
    fetchBranches();
  }, []);

  // SOLUSI 2: JANA OTP & TUNJUK NOTIFIKASI SIMULASI
  const handleRequestOtp = () => {
    if (!form.phone || !form.name) return alert("Sila isi nama dan telefon!");
    setLoading(true);

    // Jana 6 angka rawak
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    setTimeout(() => {
        setGeneratedOtp(otp);
        setLoading(false);
        setShowOtpPopup(true); // Tunjukkan popup simulasi WhatsApp masuk
        setStep(5); 
    }, 1500);
  };

  // SAHKAN OTP & SIMPAN TEMPAHAN
  const handleVerifyAndBook = async () => {
    if (form.otpInput !== generatedOtp) {
      return alert("Kod OTP salah! Sila lihat kod dalam kotak kuning.");
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
      setStep(6);
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  // FUNGSI HANTAR WHATSAPP KE OUTLET SECARA MANUAL
  const sendToWhatsApp = () => {
    const message = `*TEMPAHAN NASI AYAM HAJI ALI*%0A--------------------------%0ARef: ${bookingRef}%0ANama: ${form.name}%0ATelefon: ${form.phone}%0ACawangan: ${form.branchName}%0ATarikh: ${form.date}%0AMasa: ${form.time}%0ATetamu: ${form.guests} Pax%0A--------------------------%0A*STATUS: CONFIRMED VIA OTP*`;
    window.open(`https://wa.me/601110309430?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-10">
      
      {/* POPUP SIMULASI WHATSAPP (OTP) */}
      <AnimatePresence>
        {showOtpPopup && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] px-6 pointer-events-none"
          >
            <div className="max-w-md mx-auto bg-amber-50 border-l-4 border-amber-400 p-4 shadow-2xl rounded-2xl pointer-events-auto">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-400 p-2 rounded-full text-white"><MessageCircle size={20} /></div>
                    <div>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">WhatsApp: Haji Ali Bot</p>
                        <p className="text-sm font-bold text-slate-800">Kod OTP anda adalah <span className="text-lg text-red-600 tracking-widest">{generatedOtp}</span></p>
                    </div>
                    <button onClick={() => setShowOtpPopup(false)} className="ml-auto text-slate-400 text-xs font-bold">TUTUP</button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
          <span className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-[2px] italic tracking-tighter">Premium Quality Since 1990</span>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: PILIH CAWANGAN */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] text-center mb-4 italic">Pilih Lokasi Utama</p>
              <div className="grid gap-3">
                {branches.length > 0 ? branches.map((b) => (
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
                        <p className="font-black text-slate-800 text-lg uppercase">{b.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{b.address || 'Haji Ali Outlet'}</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-200 group-hover:text-[#D62828] transition-colors" />
                  </button>
                )) : (
                    <div className="text-center p-10 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 text-xs font-bold">Sedang memuatkan cawangan...</div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: TARIKH & MASA */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest"><ChevronLeft size={16}/> Tukar Lokasi</button>
              <div className="bg-white p-8 rounded-[35px] shadow-xl space-y-6">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 ml-1"><Calendar size={14}/> Tarikh Tempahan</label>
                  <input type="date" required className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#D62828] font-bold text-lg" onChange={(e) => setForm({...form, date: e.target.value})} />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 ml-1"><Clock size={14}/> Masa Pilihan</label>
                  <input type="time" required className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#D62828] font-bold text-lg" onChange={(e) => setForm({...form, time: e.target.value})} />
                </div>
                <button onClick={() => setStep(3)} disabled={!form.date || !form.time} className="w-full bg-[#D62828] text-white p-5 rounded-2xl font-bold shadow-lg shadow-red-100 active:scale-95 transition-all uppercase tracking-widest text-sm">Seterusnya</button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PAX */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center">
               <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mx-auto"><ChevronLeft size={16}/> Kembali</button>
               <h2 className="text-2xl font-black text-slate-800 italic uppercase">Berapa Pax?</h2>
               <div className="grid grid-cols-4 gap-3">
                {[1,2,3,4,5,6,7,8].map(n => (
                  <button 
                    key={n}
                    onClick={() => { setForm({...form, guests: n}); setStep(4); }}
                    className={`p-6 rounded-[24px] font-black text-xl transition-all active:scale-90 shadow-sm ${form.guests === n ? 'bg-[#D62828] text-white shadow-lg shadow-red-200' : 'bg-white text-slate-300'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: BUTIRAN & OTP REQUEST */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white p-8 rounded-[35px] shadow-xl text-center space-y-6 border border-slate-100">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner"><ShieldCheck size={32}/></div>
                <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase italic">Pengesahan Diri</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Kami akan hantar kod OTP via WhatsApp</p>
                </div>
                <div className="space-y-3">
                  <div className="relative text-left">
                    <User className="absolute left-5 top-5 text-slate-300" size={18} />
                    <input type="text" placeholder="NAMA PENUH" className="w-full p-5 pl-14 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#D62828] font-bold text-sm uppercase tracking-widest" onChange={(e) => setForm({...form, name: e.target.value})} />
                  </div>
                  <div className="relative text-left">
                    <Phone className="absolute left-5 top-5 text-slate-300" size={18} />
                    <input type="tel" placeholder="NOMBOR TELEFON" className="w-full p-5 pl-14 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#D62828] font-bold text-sm tracking-[2px]" onChange={(e) => setForm({...form, phone: e.target.value})} />
                  </div>
                </div>
                <button onClick={handleRequestOtp} disabled={loading || !form.name || !form.phone} className="w-full bg-[#D62828] text-white p-5 rounded-2xl font-black shadow-xl shadow-red-100 uppercase tracking-widest text-sm flex justify-center items-center gap-2">
                  {loading ? "PROSES..." : "HANTAR KOD PENGESAHAN"} <ArrowRight size={18}/>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: VERIFY OTP */}
          {step === 5 && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-[35px] shadow-xl text-center space-y-8">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-inner"><Smartphone size={32}/></div>
              <div>
                <h2 className="text-2xl font-black uppercase italic">Kod OTP</h2>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[3px] mt-2 leading-relaxed text-center">Sila masukkan kod 6-digit <br/> dari kotak kuning di atas</p>
              </div>
              <input 
                type="text" 
                maxLength={6} 
                placeholder="------" 
                className="w-full text-center text-4xl font-black tracking-[12px] bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 outline-none focus:border-[#D62828] focus:bg-white transition-all text-[#D62828]"
                onChange={(e) => setForm({...form, otpInput: e.target.value})} 
              />
              <button onClick={handleVerifyAndBook} disabled={loading || form.otpInput.length < 6} className="w-full bg-slate-900 text-white p-6 rounded-2xl font-black shadow-2xl active:scale-95 transition-all uppercase tracking-widest">
                {loading ? "SAHKAN..." : "SAHKAN & TEMPAH SEKARANG"}
              </button>
              <button onClick={() => setStep(4)} className="text-[9px] font-black text-slate-300 uppercase tracking-[3px]">Tukar Nombor Telefon</button>
            </motion.div>
          )}

          {/* STEP 6: TIKET BERJAYA */}
          {step === 6 && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6 pb-10">
              <div className="bg-white rounded-[45px] overflow-hidden shadow-2xl border border-slate-100 relative">
                <div className="bg-[#D62828] p-12 text-center text-white relative overflow-hidden">
                  <CheckCircle size={60} className="mx-auto mb-4 drop-shadow-lg relative z-10" />
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase relative z-10 leading-none mb-1">Berjaya!</h2>
                  <p className="text-[9px] font-black uppercase tracking-[4px] opacity-60 relative z-10">Tiket Tempahan Anda</p>
                  
                  {/* Dekorasi Background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                </div>
                
                <div className="p-8 text-center bg-white space-y-8 relative">
                  {/* Decorative Ticket Cuts */}
                  <div className="absolute -top-5 -left-5 w-10 h-10 bg-[#F8FAFC] rounded-full shadow-inner"></div>
                  <div className="absolute -top-5 -right-5 w-10 h-10 bg-[#F8FAFC] rounded-full shadow-inner"></div>

                  <div className="p-4 bg-white rounded-[40px] inline-block border-[12px] border-slate-50 shadow-inner">
                    <QRCodeSVG value={bookingRef} size={160} />
                  </div>

                  <div className="text-left space-y-4 bg-slate-50 p-6 rounded-[35px] border border-slate-100">
                    <div className="flex justify-between items-center border-b border-white pb-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Booking ID</span>
                      <span className="font-black text-[#D62828] text-lg tracking-tight uppercase">{bookingRef}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white pb-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Lokasi</span>
                      <span className="font-black text-slate-700 uppercase text-xs truncate ml-4">{form.branchName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Slot Masa</span>
                      <span className="font-black text-slate-700 uppercase text-[10px]">{form.date} | {form.time}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button 
                        onClick={sendToWhatsApp}
                        className="w-full bg-[#25D366] text-white p-5 rounded-2xl font-black shadow-lg shadow-green-100 flex justify-center items-center gap-3 uppercase text-xs tracking-widest active:scale-95 transition-all"
                    >
                        <MessageCircle size={20} /> Hantar Bukti WhatsApp
                    </button>
                    <button onClick={() => window.location.reload()} className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-300 font-black text-[9px] uppercase tracking-[5px] mt-2">Tutup Tiket</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="mt-4 text-center opacity-20">
        <p className="text-[8px] font-black uppercase tracking-[6px] text-slate-900">Nasi Ayam Haji Ali &copy; 2025</p>
      </footer>
    </div>
  );
}
