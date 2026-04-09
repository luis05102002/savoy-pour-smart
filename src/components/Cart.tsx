import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Minus, Plus, X, Send, QrCode } from 'lucide-react';
import { useCartStore } from '@/store/orderStore';
import { submitOrder } from '@/hooks/useOrders';
import ClientInvoice from '@/components/ClientInvoice';
import type { Order } from '@/data/menu';
import { toast } from 'sonner';

const Cart = () => {
  const [open, setOpen] = useState(false);
  const { items, tableNumber, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const [sending, setSending] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const total = getTotal();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  const handleOrder = async () => {
    if (!tableNumber) {
      toast.error('Escanea el QR de tu mesa para poder pedir');
      return;
    }
    setSending(true);

    try {
      await submitOrder({
        tableNumber,
        items: [...items],
        total,
      });

      const order: Order = {
        id: crypto.randomUUID(),
        tableNumber,
        items: [...items],
        status: 'pending',
        createdAt: new Date(),
        total,
      };

      clearCart();
      setOpen(false);
      toast.success('Pedido enviado al bar', {
        description: `Mesa ${tableNumber} · ${total.toFixed(2)}€`,
      });
      setLastOrder(order);
    } catch {
      toast.error('Error al enviar el pedido. Inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
      >
        <ShoppingBag size={24} className="text-primary-foreground" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
            {count}
          </span>
        )}
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="font-display text-xl text-gold">Tu Pedido</h2>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">Tu carrito está vacío</p>
                ) : (
                  items.map((item) => (
                    <div key={item.menuItem.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-foreground truncate">{item.menuItem.name}</p>
                        <p className="text-sm text-gold">{item.menuItem.price}€</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-foreground font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeItem(item.menuItem.id)}
                          className="ml-1 text-muted-foreground hover:text-destructive"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-6 border-t border-border space-y-4">
                  {tableNumber ? (
                    <div className="w-full px-4 py-3 rounded-lg bg-gold/10 border border-gold/30 text-center">
                      <span className="text-sm text-muted-foreground">Mesa </span>
                      <span className="font-display text-lg text-gold">{tableNumber}</span>
                    </div>
                  ) : (
                    <div className="w-full px-4 py-4 rounded-lg bg-destructive/10 border border-destructive/30 text-center space-y-2">
                      <QrCode size={28} className="mx-auto text-destructive" />
                      <p className="text-sm text-destructive font-medium">Escanea el QR de tu mesa</p>
                      <p className="text-xs text-muted-foreground">Necesitas escanear el código QR de tu mesa para poder hacer un pedido</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-display text-2xl text-gold">{total.toFixed(2)}€</span>
                  </div>
                  <button
                    onClick={handleOrder}
                    disabled={sending || !tableNumber}
                    className="w-full py-4 rounded-lg gold-gradient text-primary-foreground font-display text-lg tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={18} />
                        Enviar Pedido
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Client Invoice after order */}
      <AnimatePresence>
        {lastOrder && (
          <ClientInvoice order={lastOrder} onClose={() => setLastOrder(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Cart;
