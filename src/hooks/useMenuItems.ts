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
  image_url: db.image_url,
});

export const useMenuItems = () => {
  const queryClient = useQueryClient();

  const { data: dbItems = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['menu_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as DbMenuItem[];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const menuItems: MenuItem[] = dbItems.filter(i => i.available).map(toMenuItem);
  const categories = [...new Set(menuItems.map(i => i.category))];

  const addItem = useMutation({
    mutationFn: async (item: Omit<DbMenuItem, 'id' | 'sort_order'>) => {
      if (!item.name?.trim() || item.name.length > 100) throw new Error('Nombre inválido (máx. 100 caracteres)');
      if (!item.price || item.price <= 0 || item.price > 9999) throw new Error('Precio inválido (0–9999€)');
      if (!item.category?.trim() || item.category.length > 50) throw new Error('Categoría inválida');
      if (item.description && item.description.length > 500) throw new Error('Descripción demasiado larga (máx. 500)');
      // Validate image_url format if provided
      if (item.image_url) {
        try { new URL(item.image_url); } catch { throw new Error('URL de imagen inválida'); }
        if (!item.image_url.startsWith('https://') && !item.image_url.startsWith('/')) throw new Error('La URL de imagen debe empezar con https:// o /');
      }
      const { error } = await supabase.from('menu_items').insert(item);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu_items'] });
      toast.success('Producto añadido');
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Error al añadir'),
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbMenuItem> & { id: string }) => {
      if (updates.name !== undefined && (!updates.name.trim() || updates.name.length > 100)) throw new Error('Nombre inválido (máx. 100 caracteres)');
      if (updates.price !== undefined && (updates.price <= 0 || updates.price > 9999)) throw new Error('Precio inválido (0–9999€)');
      if (updates.category !== undefined && (!updates.category.trim() || updates.category.length > 50)) throw new Error('Categoría inválida');
      if (updates.description !== undefined && updates.description.length > 500) throw new Error('Descripción demasiado larga (máx. 500)');
      if (updates.image_url !== undefined && updates.image_url) {
        try { new URL(updates.image_url); } catch { throw new Error('URL de imagen inválida'); }
        if (!updates.image_url.startsWith('https://') && !updates.image_url.startsWith('/')) throw new Error('La URL de imagen debe empezar con https:// o /');
      }
      const { error } = await supabase.from('menu_items').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu_items'] });
      toast.success('Producto actualizado');
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Error al actualizar'),
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

  return { dbItems, menuItems, categories, isLoading, isError, refetch, addItem, updateItem, deleteItem };
};
