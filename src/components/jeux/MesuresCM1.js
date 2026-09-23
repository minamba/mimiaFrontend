import * as regle from '../../lib/jeux/mesuresCM1';
import * as regleCM2 from '../../lib/jeux/longueursCM2';
import jeuSimple from './JeuSimple';

/**
 * LES MASSES ET LES CONTENANCES DU CM1 — le mètre ruban au CM1, à l'écran. Toute la règle vit dans `mesuresCM1.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'mesures-cm1',
  classe: 'jeu--ruban',
  rendreQuestion: (m) => <p className="grands__nombre">{m.question}</p>,
  parNiveau: { CM2: { module: regleCM2, prefixe: 'longueurs-cm2' } },
});
