import * as regle from '../../lib/jeux/recettePour8';
import * as regleCM2 from '../../lib/jeux/recetteCM2';
import jeuSimple from './JeuSimple';

/**
 * LA RECETTE POUR 8 — un jeu du CM1, à l'écran. Toute la règle vit dans `recettePour8.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'recette-pour-8',
  classe: 'jeu--recette',
  parNiveau: { CM2: { module: regleCM2, prefixe: 'recette-cm2' } },
});
