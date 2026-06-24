import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade — HyperGrow",
  description: "Como a HyperGrow coleta, usa e protege seus dados.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacidadePage() {
  return (
    <main className="relative min-h-screen py-20">
      <div className="mx-auto max-w-3xl px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <h1 className="mt-6 font-display text-4xl font-bold text-white">Política de Privacidade</h1>
        <div className="mt-6 space-y-4 text-slate-300">
          <p>
            A HyperGrow respeita a sua privacidade. Esta política explica, de forma
            resumida, como tratamos os dados que você nos fornece.
          </p>
          <h2 className="pt-4 font-display text-xl font-semibold text-white">Dados que coletamos</h2>
          <p>
            Coletamos os dados que você informa voluntariamente em nossos formulários
            (nome, e-mail, telefone e mensagem) com o objetivo de responder à sua
            solicitação e enviar uma proposta.
          </p>
          <h2 className="pt-4 font-display text-xl font-semibold text-white">Uso dos dados</h2>
          <p>
            Utilizamos seus dados apenas para contato comercial e atendimento. Não
            vendemos nem compartilhamos seus dados com terceiros para fins de marketing.
          </p>
          <h2 className="pt-4 font-display text-xl font-semibold text-white">Seus direitos</h2>
          <p>
            Você pode solicitar a qualquer momento a correção ou exclusão dos seus
            dados pelo e-mail contato@hypergrow.com.br.
          </p>
          <p className="pt-6 text-sm text-slate-500">Última atualização: 2026.</p>
        </div>
      </div>
    </main>
  );
}
