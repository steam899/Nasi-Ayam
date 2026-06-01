import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, password, fullName, branchId, role } = await req.json();

  // Guna Service Role Key untuk bypass RLS dan cipta user
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // PENTING: Guna Service Key
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // 1. Cipta User di Supabase Auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  // 2. Simpan profil dalam table profiles
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
}
