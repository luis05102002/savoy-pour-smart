import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChefHat, Check, Receipt, FileText, QrCode, LogOut, BarChart3, Wine, ClipboardList, History, Bell, BellOff, RefreshCw, CalendarDays, HandCoins } from 'lucide-react';
import { useRealtimeOrders } from '@/hooks/useOrders';
import type { Order } from '@/data/menu';
import DashboardStats from '@/components/DashboardStats';
import SalesStats from '@/components/SalesStats';
import MenuManager from '@/components/MenuManager';
import InvoiceModal from '@/components/InvoiceModal';
import NewOrderAlert from '@/components/NewOrderAlert';
import BackButton from '@/components/BackButton';
import TableHistory from '@/components/TableHistory';
import ReservationManager from '@/components/ReservationManager';
import { useAuth } from '@/hooks/useAuth';
import { useWaiterCalls } from '@/hooks/useWaiterCalls';

const statusConfig = {
  pending: { label: 'Pendiente', icon: Clock, color: 'text-warning' },
  preparing: { label: 'Preparando', icon: ChefHat, color: 'text-gold' },
  served: { label: 'Servido', icon: Check, color: 'text-success' },
  paid: { label: 'Pagado', icon: Receipt, color: 'text-muted-foreground' },
};

const statusFlow: Order['status'][] = ['pending', 'preparing', 'served', 'paid'];

type Tab = 'orders' | 'reservations' | 'stats' | 'menu' | 'history';

