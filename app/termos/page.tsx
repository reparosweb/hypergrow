import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Termos de Uso — HyperGrow",
  description: "Termos e condições de uso do site e serviços da HyperGrow.",
  alternates: { canonical: "/termos" },
};

export default function TermosPage() {
  return (
    <main className="relative min-h-screen py-20">
      <div className="mx-auto max-w-3xl px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <h1 className="mt-6 font-display text-4xl font-bold text-white">Termos de Uso</h1>
        <div className="mt-6 space-y-4 text-slate-300">
          <p>
            Ao utilizar o site da HyperGrow, você concorda com os termos abaixo.
          </p>
          <h2 className="pt-4 font-display text-xl font-semibold text-white">Uso do site</h2>
          <p>
            O conteúdo deste site é informativo. As propostas e condições comerciais
            são definidas individualmente em contrato para cada projeto.
          </p>
          <h2 className="pt-4 font-display text-xl font-semibold text-white">Propriedade intelectual</h2>
          <p>
            Marca, textos e identidade visual da HyperGrow são protegidos. Os projetos
            do portfólio pertencem aos seus respectivos titulares.
          </p>
          <h2 className="pt-4 font-display text-xl font-semibold text-white">Contato</h2>
          <p>Dúvidas sobre estes termos: contato@hypergrow.com.br.</p>
          <p className="pt-6 text-sm text-slate-500">Última atualização: 2026.</p>
        </div>
      </div>
    </main>
  );
}
