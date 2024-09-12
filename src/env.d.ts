/// <reference path="../.astro/types.d.ts" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    runtime: {
      env: {
        COMINAVI_CIRCLEMS_ORIGIN: string;
        COMINAVI_OAUTH_CIRCLEMS_CLIENT_ID: string;
        COMINAVI_OAUTH_CIRCLEMS_CLIENT_SECRET: string;
      };
    };
  }
}
