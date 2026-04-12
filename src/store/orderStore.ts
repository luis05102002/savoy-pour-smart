import { create } from 'zustand';
import type { MenuItem, OrderItem, Order } from '@/data/menu';

interface CartState {
  items: OrderItem[];
  tableNumber: number | null;
  tableOrders: Order[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNotes: (itemId: string, notes: string) => void;
  setTableNumber: (table: number) => void;
  clearCart: () => void;
  addTableOrder: (order: Order) => void;
  clearTableOrders: () => void;
  getTotal: () => number;
  getTableTotal: () => number;
}

interface OrdersState {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrderInStore: (orderId: string, status: Order['status']) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  tableNumber: null,
  tableOrders: [],
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { menuItem: item, quantity: 1 }] };
    }),
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.menuItem.id !== itemId),
    })),
  updateQuantity: (itemId, quantity) =>
    set((state) => ({
      items: quantity <= 0
        ? state.items.filter((i) => i.menuItem.id !== itemId)
        : state.items.map((i) =>
            i.menuItem.id === itemId ? { ...i, quantity } : i
          ),
    })),
  updateNotes: (itemId, notes) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.menuItem.id === itemId ? { ...i, notes: notes || undefined } : i
      ),
    })),
  setTableNumber: (table) => set({ tableNumber: table }),
  clearCart: () => set((state) => ({ items: [], tableNumber: state.tableNumber })),
  addTableOrder: (order) =>
    set((state) => ({ tableOrders: [...state.tableOrders, order] })),
  clearTableOrders: () => set({ tableOrders: [] }),
  getTotal: () =>
    get().items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),
  getTableTotal: () =>
    get().tableOrders.reduce((sum, o) => sum + o.total, 0),
}));

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  addOrder: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),
  updateOrderInStore: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
    })),
}));
