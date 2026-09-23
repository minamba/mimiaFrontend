import * as regle from '../../lib/jeux/calculMental';
import * as regleCM2 from '../../lib/jeux/operationsCM2';
import jeuSimple from './JeuSimple';

/**
 * LE CALCUL MENTAL DU CM1 — la course des tables au CM1, à l'écran. Toute la règle vit dans `calculMental.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'calcul-mental',
  classe: 'jeu--course',
  rendreQuestion: (m) => <p className="grands__nombre">{m.question}</p>,
  parNiveau: { CM2: { module: regleCM2, prefixe: 'operations-cm2' } },
});
