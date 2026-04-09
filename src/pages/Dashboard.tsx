import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChefHat, Check, Receipt, FileText, QrCode, LogOut, BarChart3, Wine, ClipboardList, History, Bell, BellOff, RefreshCw } from 'lucide-react';
import { useRealtimeOrders } from '@/hooks/useOrders';
import type { Order } from '@/data/menu';
import DashboardStats from '@/components/DashboardStats';
import SalesStats from '@/components/SalesStats';
import MenuManager from '@/components/MenuManager';
import InvoiceModal from '@/components/InvoiceModal';
import NewOrderAlert from '@/components/NewOrderAlert';
import BackButton from '@/components/BackButton';
import TableHistory from '@/components/TableHistory';
import { useAuth } from '@/hooks/useAuth';

const statusConfig = {
  pending: { label: 'Pendiente', icon: Clock, color: 'text-warning' },
  preparing: { label: 'Preparando', icon: ChefHat, color: 'text-gold' },
  served: { label: 'Servido', icon: Check, color: 'text-success' },
  paid: { label: 'Pagado', icon: Receipt, color: 'text-muted-foreground' },
};

const statusFlow: Order['status'][] = ['pending', 'preparing', 'served', 'paid'];

type Tab = 'orders' | 'stats' | 'menu' | 'history';

const Dashboard = () => {
  const navigate = useNavigate();
  const { orders, updateOrderStatus, requestPermission, permission, refreshOrders, newOrderAlert, dismissAlert } = useRealtimeOrders();
  const { signOut } = useAuth();
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('orders');

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const nextStatus = (current: Order['status']) => {
    const idx = statusFlow.indexOf(current);
    return idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
  };

  const tabs: { id: Tab; label: string; icon: typeof ClipboardList }[] = [
    { id: 'orders', label: 'Pedidos', icon: ClipboardList },
    { id: 'history', label: 'Mesas', icon: History },
    { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
    { id: 'menu', label: 'Carta', icon: Wine },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton to="/" label="Inicio" />
            <div>
              <h1 className="font-display text-2xl gold-text-gradient tracking-[0.15em] uppercase">
                Savoy
              </h1>
              <p className="text-muted-foreground text-xs tracking-wider">Panel de Gestión</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { refreshOrders(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm hover:text-foreground hover:border-gold/40 transition-colors"
              title="Actualizar pedidos"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button
              onClick={requestPermission}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                permission === 'granted'
                  ? 'border-success/40 text-success'
                  : 'border-gold/40 text-gold hover:bg-gold/10'
              }`}
              title={permission === 'granted' ? 'Notificaciones activadas' : 'Activar notificaciones push'}
            >
              {permission === 'granted' ? <Bell size={16} /> : <BellOff size={16} />}
              <span className="hidden sm:inline">{permission === 'granted' ? 'Push ON' : 'Push'}</span>
            </button>
            <button
              onClick={() => navigate('/qr')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/40 text-gold text-sm hover:bg-gold/10 transition-colors"
            >
              <QrCode size={16} />
              <span className="hidden sm:inline">QR Mesas</span>
            </button>
            <button
              onClick={async () => { await signOut(); navigate('/login'); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/40 text-destructive text-sm hover:bg-destructive/10 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-secondary/50 rounded-xl p-1 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-gold text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            <DashboardStats orders={orders} />

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {(['all', ...statusFlow] as const).map((s) => {
                const label = s === 'all' ? 'Todos' : statusConfig[s].label;
                const count = s === 'all' ? orders.length : orders.filter((o) => o.status === s).length;
                return (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`shrink-0 px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
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
                          <span className="font-display text-2xl text-gold">Mesa {order.tableNumber}</span>
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
                              onClick={() => setInvoiceOrder(order)}
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
          </>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && <SalesStats orders={orders} />}

        {/* Table History Tab */}
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

        {/* Menu Management Tab */}
        {activeTab === 'menu' && <MenuManager />}
      </div>

      {/* Invoice Modal */}
      <AnimatePresence>
        {invoiceOrder && (
          <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
