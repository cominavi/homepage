// @ts-check
import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";

// https://astro.build/config
export default defineConfig({
  build: {
    redirects: false,
  },
  output: "hybrid",
  adapter: cloudflare(),
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
  ],
});
