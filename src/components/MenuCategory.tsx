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
            className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border/50 hover:border-gold/30 transition-colors group"
          >
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                loading="lazy"
                width={80}
                height={80}
                className="w-20 h-20 rounded-lg object-cover shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base text-foreground">{item.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-center">
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
