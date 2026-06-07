import { products } from "@/lib/products";
import ProductCard from "./ProductCard";

export default function ProductsSection() {
  return (
    <section id="produtos" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">
            Portfólio
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl">
            Um produto para cada <span className="gradient-text">problema real</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Cada solução abaixo está no ar, com clientes de verdade. Clique para
            conhecer ou peça uma versão sob medida para o seu negócio.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
