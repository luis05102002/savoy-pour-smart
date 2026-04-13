import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, HandCoins } from 'lucide-react';
import type { Order } from '@/data/menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClientInvoiceProps {
  order: Order;
  onClose: () => void;
}

const ClientInvoice = ({ order, onClose }: ClientInvoiceProps) => {
  const subtotal = order.total / 1.10;
  const iva = order.total - subtotal;
  const [calling, setCalling] = useState(false);
  const [called, setCalled] = useState(false);

  const handleCallWaiter = async () => {
    setCalling(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-waiter-call', {
        body: { tableNumber: order.tableNumber, type: 'payment' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCalled(true);
      toast.success('Camarero avisado', {
        description: data?.existingCall ? 'Ya hay una llamada pendiente' : 'En breve vendrá a cobrarte',
      });
    } catch (err: any) {
      toast.error(err.message || 'Error al avisar al camarero');
    } finally {
      setCalling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-6 space-y-4">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-display text-2xl gold-text-gradient">Savoy</h2>
                <p className="text-xs text-muted-foreground tracking-wider">Cocktail Bar</p>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="art-deco-line" />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Mesa {order.tableNumber}</span>
            <span>{order.createdAt.toLocaleDateString('es-ES')}</span>
          </div>

          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={`${item.menuItem.id}-${idx}`} className="flex justify-between text-sm">
                <span className="text-foreground">{item.quantity}× {item.menuItem.name}</span>
                <span className="text-muted-foreground">{(item.menuItem.price * item.quantity).toFixed(2)}€</span>
              </div>
            ))}
          </div>

          <div className="art-deco-line" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>IVA (10%)</span>
              <span>{iva.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between font-display text-xl text-gold pt-2">
              <span>Total</span>
              <span>{order.total.toFixed(2)}€</span>
            </div>
          </div>

          <div className="art-deco-line" />

          {/* Call waiter button */}
          <button
            onClick={handleCallWaiter}
            disabled={calling || called}
            className={`w-full py-4 rounded-lg font-display text-lg tracking-wider flex items-center justify-center gap-3 transition-all ${
              called
                ? 'bg-success/20 border border-success/40 text-success'
                : 'gold-gradient text-primary-foreground hover:opacity-90'
            } disabled:opacity-70`}
          >
            {calling ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : called ? (
              '✓ Camarero avisado'
            ) : (
              <>
                <HandCoins size={22} />
                Pedir la cuenta
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ClientInvoice;
