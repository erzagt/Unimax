import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { RouteTimeline } from "@/components/sections/RouteTimeline";
import { Directions } from "@/components/sections/Directions";
import { FreeTools } from "@/components/sections/FreeTools";
import { Mentors } from "@/components/sections/Mentors";
import { Faq } from "@/components/sections/Faq";
import { Apply } from "@/components/sections/Apply";

export default function HomePage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Перейти к содержанию
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <RouteTimeline />
        <Directions />
        <FreeTools />
        <Mentors />
        <Faq />
        <Apply />
      </main>
      <Footer />
    </>
  );
}
