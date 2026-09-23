import * as regle from '../../lib/jeux/phrasesCM1';
import * as regleCM2 from '../../lib/jeux/phrasesCM2';
import jeuSimple from './JeuSimple';

/**
 * LES TYPES ET LES FORMES DU CM1 — transformer la phrase au CM1, à l'écran. Toute la règle vit dans `phrasesCM1.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'phrases-cm1',
  classe: 'jeu--non jeu--transformer',
  parNiveau: { CM2: { module: regleCM2, prefixe: 'phrases-cm2' } },
});
