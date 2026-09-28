export async function verifyTurnstile(
  token: unknown,
  origin: string,
  expectedAction: string,
): Promise<boolean> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (typeof token !== "string" || token.length < 1 || !secret) return false;

  const hostname = new URL(origin).hostname;
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(5_000),
    },
  );
  if (!response.ok) return false;

  const result = await response.json();
  return result.success === true
    && result.action === expectedAction
    && result.hostname === hostname;
}
