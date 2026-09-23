import * as regle from '../../lib/jeux/motsDeLiaison';
import jeuSimple from './JeuSimple';

/**
 * LES MOTS DE LIAISON — un jeu du CM1, à l'écran. Toute la règle vit dans `motsDeLiaison.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'mots-de-liaison',
  classe: 'jeu--liaison',
});
