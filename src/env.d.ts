/// <reference path="../.astro/types.d.ts" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    env: {
      COMINAVI_CIRCLEMS_DOMAIN: string;
      COMINAVI_OAUTH_CIRCLEMS_CLIENT_ID: string;
      COMINAVI_OAUTH_CIRCLEMS_CLIENT_SECRET: string;
    };
  }
}