const Dashboard = () => {
  const navigate = useNavigate();
  const { orders, updateOrderStatus, requestPermission, permission, refreshOrders, newOrderAlert, dismissAlert } = useRealtimeOrders();
  const { signOut } = useAuth();
  const { calls, dismissCall } = useWaiterCalls();
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('orders');

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const groupedByTable = useMemo(() => {
    const map = new Map<number, Order[]>();
    for (const o of filtered) {
      const arr = map.get(o.tableNumber) || [];
      arr.push(o);
      map.set(o.tableNumber, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  const tableHasCall = (tableNumber: number) => calls.find(c => c.table_number === tableNumber);

  const nextStatus = (current: Order['status']) => {
    const idx = statusFlow.indexOf(current);
    return idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
  };

  const tabs: { id: Tab; label: string; icon: typeof ClipboardList }[] = [
    { id: 'orders', label: 'Pedidos', icon: ClipboardList },
    { id: 'reservations', label: 'Reservas', icon: CalendarDays },
    { id: 'history', label: 'Mesas', icon: History },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'menu', label: 'Carta', icon: Wine },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NewOrderAlert order={newOrderAlert} onDismiss={dismissAlert} />
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton to="/" label="Inicio" />
            <div>
              <h1 className="font-display text-xl gold-text-gradient tracking-[0.15em] uppercase">
                Savoy
              </h1>
              <p className="text-muted-foreground text-xs tracking-wider">Panel de Gestión</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { refreshOrders(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted-foreground text-xs hover:text-foreground hover:border-gold/40 transition-colors"
              title="Actualizar pedidos"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={requestPermission}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors ${
                permission === 'granted'
                  ? 'border-success/40 text-success'
                  : 'border-gold/40 text-gold hover:bg-gold/10'
              }`}
              title={permission === 'granted' ? 'Notificaciones activadas' : 'Activar notificaciones push'}
            >
              {permission === 'granted' ? <Bell size={14} /> : <BellOff size={14} />}
            </button>
            <button
              onClick={() => navigate('/qr')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gold/40 text-gold text-xs hover:bg-gold/10 transition-colors"
            >
              <QrCode size={14} />
            </button>
            <button
              onClick={async () => { await signOut(); navigate('/login'); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-destructive/40 text-destructive text-xs hover:bg-destructive/10 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Tabs - scrollable on mobile */}
        <div className="flex gap-1 mb-4 bg-secondary/50 rounded-xl p-1 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gold text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'orders' && (
          <>
            <DashboardStats orders={orders} />

            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
              {(['all', ...statusFlow] as const).map((s) => {
                const label = s === 'all' ? 'Todos' : statusConfig[s].label;
                const count = s === 'all' ? orders.length : orders.filter((o) => o.status === s).length;
                return (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                      filter === s
                        ? 'bg-gold text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      filter === s ? 'bg-primary-foreground/20' : 'bg-muted'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {calls.length > 0 && (
              <div className="mb-4 space-y-2">
                {calls.map(call => (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gold/10 border border-gold/40"
                  >
                    <div className="flex items-center gap-2">
                      <HandCoins size={18} className="text-gold" />
                      <span className="font-display text-gold text-sm">Mesa {call.table_number}</span>
                      <span className="text-xs text-muted-foreground">pide la cuenta</span>
                    </div>
                    <button
                      onClick={() => dismissCall(call.id)}
                      className="px-3 py-1.5 rounded-lg bg-gold text-primary-foreground text-xs font-medium hover:opacity-90"
                    >
                      Atendido
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Clock size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-display text-lg">Sin pedidos</p>
                <p className="text-sm mt-1">Los pedidos aparecerán aquí en tiempo real</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {groupedByTable.map(([tableNum, tableOrders]) => {
                    const tableTotal = tableOrders.reduce((s, o) => s + o.total, 0);
                    const allItems = tableOrders.flatMap(o => o.items);
                    const consolidated = new Map<string, { name: string; price: number; quantity: number }>();
                    for (const item of allItems) {
                      const key = item.menuItem.id;
                      const existing = consolidated.get(key);
                      if (existing) {
                        existing.quantity += item.quantity;
                      } else {
                        consolidated.set(key, { name: item.menuItem.name, price: item.menuItem.price, quantity: item.quantity });
                      }
                    }
                    const statusPriority: Record<string, number> = { pending: 0, preparing: 1, served: 2, paid: 3 };
                    const worstOrder = tableOrders.reduce((a, b) => statusPriority[a.status] < statusPriority[b.status] ? a : b);
                    const { label, icon: Icon, color } = statusConfig[worstOrder.status];
                    const hasCall = tableHasCall(tableNum);

                    const invoiceForTable: Order = {
                      id: tableOrders[0].id,
                      tableNumber: tableNum,
                      items: allItems,
                      status: 'served',
                      createdAt: tableOrders[0].createdAt,
                      total: tableTotal,
                    };

                    return (
                      <motion.div
                        key={`table-${tableNum}`}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`bg-card border rounded-xl p-4 flex flex-col ${hasCall ? 'border-gold ring-2 ring-gold/30' : 'border-border'}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-xl text-gold">Mesa {tableNum}</span>
                            {hasCall && (
                              <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs font-medium animate-pulse">
                                💰
                              </span>
                            )}
                          </div>
                          <span className={`flex items-center gap-1 text-xs ${color}`}>
                            <Icon size={14} />
                            {label}
                          </span>
                        </div>

                        <div className="text-xs text-muted-foreground mb-2">{tableOrders.length} pedido(s)</div>

                        <div className="flex-1 space-y-1.5 mb-3">
                          {Array.from(consolidated.values()).map((item) => (
                            <div key={item.name} className="flex justify-between text-sm">
                              <span className="text-foreground">
                                {item.quantity}× {item.name}
                              </span>
                              <span className="text-muted-foreground">
                                {(item.price * item.quantity).toFixed(2)}€
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="art-deco-line my-2" />

                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs text-muted-foreground">
                            {tableOrders[tableOrders.length - 1].createdAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="font-display text-lg text-gold">{tableTotal.toFixed(2)}€</span>
                        </div>

                        <div className="flex gap-2">
                          {tableOrders.some(o => nextStatus(o.status)) && (
                            <button
                              onClick={async () => {
                                for (const o of tableOrders) {
                                  const next = nextStatus(o.status);
                                  if (next) await updateOrderStatus(o.id, next);
                                }
                              }}
                              className="flex-1 py-2 rounded-lg bg-gold text-primary-foreground font-medium text-xs hover:opacity-90 transition-opacity"
                            >
                              → {statusConfig[nextStatus(worstOrder.status) || 'paid'].label}
                            </button>
                          )}
                          <button
                            onClick={() => setInvoiceOrder(invoiceForTable)}
                            className="py-2 px-3 rounded-lg border border-gold/40 text-gold text-xs hover:bg-gold/10 transition-colors flex items-center gap-1"
                          >
                            <FileText size={12} />
                            Factura
                          </button>
                          {hasCall && (
                            <button
                              onClick={() => dismissCall(hasCall.id)}
                              className="py-2 px-2.5 rounded-lg bg-success/20 border border-success/40 text-success text-xs hover:bg-success/30 transition-colors"
                            >
                              ✓
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {activeTab === 'stats' && <SalesStats orders={orders} />}
        {activeTab === 'reservations' && <ReservationManager />}
        {activeTab === 'history' && (
          <TableHistory
            orders={orders}
            onCloseTable={async (tableNumber, orderIds) => {
              for (const id of orderIds) {
                await updateOrderStatus(id, 'paid');
              }
            }}
          />
        )}
        {activeTab === 'menu' && <MenuManager />}
      </div>

      <AnimatePresence>
        {invoiceOrder && (
          <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
