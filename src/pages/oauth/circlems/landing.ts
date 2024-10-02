import type { APIRoute } from "astro";

export const prerender = false;

export interface AuthorizationCodeSuccessResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: unknown;
}

function isAuthorizationCodeSuccessResponse(
  response: any,
): response is AuthorizationCodeSuccessResponse {
  return (
    typeof response === "object" &&
    typeof response.access_token === "string" &&
    typeof response.token_type === "string" &&
    typeof response.refresh_token === "string" &&
    Object.hasOwn(response, "expires_in")
  );
}

interface AuthorizationCodeErrorResponse {
  error: string;
  error_description?: string;
  error_uri?: string;
}

function isAuthorizationCodeErrorResponse(
  response: any,
): response is AuthorizationCodeErrorResponse {
  return typeof response === "object" && typeof response.error === "string";
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
      "Invalid COMINAVI_CIRCLEMS_ORIGIN. Please check the configuration.",
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

  const text = await response.text();
  if (
    (response.headers.get("Content-Type") ?? "").indexOf("application/json") ===
    -1
  ) {
    console.error(
      "Failed to fetch token: server responded with non-JSON content. status:",
      response.status,
      "content:",
      text,
    );
    return Response.redirect(
      `cominavi://oauth/circlems/landing?status=failed&error=invalid_server_response_text`,
      307,
    );
  }

  const json = JSON.parse(text);

  if (isAuthorizationCodeErrorResponse(json)) {
    const s = new URLSearchParams();
    s.set("status", "failed");
    s.set("state", state);
    s.set("error", "authorization_code_error");
    s.set("external_error", json.error);
    if (json.error_description) {
      s.set("external_error_description", json.error_description);
    }
    if (json.error_uri) {
      s.set("external_error_uri", json.error_uri);
    }
    return Response.redirect(
      `cominavi://oauth/circlems/landing?${s.toString()}`,
      307,
    );
  }

  if (isAuthorizationCodeSuccessResponse(json)) {
    const s = new URLSearchParams();
    s.set("status", "succeeded");
    s.set("state", state); // Pass the state back to the app
    s.set("token_type", json.token_type);
    s.set("access_token", json.access_token);
    s.set("expires_in", `${json.expires_in}`);
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
