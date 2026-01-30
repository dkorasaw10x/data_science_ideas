import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/lab");

  return (
    <main className="space-y-6">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 glow">
          <span className="text-emerald-200">◆</span>
          <span className="text-sm tracking-wide text-emerald-100">
            Commercial Insights Reactor
          </span>
        </div>
        <h1 className="text-4xl font-semibold">
          Choose the next quarter’s experiments
        </h1>
        <p className="text-slate-300 max-w-2xl">
          Everyone gets <b>3 votes</b> per quarter. Stack all 3 on one idea or split them.
        </p>
      </header>

      <form action="/auth/signin" method="post">
        <button className="pulse glow rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-6 py-3 hover:bg-emerald-500/25">
          Sign in with Google
        </button>
      </form>

      <p className="text-xs text-slate-400">
        Access is limited by email domain.
      </p>
    </main>
  );
}
