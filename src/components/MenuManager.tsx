import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, Eye, EyeOff } from 'lucide-react';
import { useMenuItems, type DbMenuItem, tagOptions, getTagLabel } from '@/hooks/useMenuItems';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const defaultCategories = [
  'Cócteles Signature',
  'Champagne & Espumosos',
  'Destilados Premium',
  'Vinos Selectos',
  'Sin Alcohol',
];

const emptyForm = {
  name: '',
  description: '',
  price: 0,
  category: defaultCategories[0],
  image_url: null as string | null,
  available: true,
  tags: [] as string[],
};

const MenuManager = () => {
  const { dbItems, isLoading, addItem, updateItem, deleteItem } = useMenuItems();
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categories = [...new Set(dbItems.map(i => i.category))];
  const filtered = filterCat === 'all' ? dbItems : dbItems.filter(i => i.category === filterCat);

  const handleSave = () => {
    if (!form.name || form.price <= 0) return;
    if (editing) {
      updateItem.mutate({ id: editing, ...form });
    } else {
      addItem.mutate(form);
    }
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (item: DbMenuItem) => {
    setForm({
      name: item.name,
      description: item.description,
      price: Number(item.price),
      category: item.category,
      image_url: item.image_url,
      available: item.available,
      tags: item.tags || [],
    });
    setEditing(item.id);
    setShowForm(true);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) deleteItem.mutate(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  if (isLoading) return <p className="text-muted-foreground text-center py-8">Cargando carta...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {['all', ...categories].map(c => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all ${
                filterCat === c ? 'bg-gold text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {c === 'all' ? 'Todos' : c}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Añadir
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-lg text-gold">
                  {editing ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  placeholder="Nombre"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold"
                />
                <input
                  type="number"
                  placeholder="Precio (€)"
                  value={form.price || ''}
                  onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                  className="px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold"
                />
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:border-gold"
                >
                  {defaultCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <label className="flex items-center gap-2 px-4 py-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={e => setForm(f => ({ ...f, available: e.target.checked }))}
                    className="accent-gold-DEFAULT"
                  />
                  <span className="text-sm text-foreground">Disponible</span>
                </label>
              </div>
              {/* Tags selector */}
              <div className="flex flex-wrap gap-1.5">
                {tagOptions.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
                    }))}
                    className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                      form.tags.includes(tag)
                        ? 'bg-gold/20 border-gold/40 text-gold'
                        : 'border-border text-muted-foreground hover:border-gold/30 hover:text-gold'
                    }`}
                  >
                    {getTagLabel(tag)}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Descripción"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold resize-none"
              />
              <button
                onClick={handleSave}
                disabled={!form.name || form.price <= 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gold text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Save size={16} /> {editing ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="space-y-2">
        {filtered.map(item => (
          <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-display text-foreground ${!item.available ? 'line-through opacity-50' : ''}`}>
                  {item.name}
                </span>
                {!item.available && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive">Oculto</span>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex gap-1">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-[9px] px-1 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
                        {getTagLabel(tag)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            </div>
            <span className="font-display text-gold shrink-0">{Number(item.price).toFixed(0)}€</span>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => updateItem.mutate({ id: item.id, available: !item.available })}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label={item.available ? 'Ocultar producto' : 'Mostrar producto'}
                title={item.available ? 'Ocultar' : 'Mostrar'}
              >
                {item.available ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                onClick={() => handleEdit(item)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Editar producto"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setDeleteConfirmId(item.id)}
                className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Eliminar producto"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto se eliminará permanentemente de la carta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MenuManager;
