import * as fr from '../../lib/jeux/fractionsCM1';
import * as regleCM2 from '../../lib/jeux/fractionsCM2';
import jeuSimple from './JeuSimple';

/**
 * LES FRACTIONS DU CM1 — les parts de pizza au CM1, à l'écran. La fraction ou
 * la quantité, trois réponses. Toute la règle vit dans `fractionsCM1.js`.
 */
export default jeuSimple({
  module: fr,
  prefixe: 'fractions-cm1',
  classe: 'jeu--pizza',
  rendreQuestion: (m) => <p className="grands__nombre">{m.question}</p>,
  parNiveau: { CM2: { module: regleCM2, prefixe: 'fractions-cm2' } },
});
