import { motion } from 'framer-motion';
import type { MenuItem } from '@/data/menu';
import { useCartStore } from '@/store/orderStore';
import { Plus } from 'lucide-react';

interface MenuCategoryProps {
  category: string;
  items: MenuItem[];
}

const MenuCategory = ({ category, items }: MenuCategoryProps) => {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="mb-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="art-deco-line flex-1" />
        <h2 className="font-display text-xl text-gold tracking-wider uppercase">
          {category}
        </h2>
        <div className="art-deco-line flex-1" />
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start justify-between gap-4 p-4 rounded-lg bg-card border border-border/50 hover:border-gold/30 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg text-foreground">{item.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-display text-lg text-gold">{item.price}€</span>
              <button
                onClick={() => addItem(item)}
                className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-primary-foreground transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MenuCategory;
