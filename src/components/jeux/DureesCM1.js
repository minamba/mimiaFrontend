import * as regle from '../../lib/jeux/dureesCM1';
import * as regleCM2 from '../../lib/jeux/dureesCM2';
import jeuSimple from './JeuSimple';

/**
 * LES DURÉES DU CM1 — combien de temps ? au CM1, à l'écran. Toute la règle vit dans `dureesCM1.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'durees-cm1',
  classe: 'jeu--duree',
  parNiveau: { CM2: { module: regleCM2, prefixe: 'durees-cm2' } },
});
