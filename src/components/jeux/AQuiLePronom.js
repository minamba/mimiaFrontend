import * as regle from '../../lib/jeux/aQuiLePronom';
import jeuSimple from './JeuSimple';
import { pourJeuSimple } from './scenes/primaire-francais';

/**
 * À QUI RENVOIE LE PRONOM ? — à l'écran. Le mot à suivre est en couleur.
 * Toute la règle vit dans `aQuiLePronom.js` ; la scène (l'ardoise, le chat du
 * muret, les panneaux fléchés, le fil du pronom), dans
 * `scenes/primaire-francais/Pronom.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'a-qui-le-pronom',
  classe: 'jeu--pronom',
  ...pourJeuSimple('a-qui-le-pronom'),
});
