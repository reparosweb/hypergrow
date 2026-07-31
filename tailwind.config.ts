import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ⚠️ CORREÇÃO: esta paleta ainda era a do Nexlab (índigo #6366f1 + violeta
         #a855f7 + ciano + rosa) — exatamente o "kit de site gerado por IA" que já
         foi removido do resto do site. Havia a anotação de que o Tailwind "não
         afeta o site ativo"; está ERRADO: o `ChatWidget` é renderizado na HOME e
         o botão flutuante saía com `linear-gradient(#6366f1, #a855f7)`, roxo,
         por cima de tudo, em toda visita. Verificado no ar com getComputedStyle.

         Os NOMES continuam iguais (brand-500, accent-violet…) de propósito: assim
         nenhum componente precisa mudar e a correção pega de uma vez o
         ChatWidget, /admin, /privacidade e /termos. Só o VALOR mudou, para a
         paleta real da marca (jade + cobre sobre grafite). */
      colors: {
        ink: {
          950: "#0D1013", // ink-deep
          900: "#12151A", // canvas
          800: "#171B20", // superfície de card
          700: "#1D2229",
        },
        brand: {
          50: "#E4F7EE",
          300: "#6FE3B4",
          400: "#2DD4A0",
          500: "#0FA968", // jade primário
          600: "#0B7A4C",
        },
        accent: {
          cyan: "#3BA8A0", // teal do pilar IA (era #22d3ee)
          violet: "#C4763C", // cobre — o nome é legado, o valor NÃO é violeta
          pink: "#D99461", // cobre claro
        },
      },
      // Aponta para o sistema tipográfico atual do site (Archivo + IBM Plex Sans).
      // Antes referenciava --font-inter/--font-display (Inter + Space Grotesk), que
      // eram baixadas em TODA página (70 KB) e nunca casavam com texto nenhum na
      // home — o navegador reportava status "unloaded". Agora as páginas Tailwind
      // (admin, privacidade, termos) usam a mesma tipografia do resto do site.
      fontFamily: {
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        // Mesmo motivo do bloco de cores acima: os 3 raios eram índigo, ciano e
        // violeta. Agora jade, teal e cobre.
        "mesh":
          "radial-gradient(60% 60% at 20% 10%, rgba(15,169,104,0.25) 0%, transparent 60%), radial-gradient(50% 50% at 85% 20%, rgba(59,168,160,0.18) 0%, transparent 55%), radial-gradient(60% 60% at 50% 100%, rgba(196,118,60,0.20) 0%, transparent 60%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
