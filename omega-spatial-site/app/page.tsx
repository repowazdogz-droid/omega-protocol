import { Section } from "../components/Section";
import { RoomCard } from "../components/RoomCard";
import { rooms, trust, credibility } from "../lib/copy";
import Link from "next/link";

export default function Page() {
  return (
    <main>
      {/* HERO */}
      <div className="mx-auto w-full max-w-5xl px-6 pt-16">
        <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950 p-8">
          <div className="text-sm text-zinc-400">Omega Spatial</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-100">
            Human-led spatial reasoning surfaces
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-300">
            Make structure, constraints, uncertainty, and bounded outcomes visible —
            without autonomy, simulation, or decision substitution. All rooms are Inspectable Descriptions. No system is executed.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
              href="/demo"
            >
              View Demo
            </a>
            <Link
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800/50"
              href="/demo-kit"
            >
              Open Demo Kit
            </Link>
            <a
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800/50"
              href="/trust"
            >
              Trust Contract
            </a>
          </div>

          <p className="mt-6 text-sm text-zinc-400">
            For labs, researchers, and engineering teams.
          </p>

          <div className="mt-6 text-xs text-zinc-400">
            {trust.roomTrustLine}
          </div>
        </div>
      </div>

      {/* Start here section */}
      <Section title="Start here">
        <div className="max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/tools"
              className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 hover:bg-zinc-900/60 transition"
            >
              <div className="text-lg font-semibold text-zinc-100">Tools (use today)</div>
              <div className="mt-2 text-sm text-zinc-300">
                Practical canvases and templates derived from Omega Spatial.
              </div>
              <div className="mt-4 text-xs text-zinc-400">
                Visual reasoning surfaces → practical entry points
              </div>
            </Link>

            <Link
              href="/workshops"
              className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 hover:bg-zinc-900/60 transition"
            >
              <div className="text-lg font-semibold text-zinc-100">Workshops (bring your team)</div>
              <div className="mt-2 text-sm text-zinc-300">
                Facilitated sessions that produce shared clarity.
              </div>
              <div className="mt-4 text-xs text-zinc-400">
                60–90 minutes → one-page maps + boundary language
              </div>
            </Link>
          </div>

          <div className="mt-6 text-center text-sm text-zinc-400">
            {trust.antiMisread}
          </div>
        </div>
      </Section>

      <Section title={credibility.builtForTitle}>
        <div className="max-w-5xl">
          <p className="text-zinc-300 leading-relaxed">{credibility.builtForSubtitle}</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {credibility.domains.map((d) => (
              <div key={d.title} className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5">
                <div className="text-zinc-100 font-medium">{d.title}</div>
                <div className="mt-2 text-sm text-zinc-400 leading-relaxed">{d.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title={credibility.teamsTitle}>
        <div className="max-w-5xl">
          <p className="text-zinc-300 leading-relaxed">{credibility.teamsSubtitle}</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {credibility.teamCards.map((c) => (
              <div key={c.title} className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5">
                <div className="text-zinc-100 font-medium">{c.title}</div>
                <div className="mt-2 text-sm text-zinc-400 leading-relaxed">{c.body}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="text-sm text-zinc-200 font-medium">Optional (later)</div>
            <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Replace these cards with lab logos, citations, or partners only when you have explicit permission.
              Until then, keep it clean and verifiable.
            </div>
          </div>
        </div>
      </Section>

      <Section title="What it is">
        <p className="max-w-3xl text-zinc-300">
          Omega Spatial is a suite of spatial "rooms" designed to support human judgement in complex domains.
          It is a visual reasoning surface — not a simulator, not an optimizer, and not a recommender.
        </p>
      </Section>

      <Section title="What it is not">
        <ul className="grid gap-2 text-zinc-300">
          {[
            "Not autonomous or agentic",
            "Not a simulator (no physics, no control loops, no time evolution)",
            "Not a decision-maker (no recommendations, no 'best choice')",
            "Not a certification or compliance claim"
          ].map((x) => (
            <li key={x} className="flex gap-2">
              <span className="text-zinc-500">•</span>
              <span>{x}</span>
            </li>
          ))}
        </ul>
      </Section>

      <div id="rooms">
        <Section title="The Rooms">
          <div className="grid gap-4 md:grid-cols-2">
            {rooms.map((r) => (
              <RoomCard key={r.key} title={r.title} subtitle={r.subtitle} />
            ))}
          </div>
        </Section>
      </div>

      <div id="trust">
        <Section title="Trust contract">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="text-sm font-medium">Canonical language</div>
            <div className="mt-3 space-y-2 text-sm text-zinc-300">
              <div>{trust.footer}</div>
              <div>{trust.roomTrustLine}</div>
              <div className="text-zinc-400">{trust.aboutCore}</div>
            </div>
          </div>
        </Section>
      </div>

      <div id="contact">
        <Section title="Contact">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-zinc-300">
              For labs, researchers, and engineering teams.
            </p>
            <p className="mt-3">
              <a
                href="mailto:hello@omegaspatial.com?subject=Omega%20Spatial%20Inquiry&body=Domain%3A%0AUse%20case%3A%0A"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800 transition"
              >
                Contact
              </a>
            </p>
          </div>
        </Section>
      </div>

      <footer className="mx-auto w-full max-w-5xl px-6 pb-10 pt-6 text-xs text-zinc-500">
        Omega Spatial<br />
        {trust.roomTrustLine}
      </footer>
    </main>
  );
}

