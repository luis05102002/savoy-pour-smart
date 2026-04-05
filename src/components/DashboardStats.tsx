import { Clock, ChefHat, Check, Receipt, TrendingUp } from 'lucide-react';
import type { Order } from '@/data/menu';

interface DashboardStatsProps {
  orders: Order[];
}

const DashboardStats = ({ orders }: DashboardStatsProps) => {
  const pending = orders.filter((o) => o.status === 'pending').length;
  const preparing = orders.filter((o) => o.status === 'preparing').length;
  const served = orders.filter((o) => o.status === 'served').length;
  const paid = orders.filter((o) => o.status === 'paid').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: 'Pendientes', value: pending, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Preparando', value: preparing, icon: ChefHat, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Servidos', value: served, icon: Check, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Pagados', value: paid, icon: Receipt, color: 'text-muted-foreground', bg: 'bg-muted/50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bg} border border-border rounded-xl p-4 flex items-center gap-3`}
        >
          <stat.icon size={20} className={stat.color} />
          <div>
            <p className="font-display text-2xl text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
      <div className="bg-gold/10 border border-gold/20 rounded-xl p-4 flex items-center gap-3 col-span-2 lg:col-span-1">
        <TrendingUp size={20} className="text-gold" />
        <div>
          <p className="font-display text-2xl text-gold">{totalRevenue.toFixed(0)}€</p>
          <p className="text-xs text-muted-foreground">Facturado hoy</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
