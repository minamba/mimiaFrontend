import * as regle from '../../lib/jeux/vocabulaireCM1';
import * as regleCM2 from '../../lib/jeux/vocabulaireCM2';
import jeuSimple from './JeuSimple';

/**
 * LE VOCABULAIRE DU CM1 — contraires et jumeaux au CM1, à l'écran. Toute la règle vit dans `vocabulaireCM1.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'vocabulaire-cm1',
  classe: 'jeu--contraires',
  parNiveau: { CM2: { module: regleCM2, prefixe: 'vocabulaire-cm2' } },
});
