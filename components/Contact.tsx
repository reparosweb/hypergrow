import LeadForm from "./LeadForm";
import { Mail, MessageCircle, Zap, ShieldCheck, Smartphone } from "lucide-react";

const perks = [
  { icon: Zap, title: "No ar rápido", desc: "Produtos lançados em domínio próprio, sem enrolação." },
  { icon: Smartphone, title: "Mobile-first", desc: "Responsivo de verdade e com cara de app no celular." },
  { icon: ShieldCheck, title: "Sem simulação", desc: "Tudo real: banco, IA, pagamento e automação." },
];

export default function Contact() {
  return (
    <section id="contato" className="relative py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">
            Contato
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl">
            Solicite seu <span className="gradient-text">orçamento</span>
          </h2>
          <p className="mt-4 max-w-md text-slate-400">
            Conte o que sua empresa precisa — site, e-commerce, sistema, automação
            ou IA. Respondemos rápido, por e-mail ou WhatsApp, com uma proposta sob medida.
          </p>

          <div className="mt-8 space-y-4">
            {perks.map((p) => (
              <div key={p.title} className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan text-white">
                  <p.icon className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <div>
                  <p className="font-semibold text-white">{p.title}</p>
                  <p className="text-sm text-slate-400">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2">
              <Mail size={16} className="text-brand-300" /> contato@hypergrow.com.br
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageCircle size={16} className="text-emerald-400" /> Atendimento via WhatsApp
            </span>
          </div>
        </div>

        <div>
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
