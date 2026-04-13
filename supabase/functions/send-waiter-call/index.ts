import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ALLOWED_ORIGINS = [
  "https://savoy-by-pg.lovable.app",
  "https://savoy-pour-smart.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "", // Set dynamically per request
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get("origin") || "";
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  // Only allow lovable.app subdomains that are preview builds for this project
  if (origin.match(/^https:\/\/[a-z0-9-]+--savoy(-pour-smart|-by-pg)?\.lovable\.app$/)) return origin;
  return ""; // Block unknown origins
}

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
    const { tableNumber, type } = (await req.json()) as {
      tableNumber: number;
      type?: string;
    };

    // Validate table number
    if (
      !tableNumber ||
      typeof tableNumber !== "number" ||
      tableNumber < 1 ||
      tableNumber > 100
    ) {
      return new Response(
        JSON.stringify({ error: "Número de mesa inválido" }),
        { status: 400, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
      );
    }

    // Validate type
    const validTypes = ["payment", "waiter", "menu"];
    const callType = validTypes.includes(type || "payment") ? type || "payment" : null;
    if (!callType) {
      return new Response(
        JSON.stringify({ error: "Tipo de llamada inválido" }),
        { status: 400, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit: check if there's already a pending call for this table
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentCalls, error: queryError } = await supabaseAdmin
      .from("waiter_calls")
      .select("id, created_at")
      .eq("table_number", tableNumber)
      .eq("status", "pending")
      .gte("created_at", fiveMinutesAgo);

    if (queryError) {
      return new Response(
        JSON.stringify({ error: "Error al verificar llamadas previas" }),
        { status: 500, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
      );
    }

    // If there's a pending call within the last 5 minutes, reject
    if (recentCalls && recentCalls.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Ya hay una llamada pendiente para esta mesa. Un camarero la atenderá pronto.",
          existingCall: true,
        }),
        { status: 429, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
      );
    }

    // Insert the waiter call
    const { data: call, error: insertError } = await supabaseAdmin
      .from("waiter_calls")
      .insert({
        table_number: tableNumber,
        type: callType,
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Error al crear la llamada" }),
        { status: 500, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ id: call.id, createdAt: call.created_at }),
      { status: 200, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
    );
  }
});