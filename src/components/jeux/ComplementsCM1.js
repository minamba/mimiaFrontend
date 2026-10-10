import * as regle from '../../lib/jeux/complementsCM1';
import * as regleCM2 from '../../lib/jeux/complementsCM2';
import jeuSimple from './JeuSimple';
import { pourJeuSimple } from './scenes/primaire-francais';

/**
 * LES COMPLÉMENTS DU CM1 — où, quand, comment au CM1, à l'écran. Le groupe
 * à analyser est surligné. Toute la règle vit dans `complementsCM1.js` ; la
 * scène (le pont, le voyageur, les portails), dans
 * `scenes/primaire-francais/Complements.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'complements-cm1',
  classe: 'jeu--complements',
  ...pourJeuSimple('complements-cm1'),
  parNiveau: { CM2: { module: regleCM2, prefixe: 'complements-cm2' } },
});
