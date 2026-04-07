import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrdersStore } from '@/store/orderStore';
import type { OrderItem } from '@/data/menu';
import { toast } from 'sonner';

export const useRealtimeOrders = () => {
  const { orders, setOrders, addOrder, updateOrderInStore } = useOrdersStore();
  const initialLoadDone = useRef(false);
  const previousCount = useRef(0);

  // Play notification sound
  const playNotification = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio not available
    }
  }, []);

  // Fetch initial orders
  useEffect(() => {
    const fetchOrders = async () => {
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
        previousCount.current = mapped.length;
        initialLoadDone.current = true;
      }
    };
    fetchOrders();
  }, [setOrders]);

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
          
          // Check if already in store
          const exists = useOrdersStore.getState().orders.some(existing => existing.id === order.id);
          if (!exists) {
            addOrder(order);
            if (initialLoadDone.current) {
              playNotification();
              toast.success(`🍸 Nuevo pedido · Mesa ${order.tableNumber}`, {
                description: `${order.total.toFixed(2)}€`,
                duration: 8000,
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

  return { orders, updateOrderStatus };
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
