import * as regle from '../../lib/jeux/regleDesDixiemes';
import * as regleCM2 from '../../lib/jeux/decimauxCM2';
import jeuSimple from './JeuSimple';
import { SCENE_DIXIEMES } from './scenes/primaire-maths-b/RegleEtLoupe';

/**
 * LA RÈGLE DES DIXIÈMES — à l'écran. Toute la règle vit dans
 * `regleDesDixiemes.js` (et `decimauxCM2.js` au CM2, la loupe). La règle en
 * bois, la coccinelle qui compte, la loupe et la corde à étiquettes vivent
 * dans `scenes/primaire-maths-b/RegleEtLoupe.js` (09/10/2026).
 */
export default jeuSimple({
  module: regle,
  prefixe: 'regle-des-dixiemes',
  classe: 'jeu--dixiemes',
  ...SCENE_DIXIEMES,
  parNiveau: { CM2: { module: regleCM2, prefixe: 'decimaux-cm2' } },
});
