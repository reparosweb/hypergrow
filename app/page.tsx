import "./hg-tokens.css";
import "./hg-styles.css";
import HypergrowSite from "@/components/site/HypergrowSite";
import ChatWidget from "@/components/ChatWidgetLazy";

export default function Home() {
  return (
    <>
      <HypergrowSite />
      <ChatWidget />
    </>
  );
}
