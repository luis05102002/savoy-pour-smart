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
    const { tableNumber, items } = (await req.json()) as {
      tableNumber: number;
      items: OrderItemPayload[];
    };

    // Validate inputs
    if (
      !tableNumber ||
      typeof tableNumber !== "number" ||
      tableNumber < 1 ||
      tableNumber > 100
    ) {
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
      if (
        !item.menuItemId ||
        typeof item.quantity !== "number" ||
        item.quantity < 1 ||
        item.quantity > 20
      ) {
        return new Response(
          JSON.stringify({ error: "Artículo con datos inválidos" }),
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

    // Create admin client to fetch real prices
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

    // Map by id for quick lookup
    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    // Validate all items exist and are available, build order items with real prices
    const orderItems = [];
    let serverTotal = 0;

    for (const item of items) {
      const dbItem = menuMap.get(item.menuItemId);
      if (!dbItem) {
        return new Response(
          JSON.stringify({ error: `Artículo no encontrado: ${item.menuItemId}` }),
          { status: 400, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!dbItem.available) {
        return new Response(
          JSON.stringify({ error: `"${dbItem.name}" no está disponible` }),
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
        notes: item.notes?.trim() || undefined,
      });
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
      {
        status: 200,
        headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
    );
  }
});
