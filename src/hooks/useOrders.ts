import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrdersStore } from '@/store/orderStore';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import type { OrderItem } from '@/data/menu';
import { toast } from 'sonner';

// Update browser tab title with pending orders count
const updateTabBadge = (pendingCount: number) => {
  const base = 'Savoy · Panel';
  document.title = pendingCount > 0 ? `(${pendingCount}) 🔔 ${base}` : base;

  // Update favicon with badge
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Base icon
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d4a843';
  ctx.font = 'bold 28px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', 32, 34);

  if (pendingCount > 0) {
    // Red badge
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(50, 14, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(pendingCount > 9 ? '9+' : String(pendingCount), 50, 16);
  }

  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = canvas.toDataURL();
};

export const useRealtimeOrders = () => {
  const { orders, setOrders, addOrder, updateOrderInStore } = useOrdersStore();
  const { sendLocalNotification, requestPermission, permission } = usePushNotifications();
  const initialLoadDone = useRef(false);
  const [newOrderAlert, setNewOrderAlert] = useState<{ tableNumber: number; total: number; itemCount: number } | null>(null);

  // Play LOUD notification sound — double chime with vibration
  const playNotification = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);

      // First chime: 3 ascending notes
      [0, 0.12, 0.24].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.connect(gain);
        osc.frequency.setValueAtTime(660 + i * 220, ctx.currentTime + delay);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.15);
      });

      // Second chime (repeat after pause)
      [0.6, 0.72, 0.84].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.connect(gain);
        osc.frequency.setValueAtTime(660 + i * 220, ctx.currentTime + delay);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.15);
      });

      // Vibrate on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
    } catch {
      // Audio not available
    }
  }, []);

  // Update tab badge whenever orders change
  useEffect(() => {
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    updateTabBadge(pendingCount);
  }, [orders]);

  const fetchOrders = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map((o) => ({
        id: o.id,
        tableNumber: o.table_number,
        items: o.items as unknown as OrderItem[],
        status: o.status as 'pending' | 'preparing' | 'served' | 'paid',
        createdAt: new Date(o.created_at),
        total: Number(o.total),
      }));
      setOrders(mapped);
      initialLoadDone.current = true;
    }
  }, [setOrders]);

  // Fetch initial orders
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const o = payload.new as any;
          const order = {
            id: o.id,
            tableNumber: o.table_number,
            items: o.items as unknown as OrderItem[],
            status: o.status as 'pending' | 'preparing' | 'served' | 'paid',
            createdAt: new Date(o.created_at),
            total: Number(o.total),
          };
          
          const exists = useOrdersStore.getState().orders.some(existing => existing.id === order.id);
          if (!exists) {
            addOrder(order);
            if (initialLoadDone.current) {
              playNotification();
              setNewOrderAlert({
                tableNumber: order.tableNumber,
                total: order.total,
                itemCount: order.items.length,
              });
              sendLocalNotification(
                `🍸 ¡NUEVO PEDIDO! · Mesa ${order.tableNumber}`,
                `${order.items.length} artículo(s) · ${order.total.toFixed(2)}€`
              );
              toast.success(`🍸 ¡NUEVO PEDIDO! · Mesa ${order.tableNumber}`, {
                description: `${order.items.length} artículo(s) · ${order.total.toFixed(2)}€`,
                duration: 15000,
                style: {
                  background: '#1a1a2e',
                  border: '2px solid #d4a843',
                  color: '#fff',
                  fontSize: '16px',
                  padding: '16px',
                },
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const o = payload.new as any;
          updateOrderInStore(o.id, o.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addOrder, updateOrderInStore, playNotification]);

  // Update order status in DB
  const updateOrderStatus = async (orderId: string, status: string) => {
    updateOrderInStore(orderId, status as any);
    await supabase.from('orders').update({ status }).eq('id', orderId);
  };

  return { orders, updateOrderStatus, requestPermission, permission, refreshOrders: fetchOrders };
};

// Insert order from client side (no auth needed)
export const submitOrder = async (order: {
  tableNumber: number;
  items: OrderItem[];
  total: number;
}) => {
  const { error } = await supabase
    .from('orders')
    .insert({
      table_number: order.tableNumber,
      items: order.items as any,
      total: order.total,
    });

  if (error) throw error;
};
