import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Wine, Clock, CreditCard } from 'lucide-react';
import type { Order } from '@/data/menu';

interface SalesStatsProps {
  orders: Order[];
}

const COLORS = [
  'hsl(43, 72%, 55%)',
  'hsl(43, 80%, 70%)',
  'hsl(43, 60%, 35%)',
  'hsl(150, 60%, 40%)',
  'hsl(35, 90%, 55%)',
  'hsl(0, 72%, 50%)',
];

const SalesStats = ({ orders }: SalesStatsProps) => {
  const stats = useMemo(() => {
    const paid = orders.filter(o => o.status === 'paid');
    const totalRevenue = paid.reduce((s, o) => s + o.total, 0);
    const avgTicket = paid.length > 0 ? totalRevenue / paid.length : 0;

    // Hourly sales
    const hourly: Record<string, number> = {};
    paid.forEach(o => {
      const h = o.createdAt.getHours();
      const key = `${h}:00`;
      hourly[key] = (hourly[key] || 0) + o.total;
    });
    const hourlyData = Object.entries(hourly)
      .map(([hour, revenue]) => ({ hour, revenue: Math.round(revenue) }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    // Top items
    const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        const key = item.menuItem.name;
        if (!itemCounts[key]) itemCounts[key] = { name: key, count: 0, revenue: 0 };
        itemCounts[key].count += item.quantity;
        itemCounts[key].revenue += item.menuItem.price * item.quantity;
      });
    });
    const topItems = Object.values(itemCounts).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

    return { totalRevenue, avgTicket, totalOrders: orders.length, paidOrders: paid.length, hourlyData, topItems };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gold/10 border border-gold/20 rounded-xl p-4">
          <TrendingUp size={18} className="text-gold mb-2" />
          <p className="font-display text-2xl text-gold">{stats.totalRevenue.toFixed(0)}€</p>
          <p className="text-xs text-muted-foreground">Facturado hoy</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <CreditCard size={18} className="text-gold mb-2" />
          <p className="font-display text-2xl text-foreground">{stats.avgTicket.toFixed(0)}€</p>
          <p className="text-xs text-muted-foreground">Ticket medio</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <Wine size={18} className="text-gold mb-2" />
          <p className="font-display text-2xl text-foreground">{stats.totalOrders}</p>
          <p className="text-xs text-muted-foreground">Pedidos totales</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <Clock size={18} className="text-gold mb-2" />
          <p className="font-display text-2xl text-foreground">{stats.paidOrders}</p>
          <p className="text-xs text-muted-foreground">Cobrados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Chart */}
        {stats.hourlyData.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-display text-lg text-gold mb-4">Ventas por hora</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.hourlyData}>
                <XAxis dataKey="hour" tick={{ fill: 'hsl(40,10%,55%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(40,10%,55%)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(0,0%,7%)', border: '1px solid hsl(40,15%,18%)', borderRadius: 8, color: 'hsl(40,20%,90%)' }}
                  formatter={(v: number) => [`${v}€`, 'Ventas']}
                />
                <Bar dataKey="revenue" fill="hsl(43,72%,55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Items Pie */}
        {stats.topItems.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-display text-lg text-gold mb-4">Productos más vendidos</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie data={stats.topItems} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {stats.topItems.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'hsl(0,0%,7%)', border: '1px solid hsl(40,15%,18%)', borderRadius: 8, color: 'hsl(40,20%,90%)' }}
                    formatter={(v: number) => [`${v}€`]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {stats.topItems.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="truncate text-foreground">{item.name}</span>
                    <span className="ml-auto text-muted-foreground shrink-0">{item.count}×</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesStats;
