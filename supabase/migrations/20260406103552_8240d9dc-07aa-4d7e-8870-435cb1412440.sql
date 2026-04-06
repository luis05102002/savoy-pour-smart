
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu items"
ON public.menu_items FOR SELECT USING (true);

CREATE POLICY "Staff can insert menu items"
ON public.menu_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Staff can update menu items"
ON public.menu_items FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Staff can delete menu items"
ON public.menu_items FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.menu_items (name, description, price, category, sort_order) VALUES
('Savoy Royale', 'Gin Hendricks, champagne rosé, pétalos de rosa, sirope de lichi', 18, 'Cócteles Signature', 1),
('Golden Night', 'Whisky japonés Hibiki, yuzu, miel de azahar, lámina de oro 24k', 22, 'Cócteles Signature', 2),
('Velvet Noir', 'Vodka Grey Goose, café espresso, licor de avellana, cacao', 16, 'Cócteles Signature', 3),
('Mediterranean Breeze', 'Gin Mare, tónica Fever-Tree, romero fresco, pomelo rosa', 15, 'Cócteles Signature', 4),
('Truffle Old Fashioned', 'Bourbon Woodford Reserve, bitter de trufa, sirope de arce ahumado', 24, 'Cócteles Signature', 5),
('Dom Pérignon 2013', 'Champagne vintage, notas de almendra y cítricos', 280, 'Champagne & Espumosos', 6),
('Moët & Chandon Impérial', 'Champagne brut, elegante y equilibrado', 85, 'Champagne & Espumosos', 7),
('Veuve Clicquot Rosé', 'Champagne rosé, frutos rojos y brioche', 95, 'Champagne & Espumosos', 8),
('Ruinart Blanc de Blancs', 'Chardonnay puro, frescura y finura', 110, 'Champagne & Espumosos', 9),
('Macallan 18 años', 'Single malt escocés, caramelo y especias', 35, 'Destilados Premium', 10),
('Clase Azul Reposado', 'Tequila ultra-premium, vainilla y caramelo', 40, 'Destilados Premium', 11),
('Rémy Martin Louis XIII', 'Cognac de excepción, servido en cristal', 180, 'Destilados Premium', 12),
('Nikka From The Barrel', 'Whisky japonés, intenso y complejo', 22, 'Destilados Premium', 13),
('Vega Sicilia Único 2012', 'Ribera del Duero, referencia de la enología española', 320, 'Vinos Selectos', 14),
('Opus One 2019', 'Napa Valley, Cabernet Sauvignon de culto', 450, 'Vinos Selectos', 15),
('Cloudy Bay Sauvignon Blanc', 'Marlborough, fresco y aromático (copa)', 12, 'Vinos Selectos', 16),
('Savoy Virgin', 'Agua de rosas, frambuesa, lima, soda artesanal', 10, 'Sin Alcohol', 17),
('Golden Elixir', 'Jengibre, cúrcuma, miel, limón, espuma de coco', 10, 'Sin Alcohol', 18),
('Botanical Garden', 'Pepino, albahaca, tónica premium, lima', 9, 'Sin Alcohol', 19);
