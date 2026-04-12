import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Printer, X } from 'lucide-react';
import type { Order } from '@/data/menu';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

const InvoiceModal = ({ order, onClose }: InvoiceModalProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura Savoy - Mesa ${order.tableNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            padding: 24px;
            color: #1a1a2e;
            max-width: 320px;
            margin: 0 auto;
          }
          .header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #d4a843; padding-bottom: 12px; }
          .header h1 { font-size: 22px; color: #d4a843; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 2px; }
          .header p { font-size: 10px; color: #666; letter-spacing: 0.1em; }
          .info-row { display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0; }
          .info-row .label { color: #888; }
          .divider { border: none; border-top: 1px dashed #d4a843; margin: 10px 0; }
          .item-row { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; }
          .total-section { margin-top: 6px; }
          .total-row { display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0; }
          .total-row.grand { font-size: 18px; font-weight: bold; color: #d4a843; border-top: 2px solid #d4a843; padding-top: 6px; margin-top: 4px; }
          .footer { text-align: center; margin-top: 20px; font-size: 9px; color: #999; }
          @media print {
            body { padding: 12px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Savoy</h1>
          <p>Cocktail Bar · Factura Simplificada</p>
        </div>

        <div class="info-row"><span class="label">Factura Nº</span><span>SAV-${order.id}</span></div>
        <div class="info-row"><span class="label">Fecha</span><span>${order.createdAt.toLocaleDateString('es-ES')}</span></div>
        <div class="info-row"><span class="label">Mesa</span><span>${order.tableNumber}</span></div>

        <hr class="divider">

        ${order.items.map(item => `
          <div class="item-row">
            <span>${item.quantity}× ${item.menuItem.name}</span>
            <span>${(item.menuItem.price * item.quantity).toFixed(2)}€</span>
          </div>
        `).join('')}

        <hr class="divider">

        <div class="total-section">
          <div class="total-row"><span>Subtotal</span><span>${(order.total / 1.10).toFixed(2)}€</span></div>
          <div class="total-row"><span>IVA (10%)</span><span>${(order.total - order.total / 1.10).toFixed(2)}€</span></div>
          <div class="total-row grand"><span>Total</span><span>${order.total.toFixed(2)}€</span></div>
        </div>

        <div class="footer">Gracias por su visita · Savoy Cocktail Bar</div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-x-4 top-4 z-50 md:inset-x-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] bg-card border border-border rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors z-10"
        >
          <X size={16} />
        </button>

        {/* Invoice content */}
        <div ref={printRef} className="p-6">
          <div className="text-center mb-5">
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
        </div>

        {/* Action buttons — hidden from print */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-lg gold-gradient text-primary-foreground font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Printer size={18} />
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