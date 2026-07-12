import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        taze: {
          green: "#00C896",
          leaf: "#00E6A8",
          cream: "#FBF7EE",
          soil: "#000000",
        },
      },
    },
  },
  plugins: [],
};

export default config;
