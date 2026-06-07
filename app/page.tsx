import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import ProductsSection from "@/components/ProductsSection";
import Process from "@/components/Process";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <Stats />
      <ProductsSection />
      <Process />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
