import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type UserRole = 'admin' | 'staff' | null;

// Shared channel + listeners so all useUserRole consumers get realtime updates
const channelState = {
  channel: null as ReturnType<typeof supabase.channel> | null,
  userId: null as string | null,
  refCount: 0,
  listeners: new Set<() => void>(),
};

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!user) {
      setRole(null);
      setRoleLoading(false);
      return;
    }

    setRoleLoading(true);
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setRole(data.role as UserRole);
    } else {
      setRole(null);
    }
    setRoleLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setRoleLoading(false);
      return;
    }

    // Always fetch role on mount
    fetchRole();

    // Register this consumer's callback
    channelState.listeners.add(fetchRole);

    // Create channel if not exists or user changed
    if (!channelState.channel || channelState.userId !== user.id) {
      // Clean up old channel if user changed
      if (channelState.channel) {
        supabase.removeChannel(channelState.channel);
      }

      const channel = supabase
        .channel('user-role-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_roles',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Notify ALL consumers to refetch
            channelState.listeners.forEach(fn => fn());
          }
        )
        .subscribe();

      channelState.channel = channel;
      channelState.userId = user.id;
      channelState.refCount = 1;
    } else {
      channelState.refCount++;
    }

    return () => {
      channelState.listeners.delete(fetchRole);
      channelState.refCount--;
      if (channelState.refCount <= 0 && channelState.channel) {
        supabase.removeChannel(channelState.channel);
        channelState.channel = null;
        channelState.userId = null;
        channelState.refCount = 0;
        channelState.listeners.clear();
      }
    };
  }, [user?.id, fetchRole]);

  return { role, roleLoading };
};