import * as regle from '../../lib/jeux/vocabulaireCM1';
import * as regleCM2 from '../../lib/jeux/vocabulaireCM2';
import jeuSimple from './JeuSimple';
import { pourJeuSimple } from './scenes/primaire-francais';

/**
 * LE VOCABULAIRE DU CM1 — contraires et jumeaux au CM1, à l'écran. Toute la
 * règle vit dans `vocabulaireCM1.js` ; la scène (l'atelier des mots, ses
 * pièces de puzzle et son escalier des niveaux de langue), dans
 * `scenes/primaire-francais/Vocabulaire.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'vocabulaire-cm1',
  classe: 'jeu--contraires',
  ...pourJeuSimple('vocabulaire-cm1'),
  parNiveau: { CM2: { module: regleCM2, prefixe: 'vocabulaire-cm2' } },
});
