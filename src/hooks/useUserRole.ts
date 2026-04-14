import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type UserRole = 'admin' | 'staff' | null;

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

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { role, roleLoading };
};