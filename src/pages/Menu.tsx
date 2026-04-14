import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine } from 'lucide-react';
import { useMenuItems } from '@/hooks/useMenuItems';
import MenuCategory from '@/components/MenuCategory';
import Cart from '@/components/Cart';
import BackButton from '@/components/BackButton';
import QRScanner from '@/components/QRScanner';
import { useCartStore } from '@/store/orderStore';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const tableNumber = useCartStore((s) => s.tableNumber);
  const { menuItems, categories, isLoading, isError, refetch } = useMenuItems();
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const mesa = searchParams.get('mesa');
    if (mesa) {
      const num = parseInt(mesa);
      if (!isNaN(num) && num > 0) setTableNumber(num);
    }
  }, [searchParams, setTableNumber]);

  const filteredItems = activeCategory
    ? menuItems.filter((i) => i.category === activeCategory)
    : menuItems;

  const groupedItems = useMemo(() => {
    const cats = activeCategory ? [activeCategory] : categories;
    return cats
      .map((c) => ({ category: c, items: filteredItems.filter((i) => i.category === c) }))
      .filter((g) => g.items.length > 0);
  }, [filteredItems, categories, activeCategory]);

  const handleQRScan = (mesa: number) => {
    setShowScanner(false);
    setTableNumber(mesa);
    navigate(`/menu?mesa=${mesa}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <BackButton to="/" />
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-2xl gold-text-gradient tracking-[0.2em] uppercase"
            >
              Savoy
            </motion.h1>
            <div className="flex items-center gap-2">
              {tableNumber && (
                <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
                  Mesa {tableNumber}
                </span>
              )}
              <button
                onClick={() => setShowScanner(true)}
                className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
                title="Escanear QR de mesa"
              >
                <ScanLine size={16} />
              </button>
            </div>
          </div>
        </div>
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

      <main className="max-w-2xl mx-auto px-4 py-8">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Cargando carta...</p>
        ) : isError ? (
          <div className="text-center py-16 space-y-4">
            <p className="font-display text-destructive text-lg">No se pudo cargar la carta</p>
            <p className="text-muted-foreground text-sm">Comprueba tu conexión e inténtalo de nuevo</p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-6 py-2 rounded-lg border border-gold/40 text-gold hover:bg-gold/10 transition-colors text-sm"
            >
              Reintentar
            </button>
          </div>
        ) : groupedItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">La carta está vacía</p>
        ) : (
          groupedItems.map((group) => (
            <MenuCategory key={group.category} category={group.category} items={group.items} />
          ))
        )}
      </main>

      <Cart />

      {/* QR Camera Scanner */}
      <AnimatePresence>
        {showScanner && (
          <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;
