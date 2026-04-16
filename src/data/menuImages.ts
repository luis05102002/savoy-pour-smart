// Fallback images for menu items when image_url is null in DB
// These are the same images used in the landing page (Promo.tsx)
import savoyRoyale from '@/assets/drinks/savoy-royale.jpg';
import goldenNight from '@/assets/drinks/golden-night.jpg';
import velvetNoir from '@/assets/drinks/velvet-noir.jpg';
import medBreeze from '@/assets/drinks/mediterranean-breeze.jpg';
import truffleOldFashioned from '@/assets/drinks/truffle-old-fashioned.jpg';
import domPerignon from '@/assets/drinks/dom-perignon.jpg';
import moetChandon from '@/assets/drinks/moet-chandon.jpg';
import veuveClicquot from '@/assets/drinks/veuve-clicquot.jpg';
import ruinart from '@/assets/drinks/ruinart.jpg';
import macallan18 from '@/assets/drinks/macallan-18.jpg';
import claseAzul from '@/assets/drinks/clase-azul.jpg';
import remyMartin from '@/assets/drinks/remy-martin.jpg';
import nikka from '@/assets/drinks/nikka.jpg';
import vegaSicilia from '@/assets/drinks/vega-sicilia.jpg';
import opusOne from '@/assets/drinks/opus-one.jpg';
import cloudyBay from '@/assets/drinks/cloudy-bay.jpg';
import savoyVirgin from '@/assets/drinks/savoy-virgin.jpg';
import goldenElixir from '@/assets/drinks/golden-elixir.jpg';
import botanicalGarden from '@/assets/drinks/botanical-garden.jpg';

const menuImageMap: Record<string, string> = {
  'Savoy Royale': savoyRoyale,
  'Golden Night': goldenNight,
  'Velvet Noir': velvetNoir,
  'Mediterranean Breeze': medBreeze,
  'Truffle Old Fashioned': truffleOldFashioned,
  'Dom Pérignon 2013': domPerignon,
  'Moët & Chandon Impérial': moetChandon,
  'Veuve Clicquot Rosé': veuveClicquot,
  'Ruinart Blanc de Blancs': ruinart,
  'Macallan 18 años': macallan18,
  'Clase Azul Reposado': claseAzul,
  'Rémy Martin Louis XIII': remyMartin,
  'Nikka From The Barrel': nikka,
  'Vega Sicilia Único 2012': vegaSicilia,
  'Opus One 2019': opusOne,
  'Cloudy Bay Sauvignon Blanc': cloudyBay,
  'Savoy Virgin': savoyVirgin,
  'Golden Elixir': goldenElixir,
  'Botanical Garden': botanicalGarden,
};

export const getMenuImage = (item: { name: string; image_url?: string | null; image?: string }): string | undefined => {
  // Priority: image_url from DB > image prop > fallback by name
  return item.image_url || item.image || menuImageMap[item.name];
};