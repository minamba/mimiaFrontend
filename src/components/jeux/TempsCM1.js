import * as regle from '../../lib/jeux/tempsCM1';
import * as regleCM2 from '../../lib/jeux/tempsCM2';
import jeuSimple from './JeuSimple';
import { pourJeuSimple } from './scenes/primaire-francais';

/**
 * LES QUATRE TEMPS DU CM1 — la roue des verbes au CM1, à l'écran. Toute la
 * règle vit dans `tempsCM1.js` ; la scène (la frise et ses portails, le
 * cadran à aiguille), dans `scenes/primaire-francais/Temps.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'temps-cm1',
  classe: 'jeu--roue',
  ...pourJeuSimple('temps-cm1'),
  parNiveau: { CM2: { module: regleCM2, prefixe: 'temps-cm2' } },
});
