import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.redirect(new URL("/", request.url));

  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const category = String(form.get("category") ?? "Other").trim();
  const data_gaps = String(form.get("data_gaps") ?? "").trim() || null;
  const quarter = String(form.get("quarter") ?? "").trim();

  if (!title || !description || !quarter) {
    return NextResponse.redirect(new URL("/lab?err=missing", request.url));
  }

  const { error } = await supabase.from("ideas").insert({
    title,
    description,
    category,
    data_gaps,
    quarter,
  });

  if (error) return NextResponse.redirect(new URL(`/lab?err=${encodeURIComponent(error.message)}`, request.url));
  return NextResponse.redirect(new URL("/lab", request.url));
}
