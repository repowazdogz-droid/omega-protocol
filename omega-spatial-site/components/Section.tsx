export function Section({
  title,
  subtitle,
  children
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-14">
      {title ? (
        <>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
          ) : null}
        </>
      ) : null}
      <div className={title ? "mt-5" : ""}>{children}</div>
    </section>
  );
}



