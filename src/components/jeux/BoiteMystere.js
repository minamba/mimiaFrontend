import * as regle from '../../lib/jeux/boiteMystere';
import * as regleCM2 from '../../lib/jeux/boiteCM2';
import jeuSimple from './JeuSimple';
import { SCENE_MYSTERE } from './scenes/primaire-maths-b/CoffreMystere';

/**
 * LA BOÎTE MYSTÈRE — un jeu du CM1, à l'écran. Toute la règle vit dans
 * `boiteMystere.js` ; au CM2, dans `boiteCM2.js`, qui ajoute le schéma en
 * barres. Le coffre, la balance, le schéma et leurs réponses (clés, poids,
 * barres) vivent dans `scenes/primaire-maths-b/CoffreMystere.js` (09/10/2026).
 */
export default jeuSimple({
  module: regle,
  prefixe: 'boite-mystere',
  classe: 'jeu--mystere',
  ...SCENE_MYSTERE,
  parNiveau: { CM2: { module: regleCM2, prefixe: 'boite-cm2' } },
});
