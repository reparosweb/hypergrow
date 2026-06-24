"use client";
import dynamic from "next/dynamic";

// Carrega o ChatWidget (framer-motion + lucide-react) só no cliente, após a hidratação.
// Tira essas libs do bundle inicial da home → menos JS no boot, melhor TBT/INP.
// O widget é um botão flutuante que só interessa depois que a página já apareceu.
const ChatWidget = dynamic(() => import("@/components/ChatWidget"), { ssr: false });

export default function ChatWidgetLazy() {
  return <ChatWidget />;
}
