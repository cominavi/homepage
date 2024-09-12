import type { APIRoute } from "astro";

export const prerender = false;

export interface AuthorizationCodeResponse {
  access_token: string;
  token_type: string;
  expires_in: string;
  refresh_token: string;
}

function isAuthorizationCodeResponse(
  response: any,
): response is AuthorizationCodeResponse {
  return (
    typeof response === "object" &&
    typeof response.access_token === "string" &&
    typeof response.token_type === "string" &&
    typeof response.expires_in === "string" &&
    typeof response.refresh_token === "string"
  );
}
function verifyCirclemsOrigin(origin: string): URL | null {
  const u = new URL(origin);
  if (u.protocol !== "https:" || !u.hostname.endsWith("circle.ms")) {
    return null;
  }
  return u;
}

export const GET: APIRoute = async ({ request, locals }) => {
  const {
    COMINAVI_CIRCLEMS_ORIGIN,
    COMINAVI_OAUTH_CIRCLEMS_CLIENT_ID,
    COMINAVI_OAUTH_CIRCLEMS_CLIENT_SECRET,
  } = locals.runtime.env;

  const origin = verifyCirclemsOrigin(COMINAVI_CIRCLEMS_ORIGIN);
  if (!origin) {
    return new Response(
      "Invalid COMINAVI_CIRCLEMS_DOMAIN. Please check the configuration.",
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) {
    return Response.redirect(
      "cominavi://oauth/circlems/landing?status=failed&error=invalid_request_missing_code_or_state",
      307,
    );
  }

  const response = await fetch(new URL(`${origin.origin}/OAuth2/Token`), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      client_id: COMINAVI_OAUTH_CIRCLEMS_CLIENT_ID,
      client_secret: COMINAVI_OAUTH_CIRCLEMS_CLIENT_SECRET,
    }),
  });

  const json: AuthorizationCodeResponse = await response.json();
  if (isAuthorizationCodeResponse(json)) {
    const s = new URLSearchParams();
    s.set("status", "succeeded");
    s.set("state", state); // Pass the state back to the app
    s.set("token_type", json.token_type);
    s.set("access_token", json.access_token);
    s.set("expires_in", json.expires_in);
    s.set("refresh_token", json.refresh_token);
    return Response.redirect(
      `cominavi://oauth/circlems/landing?${s.toString()}`,
      307,
    );
  }

  return Response.redirect(
    `cominavi://oauth/circlems/landing?status=failed&error=invalid_server_response`,
    307,
  );
};
