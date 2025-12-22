import "../styles/globals.css";
import Link from "next/link";
import DevWatermark from "../components/DevWatermark";
import { navLinks } from "../lib/copy";

export const metadata = {
  title: "Omega Spatial",
  description: "Human-led spatial reasoning surfaces — non-autonomous, visual reasoning only."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
            <div>
              <Link href="/" className="text-sm font-medium text-zinc-200">
                Omega Spatial
              </Link>
              <DevWatermark />
            </div>
            <div className="flex gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-zinc-400 hover:text-zinc-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}

