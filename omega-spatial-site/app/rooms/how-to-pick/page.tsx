import { Section } from "../../../components/Section";
import { trust } from "../../../lib/copy";

function Row({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
      <div className="text-sm font-semibold text-zinc-100">{title}</div>
      <div className="mt-2 text-sm text-zinc-300">{desc}</div>
    </div>
  );
}

export default function HowToPickRoom() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Section title="How to pick a room" subtitle="A quick map. Same contract everywhere.">
        <div className="grid gap-4">
          <Row title="ConstraintRoom" desc="When you need a calm spatial surface for workspace boundaries, constraints, and uncertainty layers." />
          <Row title="CausalRoom" desc="When you need to show influences (what affects what) and mark disallowed/unsupported causal shortcuts." />
          <Row title="AssumptionRoom" desc="When you need to surface load-bearing assumptions, conflicts, and missing coverage." />
          <Row title="TradeoffRoom" desc="When you need to visualize objective tensions, constraints, feasible regions, and tradeoff fronts—without selecting an answer." />
          <Row title="AssuranceRoom" desc="When you need bounded outcome classes under uncertainty and degradation (no procedures, no thresholds, no guarantees)." />
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
          <div className="text-sm font-semibold text-zinc-100">Trust contract</div>
          <div className="mt-2 text-sm text-zinc-300">{trust.footer}</div>
        </div>
      </Section>
    </main>
  );
}



