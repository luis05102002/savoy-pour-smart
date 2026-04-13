import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrdersStore } from '@/store/orderStore';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/hooks/useAuth';
import type { OrderItem } from '@/data/menu';
import { toast } from 'sonner';

// Update browser tab title with pending orders count
const updateTabBadge = (pendingCount: number) => {
  const base = 'Savoy · Panel';
  document.title = pendingCount > 0 ? `(${pendingCount}) 🔔 ${base}` : base;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6B9E9E';
  ctx.font = 'bold 28px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', 32, 34);

  if (pendingCount > 0) {
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

// Play LOUD notification — creates fresh AudioContext each time
const playNotificationSound = async () => {
  try {
    const ctx = new AudioContext();
    await ctx.resume();

    const now = ctx.currentTime;
    for (let round = 0; round < 3; round++) {
      const roundStart = now + round * 1.0;
      for (let i = 0; i < 3; i++) {
        const noteStart = roundStart + i * 0.15;
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880 + i * 330, noteStart);
        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0.9, noteStart);
        noteGain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.2);
        osc.connect(noteGain);
        noteGain.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.25);
      }
      const bassOsc = ctx.createOscillator();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(220, roundStart);
      const bassGain = ctx.createGain();
      bassGain.gain.setValueAtTime(0.6, roundStart);
      bassGain.gain.exponentialRampToValueAtTime(0.01, roundStart + 0.15);
      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(roundStart);
      bassOsc.stop(roundStart + 0.2);
    }
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 300, 200, 500, 100, 500]);
    }
    setTimeout(() => ctx.close(), 5000);
  } catch {}
};

export const useRealtimeOrders = () => {
  const { orders, setOrders, addOrder, updateOrderInStore } = useOrdersStore();
  const { sendLocalNotification, requestPermission, permission } = usePushNotifications();
  const { session } = useAuth();
  const initialLoadDone = useRef(false);
  const [newOrderAlert, setNewOrderAlert] = useState<{ tableNumber: number; total: number; itemCount: number } | null>(null);

  useEffect(() => {
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    updateTabBadge(pendingCount);
  }, [orders]);

  const fetchOrders = useCallback(async () => {
    if (!session) return;
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
  }, [setOrders, session]);

  useEffect(() => {
    if (!session) return;
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('orders-realtime', {
        config: { private: true },
      })
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
              // Always play sound — fresh AudioContext each time
              playNotificationSound();
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
                  background: '#0a0a0a',
                  border: '2px solid #6B9E9E',
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
  }, [addOrder, updateOrderInStore, session]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    // Verify user has admin/staff role before allowing updates
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session?.user?.id)
      .single();

    if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'staff')) {
      toast.error('No tienes permisos para actualizar pedidos');
      return;
    }

    updateOrderInStore(orderId, status as any);
    await supabase.from('orders').update({ status }).eq('id', orderId);
  };

  return { orders, updateOrderStatus, requestPermission, permission, refreshOrders: fetchOrders, newOrderAlert, dismissAlert: () => setNewOrderAlert(null) };
};

export const submitOrder = async (order: {
  tableNumber: number;
  items: { menuItemId: string; quantity: number; notes?: string }[];
}): Promise<{ id: string; createdAt: string; total: number; items: OrderItem[] }> => {
  const { data, error } = await supabase.functions.invoke('create-order', {
    body: order,
  });

  if (error) throw new Error(error.message || 'Error al enviar el pedido');
  if (data?.error) throw new Error(data.error);
  return data;
};
