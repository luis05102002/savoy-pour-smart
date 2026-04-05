import { motion } from 'framer-motion';
import type { Order } from '@/data/menu';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

const InvoiceModal = ({ order, onClose }: InvoiceModalProps) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] z-50 bg-card border border-border rounded-xl p-8 overflow-y-auto max-h-[90vh]"
      >
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl gold-text-gradient tracking-[0.15em] uppercase">Savoy</h2>
          <p className="text-muted-foreground text-xs tracking-wider mt-1">Cocktail Bar · Factura Simplificada</p>
          <div className="art-deco-line mt-4" />
        </div>

        <div className="space-y-1 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Factura Nº</span>
            <span className="text-foreground">SAV-{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha</span>
            <span className="text-foreground">{order.createdAt.toLocaleDateString('es-ES')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mesa</span>
            <span className="text-foreground">{order.tableNumber}</span>
          </div>
        </div>

        <div className="art-deco-line my-4" />

        <div className="space-y-2 mb-4">
          {order.items.map((item) => (
            <div key={item.menuItem.id} className="flex justify-between text-sm">
              <span className="text-foreground">{item.quantity}× {item.menuItem.name}</span>
              <span className="text-foreground">{(item.menuItem.price * item.quantity).toFixed(2)}€</span>
            </div>
          ))}
        </div>

        <div className="art-deco-line my-4" />

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{(order.total / 1.10).toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">IVA (10%)</span>
            <span className="text-foreground">{(order.total - order.total / 1.10).toFixed(2)}€</span>
          </div>
          <div className="flex justify-between font-display text-xl mt-2">
            <span className="text-foreground">Total</span>
            <span className="text-gold">{order.total.toFixed(2)}€</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 rounded-lg gold-gradient text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Imprimir
          </button>
          <button
            onClick={onClose}
            className="py-3 px-6 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default InvoiceModal;
