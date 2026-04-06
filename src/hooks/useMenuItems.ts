import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MenuItem } from '@/data/menu';
import { toast } from 'sonner';

export interface DbMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
  sort_order: number;
}

const toMenuItem = (db: DbMenuItem): MenuItem => ({
  id: db.id,
  name: db.name,
  description: db.description,
  price: Number(db.price),
  category: db.category,
  image: db.image_url ?? undefined,
});

export const useMenuItems = () => {
  const queryClient = useQueryClient();

  const { data: dbItems = [], isLoading } = useQuery({
    queryKey: ['menu_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as DbMenuItem[];
    },
  });

  const menuItems: MenuItem[] = dbItems.filter(i => i.available).map(toMenuItem);
  const categories = [...new Set(menuItems.map(i => i.category))];

  const addItem = useMutation({
    mutationFn: async (item: Omit<DbMenuItem, 'id' | 'sort_order'>) => {
      const { error } = await supabase.from('menu_items').insert(item as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu_items'] });
      toast.success('Producto añadido');
    },
    onError: () => toast.error('Error al añadir'),
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbMenuItem> & { id: string }) => {
      const { error } = await supabase.from('menu_items').update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu_items'] });
      toast.success('Producto actualizado');
    },
    onError: () => toast.error('Error al actualizar'),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu_items'] });
      toast.success('Producto eliminado');
    },
    onError: () => toast.error('Error al eliminar'),
  });

  return { dbItems, menuItems, categories, isLoading, addItem, updateItem, deleteItem };
};
