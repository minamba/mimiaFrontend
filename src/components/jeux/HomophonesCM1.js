import * as regle from '../../lib/jeux/homophonesCM1';
import * as regleCM2 from '../../lib/jeux/homophonesCM2';
import jeuSimple from './JeuSimple';
import { pourJeuSimple } from './scenes/primaire-francais';

/**
 * LES HOMOPHONES DU CM1 — a ou à au CM1, à l'écran. Toute la règle vit dans
 * `homophonesCM1.js` ; la scène (les mots-bulles à attraper), dans
 * `scenes/primaire-francais/Homophones.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'homophones-cm1',
  classe: 'jeu--aoua',
  ...pourJeuSimple('homophones-cm1'),
  parNiveau: { CM2: { module: regleCM2, prefixe: 'homophones-cm2' } },
});
