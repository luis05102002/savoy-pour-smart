import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Minus, Plus, X, Send, QrCode, MessageSquare, HandCoins, Receipt } from 'lucide-react';
import { useCartStore } from '@/store/orderStore';
import { submitOrder } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';
import type { Order } from '@/data/menu';
import { toast } from 'sonner';
import { IVA_DIVISOR } from '@/lib/constants';

const Cart = () => {
  const [open, setOpen] = useState(false);
  const [showBill, setShowBill] = useState(false);
  // Persist billRequested in localStorage so refreshing doesn't allow duplicate requests
  const [billRequested, setBillRequested] = useState(() => {
    try {
      return localStorage.getItem('savoy_bill_requested') === 'true';
    } catch {
      return false;
    }
  });
  const [calling, setCalling] = useState(false);
  const { items, tableNumber, tableOrders, updateQuantity, removeItem, clearCart, getTotal, updateNotes, addTableOrder, getTableTotal } = useCartStore();
  const [sending, setSending] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);

  const total = getTotal();
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const tableTotal = getTableTotal();
  const grandTotal = tableTotal + total;

  const handleOrder = async () => {
    if (!tableNumber) {
      toast.error('Escanea el QR de tu mesa para poder pedir');
      return;
    }
    setSending(true);

    try {
      const result = await submitOrder({
        tableNumber,
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
          notes: i.notes,
        })),
      });

      const order: Order = {
        id: result.id,
        tableNumber,
        items: result.items,
        status: 'pending',
        createdAt: new Date(result.createdAt),
        total: result.total,
      };

      addTableOrder(order);
      clearCart();
      setOpen(false);
      toast.success('Pedido enviado al bar', {
        description: `Mesa ${tableNumber} · ${result.total.toFixed(2)}€`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al enviar el pedido. Inténtalo de nuevo.';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const handleCallWaiter = async () => {
    if (!tableNumber || billRequested) return;
    setCalling(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-waiter-call', {
        body: { tableNumber, type: 'payment' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setBillRequested(true);
      // eslint-disable-next-line no-empty
      try { localStorage.setItem('savoy_bill_requested', 'true'); } catch {}
      toast.success('Camarero avisado', {
        description: data?.existingCall ? 'Ya hay una llamada pendiente' : 'En breve vendrá a cobrarte',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al avisar al camarero';
      toast.error(msg);
    } finally {
      setCalling(false);
    }
  };

  // Build consolidated order for invoice
  const consolidatedOrder: Order | null = tableOrders.length > 0 && tableNumber ? {
    id: tableOrders[0].id,
    tableNumber,
    items: tableOrders.flatMap(o => o.items),
    status: 'served' as const,
    createdAt: tableOrders[0].createdAt,
    total: tableTotal,
  } : null;

  const subtotal = consolidatedOrder ? consolidatedOrder.total / IVA_DIVISOR : 0;
  const iva = consolidatedOrder ? consolidatedOrder.total - subtotal : 0;

  return (
    <>
      {/* Single unified floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label={count > 0 ? `Abrir carrito, ${count} artículo${count !== 1 ? 's' : ''}` : 'Abrir carrito'}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
      >
        {(tableOrders.length > 0 || count > 0) ? (
          <Receipt size={24} className="text-primary-foreground" />
        ) : (
          <ShoppingBag size={24} className="text-primary-foreground" />
        )}
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
            {count}
          </span>
        )}
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="font-display text-xl text-gold">Tu Pedido</h2>
                <button onClick={() => setOpen(false)} aria-label="Cerrar carrito" className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              {/* Previous orders summary - clickable to show full bill */}
              {tableOrders.length > 0 && (
                <button
                  onClick={() => setShowBill(!showBill)}
                  className="px-6 py-3 bg-gold/5 border-b border-border w-full flex justify-between items-center text-sm hover:bg-gold/10 transition-colors"
                >
                  <span className="text-muted-foreground">{tableOrders.length} pedido(s) anterior(es)</span>
                  <span className="font-display text-gold">{tableTotal.toFixed(2)}€</span>
                </button>
              )}

              {/* Full bill detail (collapsible) */}
              {showBill && consolidatedOrder && (
                <div className="px-6 py-3 bg-secondary/30 border-b border-border space-y-2">
                  <div className="space-y-1">
                    {consolidatedOrder.items.map((item, idx) => (
                      <div key={`${item.menuItem.id}-${idx}`} className="flex justify-between text-xs">
                        <span className="text-foreground">{item.quantity}× {item.menuItem.name}</span>
                        <span className="text-muted-foreground">{(item.menuItem.price * item.quantity).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>
                  <div className="art-deco-line" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>IVA (10%)</span>
                    <span>{iva.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between font-display text-sm text-gold pt-1">
                    <span>Total pedidos</span>
                    <span>{tableTotal.toFixed(2)}€</span>
                  </div>
                </div>
              )}

              {/* Current cart items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 && tableOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">Tu carrito está vacío</p>
                ) : items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">Añade más items al carrito</p>
                ) : (
                  items.map((item) => (
                    <div key={item.menuItem.id} className="p-3 rounded-lg bg-secondary/50 space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-foreground truncate">{item.menuItem.name}</p>
                          <p className="text-sm text-gold">{item.menuItem.price}€</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-foreground font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => removeItem(item.menuItem.id)}
                            className="ml-1 text-muted-foreground hover:text-destructive"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Notes toggle */}
                      {editingNotes === item.menuItem.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={200}
                            placeholder="Sin hielo, doble, etc."
                            defaultValue={item.notes || ''}
                            autoFocus
                            onBlur={(e) => {
                              updateNotes(item.menuItem.id, e.target.value.trim());
                              setEditingNotes(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateNotes(item.menuItem.id, (e.target as HTMLInputElement).value.trim());
                                setEditingNotes(null);
                              }
                            }}
                            className="flex-1 text-xs bg-background border border-border rounded-md px-2 py-1.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingNotes(item.menuItem.id)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
                        >
                          <MessageSquare size={12} />
                          {item.notes || 'Añadir nota'}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer with totals and actions */}
              {items.length > 0 && (
                <div className="p-6 border-t border-border space-y-4">
                  {tableNumber ? (
                    <div className="w-full px-4 py-3 rounded-lg bg-gold/10 border border-gold/30 text-center">
                      <span className="text-sm text-muted-foreground">Mesa </span>
                      <span className="font-display text-lg text-gold">{tableNumber}</span>
                    </div>
                  ) : (
                    <div className="w-full px-4 py-4 rounded-lg bg-destructive/10 border border-destructive/30 text-center space-y-2">
                      <QrCode size={28} className="mx-auto text-destructive" />
                      <p className="text-sm text-destructive font-medium">Escanea el QR de tu mesa</p>
                      <p className="text-xs text-muted-foreground">Necesitas escanear el código QR de tu mesa para poder hacer un pedido</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Este pedido</span>
                    <span className="font-display text-2xl text-gold">{total.toFixed(2)}€</span>
                  </div>
                  {tableOrders.length > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total acumulado</span>
                      <span className="font-display text-gold">{grandTotal.toFixed(2)}€</span>
                    </div>
                  )}
                  <button
                    onClick={handleOrder}
                    disabled={sending || !tableNumber}
                    className="w-full py-4 rounded-lg gold-gradient text-primary-foreground font-display text-lg tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={18} />
                        Enviar Pedido
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Request bill button - only if there are orders */}
              {tableOrders.length > 0 && (
                <div className="p-6 pt-0">
                  <button
                    onClick={handleCallWaiter}
                    disabled={calling || billRequested}
                    className={`w-full py-4 rounded-lg font-display text-lg tracking-wider flex items-center justify-center gap-3 transition-all ${
                      billRequested
                        ? 'bg-success/20 border border-success/40 text-success'
                        : 'border border-gold/40 text-gold hover:bg-gold/10'
                    } disabled:opacity-70`}
                  >
                    {calling ? (
                      <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    ) : billRequested ? (
                      '✓ Camarero avisado'
                    ) : (
                      <>
                        <HandCoins size={22} />
                        Pedir la Cuenta
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Cart;