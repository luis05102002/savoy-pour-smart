import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Clock, Receipt, CreditCard, Download } from 'lucide-react';
import type { Order } from '@/data/menu';

interface TableHistoryProps {
  orders: Order[];
  onCloseTable?: (tableNumber: number, orderIds: string[]) => void;
}

const TableHistory = ({ orders, onCloseTable }: TableHistoryProps) => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const tables = Array.from(new Set(orders.map(o => o.tableNumber))).sort((a, b) => a - b);

  const tableOrders = selectedTable !== null
    ? orders.filter(o => o.tableNumber === selectedTable).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    : [];

  const tableTotal = tableOrders.reduce((sum, o) => sum + o.total, 0);
  const tablePaidTotal = tableOrders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.total, 0);
  const unpaidOrders = tableOrders.filter(o => o.status !== 'paid');
  const allPaid = tableOrders.length > 0 && unpaidOrders.length === 0;

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    preparing: 'Preparando',
    served: 'Servido',
    paid: 'Pagado',
  };

  const statusColors: Record<string, string> = {
    pending: 'text-warning',
    preparing: 'text-gold',
    served: 'text-success',
    paid: 'text-muted-foreground',
  };

  const handleCloseTable = () => {
    if (selectedTable === null || !onCloseTable) return;
    const ids = unpaidOrders.map(o => o.id);
    if (ids.length > 0) {
      onCloseTable(selectedTable, ids);
    }
    setShowInvoice(true);
  };

  // Consolidate all items for invoice
  const allItems = tableOrders.flatMap(o => o.items);
  const consolidated = new Map<string, { name: string; qty: number; price: number }>();
  allItems.forEach(item => {
    const key = item.menuItem.id;
    const existing = consolidated.get(key);
    if (existing) {
      existing.qty += item.quantity;
    } else {
      consolidated.set(key, { name: item.menuItem.name, qty: item.quantity, price: item.menuItem.price });
    }
  });

  const subtotal = tableTotal / 1.10;
  const iva = tableTotal - subtotal;

  return (
    <div>
      <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
        <History size={20} className="text-gold" />
        Historial por Mesa
      </h2>

      {/* Table selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tables.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay pedidos esta noche</p>
        ) : (
          tables.map(table => {
            const count = orders.filter(o => o.tableNumber === table).length;
            const hasPending = orders.some(o => o.tableNumber === table && (o.status === 'pending' || o.status === 'preparing'));
            const tableAllPaid = orders.filter(o => o.tableNumber === table).every(o => o.status === 'paid');
            return (
              <button
                key={table}
                onClick={() => { setSelectedTable(selectedTable === table ? null : table); setShowInvoice(false); }}
                className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedTable === table
                    ? 'bg-gold text-primary-foreground'
                    : tableAllPaid
                    ? 'bg-secondary/30 text-muted-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Mesa {table}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  selectedTable === table ? 'bg-primary-foreground/20' : 'bg-muted'
                }`}>
                  {count}
                </span>
                {hasPending && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-warning rounded-full animate-pulse" />
                )}
                {tableAllPaid && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-success rounded-full" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Table detail */}
      <AnimatePresence mode="wait">
        {selectedTable !== null && !showInvoice && (
          <motion.div
            key={`detail-${selectedTable}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-2xl text-gold">Mesa {selectedTable}</h3>
              <button onClick={() => setSelectedTable(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="font-display text-lg text-foreground">{tableOrders.length}</p>
                <p className="text-xs text-muted-foreground">Pedidos</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="font-display text-lg text-gold">{tableTotal.toFixed(2)}€</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="font-display text-lg text-success">{tablePaidTotal.toFixed(2)}€</p>
                <p className="text-xs text-muted-foreground">Cobrado</p>
              </div>
            </div>

            {/* Close table button */}
            {!allPaid && onCloseTable && (
              <button
                onClick={handleCloseTable}
                className="w-full mb-4 py-3 rounded-lg bg-success text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                Cerrar cuenta · {(tableTotal - tablePaidTotal).toFixed(2)}€ pendiente
              </button>
            )}

            {allPaid && (
              <button
                onClick={() => setShowInvoice(true)}
                className="w-full mb-4 py-3 rounded-lg border border-gold/40 text-gold font-medium text-sm hover:bg-gold/10 transition-colors flex items-center justify-center gap-2"
              >
                <Receipt size={18} />
                Ver factura consolidada
              </button>
            )}

            <div className="art-deco-line mb-4" />

            {/* Order list */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {tableOrders.map((order) => (
                <div key={order.id} className="border border-border/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} />
                      {order.createdAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-xs font-medium ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div key={item.menuItem.id} className="flex justify-between text-sm">
                        <span className="text-foreground">{item.quantity}× {item.menuItem.name}</span>
                        <span className="text-muted-foreground">{(item.menuItem.price * item.quantity).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-2">
                    <span className="font-display text-gold">{order.total.toFixed(2)}€</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Consolidated Invoice */}
        {selectedTable !== null && showInvoice && (
          <motion.div
            key={`invoice-${selectedTable}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border rounded-xl p-6 max-w-lg mx-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setShowInvoice(false)} className="text-sm text-gold hover:underline">
                ← Volver
              </button>
              <button onClick={() => setSelectedTable(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Invoice header */}
            <div className="text-center mb-6">
              <h3 className="font-display text-2xl gold-text-gradient tracking-[0.15em] uppercase">Savoy</h3>
              <p className="text-xs text-muted-foreground mt-1">Factura Consolidada</p>
              <div className="art-deco-line my-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mesa {selectedTable}</span>
                <span>{new Date().toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{tableOrders.length} pedido(s)</span>
                <span>{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Consolidated items */}
            <div className="space-y-2 mb-4">
              {Array.from(consolidated.values()).map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-foreground">{item.qty}× {item.name}</span>
                  <span className="text-muted-foreground">{(item.price * item.qty).toFixed(2)}€</span>
                </div>
              ))}
            </div>

            <div className="art-deco-line my-3" />

            {/* Totals */}
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{subtotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (10%)</span>
                <span className="text-foreground">{iva.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-base font-medium mt-2">
                <span className="text-foreground">Total</span>
                <span className="font-display text-xl text-gold">{tableTotal.toFixed(2)}€</span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4 mb-4">
              Factura simplificada · SAV-MESA{selectedTable}-{Date.now().toString(36).toUpperCase().slice(-6)}
            </p>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-lg bg-gold text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Imprimir factura
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TableHistory;
