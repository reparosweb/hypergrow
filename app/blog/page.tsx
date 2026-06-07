import Link from "next/link";
import { ArrowLeft, PenSquare } from "lucide-react";

export const metadata = {
  title: "Blog — HyperGrow",
  description: "Conteúdos sobre tecnologia, IA, automação e crescimento digital.",
};

export default function BlogPage() {
  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-mesh" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-cyan text-white">
          <PenSquare className="h-8 w-8" strokeWidth={1.6} />
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold text-white">
          Blog <span className="gradient-text">em breve</span>
        </h1>
        <p className="mt-4 max-w-md text-slate-400">
          Estamos preparando conteúdos sobre inteligência artificial, automação,
          desenvolvimento e crescimento digital. Volte em breve.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
        >
          <ArrowLeft size={18} /> Voltar ao site
        </Link>
      </div>
    </main>
  );
}
