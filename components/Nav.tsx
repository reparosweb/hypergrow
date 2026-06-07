"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#produtos", label: "Produtos" },
  { href: "#como", label: "Como funciona" },
  { href: "#sobre", label: "Sobre" },
  { href: "#contato", label: "Contato" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div
          className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 ${
            scrolled ? "glass shadow-lg shadow-black/30" : ""
          }`}
        >
          <a href="#top" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan text-white">
              N
            </span>
            <span className="tracking-tight">
              Nex<span className="gradient-text">lab</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-slate-300 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <a
              href="#contato"
              className="shine inline-flex items-center rounded-full bg-gradient-to-r from-brand-500 to-accent-violet px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-transform hover:scale-[1.03]"
            >
              Falar com a Nexlab
            </a>
          </div>

          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg text-slate-200 md:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="glass mt-2 rounded-2xl p-2 md:hidden">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-slate-200 hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contato"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-xl bg-gradient-to-r from-brand-500 to-accent-violet px-4 py-3 text-center font-semibold text-white"
            >
              Falar com a Nexlab
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
