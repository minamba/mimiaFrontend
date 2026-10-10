import * as regle from '../../lib/jeux/sacDeBilles';
import * as regleCM2 from '../../lib/jeux/billesCM2';
import jeuSimple from './JeuSimple';
import { SCENE_BILLES } from './scenes/primaire-maths-b/SacsEtChances';

/**
 * LE SAC DE BILLES — à l'écran. Toute la règle vit dans `sacDeBilles.js` (et
 * `billesCM2.js` au CM2). Le sac, les situations et les réponses (échelle des
 * chances, billes, étiquettes, balance) vivent dans
 * `scenes/primaire-maths-b/SacsEtChances.js` (09/10/2026).
 */
export default jeuSimple({
  module: regle,
  prefixe: 'sac-de-billes',
  classe: 'jeu--billes',
  ...SCENE_BILLES,
  parNiveau: { CM2: { module: regleCM2, prefixe: 'billes-cm2' } },
});
