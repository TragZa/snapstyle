import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        gray: "rgb(20, 20, 20)",
        gray2: "rgb(40, 40, 40)",
        gray3: "rgb(60, 60, 60)",
        yellow: "rgb(255, 200, 0)",
        yellow2: "rgb(255, 255, 0)",
        yellow3: "rgb(200, 150, 0)",
        green: "rgb(0, 200, 0)",
        red: "rgb(200, 0, 0)",
        red2: "rgb(255, 0, 0)",
        red3: "rgb(150, 0, 0)",
      },
    },
  },
  plugins: [],
};
export default config;
