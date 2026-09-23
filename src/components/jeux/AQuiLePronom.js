import * as regle from '../../lib/jeux/aQuiLePronom';
import jeuSimple from './JeuSimple';

/**
 * À QUI RENVOIE LE PRONOM ? — à l'écran. Le mot à suivre est en couleur.
 * Toute la règle vit dans `aQuiLePronom.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'a-qui-le-pronom',
  classe: 'jeu--pronom',
  rendreQuestion: (m) => {
    const [avant, mot, apres] = regle.decouper(m.texte);
    return <p className="texte-a-lire">{avant}<mark className="surligne">{mot}</mark>{apres}</p>;
  },
});
