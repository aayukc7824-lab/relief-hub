const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "https://aayukc7824-lab.github.io",
];

export function isAllowedOrigin(origin: string | null): origin is string {
  if (!origin) return false;
  const configured = Deno.env.get("ALLOWED_ORIGINS")
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return (configured?.length ? configured : DEFAULT_ORIGINS).includes(origin);
}

export function corsHeaders(origin: string | null): HeadersInit {
  if (!isAllowedOrigin(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function jsonResponse(
  origin: string | null,
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
