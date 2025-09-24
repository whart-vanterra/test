import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const envCheck = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseSecretKey: !!process.env.SUPABASE_SECRET_KEY,
    jwtSecret: !!process.env.JWT_SECRET,
    smtpHost: !!process.env.SMTP_HOST,
    smtpUser: !!process.env.SMTP_USER,
    smtpPass: !!process.env.SMTP_PASS,
  };

  return new Response(
    JSON.stringify({
      success: true,
      environment: envCheck,
      message: 'Environment check complete',
    }),
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}
