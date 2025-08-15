import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./client/src/**/*.{ts,tsx,js,jsx}",
    "./client/src/ui-v2/**/*.{ts,tsx,js,jsx}"
  ],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;