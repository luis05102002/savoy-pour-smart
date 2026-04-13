import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';

interface NewOrderAlertProps {
  order: { tableNumber: number; total: number; itemCount: number } | null;
  onDismiss: () => void;
}

const NewOrderAlert = ({ order, onDismiss }: NewOrderAlertProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (order) {
      setVisible(true);
      const t = setTimeout(() => { setVisible(false); onDismiss(); }, 12000);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [order, onDismiss]);

  return (
    <AnimatePresence>
      {visible && order && (
        <motion.div
          initial={{ y: -120, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -120, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-2 left-2 right-2 z-[100] max-w-lg mx-auto"
        >
          <div className="relative bg-card border-2 border-gold rounded-2xl shadow-2xl shadow-gold/20 overflow-hidden">
            <div className="absolute inset-0 rounded-2xl border-2 border-gold animate-ping opacity-30 pointer-events-none" />

            <div className="p-4 flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                transition={{ duration: 0.6, repeat: 3, repeatDelay: 0.5 }}
                className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center shrink-0"
              >
                <Bell size={24} className="text-gold" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <p className="font-display text-lg text-gold tracking-wider">
                  ¡NUEVO PEDIDO!
                </p>
                <p className="text-foreground font-medium">
                  Mesa {order.tableNumber}
                </p>
                <p className="text-muted-foreground text-xs">
                  {order.itemCount} artículo{order.itemCount !== 1 ? 's' : ''} · {order.total.toFixed(2)}€
                </p>
              </div>

              <button
                onClick={() => { setVisible(false); onDismiss(); }}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-gold/40 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 12, ease: 'linear' }}
              className="h-1 bg-gold origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewOrderAlert;
