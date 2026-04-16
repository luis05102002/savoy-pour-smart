-- Add tags column to menu_items for dietary/attribute labels
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Update existing items with relevant tags
UPDATE public.menu_items SET tags = ARRAY['signature'] WHERE name = 'Savoy Royale';
UPDATE public.menu_items SET tags = ARRAY['premium'] WHERE name = 'Golden Night';
UPDATE public.menu_items SET tags = ARRAY['popular'] WHERE name = 'Velvet Noir';
UPDATE public.menu_items SET tags = ARRAY['popular'] WHERE name = 'Mediterranean Breeze';
UPDATE public.menu_items SET tags = ARRAY['signature'] WHERE name = 'Truffle Old Fashioned';
UPDATE public.menu_items SET tags = ARRAY['premium', 'champagne'] WHERE name = 'Dom Pérignon 2013';
UPDATE public.menu_items SET tags = ARRAY['champagne'] WHERE name = 'Moët & Chandon Impérial';
UPDATE public.menu_items SET tags = ARRAY['champagne'] WHERE name = 'Veuve Clicquot Rosé';
UPDATE public.menu_items SET tags = ARRAY['premium', 'champagne'] WHERE name = 'Ruinart Blanc de Blancs';
UPDATE public.menu_items SET tags = ARRAY['premium', 'whisky'] WHERE name = 'Macallan 18 años';
UPDATE public.menu_items SET tags = ARRAY['premium'] WHERE name = 'Clase Azul Reposado';
UPDATE public.menu_items SET tags = ARRAY['premium'] WHERE name = 'Rémy Martin Louis XIII';
UPDATE public.menu_items SET tags = ARRAY['whisky'] WHERE name = 'Nikka From The Barrel';
UPDATE public.menu_items SET tags = ARRAY['premium', 'wine'] WHERE name = 'Vega Sicilia Único 2012';
UPDATE public.menu_items SET tags = ARRAY['premium', 'wine'] WHERE name = 'Opus One 2019';
UPDATE public.menu_items SET tags = ARRAY['wine'] WHERE name = 'Cloudy Bay Sauvignon Blanc';
UPDATE public.menu_items SET tags = ARRAY['sin alcohol', 'popular'] WHERE name = 'Savoy Virgin';
UPDATE public.menu_items SET tags = ARRAY['sin alcohol'] WHERE name = 'Golden Elixir';
UPDATE public.menu_items SET tags = ARRAY['sin alcohol'] WHERE name = 'Botanical Garden';

-- Add GIN index for tag lookups
CREATE INDEX IF NOT EXISTS idx_menu_items_tags ON public.menu_items USING GIN (tags);