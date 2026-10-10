import OuSurTerre from './OuSurTerre';
import EnqueteCarte from './EnqueteCarte';
import GrandJeuDeGeo from './GrandJeuDeGeo';

/**
 * Les écrans des jeux bonus « geo » (10/10/2026) — clé du catalogue → écran.
 * « Cap sur le Monde » : une carte du monde construite par le code (voir
 * `monde.js` et `CarteMonde.js`), commune aux trois jeux.
 */
export const ECRANS = {
  'bonus-ou-sur-terre': OuSurTerre,
  'bonus-enquete-carte': EnqueteCarte,
  'bonus-grand-jeu-de-geo': GrandJeuDeGeo,
};

/** Leur aperçu de carte, faute de couverture. */
export const APERCUS = {
  'bonus-ou-sur-terre': '🗂️',
  'bonus-enquete-carte': '🧭',
  'bonus-grand-jeu-de-geo': '🌍',
};
