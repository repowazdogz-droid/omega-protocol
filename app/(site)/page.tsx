import { LANDING_COPY } from "@/app/content/landing";
import { DEMOS } from "@/app/content/demos";
import HeroSection from "@/app/components/sections/HeroSection";
import WhatOmegaDoes from "@/app/components/sections/WhatOmegaDoes";
import WhatOmegaIsNot from "@/app/components/sections/WhatOmegaIsNot";
import Products from "@/app/components/sections/Products";
import DemoSection from "@/app/components/sections/DemoSection";
import DomainAgnostic from "@/app/components/sections/DomainAgnostic";
import WhereUsed from "@/app/components/sections/WhereUsed";
import Philosophy from "@/app/components/sections/Philosophy";
import About from "@/app/components/sections/About";
import Contact from "@/app/components/sections/Contact";
import Footer from "@/app/components/sections/Footer";

export default function Page() {
  return (
    <>
      <HeroSection />
      <WhatOmegaDoes />
      <WhatOmegaIsNot />
      <Products />
      <DemoSection />
      <DomainAgnostic />
      <WhereUsed />
      <Philosophy />
      <About />
      <Contact />
      <Footer />
    </>
  );
}
