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

export default async function LabPage({
  searchParams,
}: {
  searchParams?: { idea?: string };
}) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/");

  const quarter = process.env.NEXT_PUBLIC_CURRENT_QUARTER ?? "2026Q1";

  const { data: ideasRaw } = await supabase
    .from("ideas")
    .select("id,title,description,category,quarter,created_at")
    .eq("quarter", quarter)
    .order("created_at", { ascending: false });

  const ideas = (ideasRaw ?? []) as Idea[];

  const selectedId = searchParams?.idea ?? ideas[0]?.id ?? null;
  const selected = ideas.find((x) => x.id === selectedId) ?? ideas[0] ?? null;

  // Optional: compute "votes left" if you have a votes table.
  // If your schema differs, this safely falls back.
  let votesLeft: number | null = null;
  try {
    const { count } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("quarter", quarter)
      .eq("user_id", user.id);
    const used = typeof count === "number" ? count : 0;
    votesLeft = Math.max(0, 3 - used);
  } catch {
    votesLeft = null;
  }

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0f14]/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow-lg" />
            <div>
              <div className="text-sm text-slate-300">Commercial DS</div>
              <div className="text-lg font-semibold leading-tight">
                Ideas Voting • {quarter}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {votesLeft === null ? "Votes left: ?" : `Votes left: ${votesLeft}/3`}
            </div>

            <form action="/auth/signout" method="post">
              <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main “WhatsApp-like” layout */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Ideas list (like chats) */}
          <aside className="lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-300">Browse</div>
                    <div className="text-xl font-semibold">Ideas</div>
                  </div>
                  <div className="sm:hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                    {votesLeft === null ? "Votes: ?" : `${votesLeft}/3 votes left`}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="rounded-2xl border border-white/10 bg-[#0b0f14]/60 px-3 py-2 text-sm text-slate-300">
                    Logged in as <span className="text-slate-100">{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="max-h-[65vh] overflow-auto">
                {ideas.length ? (
                  ideas.map((idea) => {
                    const active = idea.id === selectedId;
                    return (
                      <a
                        key={idea.id}
                        href={`/lab?idea=${idea.id}`}
                        className={[
                          "block px-4 py-4 border-b border-white/10 transition",
                          active ? "bg-white/10" : "hover:bg-white/5",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="truncate font-semibold">
                                {idea.title}
                              </div>
                              {idea.category ? (
                                <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-200">
                                  {idea.category}
                                </span>
                              ) : null}
                            </div>
                            {idea.description ? (
                              <div className="mt-1 line-clamp-2 text-sm text-slate-300">
                                {idea.description}
                              </div>
                            ) : (
                              <div className="mt-1 text-sm text-slate-400">
                                No description yet.
                              </div>
                            )}
                          </div>
                        </div>
                      </a>
                    );
                  })
                ) : (
                  <div className="p-4 text-slate-300">No ideas yet for {quarter}.</div>
                )}
              </div>
            </div>

            {/* Add idea panel (like a composer) */}
            <div className="mt-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-300">New</div>
                  <div className="text-lg font-semibold">Add an idea</div>
                </div>
                <div className="text-xs text-slate-400">
                  shows up immediately
                </div>
              </div>

              <form action="/api/idea" method="post" className="mt-3 space-y-2">
                <input type="hidden" name="quarter" value={quarter} />
                <input
                  name="title"
                  placeholder="Title (e.g., Predict opportunity close)"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-[#0b0f14]/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <input
                  name="category"
                  placeholder="Category (Orders / Forecast / Churn / LTV...)"
                  className="w-full rounded-2xl border border-white/10 bg-[#0b0f14]/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <textarea
                  name="description"
                  placeholder="What would we answer? What data gaps?"
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b0f14]/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 font-semibold text-[#0b0f14] hover:opacity-95">
                  Add idea
                </button>
              </form>
            </div>
          </aside>

          {/* Detail panel (like the conversation) */}
          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl overflow-hidden">
              <div className="border-b border-white/10 p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-slate-300">Selected idea</div>
                  <div className="truncate text-xl font-semibold">
                    {selected ? selected.title : "No idea selected"}
                  </div>
                </div>

                {selected ? (
                  <form action="/api/vote" method="post" className="shrink-0">
                    <input type="hidden" name="idea_id" value={selected.id} />
                    <button className="rounded-2xl bg-emerald-400 px-4 py-2 font-semibold text-[#0b0f14] hover:opacity-95">
                      +1 Vote
                    </button>
                  </form>
                ) : null}
              </div>

              <div className="p-5">
                {!selected ? (
                  <div className="text-slate-300">Pick an idea from the left.</div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {selected.category ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                          {selected.category}
                        </span>
                      ) : null}
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                        Quarter: {selected.quarter}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-3xl bg-[#0b0f14]/50 border border-white/10 p-4">
                        <div className="text-xs text-slate-400 mb-2">
                          Context / questions
                        </div>
                        <div className="whitespace-pre-wrap text-sm text-slate-200">
                          {selected.description || "No description yet. Add details on the left."}
                        </div>
                      </div>

                      {/* “Insta-like” hero banner – replace anytime */}
                      <div className="overflow-hidden rounded-3xl border border-white/10">
                        <img
                          src="https://images.unsplash.com/photo-1582719478185-2f55d27c4b74?auto=format&fit=crop&w=1400&q=80"
                          alt="Microscopy"
                          className="h-40 w-full object-cover"
                        />
                        <div className="p-4 bg-[#0b0f14]/70">
                          <div className="text-sm font-semibold">
                            Make it scientific ✨
                          </div>
                          <div className="text-sm text-slate-300 mt-1">
                            Vote on the questions you want data science to solve this quarter.
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400">
                        Tip: open this on mobile — it behaves like “list → detail”.
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
