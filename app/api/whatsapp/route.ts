import { NextResponse } from 'next/server';

const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN; // Simpan di Vercel Env
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;

async function sendWA(to: string, message: string) {
  // Jika anda belum ada API key, ia akan log ke console Vercel sahaja
  console.log(`Sending WA to ${to}: ${message}`);
  
  if (!WHATSAPP_TOKEN) return { success: true, mocked: true };

  const res = await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: message }
    })
  });
  return res.json();
}

export async function POST(req: Request) {
  const { type, phone, name, details, otp } = await req.json();

  if (type === 'send_otp') {
    const msg = `KOD OTP NASI AYAM HAJI ALI: ${otp}. Kod ini sah untuk 5 minit. Jangan kongsi kod ini dengan sesiapa.`;
    await sendWA(phone, msg);
    return NextResponse.json({ success: true });
  }

  if (type === 'confirm_booking') {
    const msg = `*BOOKING BARU - NASI AYAM HAJI ALI*\n\nNama: ${name}\nTelefon: ${phone}\nCawangan: ${details.branch}\nTarikh: ${details.date}\nMasa: ${details.time}\nTetamu: ${details.guests} Pax\nStatus: *CONFIRMED VIA OTP*`;
    // Hantar ke nombor outlet yang anda beri
    await sendWA('601110309430', msg);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid type' });
}
