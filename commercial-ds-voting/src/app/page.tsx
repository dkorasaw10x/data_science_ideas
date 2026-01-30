import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Home({
  searchParams,
}: {
  searchParams?: { sent?: string; denied?: string; err?: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/lab");

  const sent = searchParams?.sent === "1";
  const denied = searchParams?.denied === "1";
  const err = searchParams?.err;

  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-3xl px-4 pt-12 pb-6">
        <div className="pill">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Commercial Data Science
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Vote on the business questions we solve next.
        </h1>
        <p className="mt-2 text-slate-600">
          Everyone gets <b>3 votes</b> per quarter. Stack or split.
        </p>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-12">
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Sign in</h2>
          <p className="mt-1 text-sm text-slate-600">
            We’ll email you a one-time sign-in link (10x domain only).
          </p>

          <form action="/auth/signin" method="post" className="mt-4 space-y-3">
            <input
              className="input"
              type="email"
              name="email"
              placeholder="you@10xgenomics.com"
              required
            />
            <button className="btn-primary w-full" type="submit">
              Email me a sign-in link
            </button>
          </form>

          {sent && (
            <p className="mt-3 text-sm text-emerald-700">
              ✅ Check your email for the sign-in link.
            </p>
          )}
          {denied && (
            <p className="mt-3 text-sm text-rose-700">
              ❌ This app is restricted to the allowed email domain.
            </p>
          )}
          {err && (
            <p className="mt-3 text-sm text-rose-700">
              ❌ Sign-in error: {err}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
