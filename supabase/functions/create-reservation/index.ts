import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ALLOWED_ORIGINS = [
  "https://savoy-by-pg.lovable.app",
  "https://savoy-pour-smart.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get("origin") || "";
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (origin.match(/^https:\/\/[a-z0-9-]+--savoy(-pour-smart|-by-pg)?\.lovable\.app$/)) return origin;
  return "";
}

// IP-based rate limiting
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkIpRateLimit(req: Request, keyPrefix: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter: number } {
  const forward = req.headers.get("x-forwarded-for");
  const ip = forward ? forward.split(",")[0].trim() : (req.headers.get("x-real-ip") || "unknown");
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimits) {
    if (now > entry.resetAt) rateLimits.delete(key);
  }
}, 5 * 60 * 1000);

function sanitize(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s\-()]{6,20}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: { ...corsHeaders, "Access-Control-Allow-Origin": getAllowedOrigin(req) },
    });
  }

  const origin = getAllowedOrigin(req);
  const responseHeaders = { ...corsHeaders, "Access-Control-Allow-Origin": origin };

  try {
    // IP rate limit: max 5 reservations per IP per hour
    const ipRateCheck = checkIpRateLimit(req, "reservation", 5, 60 * 60 * 1000);
    if (!ipRateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: `Demasiadas reservas. Intenta de nuevo en ${ipRateCheck.retryAfter}s.` }),
        { status: 429, headers: { ...responseHeaders, "Content-Type": "application/json", "Retry-After": String(ipRateCheck.retryAfter) } }
      );
    }

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
        { status: 400, headers: { ...responseHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.customer_phone || !PHONE_REGEX.test(body.customer_phone)) {
      return new Response(
        JSON.stringify({ error: "Teléfono inválido" }),
        { status: 400, headers: { ...responseHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.customer_email && !EMAIL_REGEX.test(body.customer_email)) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { ...responseHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.reservation_date || !body.reservation_time) {
      return new Response(
        JSON.stringify({ error: "Fecha y hora son obligatorias" }),
        { status: 400, headers: { ...responseHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate reservation is in the future
    const reservationDate = new Date(`${body.reservation_date}T${body.reservation_time}`);
    if (isNaN(reservationDate.getTime()) || reservationDate <= new Date()) {
      return new Response(
        JSON.stringify({ error: "La reserva debe ser para una fecha futura" }),
        { status: 400, headers: { ...responseHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate reservation time is within business hours (16:00 - 01:00)
    const hour = parseInt(body.reservation_time.split(":")[0], 10);
    if (hour < 16 && hour > 1) {
      return new Response(
        JSON.stringify({ error: "Horario de reserva fuera del horario de apertura (16:00 - 01:00)" }),
        { status: 400, headers: { ...responseHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.party_size || body.party_size < 1 || body.party_size > 20) {
      return new Response(
        JSON.stringify({ error: "El número de personas debe ser entre 1 y 20" }),
        { status: 400, headers: { ...responseHeaders, "Content-Type": "application/json" } }
      );
    }

    const validZones = ["barra", "terraza", "salon", "privado"];
    if (body.preferred_zone && !validZones.includes(body.preferred_zone)) {
      return new Response(
        JSON.stringify({ error: "Zona inválida" }),
        { status: 400, headers: { ...responseHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate preferred_table is a reasonable table number
    if (body.preferred_table !== undefined && body.preferred_table !== null) {
      const tableNum = Number(body.preferred_table);
      if (!Number.isInteger(tableNum) || tableNum < 1 || tableNum > 50) {
        return new Response(
          JSON.stringify({ error: "Número de mesa inválido" }),
          { status: 400, headers: { ...responseHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (body.customer_notes && (typeof body.customer_notes !== "string" || body.customer_notes.length > 500)) {
      return new Response(
        JSON.stringify({ error: "Las notas no pueden superar 500 caracteres" }),
        { status: 400, headers: { ...responseHeaders, "Content-Type": "application/json" } }
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
        { status: 429, headers: { ...responseHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert reservation with sanitized text fields
    const { data: reservation, error: insertError } = await supabaseAdmin
      .from("reservations")
      .insert({
        customer_name: sanitize(body.customer_name.trim()),
        customer_phone: body.customer_phone.trim(),
        customer_email: body.customer_email?.trim() || null,
        reservation_date: body.reservation_date,
        reservation_time: body.reservation_time,
        party_size: body.party_size,
        preferred_zone: body.preferred_zone || null,
        preferred_table: body.preferred_table || null,
        customer_notes: body.customer_notes?.trim() ? sanitize(body.customer_notes.trim()) : null,
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Error al crear la reserva" }),
        { status: 500, headers: { ...responseHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send confirmation email if email provided
    if (body.customer_email?.trim()) {
      try {
        const zoneLabels: Record<string, string> = { barra: "Barra", terraza: "Terraza", salon: "Salón", privado: "Privado" };
        const zoneText = body.preferred_zone ? zoneLabels[body.preferred_zone] || body.preferred_zone : "";
        const dateFormatted = new Date(`${body.reservation_date}T12:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
        const html = `
          <div style="font-family: 'Georgia', serif; max-width: 480px; margin: 0 auto; background: #0D0D0D; color: #E5E5E5; border: 1px solid #6B9E9E; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #6B9E9E;">
              <h1 style="margin: 0; font-size: 28px; letter-spacing: 0.3em; text-transform: uppercase; color: #6B9E9E;">Savoy</h1>
              <p style="margin: 4px 0 0; font-size: 12px; letter-spacing: 0.5em; color: #888;">by PG</p>
            </div>
            <div style="padding: 28px 24px;">
              <p style="font-size: 16px; margin: 0 0 4px;">¡Reserva confirmada!</p>
              <p style="font-size: 13px; color: #999; margin: 0 0 24px;">Hemos recibido tu solicitud. Te confirmaremos por teléfono pronto.</p>
              <div style="background: #1a1a2e; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                  <tr><td style="color: #6B9E9E; padding: 6px 0; width: 100px;">Fecha</td><td style="padding: 6px 0;">${dateFormatted}</td></tr>
                  <tr><td style="color: #6B9E9E; padding: 6px 0;">Hora</td><td style="padding: 6px 0;">${body.reservation_time}h</td></tr>
                  <tr><td style="color: #6B9E9E; padding: 6px 0;">Personas</td><td style="padding: 6px 0;">${body.party_size}</td></tr>
                  ${zoneText ? `<tr><td style="color: #6B9E9E; padding: 6px 0;">Zona</td><td style="padding: 6px 0;">${zoneText}</td></tr>` : ""}
                </table>
              </div>
              ${body.customer_notes ? `<p style="font-size: 13px; color: #999; margin: 0 0 16px;">Nota: ${sanitize(body.customer_notes)}</p>` : ""}
              <p style="font-size: 12px; color: #666; text-align: center; margin: 24px 0 0;">Savoy by PG · Sanlúcar de Barrameda</p>
            </div>
          </div>
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY") || ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Savoy by PG <no-reply@savoy-pour-smart.lovable.app>",
            to: [body.customer_email.trim()],
            subject: `Reserva confirmada — ${dateFormatted} a las ${body.reservation_time}h`,
            html,
          }),
        });
      } catch {
        // Email is non-critical — don't fail the reservation
      }
    }

    return new Response(
      JSON.stringify({ id: reservation.id, createdAt: reservation.created_at }),
      { status: 200, headers: { ...responseHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...responseHeaders, "Content-Type": "application/json" } }
    );
  }
});