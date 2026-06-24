import "./hg-tokens.css";
import "./hg-styles.css";
import type { Metadata } from "next";
import HypergrowSite from "@/components/site/HypergrowSite";
import ChatWidget from "@/components/ChatWidgetLazy";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <HypergrowSite />
      <ChatWidget />
    </>
  );
}
