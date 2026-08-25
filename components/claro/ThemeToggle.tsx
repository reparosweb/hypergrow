"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   BOTÃO CLARO/ESCURO (2026-08-16) — o visitante escolhe o tema.

   O site é ESCURO por padrão. Este botão troca `data-theme` no <html> entre
   "dark" e "light" e salva a escolha em localStorage. O tema em si vive todo
   em CSS (app/claro-tokens.css: paleta escura no :root, override claro em
   `html[data-theme="light"]`) — aqui só se liga/desliga o atributo.

   SEM FLASH: quem aplica a escolha salva ANTES da 1a pintura é o script inline
   em app/layout.tsx (roda antes do React montar). Este componente só reflete o
   estado atual e alterna no clique.

   Estado inicial NEUTRO ("dark") no servidor e na 1a render do cliente, ligado
   ao valor real depois de montar — mesma disciplina anti-hidratação do
   useWhatsApp()/ClaroShow: nunca renderizar no servidor um valor que o cliente
   recalcularia diferente. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [tema, setTema] = useState<"dark" | "light">("dark");
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    const atual = document.documentElement.getAttribute("data-theme");
    setTema(atual === "light" ? "light" : "dark");
    setMontado(true);
  }, []);

  function alternar() {
    const novo = tema === "dark" ? "light" : "dark";
    setTema(novo);
    document.documentElement.setAttribute("data-theme", novo);
    try {
      localStorage.setItem("hg-theme", novo);
    } catch {
      /* modo anônimo/localStorage bloqueado: a troca vale só nesta visita */
    }
  }

  // Antes de montar, o rótulo/ícone é neutro para não divergir do HTML do servidor.
  const escuro = montado && tema === "dark";
  const rotulo = escuro ? "Mudar para tema claro" : "Mudar para tema escuro";

  return (
    <button
      type="button"
      className={"cl-theme-btn" + (className ? " " + className : "")}
      onClick={alternar}
      aria-label={rotulo}
      title={rotulo}
    >
      {escuro ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
