import Link from "next/link";
import { trust, rooms } from "../../lib/copy";

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="mb-3">
        <div className="text-lg font-semibold text-zinc-100">{title}</div>
        {subtitle ? (
          <div className="mt-1 text-sm text-zinc-400">{subtitle}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800/50 px-2.5 py-1 text-xs text-zinc-300">
      {children}
    </span>
  );
}

const clips = [
  { id: "main", label: "Main Demo (60–90s)", note: "One clean walkthrough. No claims. Show trust + 2 room moments." },
  { id: "constraint", label: "ConstraintRoom clip (15–30s)", note: "Layers + inspector. Nothing moves except camera." },
  { id: "causal", label: "CausalRoom clip (15–30s)", note: "Allowed vs disallowed links. Boundary language." },
  { id: "assumption", label: "AssumptionRoom clip (15–30s)", note: "Assumptions + conflicts + missing coverage." },
  { id: "tradeoff", label: "TradeoffRoom clip (15–30s)", note: "Tradeoff front. No 'best point'." },
  { id: "assurance", label: "AssuranceRoom clip (15–30s)", note: "Inputs → authority → outcomes. Overrides reinforce limits." },
];

export default function DemoKitPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold text-zinc-100">Demo Kit</div>
          <div className="mt-1 text-sm text-zinc-400">
            This page is for live demos, workshops, and conferences.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/demo"
            className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Demo Page
          </Link>
          <Link
            href="/trust"
            className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Trust Contract
          </Link>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Pill>{trust.footer}</Pill>
        <Pill>{trust.roomLine}</Pill>
        <Pill>{trust.nothingMoves}</Pill>
        <Pill>Packs change wording only</Pill>
      </div>

      {/* No Simulation Guarantee callout */}
      <div className="mb-8 rounded-2xl border border-zinc-700 bg-zinc-900/60 p-5">
        <div className="text-sm font-semibold text-zinc-100">No Simulation Guarantee</div>
        <div className="mt-2 text-sm text-zinc-300">
          All demos use Inspectable Descriptions.
          Nothing runs, predicts, optimizes, or decides.
          If a demo looks dynamic, it is camera movement only.
        </div>
        <div className="mt-3 text-xs text-zinc-400">
          This protects you in live events.
        </div>
      </div>

      {/* A) Video slots */}
      <section className="mb-10 space-y-4">
        <div className="text-lg font-semibold text-zinc-100">A) Video slots</div>
        <div className="grid gap-4 md:grid-cols-2">
          {clips.map((c) => (
            <Card key={c.id} title={c.label} subtitle={c.note}>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <div className="text-xs text-zinc-500">Placeholder</div>
                <div className="mt-2 text-sm text-zinc-300">
                  Drop your video here later (embed/link). Keep it short and calm.
                </div>
                <div className="mt-3 text-xs text-zinc-400">
                  Suggested filename: <span className="text-zinc-300">{`omega_spatial_${c.id}.mp4`}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* B) 5-minute smoke test */}
      <section className="mb-10 space-y-4">
        <div className="text-lg font-semibold text-zinc-100">B) 5-minute smoke test checklist</div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Mac smoke test (2–3 minutes)" subtitle="Zero debugging. If any step fails: stop and switch to recorded demos.">
            <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-300">
              <li>Open the explainer site. Confirm header says <b>Omega Spatial</b>.</li>
              <li>Open <b>/demo-kit</b>. Confirm this page loads.</li>
              <li>Open <b>/trust</b>. Confirm trust language is present and consistent.</li>
              <li>If you're showing live web templates: open the gallery link you plan to use (or local file) and confirm it loads.</li>
              <li>Confirm you can show: a layer toggle + an inspector selection in under 20 seconds.</li>
              <li>Stop: if anything asks you to "wait for compile" — use recordings instead.</li>
            </ol>
          </Card>

          <Card title="Vision Pro smoke test (2 minutes)" subtitle="No rabbit holes. You only need: launch → enter room → select → trust line.">
            <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-300">
              <li>Launch <b>OmegaGallery</b>.</li>
              <li>Confirm you see the trust line (or DemoMode toggle if enabled).</li>
              <li>Enter any room (ConstraintRoom is the fastest).</li>
              <li>Toggle a layer on/off.</li>
              <li>Select one object and show the Inspector text.</li>
              <li>Confirm: nothing moves except your viewpoint/camera.</li>
              <li>If anything fails: switch to website demo videos immediately.</li>
            </ol>
          </Card>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="text-sm font-semibold text-zinc-100">Event fallback rule</div>
          <div className="mt-1 text-sm text-zinc-300">
            If live demo introduces friction, you don't debug on-site. You show recordings + the trust contract.
          </div>
        </div>
      </section>

      {/* C) Room map (quick reference) */}
      <section className="mb-10 space-y-4">
        <div className="text-lg font-semibold text-zinc-100">C) Room map (what each room proves)</div>
        <div className="grid gap-4 md:grid-cols-2">
          {rooms.map((r) => (
            <Card key={r.key} title={r.title} subtitle={r.subtitle}>
              <div className="text-sm text-zinc-300">
                Use this room to demonstrate structure + boundaries, not "capability".
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* D) Downloads / links */}
      <section className="space-y-4">
        <div className="text-lg font-semibold text-zinc-100">D) Downloads / links</div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="One-pager (PDF)" subtitle="Print this for tables + QR code.">
            <div className="text-sm text-zinc-300">
              Placeholder link (add later):{" "}
              <span className="text-zinc-400">/downloads/omega_spatial_onepager.pdf</span>
            </div>
          </Card>
          <Card title="Contact" subtitle="Keep it simple.">
            <div className="text-sm text-zinc-300">
              Use the same contact address as the main site footer.
              <div className="mt-2">
                <Link className="text-zinc-300 underline underline-offset-4 hover:text-zinc-100" href="/#contact">
                  Go to Contact section
                </Link>
              </div>
            </div>
          </Card>
          <Card title="Expanded Trust" subtitle="Synthetic data & Inspectable Descriptions.">
            <div className="text-sm text-zinc-300">
              Learn how synthetic examples and Inspectable Descriptions fit Omega Spatial without breaking the trust contract.
              <div className="mt-2">
                <Link
                  href="/trust"
                  className="inline-flex items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-950/60 px-4 py-2 text-sm text-zinc-100 hover:bg-zinc-900"
                >
                  Expanded Trust (Synthetic & Twins)
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <footer className="mt-10 text-xs text-zinc-500">
        Omega Spatial<br />
        {trust.roomTrustLine}
      </footer>
    </main>
  );
}


