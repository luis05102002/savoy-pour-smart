import { motion } from 'framer-motion';
import { X, Download } from 'lucide-react';
import type { Order } from '@/data/menu';

interface ClientInvoiceProps {
  order: Order;
  onClose: () => void;
}

const ClientInvoice = ({ order, onClose }: ClientInvoiceProps) => {
  const subtotal = order.total / 1.10;
  const iva = order.total - subtotal;

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
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-display text-2xl gold-text-gradient">Savoy</h2>
              <p className="text-xs text-muted-foreground tracking-wider">Cocktail Bar</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </div>

          <div className="art-deco-line" />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Mesa {order.tableNumber}</span>
            <span>{order.createdAt.toLocaleDateString('es-ES')} · {order.createdAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* Items */}
          <div className="space-y-2">
            {order.items.map(item => (
              <div key={item.menuItem.id} className="flex justify-between text-sm">
                <span className="text-foreground">{item.quantity}× {item.menuItem.name}</span>
                <span className="text-muted-foreground">{(item.menuItem.price * item.quantity).toFixed(2)}€</span>
              </div>
            ))}
          </div>

          <div className="art-deco-line" />

          {/* Totals */}
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

          <p className="text-center text-xs text-muted-foreground">
            Factura simplificada · SAV-{order.id.slice(0, 8).toUpperCase()}
          </p>

          <button
            onClick={() => window.print()}
            className="w-full py-3 rounded-lg border border-gold/40 text-gold font-display text-sm hover:bg-gold/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Descargar / Imprimir
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ClientInvoice;
