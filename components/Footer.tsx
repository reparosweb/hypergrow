import { products } from "@/lib/products";

export default function Footer() {
  const year = 2026;
  return (
    <footer className="relative border-t border-white/10 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-display text-lg font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan text-white">
                N
              </span>
              Hyper<span className="gradient-text">grow</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-slate-400">
              Estúdio de produtos digitais. Criamos, lançamos e operamos SaaS de
              verdade — com IA, automação e foco em receita.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Produtos</p>
            <ul className="space-y-2 text-sm text-slate-400">
              {products.map((p) => (
                <li key={p.slug}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-white"
                  >
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Empresa</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#sobre" className="hover:text-white">Sobre</a></li>
              <li><a href="#como" className="hover:text-white">Como funciona</a></li>
              <li><a href="#contato" className="hover:text-white">Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {year} Hypergrow. Todos os direitos reservados.</p>
          <p>Feito com tecnologia própria e IA.</p>
        </div>
      </div>
    </footer>
  );
}
