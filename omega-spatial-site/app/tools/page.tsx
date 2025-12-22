import Link from "next/link";
import { Section } from "../../components/Section";
import { tools, trust } from "../../lib/copy";

export default function ToolsPage() {
  return (
    <main className="min-h-screen">
      <Section>
        <div className="max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-100">
            Tools
          </h1>
          <p className="mt-4 text-zinc-300 text-base md:text-lg leading-relaxed">
            Practical, lightweight entry points — derived from Omega Spatial.
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="text-sm text-zinc-200 font-medium">Trust contract</div>
            <div className="mt-2 text-sm text-zinc-300 leading-relaxed">
              {trust.antiMisread}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Available tools">
        <div className="grid grid-cols-1 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 hover:bg-zinc-900/60 transition"
            >
              <div className="text-xl font-semibold text-zinc-100">{tool.title}</div>
              <div className="mt-2 text-zinc-300 leading-relaxed">{tool.subtitle}</div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">
                    Includes
                  </div>
                  <ul className="mt-2 text-sm text-zinc-300 space-y-1">
                    {tool.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="text-zinc-500">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">
                    Not
                  </div>
                  <div className="mt-2 text-sm text-zinc-300 leading-relaxed">
                    {tool.constraints[0]}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Request access">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 max-w-5xl">
          <div className="text-zinc-200 font-medium">Get tools + templates</div>
          <p className="mt-2 text-zinc-300 leading-relaxed">
            Request access to download tools and templates. Include your domain and intended use.
          </p>
          <div className="mt-4">
            <a
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-zinc-100 hover:bg-zinc-800 transition"
              href="mailto:hello@omegaspatial.com?subject=Omega%20Spatial%20Tools%20Request&body=Domain%3A%0AUse%20case%3A%0AWhich%20tools%20interest%20you%3A%0A"
            >
              Request access
            </a>
          </div>
        </div>
      </Section>

      <footer className="mx-auto w-full max-w-5xl px-6 pb-10 pt-6 text-xs text-zinc-500">
        {trust.footer}
      </footer>
    </main>
  );
}

