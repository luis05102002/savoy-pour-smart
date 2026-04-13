import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ALLOWED_ORIGINS = [
  "https://savoy-by-pg.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get("origin") || "";
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (origin.endsWith(".lovable.app") || origin.endsWith(".lovable.app")) return origin;
  return ALLOWED_ORIGINS[0];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s\-()]{6,20}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Origin": getAllowedOrigin(req),
      },
    });
  }

  const origin = getAllowedOrigin(req);

  try {
    const body = (await req.json()) as {
      customer_name: string;
      customer_phone: string;
      customer_email?: string;
      reservation_date: string;
      reservation_time: string;
      party_size: number;
      preferred_zone?: string;
      preferred_table?: number;
      customer_notes?: string;
    };

    // Validate required fields
    if (!body.customer_name || typeof body.customer_name !== "string" || body.customer_name.trim().length < 2 || body.customer_name.trim().length > 100) {
      return new Response(
        JSON.stringify({ error: "El nombre debe tener entre 2 y 100 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
      );
    }

    if (!body.customer_phone || !PHONE_REGEX.test(body.customer_phone)) {
      return new Response(
        JSON.stringify({ error: "Teléfono inválido" }),
        { status: 400, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
      );
    }

    if (body.customer_email && !EMAIL_REGEX.test(body.customer_email)) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
      );
    }

    if (!body.reservation_date || !body.reservation_time) {
      return new Response(
        JSON.stringify({ error: "Fecha y hora son obligatorias" }),
        { status: 400, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
      );
    }

    // Validate reservation is in the future
    const reservationDate = new Date(`${body.reservation_date}T${body.reservation_time}`);
    if (isNaN(reservationDate.getTime()) || reservationDate <= new Date()) {
      return new Response(
        JSON.stringify({ error: "La reserva debe ser para una fecha futura" }),
        { status: 400, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
      );
    }

    if (!body.party_size || body.party_size < 1 || body.party_size > 20) {
      return new Response(
        JSON.stringify({ error: "El número de personas debe ser entre 1 y 20" }),
        { status: 400, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
      );
    }

    const validZones = ["barra", "terraza", "salon", "privado"];
    if (body.preferred_zone && !validZones.includes(body.preferred_zone)) {
      return new Response(
        JSON.stringify({ error: "Zona inválida" }),
        { status: 400, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
      );
    }

    if (body.customer_notes && (typeof body.customer_notes !== "string" || body.customer_notes.length > 500)) {
      return new Response(
        JSON.stringify({ error: "Las notas no pueden superar 500 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit: max 3 reservations per phone in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentReservations } = await supabaseAdmin
      .from("reservations")
      .select("id")
      .eq("customer_phone", body.customer_phone.trim())
      .gte("created_at", oneDayAgo);

    if (recentReservations && recentReservations.length >= 3) {
      return new Response(
        JSON.stringify({ error: "Demasiadas reservas. Inténtalo más tarde." }),
        { status: 429, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
      );
    }

    // Insert reservation
    const { data: reservation, error: insertError } = await supabaseAdmin
      .from("reservations")
      .insert({
        customer_name: body.customer_name.trim(),
        customer_phone: body.customer_phone.trim(),
        customer_email: body.customer_email?.trim() || null,
        reservation_date: body.reservation_date,
        reservation_time: body.reservation_time,
        party_size: body.party_size,
        preferred_zone: body.preferred_zone || null,
        preferred_table: body.preferred_table || null,
        customer_notes: body.customer_notes?.trim() || null,
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Error al crear la reserva" }),
        { status: 500, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ id: reservation.id, createdAt: reservation.created_at }),
      { status: 200, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
    );
  }
});