import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password, fullName, branchId, role } = await req.json();

    // 1. Inisialisasi Admin Client menggunakan Service Role Key
    // Ini membolehkan sistem mendaftarkan user baru secara automatik
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Kunci ini wajib ada di Vercel
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 2. Cipta User di Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    // 3. Simpan maklumat ke dalam table Profiles
    const { error: profError } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: authUser.user.id,
        full_name: fullName,
        email: email,
        role: role || 'staff',
        branch_id: branchId
      }]);

    if (profError) return NextResponse.json({ error: profError.message }, { status: 400 });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
