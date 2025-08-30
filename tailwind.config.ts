import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      extend: {
        colors: {
          background: "#f9fbff", // slightly tinted white (not harsh pure white)
          foreground: "#0f172a", // deep navy text for contrast

          card: "#ffffff",
          "card-foreground": "#0f172a",

          popover: "#ffffff",
          "popover-foreground": "#0f172a",

          primary: "#2563eb", // blue-600 (brand core, not too dark)
          "primary-foreground": "#ffffff", // pure white for clean contrast

          secondary: "#3b82f6", // blue-500 (slightly lighter complement)
          "secondary-foreground": "#ffffff",

          muted: "#f1f5f9", // soft neutral gray-blue
          "muted-foreground": "#475569", // slate-600 (better legibility)

          accent: "#dbeafe", // blue-100 (subtle hover / highlight)
          "accent-foreground": "#1e3a8a", // blue-900 (strong text on accent)

          destructive: "#e11d48", // rose-600 (vivid red, elegant contrast)
          "destructive-foreground": "#ffffff",

          border: "#cbd5e1", // slate-300 (lighter but visible)
          input: "#ffffff",
          ring: "#3b82f6", // blue-500 (vibrant focus ring)
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
