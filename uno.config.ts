import { presetHeroPatterns } from "@julr/unocss-preset-heropatterns";
import { defineConfig, presetUno, transformerDirectives } from "unocss";

export default defineConfig({
  presets: [presetUno(), presetHeroPatterns()],
  transformers: [transformerDirectives()],
});
