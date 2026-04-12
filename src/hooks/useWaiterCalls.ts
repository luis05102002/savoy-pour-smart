import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePushNotifications } from './usePushNotifications';
import { toast } from 'sonner';

interface WaiterCall {
  id: string;
  table_number: number;
  type: string;
  status: string;
  created_at: string;
}

export const useWaiterCalls = () => {
  const [calls, setCalls] = useState<WaiterCall[]>([]);
  const { sendLocalNotification } = usePushNotifications();

  const fetchCalls = useCallback(async () => {
    const { data } = await supabase
      .from('waiter_calls')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (data) setCalls(data);
  }, []);

  const dismissCall = useCallback(async (id: string) => {
    await supabase.from('waiter_calls').update({ status: 'attended' }).eq('id', id);
    setCalls(prev => prev.filter(c => c.id !== id));
  }, []);

  useEffect(() => {
    fetchCalls();

    const channel = supabase
      .channel('waiter-calls-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'waiter_calls' },
        (payload) => {
          const call = payload.new as WaiterCall;
          setCalls(prev => [call, ...prev]);

          // Vibrate
          if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);

          // Sound
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.value = 0.3;
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
          } catch {}

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
  }, [fetchCalls, sendLocalNotification]);

  return { calls, dismissCall, fetchCalls };
};
