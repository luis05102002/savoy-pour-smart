import { useState } from 'react';
import { motion } from 'framer-motion';
import { menuItems, categories } from '@/data/menu';
import MenuCategory from '@/components/MenuCategory';
import Cart from '@/components/Cart';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredItems = activeCategory
    ? menuItems.filter((i) => i.category === activeCategory)
    : menuItems;

  const groupedItems = categories
    .filter((c) => !activeCategory || c === activeCategory)
    .map((c) => ({
      category: c,
      items: filteredItems.filter((i) => i.category === c),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-5 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl gold-text-gradient tracking-[0.2em] uppercase"
          >
            Savoy
          </motion.h1>
          <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase mt-1">Cocktail Bar</p>
        </div>
        {/* Category filter */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs tracking-wider uppercase transition-all ${
              !activeCategory
                ? 'bg-gold text-primary-foreground'
                : 'border border-border text-muted-foreground hover:border-gold/50 hover:text-gold'
            }`}
          >
            Todo
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs tracking-wider uppercase transition-all whitespace-nowrap ${
                activeCategory === c
                  ? 'bg-gold text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:border-gold/50 hover:text-gold'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      {/* Menu */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {groupedItems.map((group) => (
          <MenuCategory key={group.category} category={group.category} items={group.items} />
        ))}
      </main>

      <Cart />
    </div>
  );
};

export default Menu;
