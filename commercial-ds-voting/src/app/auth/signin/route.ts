import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const origin = new URL(request.url).origin;

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();

  const allowed = (process.env.NEXT_PUBLIC_ALLOWED_DOMAIN ?? "").toLowerCase();
  if (allowed && !email.toLowerCase().endsWith(`@${allowed}`)) {
    return NextResponse.redirect(`${origin}/?denied=1`, { status: 303 });
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    return NextResponse.redirect(`${origin}/?err=${encodeURIComponent(error.message)}`, { status: 303 });
  }

  return NextResponse.redirect(`${origin}/?sent=1`, { status: 303 });
}
