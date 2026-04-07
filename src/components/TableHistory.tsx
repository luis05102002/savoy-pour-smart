import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Clock, Receipt } from 'lucide-react';
import type { Order } from '@/data/menu';

interface TableHistoryProps {
  orders: Order[];
}

const TableHistory = ({ orders }: TableHistoryProps) => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Get unique table numbers with order counts
  const tables = Array.from(new Set(orders.map(o => o.tableNumber))).sort((a, b) => a - b);

  const tableOrders = selectedTable !== null
    ? orders.filter(o => o.tableNumber === selectedTable).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    : [];

  const tableTotal = tableOrders.reduce((sum, o) => sum + o.total, 0);
  const tablePaidTotal = tableOrders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.total, 0);

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
            return (
              <button
                key={table}
                onClick={() => setSelectedTable(selectedTable === table ? null : table)}
                className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedTable === table
                    ? 'bg-gold text-primary-foreground'
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
              </button>
            );
          })
        )}
      </div>

      {/* Table detail */}
      <AnimatePresence mode="wait">
        {selectedTable !== null && (
          <motion.div
            key={selectedTable}
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
      </AnimatePresence>
    </div>
  );
};

export default TableHistory;
