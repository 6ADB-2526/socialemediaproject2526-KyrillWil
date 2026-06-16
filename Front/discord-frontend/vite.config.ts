import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
});

//zegt hoe hij je project moet bouwen zonder weet hij niet hoe hij react moet gebruiken
