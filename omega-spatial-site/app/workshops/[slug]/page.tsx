import { notFound } from "next/navigation";
import Link from "next/link";
import { Section } from "../../../components/Section";
import { workshops, trust, contact, offerings } from "../../../lib/copy";
import { buildWorkshopInquiryMailto } from "../../../lib/mailto";

export async function generateStaticParams() {
  const workshopSlugs = workshops.map((workshop) => ({ slug: workshop.slug }));
  const offeringSlugs = offerings.workshops.map((workshop) => ({ slug: workshop.slug }));
  return [...workshopSlugs, ...offeringSlugs];
}

export default function WorkshopDetailPage({ params }: { params: { slug: string } }) {
  // Check offerings first
  const offering = offerings.workshops.find((w) => w.slug === params.slug);
  if (offering) {
    const path = `/workshops/${offering.slug}`;
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Section title={offering.title} subtitle={offering.subtitle}>
          <ul className="mt-2 space-y-2 text-sm text-zinc-200">
            {offering.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-500" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
            <div className="text-sm font-semibold text-zinc-100">Share this page</div>
            <div className="mt-2 text-sm text-zinc-300">Path:</div>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-zinc-950 p-3 text-xs text-zinc-200">{path}</pre>
          </div>
        </Section>
      </main>
    );
  }

  // Fall back to full workshop detail
  const workshop = workshops.find((w) => w.slug === params.slug);

  if (!workshop) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <Section>
        <div className="max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-100">
            {workshop.title}
          </h1>
          <p className="mt-4 text-zinc-300 text-base md:text-lg leading-relaxed">
            {workshop.duration}
          </p>

          <div className="mt-4 text-sm text-zinc-400">
            {trust.antiMisread}
          </div>
        </div>
      </Section>

      <Section title="Who it's for">
        <div className="max-w-5xl">
          <p className="text-zinc-300 leading-relaxed">{workshop.whoFor}</p>
        </div>
      </Section>

      <Section title="Agenda">
        <div className="max-w-5xl">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <ul className="space-y-2 text-zinc-300">
              {workshop.agenda.map((item, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-zinc-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Outputs">
        <div className="max-w-5xl">
          <ul className="space-y-2 text-zinc-300">
            {workshop.outputs.map((output, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-zinc-500">•</span>
                <span>{output}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="Boundaries">
        <div className="max-w-5xl">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <ul className="space-y-2 text-zinc-300">
              {workshop.constraints.map((constraint, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-zinc-500">•</span>
                  <span>{constraint}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <div className="max-w-5xl flex flex-col sm:flex-row gap-4">
          <a
            href={buildWorkshopInquiryMailto(workshop.title, contact.email, contact.subjectPrefix)}
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800/50 px-6 py-3 text-zinc-100 hover:bg-zinc-800 transition font-medium"
          >
            Email inquiry
          </a>
          <Link
            href="/workshops"
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-700 px-6 py-3 text-zinc-300 hover:bg-zinc-800/50 transition"
          >
            Back to Workshops
          </Link>
        </div>
      </Section>

      <footer className="mx-auto w-full max-w-5xl px-6 pb-10 pt-6 text-xs text-zinc-500">
        {trust.footer}
      </footer>
    </main>
  );
}

