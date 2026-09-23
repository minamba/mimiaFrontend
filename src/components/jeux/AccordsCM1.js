import * as regle from '../../lib/jeux/accordsCM1';
import * as regleCM2 from '../../lib/jeux/attributCM2';
import { decouper } from '../../lib/jeux/complementsCM1';
import jeuSimple from './JeuSimple';

/**
 * LES ACCORDS À DISTANCE DU CM1 — les accords au CM1, à l'écran. Toute la
 * règle vit dans `accordsCM1.js`. Au CM2 (`attributCM2.js`), le groupe à
 * reconnaître est surligné.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'accords-cm1',
  classe: 'jeu--unoudes',
  rendreQuestion: (m) => {
    if (!m.phrase) return <p className="phrase-a-trou">{m.question}</p>;
    const [avant, groupe, apres] = decouper(m.phrase);
    return <p className="phrase-a-trou">{avant}<mark className="surligne">{groupe}</mark>{apres}</p>;
  },
  parNiveau: { CM2: { module: regleCM2, prefixe: 'attribut-cm2' } },
});
