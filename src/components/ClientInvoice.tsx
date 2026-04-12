import { useRef } from 'react';
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
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!ticketRef.current) return;
    const content = ticketRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Factura Savoy</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:-apple-system,sans-serif;background:#fff;color:#111;padding:24px;max-width:360px;margin:0 auto}
      .header h2{font-size:1.5rem;font-weight:700;color:#1a1a2e}
      .header p{font-size:0.7rem;color:#888;letter-spacing:2px;text-transform:uppercase}
      .line{height:1px;background:linear-gradient(90deg,transparent,#d4a843,transparent);margin:12px 0}
      .meta{display:flex;justify-content:space-between;font-size:0.75rem;color:#888}
      .items .row{display:flex;justify-content:space-between;font-size:0.85rem;padding:3px 0}
      .totals .row{display:flex;justify-content:space-between;font-size:0.85rem;color:#888;padding:2px 0}
      .totals .total{font-size:1.25rem;font-weight:700;color:#d4a843;padding-top:8px}
      .footer{text-align:center;font-size:0.7rem;color:#888;margin-top:8px}
      @media print{body{padding:0}}
    </style></head><body>${content}<script>window.print();window.close();<\/script></body></html>`);
    win.document.close();
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
          {/* Printable ticket content */}
          <div ref={ticketRef}>
            <div className="header">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-display text-2xl gold-text-gradient">Savoy</h2>
                  <p className="text-xs text-muted-foreground tracking-wider">Cocktail Bar</p>
                </div>
              </div>
            </div>

            <div className="art-deco-line line" />

            <div className="meta flex justify-between text-xs text-muted-foreground">
              <span>Mesa {order.tableNumber}</span>
              <span>{order.createdAt.toLocaleDateString('es-ES')} · {order.createdAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div className="items space-y-2 mt-3">
              {order.items.map((item, idx) => (
                <div key={`${item.menuItem.id}-${idx}`} className="row flex justify-between text-sm">
                  <span className="text-foreground">{item.quantity}× {item.menuItem.name}</span>
                  <span className="text-muted-foreground">{(item.menuItem.price * item.quantity).toFixed(2)}€</span>
                </div>
              ))}
            </div>

            <div className="art-deco-line line" />

            <div className="totals space-y-1 text-sm">
              <div className="row flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)}€</span>
              </div>
              <div className="row flex justify-between text-muted-foreground">
                <span>IVA (10%)</span>
                <span>{iva.toFixed(2)}€</span>
              </div>
              <div className="total flex justify-between font-display text-xl text-gold pt-2">
                <span>Total</span>
                <span>{order.total.toFixed(2)}€</span>
              </div>
            </div>

            <div className="art-deco-line line" />

            <p className="footer text-center text-xs text-muted-foreground">
              Factura simplificada · SAV-{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Action buttons (not printed) */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 rounded-lg border border-gold/40 text-gold font-display text-sm hover:bg-gold/10 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Descargar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ClientInvoice;
