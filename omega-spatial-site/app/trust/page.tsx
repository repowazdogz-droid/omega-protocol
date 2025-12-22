import { Section } from "../../components/Section";
import { trust, trustExpanded } from "../../lib/copy";

export default function TrustPage() {
  return (
    <main>
      <div className="mx-auto w-full max-w-5xl px-6 pt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
            Trust Contract
          </h1>
        </div>

        <Section title="Canonical language">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="space-y-3 text-sm text-zinc-300">
              <div>{trust.footer}</div>
              <div>{trust.roomTrustLine}</div>
              <div>{trust.notDecisions}</div>
              <div className="text-zinc-400">{trust.nothingMoves}</div>
              <div className="mt-4 text-zinc-400">{trust.aboutCore}</div>
            </div>
          </div>
        </Section>

        <Section title="Clarifications">
          <div className="space-y-4">
            {[
              {
                q: "Is this a simulator?",
                a: "No. Omega Spatial is a static visualization surface. It does not run physics, control loops, or time evolution. Nothing moves unless you move the camera."
              },
              {
                q: "Does it give recommendations?",
                a: "No. It shows structure, constraints, and boundaries. It does not recommend actions, optimize outcomes, or select 'best' choices."
              },
              {
                q: "Does it replace expertise?",
                a: "No. It supports human judgment by making assumptions, tradeoffs, and uncertainty visible. Human expertise remains sovereign."
              },
              {
                q: "What do packs do?",
                a: "Packs override Inspector vocabulary only (titles and meanings). They do not change geometry, interactions, or behavior. The structure is fixed."
              },
              {
                q: "Can it certify safety or compliance?",
                a: "No. Omega Spatial is a reasoning scaffold, not a certification tool. It does not imply compliance, safety guarantees, or regulatory approval."
              },
              {
                q: "Can it control real devices?",
                a: "No. It has no execution capabilities. It is visual-only, non-operational, and non-autonomous."
              },
              {
                q: "Does it predict the future?",
                a: "No. It visualizes conceptual structure and bounded outcomes under constraints. It does not forecast, simulate, or predict."
              }
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
              >
                <div className="text-sm font-medium text-zinc-200">
                  {item.q}
                </div>
                <div className="mt-2 text-sm text-zinc-300">{item.a}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title={trustExpanded.title}>
          <div className="space-y-4 text-zinc-200">
            <p className="text-zinc-200">{trustExpanded.promise}</p>

            <div className="grid gap-3 md:grid-cols-2">
              {trustExpanded.bullets.map((b) => (
                <div
                  key={b.h}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
                >
                  <div className="text-sm font-semibold text-zinc-100">{b.h}</div>
                  <div className="mt-2 text-sm text-zinc-300">{b.p}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="text-sm font-semibold text-zinc-100">
                  {trustExpanded.whatThisEnables.title}
                </div>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-zinc-300">
                  {trustExpanded.whatThisEnables.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="text-sm font-semibold text-zinc-100">
                  {trustExpanded.whatWeDoNotDo.title}
                </div>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-zinc-300">
                  {trustExpanded.whatWeDoNotDo.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>

        <footer className="mx-auto w-full max-w-5xl px-6 pb-10 pt-6 text-xs text-zinc-500">
          Omega Spatial<br />
          {trust.roomTrustLine}
        </footer>
      </div>
    </main>
  );
}




