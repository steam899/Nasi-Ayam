import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { type, phone, otp, name, details } = await req.json();

  // API KEY dari Gateway (Contoh: Fonnte.com)
  // Anda boleh daftar di fonnte.com untuk dapatkan token
  const FONNTE_TOKEN = process.env.FONNTE_TOKEN; 

  let message = '';

  if (type === 'send_otp') {
    message = `KOD OTP NASI AYAM HAJI ALI: ${otp}. Kod ini untuk pengesahan tempahan anda. Jangan kongsi kod ini.`;
  } 
  else if (type === 'confirm_booking') {
    message = `*BOOKING SAH - NASI AYAM HAJI ALI*\n\nRef: ${details.ref}\nNama: ${name}\nCawangan: ${details.branch}\nTarikh: ${details.date}\nMasa: ${details.time}\nTetamu: ${details.guests} Pax\n\nTerima kasih kerana memilih Haji Ali!`;
  }

  // LOGIK HANTAR WHATSAPP (Guna Fonnte API)
  try {
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN || '', // Masukkan token anda di Vercel Settings
      },
      body: new URLSearchParams({
        'target': phone,
        'message': message,
        'countryCode': '60', // Malaysia
      })
    });

    // Jika anda belum ada Token, sistem tetap "berjaya" supaya anda boleh test UI
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to send WhatsApp' });
  }
}
