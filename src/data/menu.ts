export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  image_url?: string | null;
  tags?: string[];
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'served' | 'paid';
  createdAt: Date;
  total: number;
}

export const categories = [
  'Cócteles Signature',
  'Champagne & Espumosos',
  'Destilados Premium',
  'Vinos Selectos',
  'Sin Alcohol',
];

export const menuItems: MenuItem[] = [
  // Cócteles Signature
  { id: '1', name: 'Savoy Royale', description: 'Gin Hendricks, champagne rosé, pétalos de rosa, sirope de lichi', price: 18, category: 'Cócteles Signature' },
  { id: '2', name: 'Golden Night', description: 'Whisky japonés Hibiki, yuzu, miel de azahar, lámina de oro 24k', price: 22, category: 'Cócteles Signature' },
  { id: '3', name: 'Velvet Noir', description: 'Vodka Grey Goose, café espresso, licor de avellana, cacao', price: 16, category: 'Cócteles Signature' },
  { id: '4', name: 'Mediterranean Breeze', description: 'Gin Mare, tónica Fever-Tree, romero fresco, pomelo rosa', price: 15, category: 'Cócteles Signature' },
  { id: '5', name: 'Truffle Old Fashioned', description: 'Bourbon Woodford Reserve, bitter de trufa, sirope de arce ahumado', price: 24, category: 'Cócteles Signature' },

  // Champagne & Espumosos
  { id: '6', name: 'Dom Pérignon 2013', description: 'Champagne vintage, notas de almendra y cítricos', price: 280, category: 'Champagne & Espumosos' },
  { id: '7', name: 'Moët & Chandon Impérial', description: 'Champagne brut, elegante y equilibrado', price: 85, category: 'Champagne & Espumosos' },
  { id: '8', name: 'Veuve Clicquot Rosé', description: 'Champagne rosé, frutos rojos y brioche', price: 95, category: 'Champagne & Espumosos' },
  { id: '9', name: 'Ruinart Blanc de Blancs', description: 'Chardonnay puro, frescura y finura', price: 110, category: 'Champagne & Espumosos' },

  // Destilados Premium
  { id: '10', name: 'Macallan 18 años', description: 'Single malt escocés, caramelo y especias', price: 35, category: 'Destilados Premium' },
  { id: '11', name: 'Clase Azul Reposado', description: 'Tequila ultra-premium, vainilla y caramelo', price: 40, category: 'Destilados Premium' },
  { id: '12', name: 'Rémy Martin Louis XIII', description: 'Cognac de excepción, servido en cristal', price: 180, category: 'Destilados Premium' },
  { id: '13', name: 'Nikka From The Barrel', description: 'Whisky japonés, intenso y complejo', price: 22, category: 'Destilados Premium' },

  // Vinos Selectos
  { id: '14', name: 'Vega Sicilia Único 2012', description: 'Ribera del Duero, referencia de la enología española', price: 320, category: 'Vinos Selectos' },
  { id: '15', name: 'Opus One 2019', description: 'Napa Valley, Cabernet Sauvignon de culto', price: 450, category: 'Vinos Selectos' },
  { id: '16', name: 'Cloudy Bay Sauvignon Blanc', description: 'Marlborough, fresco y aromático (copa)', price: 12, category: 'Vinos Selectos' },

  // Sin Alcohol
  { id: '17', name: 'Savoy Virgin', description: 'Agua de rosas, frambuesa, lima, soda artesanal', price: 10, category: 'Sin Alcohol' },
  { id: '18', name: 'Golden Elixir', description: 'Jengibre, cúrcuma, miel, limón, espuma de coco', price: 10, category: 'Sin Alcohol' },
  { id: '19', name: 'Botanical Garden', description: 'Pepino, albahaca, tónica premium, lima', price: 9, category: 'Sin Alcohol' },
];
