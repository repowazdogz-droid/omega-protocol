import Link from "next/link";
import { Section } from "../../components/Section";
import { trust } from "../../lib/copy";

export default function DemoPage() {
  return (
    <main>
      <div className="mx-auto w-full max-w-5xl px-6 pt-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
              Demo
            </h1>
            <p className="mt-2 text-zinc-300">
              What this feels like
            </p>
          </div>
          <Link
            href="/demo-kit"
            className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Open Demo Kit
          </Link>
        </div>

        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="text-sm text-zinc-300">{trust.roomTrustLine}</div>
        </div>

        <Section>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="text-sm font-medium text-zinc-200">Video</div>
            <div className="mt-4 flex h-64 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950/60">
              <div className="text-center text-sm text-zinc-500">
                Demo video placeholder
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              Record a 45–90s screen capture when ready.
            </p>
          </div>
        </Section>

        <Section title="Pressure questions">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex gap-2">
                <span className="text-zinc-500">•</span>
                <span><strong>It doesn't predict outcomes</strong> — shows structure, not forecasts.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-zinc-500">•</span>
                <span><strong>It doesn't run controllers</strong> — visual reasoning only, no execution.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-zinc-500">•</span>
                <span><strong>It doesn't recommend decisions</strong> — shows boundaries, not advice.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-zinc-500">•</span>
                <span><strong>Packs change wording only</strong> — Inspector vocabulary, not geometry or behavior.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-zinc-500">•</span>
                <span><strong>Nothing moves unless you move the camera</strong> — static scenes, no animation.</span>
              </li>
            </ul>
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



