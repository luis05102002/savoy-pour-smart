import { useState, useEffect, useCallback } from 'react';
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
      // Auto-dismiss after 12 seconds
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
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-lg"
        >
          <div className="relative bg-card border-2 border-gold rounded-2xl shadow-2xl shadow-gold/20 overflow-hidden">
            {/* Animated pulse border */}
            <div className="absolute inset-0 rounded-2xl border-2 border-gold animate-ping opacity-30 pointer-events-none" />

            <div className="p-5 flex items-center gap-4">
              {/* Animated bell */}
              <motion.div
                animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                transition={{ duration: 0.6, repeat: 3, repeatDelay: 0.5 }}
                className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center shrink-0"
              >
                <Bell size={28} className="text-gold" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <p className="font-display text-xl text-gold tracking-wider">
                  ¡NUEVO PEDIDO!
                </p>
                <p className="text-foreground font-medium text-lg mt-0.5">
                  Mesa {order.tableNumber}
                </p>
                <p className="text-muted-foreground text-sm">
                  {order.itemCount} artículo{order.itemCount !== 1 ? 's' : ''} · {order.total.toFixed(2)}€
                </p>
              </div>

              <button
                onClick={() => { setVisible(false); onDismiss(); }}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-gold/40 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Progress bar */}
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
