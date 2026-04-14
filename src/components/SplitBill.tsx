import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, UserMinus, Download, Users } from 'lucide-react';
import type { Order } from '@/data/menu';
import { IVA_DIVISOR } from '@/lib/constants';

interface SplitBillProps {
  orders: Order[];
  tableNumber: number;
  onClose: () => void;
}

interface SplitItem {
  name: string;
  qty: number;
  unitPrice: number;
  assignedTo: number[]; // diner indices
}

const SplitBill = ({ orders, tableNumber, onClose }: SplitBillProps) => {
  const [diners, setDiners] = useState(2);
  const [dinerNames, setDinerNames] = useState<string[]>(['Comensal 1', 'Comensal 2']);

  // Consolidate items
  const items = useMemo<SplitItem[]>(() => {
    const map = new Map<string, SplitItem>();
    orders.flatMap(o => o.items).forEach(item => {
      const key = item.menuItem.id;
      const existing = map.get(key);
      if (existing) {
        existing.qty += item.quantity;
      } else {
        map.set(key, {
          name: item.menuItem.name,
          qty: item.quantity,
          unitPrice: item.menuItem.price,
          assignedTo: [],
        });
      }
    });
    return Array.from(map.values());
  }, [orders]);

  const [assignments, setAssignments] = useState<number[][]>(() => items.map(() => []));

  const toggleAssignment = (itemIdx: number, dinerIdx: number) => {
    setAssignments(prev => {
      const copy = prev.map(a => [...a]);
      const arr = copy[itemIdx];
      const pos = arr.indexOf(dinerIdx);
      if (pos >= 0) arr.splice(pos, 1);
      else arr.push(dinerIdx);
      return copy;
    });
  };

  const addDiner = () => {
    const n = diners + 1;
    setDiners(n);
    setDinerNames(prev => [...prev, `Comensal ${n}`]);
  };

  const removeDiner = () => {
    if (diners <= 2) return;
    const n = diners - 1;
    setDiners(n);
    setDinerNames(prev => prev.slice(0, n));
    setAssignments(prev => prev.map(a => a.filter(d => d < n)));
  };

  // Calculate totals per diner
  const dinerTotals = useMemo(() => {
    const totals = Array(diners).fill(0);
    items.forEach((item, idx) => {
      const assigned = assignments[idx] || [];
      if (assigned.length === 0) {
        // Unassigned: split equally among all
        const share = (item.unitPrice * item.qty) / diners;
        totals.forEach((_, i) => (totals[i] += share));
      } else {
        const share = (item.unitPrice * item.qty) / assigned.length;
        assigned.forEach(d => (totals[d] += share));
      }
    });
    return totals;
  }, [items, assignments, diners]);

  const grandTotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  const dinerColors = [
    'bg-blue-500/20 text-blue-400 border-blue-500/40',
    'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    'bg-purple-500/20 text-purple-400 border-purple-500/40',
    'bg-amber-500/20 text-amber-400 border-amber-500/40',
    'bg-rose-500/20 text-rose-400 border-rose-500/40',
    'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border rounded-xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between z-10">
          <div>
            <h3 className="font-display text-xl text-gold flex items-center gap-2">
              <Users size={20} />
              Dividir Cuenta · Mesa {tableNumber}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Asigna artículos a cada comensal. Los no asignados se dividen a partes iguales.
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Diner count */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground font-medium">Comensales</span>
            <div className="flex items-center gap-2">
              <button
                onClick={removeDiner}
                disabled={diners <= 2}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <UserMinus size={14} />
              </button>
              <span className="font-display text-lg text-foreground w-8 text-center">{diners}</span>
              <button
                onClick={addDiner}
                disabled={diners >= 6}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <UserPlus size={14} />
              </button>
            </div>
          </div>

          {/* Diner names */}
          <div className="grid grid-cols-2 gap-2">
            {dinerNames.map((name, i) => (
              <input
                key={i}
                value={name}
                onChange={(e) => setDinerNames(prev => { const c = [...prev]; c[i] = e.target.value; return c; })}
                className={`px-3 py-1.5 rounded-lg text-xs border bg-secondary/50 text-foreground focus:outline-none focus:border-gold ${dinerColors[i % dinerColors.length].split(' ').filter(c => c.startsWith('border-')).join(' ')}`}
              />
            ))}
          </div>

          <div className="art-deco-line" />

          {/* Items with assignment */}
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="bg-secondary/30 rounded-lg p-3">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-foreground">{item.qty}× {item.name}</span>
                  <span className="text-sm text-gold">{(item.unitPrice * item.qty).toFixed(2)}€</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: diners }, (_, d) => {
                    const isAssigned = (assignments[idx] || []).includes(d);
                    return (
                      <button
                        key={d}
                        onClick={() => toggleAssignment(idx, d)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          isAssigned
                            ? dinerColors[d % dinerColors.length]
                            : 'border-border text-muted-foreground hover:border-gold/30'
                        }`}
                      >
                        {dinerNames[d]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="art-deco-line" />

          {/* Per-diner totals */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Resumen por comensal</h4>
            {dinerNames.map((name, i) => {
              const subtotal = dinerTotals[i] / IVA_DIVISOR;
              const iva = dinerTotals[i] - subtotal;
              return (
                <div key={i} className={`p-3 rounded-lg border ${dinerColors[i % dinerColors.length]}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{name}</span>
                    <span className="font-display text-lg">{dinerTotals[i].toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-xs opacity-70 mt-1">
                    <span>Base: {subtotal.toFixed(2)}€</span>
                    <span>IVA 10%: {iva.toFixed(2)}€</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grand total check */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-muted-foreground text-sm">Total mesa</span>
            <span className="font-display text-xl text-gold">{grandTotal.toFixed(2)}€</span>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full py-3 rounded-lg bg-gold text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Imprimir cuentas divididas
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SplitBill;
