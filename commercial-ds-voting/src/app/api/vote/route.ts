import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.redirect(new URL("/", request.url));

  const form = await request.formData();
  const ideaId = String(form.get("ideaId") ?? "");
  const quarter = String(form.get("quarter") ?? "");
  const votes = Number(form.get("votes") ?? 0);

  const { error } = await supabase.rpc("set_votes", {
    p_idea_id: ideaId,
    p_quarter: quarter,
    p_votes: votes,
  });

  if (error) {
    // vote-limit errors show as a query param
    return NextResponse.redirect(new URL(`/lab?vote_err=${encodeURIComponent(error.message)}`, request.url));
  }

  return NextResponse.redirect(new URL("/lab", request.url));
}
