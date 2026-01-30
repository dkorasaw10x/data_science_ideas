import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import VotePanel from "./vote-panel";
import NewIdea from "./new-idea";

export default async function Lab() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/");

  const quarter = process.env.NEXT_PUBLIC_CURRENT_QUARTER ?? "2026Q1";

  // Ideas + total votes this quarter
  const { data: ideas, error } = await supabase
    .from("ideas")
    .select("id,title,description,category,data_gaps,created_at,quarter")
    .eq("quarter", quarter)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // User’s votes this quarter
  const { data: myVotes } = await supabase
    .from("votes")
    .select("idea_id,votes,quarter")
    .eq("quarter", quarter);

  // Total votes per idea (server-side aggregate query)
  const { data: totals } = await supabase
    .from("votes")
    .select("idea_id,votes,quarter")
    .eq("quarter", quarter);

  const totalByIdea = new Map<string, number>();
  (totals ?? []).forEach((v) => {
    totalByIdea.set(v.idea_id, (totalByIdea.get(v.idea_id) ?? 0) + v.votes);
  });

  const mineByIdea = new Map<string, number>();
  (myVotes ?? []).forEach((v) => mineByIdea.set(v.idea_id, v.votes));

  const used = (myVotes ?? []).reduce((s, v) => s + v.votes, 0);
  const remaining = Math.max(0, 3 - used);

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="text-sm text-emerald-200/80 tracking-widest">
            QUARTER // {quarter}
          </div>
          <h1 className="text-3xl font-semibold">Idea Reactor Console</h1>
          <p className="text-slate-300">
            Allocate votes like reagent. Highest signal ships.
          </p>
        </div>

        <VotePanel remaining={remaining} used={used} />
      </header>

      <NewIdea quarter={quarter} />

      <section className="grid gap-4 md:grid-cols-2">
        {ideas?.map((idea) => {
          const total = totalByIdea.get(idea.id) ?? 0;
          const mine = mineByIdea.get(idea.id) ?? 0;

          return (
            <div
              key={idea.id}
              className="rounded-2xl border border-emerald-400/20 bg-slate-900/30 p-5 glow"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-600/40 bg-slate-800/30 px-3 py-1 text-xs text-slate-200">
                    {idea.category}
                  </div>
                  <h2 className="mt-3 text-xl font-semibold">{idea.title}</h2>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">SIGNAL</div>
                  <div className="text-2xl font-bold text-emerald-200">{total}</div>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-slate-300">
                {idea.description}
              </p>

              {idea.data_gaps ? (
                <div className="mt-3 rounded-xl border border-amber-300/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  ⚠ Data gaps: {idea.data_gaps}
                </div>
              ) : null}

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-sm text-slate-400">
                  Your allocation: <span className="text-slate-200">{mine}</span>
                </div>
                <div className="flex items-center gap-2">
                  <VoteButton ideaId={idea.id} quarter={quarter} setTo={0} label="0" />
                  <VoteButton ideaId={idea.id} quarter={quarter} setTo={1} label="1" />
                  <VoteButton ideaId={idea.id} quarter={quarter} setTo={2} label="2" />
                  <VoteButton ideaId={idea.id} quarter={quarter} setTo={3} label="3" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <form action="/auth/signout" method="post">
        <button className="text-sm text-slate-400 hover:text-slate-200">
          Sign out
        </button>
      </form>
    </main>
  );
}

function VoteButton({
  ideaId,
  quarter,
  setTo,
  label,
}: {
  ideaId: string;
  quarter: string;
  setTo: number;
  label: string;
}) {
  return (
    <form action="/api/vote" method="post">
      <input type="hidden" name="ideaId" value={ideaId} />
      <input type="hidden" name="quarter" value={quarter} />
      <input type="hidden" name="votes" value={setTo} />
      <button
        className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm hover:bg-emerald-500/20"
        type="submit"
      >
        {label}
      </button>
    </form>
  );
}
