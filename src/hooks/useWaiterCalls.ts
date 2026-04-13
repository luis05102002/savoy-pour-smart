import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { usePushNotifications } from './usePushNotifications';
import { toast } from 'sonner';

interface WaiterCall {
  id: string;
  table_number: number;
  type: string;
  status: string;
  created_at: string;
}

// Play alert sound that works every time (new AudioContext per call)
const playCallSound = async () => {
  try {
    const ctx = new AudioContext();
    await ctx.resume();

    const now = ctx.currentTime;
    for (let round = 0; round < 3; round++) {
      const t = now + round * 0.8;
      for (let i = 0; i < 3; i++) {
        const s = t + i * 0.12;
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880 + i * 330, s);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.8, s);
        g.gain.exponentialRampToValueAtTime(0.01, s + 0.18);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(s);
        osc.stop(s + 0.2);
      }
    }
    // Close context after sound finishes
    setTimeout(() => ctx.close(), 4000);
  } catch {}
};

export const useWaiterCalls = () => {
  const [calls, setCalls] = useState<WaiterCall[]>([]);
  const { session } = useAuth();
  const { sendLocalNotification } = usePushNotifications();
  const processedIds = useRef(new Set<string>());

  const fetchCalls = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from('waiter_calls')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (data) {
      setCalls(data);
      data.forEach(c => processedIds.current.add(c.id));
    }
  }, [session]);

  const dismissCall = useCallback(async (id: string) => {
    await supabase.from('waiter_calls').update({ status: 'attended' }).eq('id', id);
    setCalls(prev => prev.filter(c => c.id !== id));
  }, []);

  const callWaiter = useCallback(async (tableNumber: number, type: string = 'payment') => {
    try {
      // Use Edge Function instead of direct insert
      const { data, error } = await supabase.functions.invoke('send-waiter-call', {
        body: { tableNumber, type },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al llamar al camarero' };
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    fetchCalls();

    const channel = supabase
      .channel('waiter-calls-realtime', {
        config: { private: true },
      })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'waiter_calls' },
        (payload) => {
          const call = payload.new as WaiterCall;

          // Skip if already processed (duplicate event)
          if (processedIds.current.has(call.id)) return;
          processedIds.current.add(call.id);

          setCalls(prev => [call, ...prev]);

          // ALWAYS play sound and vibrate — every single call
          if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);
          playCallSound();

          // Toast
          const label = call.type === 'payment' ? '💰 Piden la cuenta' : '🔔 Llamada';
          toast.info(`${label} — Mesa ${call.table_number}`, { duration: 10000 });

          // Push notification
          sendLocalNotification(
            `Mesa ${call.table_number} pide la cuenta`,
            'Un cliente quiere pagar'
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session, fetchCalls, sendLocalNotification]);

  return { calls, dismissCall, callWaiter, fetchCalls };
};
