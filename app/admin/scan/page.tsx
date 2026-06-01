"use client"
import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QRScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // 1. Initialize Scanner
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { fps: 10, qrbox: { width: 250, height: 250 } }, 
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanError);

    async function onScanSuccess(decodedText: string) {
      //decodedText akan berisi Booking Reference (cth: NHA-A1B2C)
      setScanResult(decodedText);
      scanner.clear(); // Tutup kamera selepas berjaya scan
      handleCheckIn(decodedText);
    }

    function onScanError(err: any) {
      // Biarkan kosong untuk elak spam console
    }

    return () => {
      scanner.clear();
    };
  }, []);

  const handleCheckIn = async (ref: string) => {
    setStatus('loading');
    
    // 2. Cari tempahan dalam database
    const { data, error } = await supabase
      .from('bookings')
      .select('*, branches(name)')
      .eq('booking_reference', ref)
      .single();

    if (error || !data) {
      setStatus('error');
      setMessage("Tempahan tidak dijumpai.");
      return;
    }

    if (data.status === 'checked_in') {
      setStatus('error');
      setMessage("Pelanggan ini sudah pun check-in sebelum ini.");
      return;
    }

    // 3. Update status ke checked_in
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'checked_in' })
      .eq('booking_reference', ref);

    if (updateError) {
      setStatus('error');
      setMessage("Gagal mengemaskini status.");
    } else {
      setStatus('success');
      setMessage(`Check-in Berjaya: ${data.customer_name} (${data.branches.name})`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-10">
        <button onClick={() => router.push('/admin/dashboard')} className="p-3 bg-white/10 rounded-2xl">
          <ChevronLeft />
        </button>
        <h1 className="font-black uppercase italic tracking-tighter">QR Ticket Scanner</h1>
        <div className="w-10"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl text-slate-900 p-8 space-y-8">
        {status === 'idle' && (
          <div className="space-y-6">
            <div className="text-center">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Halakan Kamera Ke QR Tiket</p>
                <div id="reader" className="overflow-hidden rounded-3xl border-4 border-slate-50"></div>
            </div>
          </div>
        )}

        {status === 'loading' && (
          <div className="py-20 text-center space-y-4">
            <RefreshCw className="animate-spin mx-auto text-[#D62828]" size={40} />
            <p className="font-bold uppercase italic text-sm">Mengesahkan Tiket...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-10 text-center space-y-6 animate-in zoom-in">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={48} />
            </div>
            <div>
                <h2 className="text-2xl font-black uppercase italic text-green-600">Berjaya!</h2>
                <p className="font-bold text-slate-600 mt-2">{message}</p>
            </div>
            <button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs">Scan Seterusnya</button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-10 text-center space-y-6 animate-in zoom-in">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={48} />
            </div>
            <div>
                <h2 className="text-2xl font-black uppercase italic text-red-600">Gagal</h2>
                <p className="font-bold text-slate-600 mt-2">{message}</p>
            </div>
            <button onClick={() => window.location.reload()} className="w-full bg-slate-100 text-slate-400 p-5 rounded-2xl font-black uppercase tracking-widest text-xs">Cuba Lagi</button>
          </div>
        )}
      </div>

      <p className="mt-10 text-[10px] font-black text-white/20 uppercase tracking-[5px]">Haji Ali Scanner v1.0</p>
    </div>
  );
        }
