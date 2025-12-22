import { LANDING_COPY } from "@/app/content/landing";

export default function Footer() {
  return (
    <footer className="section" style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--s-7)' }}>
      <div className="site-wrap">
        <div className="site-measure">
          <p className="note" style={{ whiteSpace: 'pre-line' }}>{LANDING_COPY.footer}</p>
        </div>
      </div>
    </footer>
  );
}

