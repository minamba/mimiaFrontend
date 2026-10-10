import * as regle from '../../lib/jeux/accordsCM1';
import * as regleCM2 from '../../lib/jeux/attributCM2';
import jeuSimple from './JeuSimple';
import { pourJeuSimple } from './scenes/primaire-francais';

/**
 * LES ACCORDS À DISTANCE DU CM1 — les accords au CM1, à l'écran. Toute la
 * règle vit dans `accordsCM1.js`. Au CM2 (`attributCM2.js`), le groupe à
 * reconnaître est surligné. La scène (le sentier des accords, les étiquettes
 * à glisser) : `scenes/primaire-francais/Accords.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'accords-cm1',
  classe: 'jeu--unoudes',
  ...pourJeuSimple('accords-cm1'),
  parNiveau: { CM2: { module: regleCM2, prefixe: 'attribut-cm2' } },
});
