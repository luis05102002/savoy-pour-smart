import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChefHat, Check, Receipt, FileText } from 'lucide-react';
import { useOrdersStore } from '@/store/orderStore';
import type { Order } from '@/data/menu';

const statusConfig = {
  pending: { label: 'Pendiente', icon: Clock, color: 'text-warning' },
  preparing: { label: 'Preparando', icon: ChefHat, color: 'text-gold' },
  served: { label: 'Servido', icon: Check, color: 'text-success' },
  paid: { label: 'Pagado', icon: Receipt, color: 'text-muted-foreground' },
};

const statusFlow: Order['status'][] = ['pending', 'preparing', 'served', 'paid'];

const Dashboard = () => {
  const { orders, updateOrderStatus } = useOrdersStore();
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const activeCount = orders.filter((o) => o.status !== 'paid').length;

  const nextStatus = (current: Order['status']) => {
    const idx = statusFlow.indexOf(current);
    return idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
  };

  const generateInvoice = (order: Order) => {
    setInvoiceOrder(order);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl gold-text-gradient tracking-[0.15em] uppercase">
              Savoy
            </h1>
            <p className="text-muted-foreground text-xs tracking-wider">Panel de Gestión</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-sm font-medium border border-gold/20">
              {activeCount} pedidos activos
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['all', ...statusFlow] as const).map((s) => {
            const label = s === 'all' ? 'Todos' : statusConfig[s].label;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === s
                    ? 'bg-gold text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Orders grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Clock size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-display text-lg">Sin pedidos</p>
            <p className="text-sm mt-1">Los pedidos aparecerán aquí en tiempo real</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((order) => {
                const { label, icon: Icon, color } = statusConfig[order.status];
                const next = nextStatus(order.status);

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card border border-border rounded-xl p-5 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-2xl text-gold">
                          Mesa {order.tableNumber}
                        </span>
                      </div>
                      <span className={`flex items-center gap-1.5 text-sm ${color}`}>
                        <Icon size={16} />
                        {label}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 mb-4">
                      {order.items.map((item) => (
                        <div key={item.menuItem.id} className="flex justify-between text-sm">
                          <span className="text-foreground">
                            {item.quantity}× {item.menuItem.name}
                          </span>
                          <span className="text-muted-foreground">
                            {(item.menuItem.price * item.quantity).toFixed(2)}€
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="art-deco-line my-3" />

                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs text-muted-foreground">
                        {order.createdAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-display text-xl text-gold">{order.total.toFixed(2)}€</span>
                    </div>

                    <div className="flex gap-2">
                      {next && (
                        <button
                          onClick={() => updateOrderStatus(order.id, next)}
                          className="flex-1 py-2.5 rounded-lg bg-gold text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                        >
                          → {statusConfig[next].label}
                        </button>
                      )}
                      {(order.status === 'served' || order.status === 'paid') && (
                        <button
                          onClick={() => generateInvoice(order)}
                          className="py-2.5 px-4 rounded-lg border border-gold/40 text-gold text-sm hover:bg-gold/10 transition-colors flex items-center gap-1.5"
                        >
                          <FileText size={14} />
                          Factura
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      <AnimatePresence>
        {invoiceOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInvoiceOrder(null)}
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
                  <span className="text-foreground">SAV-{invoiceOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha</span>
                  <span className="text-foreground">{invoiceOrder.createdAt.toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mesa</span>
                  <span className="text-foreground">{invoiceOrder.tableNumber}</span>
                </div>
              </div>

              <div className="art-deco-line my-4" />

              <div className="space-y-2 mb-4">
                {invoiceOrder.items.map((item) => (
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
                  <span className="text-foreground">{(invoiceOrder.total / 1.10).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA (10%)</span>
                  <span className="text-foreground">{(invoiceOrder.total - invoiceOrder.total / 1.10).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-display text-xl mt-2">
                  <span className="text-foreground">Total</span>
                  <span className="text-gold">{invoiceOrder.total.toFixed(2)}€</span>
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
                  onClick={() => setInvoiceOrder(null)}
                  className="py-3 px-6 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
