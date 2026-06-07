import { Instagram, Linkedin, Facebook, Mail } from "lucide-react";
import { services } from "@/lib/content";

export default function Footer() {
  const year = 2026;
  return (
    <footer className="relative border-t border-white/10 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 font-display text-lg font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan text-white">H</span>
              Hyper<span className="gradient-text">grow</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-slate-400">
              Transformação digital, desenvolvimento de software, inteligência
              artificial e automação para acelerar o crescimento da sua empresa.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Linkedin, label: "LinkedIn" },
                { icon: Facebook, label: "Facebook" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#contato"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="mb-3 text-sm font-semibold text-white">Serviços</p>
            <ul className="space-y-2 text-sm text-slate-400">
              {services.map((s) => (
                <li key={s.slug}>
                  <a href="#servicos" className="transition-colors hover:text-white">{s.title}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="mb-3 text-sm font-semibold text-white">Empresa</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#portfolio" className="hover:text-white">Portfólio</a></li>
              <li><a href="#sobre" className="hover:text-white">Sobre</a></li>
              <li><a href="/blog" className="hover:text-white">Blog</a></li>
              <li><a href="#contato" className="hover:text-white">Contato</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="mb-3 text-sm font-semibold text-white">Contato</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="inline-flex items-center gap-2">
                <Mail size={14} className="text-brand-300" /> contato@hypergrow.com.br
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {year} HyperGrow. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="/privacidade" className="hover:text-slate-300">Política de Privacidade</a>
            <a href="/termos" className="hover:text-slate-300">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
