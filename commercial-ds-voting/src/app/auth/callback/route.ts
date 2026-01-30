import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) return NextResponse.redirect(`${origin}/`);

  const supabase = await createClient();
  await supabase.auth.exchangeCodeForSession(code);

  const { data } = await supabase.auth.getUser();
  const email = data.user?.email ?? "";
  const allowed = (process.env.NEXT_PUBLIC_ALLOWED_DOMAIN ?? "").toLowerCase();

  if (allowed && !email.toLowerCase().endsWith(`@${allowed}`)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/?denied=1`);
  }

  return NextResponse.redirect(`${origin}/lab`);
}
