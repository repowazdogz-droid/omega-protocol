import React from "react";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-container">
      <SiteNav />
      <main className="site-main">
        <div className="site-content">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
