import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type UserRole = 'admin' | 'staff' | null;

// Track active subscriptions to prevent duplicate channel registrations
const channelRef = { channel: null as ReturnType<typeof supabase.channel> | null, userId: null as string | null, count: 0 };

export const useUserRole = () => {
  const { user, session } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setRoleLoading(false);
      return;
    }

    const fetchRole = async () => {
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
    };

    fetchRole();

    // Reuse existing channel if same user, create new one if user changed
    if (channelRef.channel && channelRef.userId === user.id) {
      channelRef.count++;
      return () => {
        channelRef.count--;
        if (channelRef.count <= 0) {
          supabase.removeChannel(channelRef.channel!);
          channelRef.channel = null;
          channelRef.userId = null;
          channelRef.count = 0;
        }
      };
    }

    // Clean up old channel if user changed
    if (channelRef.channel) {
      supabase.removeChannel(channelRef.channel);
    }

    // Subscribe to realtime changes on user_roles for this user
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
          fetchRole();
        }
      )
      .subscribe();

    channelRef.channel = channel;
    channelRef.userId = user.id;
    channelRef.count = 1;

    return () => {
      channelRef.count--;
      if (channelRef.count <= 0) {
        supabase.removeChannel(channel);
        channelRef.channel = null;
        channelRef.userId = null;
        channelRef.count = 0;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { role, roleLoading };
};