import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type Idea = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  quarter: string;
  created_at: string;
};

export default async function LabPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/");

  const quarter = process.env.NEXT_PUBLIC_CURRENT_QUARTER ?? "2026Q1";

  const { data: ideas } = await supabase
    .from("ideas")
    .select("id,title,description,category,quarter,created_at")
    .eq("quarter", quarter)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/70 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Lab Voting Console • {quarter}
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Commercial Data Science Ideas
              </h1>
              <p className="mt-1 text-slate-300">
                Everyone gets <b>3 votes</b> per quarter — stack them or split them.
              </p>
            </div>

            <form action="/auth/signout" method="post">
              <button className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm hover:bg-slate-800">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
              <h2 className="text-lg font-semibold">Add an idea</h2>
              <p className="mt-1 text-sm text-slate-300">
                Submit a question the team can vote on this quarter.
              </p>

              <form action="/api/idea" method="post" className="mt-4 space-y-3">
                <input type="hidden" name="quarter" value={quarter} />
                <input
                  name="title"
                  placeholder="Title (e.g., Predicting customer orders)"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  name="category"
                  placeholder="Category (e.g., Orders, Forecast, Churn)"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <textarea
                  name="description"
                  placeholder="Details / questions to answer / data gaps…"
                  rows={6}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button className="w-full rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:opacity-90">
                  Add idea
                </button>
              </form>

              <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-100">
                Tip: After you submit, refresh to see it immediately.
              </div>
            </div>
          </section>

          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 shadow-xl">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold">Ideas</h2>
                <div className="text-sm text-slate-400">
                  Logged in as <span className="text-slate-200">{userData.user.email}</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {(ideas as Idea[] | null)?.length ? (
                  (ideas as Idea[]).map((idea) => (
                    <div
                      key={idea.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-lg font-semibold">{idea.title}</div>
                          {idea.category ? (
                            <div className="mt-1 inline-flex rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs text-slate-200">
                              {idea.category}
                            </div>
                          ) : null}
                        </div>

                        <form action="/api/vote" method="post">
                          <input type="hidden" name="idea_id" value={idea.id} />
                          <button className="rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:opacity-90">
                            +1 Vote
                          </button>
                        </form>
                      </div>

                      {idea.description ? (
                        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">
                          {idea.description}
                        </p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 text-slate-300">
                    No ideas yet for {quarter}. Add the first one ✨
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
