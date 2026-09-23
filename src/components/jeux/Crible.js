import * as regle from '../../lib/jeux/crible';
import jeuSimple from './JeuSimple';

/**
 * LE CRIBLE — un jeu du CM1, à l'écran. Toute la règle vit dans `crible.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'crible',
  classe: 'jeu--crible',
});
