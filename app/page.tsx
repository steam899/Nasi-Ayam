"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Utensils, Phone, Calendar, Users, CheckCircle, QrCode, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
    const getBranches = async () => {
      const { data } = await supabase.from('branches').select('*');
      if (data) setBranches(data);
    };
    getBranches();
  }, []);

  const handleSendOTP = async () => {
    if (!form.phone || !form.name) return alert("Sila isi nama dan telefon");
    setLoading(true);
    // Di sini anda boleh integrasi Supabase Phone Auth
    // Untuk demo manual, kita terus ke step 2
    setTimeout(() => {
      setStep(2);
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    const ref = `NHA-${Math.floor(1000 + Math.random() * 9000)}`;
    
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
      setStep(3);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl flex flex-col">
      {/* HEADER */}
      <div className="bg-[#D62828] p-8 text-white rounded-b-[40px] shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2 uppercase tracking-tight">
          <Utensils className="text-[#F4C542]" /> Haji Ali Booking
        </h1>
        <p className="text-sm opacity-90 mt-1">Tempahan meja pantas & sah melalui OTP</p>
      </div>

      <div className="p-6 -mt-8 flex-grow">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          
          {/* STEP 1: INPUT INFO */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Pilih Cawangan</label>
                <select 
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-[#D62828] outline-none transition-all"
                  onChange={(e) => setForm({...form, branchId: e.target.value})}
                >
                  <option value="">Pilih Lokasi...</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Tarikh</label>
                  <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl ring-1 ring-gray-200 outline-none" 
                    onChange={(e) => setForm({...form, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Pax</label>
                  <input type="number" placeholder="2" className="w-full p-4 bg-gray-50 rounded-2xl ring-1 ring-gray-200 outline-none" 
                    onChange={(e) => setForm({...form, guests: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Penuh</label>
                <input type="text" placeholder="Masukkan nama..." className="w-full p-4 bg-gray-50 rounded-2xl ring-1 ring-gray-200 outline-none" 
                  onChange={(e) => setForm({...form, name: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">No. Telefon</label>
                <input type="tel" placeholder="60123456789" className="w-full p-4 bg-gray-50 rounded-2xl ring-1 ring-gray-200 outline-none" 
                  onChange={(e) => setForm({...form, phone: e.target.value})} />
              </div>

              <button 
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-[#D62828] text-white p-4 rounded-2xl font-bold shadow-lg shadow-red-200 flex justify-center items-center gap-2 active:scale-95 transition-transform"
              >
                {loading ? "Memproses..." : "Teruskan ke Pengesahan"} <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 2 && (
            <div className="text-center space-y-6 py-4">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Phone className="text-[#D62828]" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Sahkan Kod OTP</h2>
                <p className="text-sm text-gray-500 mt-1">Sila masukkan kod yang dihantar ke <br/> <b>{form.phone}</b></p>
              </div>
              <input 
                type="text" 
                placeholder="· · · · · ·" 
                className="w-full text-center text-3xl font-mono tracking-[10px] p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 outline-none focus:border-[#D62828]"
                maxLength={6}
                onChange={(e) => setForm({...form, otp: e.target.value})}
              />
              <button 
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full bg-black text-white p-4 rounded-2xl font-bold shadow-xl"
              >
                {loading ? "Mengesahkan..." : "Sahkan Tempahan"}
              </button>
            </div>
          )}

          {/* STEP 3: SUCCESS & QR */}
          {step === 3 && (
            <div className="text-center space-y-6 py-4">
              <div className="animate-bounce bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Tempahan Diterima!</h2>
                <p className="text-sm text-gray-500">Sila tunjukkan QR ini semasa ketibaan.</p>
              </div>

              <div className="bg-white p-4 rounded-3xl border-4 border-[#F4C542] inline-block shadow-xl">
                <QRCodeSVG value={bookingRef} size={180} />
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl text-left space-y-2 text-sm border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase text-[10px] font-bold">Rujukan</span>
                  <span className="font-bold text-[#D62828]">{bookingRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase text-[10px] font-bold">Tarikh</span>
                  <span className="font-semibold">{form.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase text-[10px] font-bold">Tetamu</span>
                  <span className="font-semibold">{form.guests} Orang</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 italic">Notifikasi WhatsApp akan dihantar sebentar lagi.</p>
            </div>
          )}

        </div>
      </div>

      <footer className="p-6 text-center text-gray-300 text-[10px]">
        &copy; 2025 Nasi Ayam Haji Ali. Hak Cipta Terpelihara.
      </footer>
    </div>
  );
}
