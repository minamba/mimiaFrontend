import * as regle from '../../lib/jeux/motsDeLiaison';
import jeuSimple from './JeuSimple';
import { pourJeuSimple } from './scenes/primaire-francais';

/**
 * LES MOTS DE LIAISON — un jeu du CM1, à l'écran. Toute la règle vit dans
 * `motsDeLiaison.js` ; la scène (les pierres de la rivière), dans
 * `scenes/primaire-francais/Liaison.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'mots-de-liaison',
  classe: 'jeu--liaison',
  ...pourJeuSimple('mots-de-liaison'),
});
