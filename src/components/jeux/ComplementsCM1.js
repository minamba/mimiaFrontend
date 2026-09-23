import * as regle from '../../lib/jeux/complementsCM1';
import * as regleCM2 from '../../lib/jeux/complementsCM2';
import jeuSimple from './JeuSimple';

/**
 * LES COMPLÉMENTS DU CM1 — où, quand, comment au CM1, à l'écran. Le groupe
 * à analyser est surligné. Toute la règle vit dans `complementsCM1.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'complements-cm1',
  classe: 'jeu--complements',
  rendreQuestion: (m) => {
    const [avant, groupe, apres] = regle.decouper(m.phrase);
    return <p className="phrase-a-trou">{avant}<mark className="surligne">{groupe}</mark>{apres}</p>;
  },
  parNiveau: { CM2: { module: regleCM2, prefixe: 'complements-cm2' } },
});
