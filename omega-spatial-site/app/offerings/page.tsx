import { offerings } from "../../lib/copy";
import { Section } from "../../components/Section";
import Link from "next/link";

function Card({ title, subtitle, bullets, href }: { title: string; subtitle: string; bullets: string[]; href: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
      <div className="text-lg font-semibold text-zinc-50">{title}</div>
      <div className="mt-1 text-sm text-zinc-300">{subtitle}</div>
      <ul className="mt-4 space-y-2 text-sm text-zinc-200">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-500" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <Link
          href={href}
          className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-800"
        >
          View details
        </Link>
      </div>
    </div>
  );
}

export default function OfferingsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Section title="Offerings" subtitle="Tools and workshops you can share after a conversation.">
        <div className="grid gap-8">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Tools</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {offerings.tools.map((t) => (
                <Card key={t.slug} title={t.title} subtitle={t.subtitle} bullets={t.bullets} href={`/tools/${t.slug}`} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold text-zinc-100">Workshops</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {offerings.workshops.map((w) => (
                <Card key={w.slug} title={w.title} subtitle={w.subtitle} bullets={w.bullets} href={`/workshops/${w.slug}`} />
              ))}
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}



