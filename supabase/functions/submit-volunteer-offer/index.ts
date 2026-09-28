import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, isAllowedOrigin, jsonResponse } from "../_shared/http.ts";
import { checkSubmissionRateLimit } from "../_shared/rate-limit.ts";
import { verifyTurnstile } from "../_shared/turnstile.ts";

const districts = new Set(["Rasuwa", "Nuwakot", "Dhading"]);
const offerTypes = new Set(["volunteer", "supplies", "medical", "transport", "other"]);
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
    if (rawBody.length > 10_000) {
      return jsonResponse(origin, { error: "The offer is too large." }, 413);
    }
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return jsonResponse(origin, { error: "Invalid offer data." }, 400);
    }
    input = parsed as Record<string, unknown>;
  } catch {
    return jsonResponse(origin, { error: "Invalid offer data." }, 400);
  }

  const fullName = textField(input.full_name, 2, 100);
  const phone = textField(input.phone, 7, 30);
  const hasEmail = input.email != null && input.email !== "";
  const email = !hasEmail
    ? null
    : textField(input.email, 5, 254);
  const offerType = textField(input.offer_type, 1, 20);
  const district = textField(input.district, 1, 20);
  const availability = textField(input.availability, 2, 120);
  const details = textField(input.details, 10, 1000);

  if (
    !fullName || !phone || !phonePattern.test(phone)
    || (hasEmail && (!email || !emailPattern.test(email)))
    || !offerType || !offerTypes.has(offerType)
    || !district || !districts.has(district)
    || !availability || !details || input.consent_to_contact !== true
  ) {
    return jsonResponse(origin, { error: "Check the required fields and consent choice." }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(origin, { error: "Offer intake is not configured." }, 503);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let turnstilePassed = false;
  try {
    turnstilePassed = await verifyTurnstile(
      input.turnstile_token,
      origin,
      "volunteer_offer",
    );
  } catch (error) {
    console.error("Turnstile verification failed", error);
  }
  if (!turnstilePassed) {
    return jsonResponse(origin, { error: "Security check failed. Please try again." }, 403);
  }

  const rateLimit = await checkSubmissionRateLimit(request, supabase, "volunteer_offer");
  if (rateLimit === "limited") {
    return jsonResponse(origin, { error: "Too many submissions. Please try again later." }, 429);
  }
  if (rateLimit === "unavailable") {
    return jsonResponse(origin, { error: "Secure offer intake is temporarily unavailable." }, 503);
  }

  const { error } = await supabase.from("volunteer_offers").insert({
    full_name: fullName,
    phone,
    email,
    offer_type: offerType,
    district,
    availability,
    details,
    consent_to_contact: true,
  });

  if (error) {
    console.error("Volunteer offer insert failed", error.code);
    return jsonResponse(origin, { error: "The offer could not be saved. Please try again." }, 500);
  }

  return jsonResponse(origin, {
    message: "Your offer was received for private review. Do not use this form for emergencies.",
  }, 201);
});
