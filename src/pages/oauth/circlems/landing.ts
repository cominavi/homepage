import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  if (searchParams.has("code")) {
    return Response.redirect(
      `cominavi://oauth/circlems/landing${searchParams.toString()}`,
      307,
    );
  }

  return Response.redirect(
    "cominavi://oauth/circlems/landing?error=invalid_request",
    307,
  );
};
