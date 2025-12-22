import Link from "next/link";
import { Section } from "../../components/Section";
import { rooms, trust } from "../../lib/copy";

function ShotPlaceholder({ label }: { label: string }) {
  return (
    <div className="aspect-[16/9] w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="text-xs uppercase tracking-wide text-zinc-500">Placeholder</div>
      <div className="mt-2 text-sm text-zinc-300">{label}</div>
      <div className="mt-4 text-xs text-zinc-400">
        Add a screenshot or short clip when ready. This page works without media.
      </div>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <main className="min-h-screen">
      <Section>
        <div className="max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-100">
            Rooms
          </h1>
          <p className="mt-4 text-zinc-300 text-base md:text-lg leading-relaxed">
            Each room is a <span className="text-zinc-100">static spatial reasoning surface</span>.
            You can look, toggle layers, and inspect meanings. Nothing runs. Nothing decides.
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="text-sm text-zinc-200 font-medium">Trust contract (summary)</div>
            <div className="mt-2 text-sm text-zinc-300 leading-relaxed">
              {trust.roomTrustLine} {trust.antiMisread}
            </div>
          </div>

          <div className="mt-4">
            <Link
              href="/rooms/how-to-pick"
              className="text-sm text-zinc-400 hover:text-zinc-200"
            >
              How to pick a room →
            </Link>
          </div>
        </div>
      </Section>

      <Section title="The five rooms">
        <div className="grid grid-cols-1 gap-6">
          {rooms.map((r) => (
            <div
              key={r.key}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="max-w-3xl">
                  <div className="text-xl font-semibold text-zinc-100">{r.title}</div>
                  <div className="mt-1 text-zinc-400">{r.subtitle}</div>
                  <div className="mt-2 text-xs text-zinc-400">
                    Visual reasoning only. No control. No simulation.
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        What you can do
                      </div>
                      <ul className="mt-2 text-sm text-zinc-300 space-y-1">
                        <li>Orbit / pan / zoom</li>
                        <li>Toggle layers</li>
                        <li>Tap elements → inspect meaning</li>
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        What it shows
                      </div>
                      <ul className="mt-2 text-sm text-zinc-300 space-y-1">
                        {(r.bullets ?? []).slice(0, 3).map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        What it never does
                      </div>
                      <ul className="mt-2 text-sm text-zinc-300 space-y-1">
                        <li>Inspectable Descriptions only. No simulation, prediction, or optimization</li>
                        <li>No advice or "best option"</li>
                        <li>No autonomy (human-led only)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-[420px]">
                  <ShotPlaceholder label={`${r.title} — screenshot / clip`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <footer className="mx-auto w-full max-w-5xl px-6 pb-10 pt-6 text-xs text-zinc-500">
        Omega Spatial<br />
        {trust.roomTrustLine}
      </footer>
    </main>
  );
}



