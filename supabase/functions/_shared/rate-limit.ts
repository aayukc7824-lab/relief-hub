import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type RateLimitResult = "allowed" | "limited" | "unavailable";

function getClientIp(request: Request): string | null {
  const directIp = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-real-ip");
  if (directIp?.trim()) return directIp.trim();

  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || null;
}

async function hashIp(ip: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(ip));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function checkSubmissionRateLimit(
  request: Request,
  supabase: SupabaseClient,
  formName: "missing_report" | "volunteer_offer",
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const hashSecret = Deno.env.get("RATE_LIMIT_HASH_SECRET");
  if (!ip || !hashSecret || hashSecret.length < 32) return "unavailable";

  const hourMilliseconds = 60 * 60 * 1000;
  const bucketStart = new Date(
    Math.floor(Date.now() / hourMilliseconds) * hourMilliseconds,
  ).toISOString();

  let ipHash: string;
  try {
    ipHash = await hashIp(ip, hashSecret);
  } catch (error) {
    console.error("Unable to hash submission IP for rate limiting", error);
    return "unavailable";
  }

  const { data, error } = await supabase.rpc("consume_submission_rate_limit", {
    p_ip_hash: ipHash,
    p_form_name: formName,
    p_bucket_start: bucketStart,
    p_hourly_limit: 5,
  });
  if (error) {
    console.error("Submission rate limit check failed", error.code);
    return "unavailable";
  }

  return data === true ? "allowed" : "limited";
}
