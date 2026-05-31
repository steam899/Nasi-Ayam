"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Calendar, Clock, Users, CheckCircle, QrCode, ArrowRight, Star } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [form, setForm] = useState({ branchId: '', branchName: '', date: '', time: '', guests: 2, name: '', phone: '' });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('branches').select('*');
      if (data) setBranches(data);
    };
    fetch();
  }, []);

  const handleBooking = async () => {
    setLoading(true);
    const ref = `NHA-${Math.random().toString(36).toUpperCase().substring(2, 7)}`;
    const { error } = await supabase.from('bookings').insert([{
      booking_reference: ref, customer_name: form.name, customer_phone: form.phone,
      branch_id: form.branchId, booking_date: form.date, booking_time: form.time, guest_count: form.guests
    }]);
    if (!error) { setBookingRef(ref); setStep(4); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-8 text-center shadow-sm">
        <img src="/logo.png" alt="Logo" className="h-28 w-28 mx-auto mb-4 object-contain rounded-full border-4 border-slate-50 shadow-md" />
        <h1 className="text-2xl font-black text-slate-800">Nasi Ayam Haji Ali</h1>
        <div className="flex justify-center gap-1 mt-2 text-amber-400">
           {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
        </div>
      </div>

      <div className="max-w-md mx-auto p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pilih Cawangan</h2>
            <div className="grid gap-3">
              {branches.map(b => (
                <button key={b.id} onClick={() => { setForm({...form, branchId: b.id, branchName: b.name}); setStep(2); }}
                  className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-red-500 transition-all text-left">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-50 p-3 rounded-xl text-red-600"><MapPin size={24} /></div>
                    <div>
                      <p className="font-bold text-lg">{b.name}</p>
                      <p className="text-xs text-slate-400 uppercase">{b.address}</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white p-8 rounded-[32px] shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Calendar className="text-red-600" /> Slot Masa</h2>
            <div className="space-y-4">
              <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500" onChange={e => setForm({...form, date: e.target.value})} />
              <input type="time" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500" onChange={e => setForm({...form, time: e.target.value})} />
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl font-bold">
                <span>{form.guests} Orang</span>
                <div className="flex gap-2">
                   <button onClick={() => setForm({...form, guests: Math.max(1, form.guests-1)})} className="bg-white w-10 h-10 rounded-lg shadow-sm">-</button>
                   <button onClick={() => setForm({...form, guests: form.guests+1})} className="bg-white w-10 h-10 rounded-lg shadow-sm">+</button>
                </div>
              </div>
            </div>
            <button onClick={() => setStep(3)} className="w-full bg-red-600 text-white p-5 rounded-2xl font-bold shadow-lg shadow-red-200">Seterusnya</button>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white p-8 rounded-[32px] shadow-xl space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Users className="text-red-600" /> Info Hubungan</h2>
            <input type="text" placeholder="Nama Anda" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setForm({...form, name: e.target.value})} />
            <input type="tel" placeholder="60123456789" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setForm({...form, phone: e.target.value})} />
            <button onClick={handleBooking} disabled={loading} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-bold">
               {loading ? "Menyimpan..." : "Sahkan Tempahan"}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white rounded-[40px] p-8 shadow-2xl text-center space-y-6">
            <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto"><CheckCircle size={48} /></div>
            <h2 className="text-2xl font-black italic tracking-tight">TEMPAHAN SAH!</h2>
            <div className="p-4 border-8 border-slate-50 rounded-3xl inline-block bg-white shadow-inner">
               <QRCodeSVG value={bookingRef} size={180} />
            </div>
            <div className="bg-slate-50 p-5 rounded-3xl text-left text-sm space-y-1">
               <p className="text-slate-400 uppercase text-[10px] font-black">Rujukan Tempahan</p>
               <p className="text-lg font-bold text-red-600">{bookingRef}</p>
               <div className="pt-2 flex justify-between font-medium">
                  <span>{form.branchName}</span>
                  <span>{form.date} | {form.time}</span>
               </div>
            </div>
            <button onClick={() => window.location.reload()} className="w-full p-4 text-slate-300 font-bold">Kembali ke Menu</button>
          </div>
        )}
      </div>
    </div>
  );
}
