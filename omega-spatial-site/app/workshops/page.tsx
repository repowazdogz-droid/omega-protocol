import Link from "next/link";
import { Section } from "../../components/Section";
import { workshops, trust } from "../../lib/copy";

export default function WorkshopsPage() {
  return (
    <main className="min-h-screen">
      <Section>
        <div className="max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-100">
            Workshops
          </h1>
          <p className="mt-4 text-zinc-300 text-base md:text-lg leading-relaxed">
            Facilitated sessions that produce shared clarity — without automation.
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="text-sm text-zinc-200 font-medium">Trust contract</div>
            <div className="mt-2 text-sm text-zinc-300 leading-relaxed">
              {trust.roomLine}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Workshop formats">
        <div className="grid grid-cols-1 gap-6">
          {workshops.map((workshop) => (
            <Link
              key={workshop.id}
              href={`/workshops/${workshop.slug}`}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 hover:bg-zinc-900/60 transition"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="max-w-3xl">
                  <div className="text-xl font-semibold text-zinc-100">{workshop.title}</div>
                  <div className="mt-2 text-sm text-zinc-400">{workshop.duration}</div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        For
                      </div>
                      <div className="mt-2 text-sm text-zinc-300 leading-relaxed">
                        {workshop.whoFor}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        Output
                      </div>
                      <div className="mt-2 text-sm text-zinc-300 leading-relaxed">
                        {workshop.outcomes}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      Not
                    </div>
                    <div className="mt-2 text-sm text-zinc-300 leading-relaxed">
                      {workshop.constraints[0]}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Request a workshop">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 max-w-5xl">
          <div className="text-zinc-200 font-medium">Bring your team</div>
          <p className="mt-2 text-zinc-300 leading-relaxed">
            Schedule a facilitated workshop. Include your team size, domain, and preferred format.
          </p>
          <div className="mt-4">
            <a
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-zinc-100 hover:bg-zinc-800 transition"
              href="mailto:hello@omegaspatial.com?subject=Omega%20Spatial%20Workshop%20Request&body=Team%20size%3A%0ADomain%3A%0APreferred%20format%3A%0ATimeline%3A%0A"
            >
              Request workshop
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

