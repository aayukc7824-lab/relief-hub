import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, isAllowedOrigin, jsonResponse } from "../_shared/http.ts";
import { checkSubmissionRateLimit } from "../_shared/rate-limit.ts";
import { verifyTurnstile } from "../_shared/turnstile.ts";

const districts = new Set(["Rasuwa", "Nuwakot", "Dhading"]);
const phonePattern = /^\+?[0-9][0-9\s().-]{6,28}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function textField(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length >= min && text.length <= max ? text : null;
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(origin)) return new Response("Forbidden", { status: 403 });
    return new Response("ok", { headers: corsHeaders(origin) });
  }
  if (request.method !== "POST") {
    return jsonResponse(origin, { error: "Method not allowed." }, 405);
  }
  if (!isAllowedOrigin(origin)) {
    return jsonResponse(origin, { error: "This origin is not allowed." }, 403);
  }

  let rawBody: string;
  let input: Record<string, unknown>;
  try {
    rawBody = await request.text();
    if (rawBody.length > 12_000) {
      return jsonResponse(origin, { error: "The report is too large." }, 413);
    }
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return jsonResponse(origin, { error: "Invalid report data." }, 400);
    }
    input = parsed as Record<string, unknown>;
  } catch {
    return jsonResponse(origin, { error: "Invalid report data." }, 400);
  }

  const personName = textField(input.person_name, 2, 100);
  const district = textField(input.district, 1, 20);
  const lastSeenLocation = textField(input.last_seen_location, 2, 160);
  const lastSeenAt = textField(input.last_seen_at, 10, 40);
  const description = textField(input.description, 10, 1200);
  const reporterName = textField(input.reporter_name, 2, 100);
  const reporterPhone = textField(input.reporter_phone, 7, 30);
  const hasReporterEmail = input.reporter_email != null && input.reporter_email !== "";
  const reporterEmail = !hasReporterEmail
    ? null
    : textField(input.reporter_email, 5, 254);
  const ageValue = input.approximate_age;
  const age = ageValue === "" || ageValue == null
    ? null
    : Number.isInteger(ageValue) && Number(ageValue) >= 0 && Number(ageValue) <= 120
    ? Number(ageValue)
    : undefined;

  if (
    !personName || !district || !districts.has(district) || !lastSeenLocation
    || !lastSeenAt || Number.isNaN(Date.parse(lastSeenAt)) || !description
    || !reporterName || !reporterPhone || !phonePattern.test(reporterPhone)
    || age === undefined
    || (hasReporterEmail && (!reporterEmail || !emailPattern.test(reporterEmail)))
    || input.consent_to_store !== true
    || typeof input.publication_consent !== "boolean"
  ) {
    return jsonResponse(origin, { error: "Check the required fields and consent choices." }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(origin, { error: "Report intake is not configured." }, 503);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let turnstilePassed = false;
  try {
    turnstilePassed = await verifyTurnstile(
      input.turnstile_token,
      origin,
      "missing_report",
    );
  } catch (error) {
    console.error("Turnstile verification failed", error);
  }
  if (!turnstilePassed) {
    return jsonResponse(origin, { error: "Security check failed. Please try again." }, 403);
  }

  const rateLimit = await checkSubmissionRateLimit(request, supabase, "missing_report");
  if (rateLimit === "limited") {
    return jsonResponse(origin, { error: "Too many submissions. Please try again later." }, 429);
  }
  if (rateLimit === "unavailable") {
    return jsonResponse(origin, { error: "Secure report intake is temporarily unavailable." }, 503);
  }

  const { error } = await supabase.from("missing_reports").insert({
    person_name: personName,
    approximate_age: age,
    district,
    last_seen_location: lastSeenLocation,
    last_seen_at: new Date(lastSeenAt).toISOString(),
    description,
    reporter_name: reporterName,
    reporter_phone: reporterPhone,
    reporter_email: reporterEmail,
    consent_to_store: true,
    publication_consent: input.publication_consent,
  });

  if (error) {
    console.error("Missing report insert failed", error.code);
    return jsonResponse(origin, { error: "The report could not be saved. Please try again." }, 500);
  }

  return jsonResponse(origin, {
    message: "Your report was received for private review. This is not an emergency dispatch service.",
  }, 201);
});
