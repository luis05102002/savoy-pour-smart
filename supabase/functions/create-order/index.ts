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

// HTML-sanitize user input to prevent XSS when rendered in dashboards
function sanitize(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// UUID format validation
function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// IP-based rate limiting using Deno KV
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkIpRateLimit(req: Request, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter: number } {
  const forward = req.headers.get("x-forwarded-for");
  const ip = forward ? forward.split(",")[0].trim() : (req.headers.get("x-real-ip") || "unknown");
  const key = `order:${ip}`;
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

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimits) {
    if (now > entry.resetAt) rateLimits.delete(key);
  }
}, 5 * 60 * 1000);

const MAX_ORDER_TOTAL = 5000; // €5,000 max order

interface OrderItemPayload {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

Deno.serve(async (req) => {
  const origin = getAllowedOrigin(req);
  const responseCorsHeaders = { ...corsHeaders, "Access-Control-Allow-Origin": origin };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: responseCorsHeaders });
  }

  try {
    // IP-based rate limit: max 15 orders per IP per hour
    const rateCheck = checkIpRateLimit(req, 15, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: `Demasiados pedidos. Intenta de nuevo en ${rateCheck.retryAfter}s.` }),
        { status: 429, headers: { ...responseCorsHeaders, "Content-Type": "application/json", "Retry-After": String(rateCheck.retryAfter) } }
      );
    }

    const { tableNumber, items } = (await req.json()) as {
      tableNumber: number;
      items: OrderItemPayload[];
    };

    // Validate inputs
    if (!tableNumber || typeof tableNumber !== "number" || tableNumber < 1 || tableNumber > 100) {
      return new Response(
        JSON.stringify({ error: "Número de mesa inválido" }),
        { status: 400, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return new Response(
        JSON.stringify({ error: "Artículos inválidos" }),
        { status: 400, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const item of items) {
      // Validate menuItemId is a UUID
      if (!item.menuItemId || !isUUID(item.menuItemId)) {
        return new Response(
          JSON.stringify({ error: "Artículo con ID inválido" }),
          { status: 400, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (typeof item.quantity !== "number" || item.quantity < 1 || item.quantity > 20) {
        return new Response(
          JSON.stringify({ error: "Cantidad inválida" }),
          { status: 400, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (item.notes && (typeof item.notes !== "string" || item.notes.length > 200)) {
        return new Response(
          JSON.stringify({ error: "Nota demasiado larga (máx 200 caracteres)" }),
          { status: 400, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit: max 10 orders per table in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentOrders } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("table_number", tableNumber)
      .gte("created_at", oneHourAgo);

    if (recentOrders && recentOrders.length >= 10) {
      return new Response(
        JSON.stringify({ error: "Demasiados pedidos. Espera un momento antes de volver a pedir." }),
        { status: 429, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch menu items from DB to get real prices
    const menuItemIds = items.map((i) => i.menuItemId);
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from("menu_items")
      .select("id, name, description, price, category, image_url, available")
      .in("id", menuItemIds);

    if (menuError || !menuItems) {
      return new Response(
        JSON.stringify({ error: "Error al obtener los artículos del menú" }),
        { status: 500, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
      );
    }

    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    // Validate all items exist and are available, build order items with real prices
    const orderItems = [];
    let serverTotal = 0;

    for (const item of items) {
      const dbItem = menuMap.get(item.menuItemId);
      if (!dbItem) {
        return new Response(
          JSON.stringify({ error: "Artículo no encontrado" }),
          { status: 400, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!dbItem.available) {
        return new Response(
          JSON.stringify({ error: "Artículo no disponible" }),
          { status: 400, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
        );
      }

      const lineTotal = dbItem.price * item.quantity;
      serverTotal += lineTotal;

      orderItems.push({
        menuItem: {
          id: dbItem.id,
          name: dbItem.name,
          description: dbItem.description,
          price: dbItem.price,
          category: dbItem.category,
          image_url: dbItem.image_url,
        },
        quantity: item.quantity,
        notes: item.notes?.trim() ? sanitize(item.notes.trim()) : undefined,
      });
    }

    // Validate maximum order total
    if (serverTotal > MAX_ORDER_TOTAL) {
      return new Response(
        JSON.stringify({ error: `El total del pedido no puede superar los ${MAX_ORDER_TOTAL.toLocaleString('es-ES')}€` }),
        { status: 400, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert order with server-calculated total
    const { data: order, error: insertError } = await supabaseAdmin
      .from("orders")
      .insert({
        table_number: tableNumber,
        items: orderItems,
        total: serverTotal,
      })
      .select("id, created_at, total")
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Error al crear el pedido" }),
        { status: 500, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        id: order.id,
        createdAt: order.created_at,
        total: order.total,
        items: orderItems,
      }),
      { status: 200, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
    );
  }
});