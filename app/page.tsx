import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import AISolutions from "@/components/AISolutions";
import Differentials from "@/components/Differentials";
import Portfolio from "@/components/Portfolio";
import Process from "@/components/Process";
import Testimonials from "@/components/Testimonials";
import About from "@/components/About";
import WhyUs from "@/components/WhyUs";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <Services />
      <AISolutions />
      <Differentials />
      <Portfolio />
      <Process />
      <Testimonials />
      <About />
      <WhyUs />
      <FAQ />
      <FinalCTA />
      <Contact />
      <Footer />
      <ChatWidget />
    </main>
  );
}
