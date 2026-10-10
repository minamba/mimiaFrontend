import * as regle from '../../lib/jeux/crible';
import jeuSimple from './JeuSimple';
import { SCENE_CRIBLE } from './scenes/primaire-maths-b/ArcDuCrible';

/**
 * LE CRIBLE — un jeu du CM1, à l'écran. Toute la règle vit dans `crible.js` ;
 * le pas de tir de l'archère (cibles, flèche, tamis) dans
 * `scenes/primaire-maths-b/ArcDuCrible.js` (09/10/2026).
 */
export default jeuSimple({
  module: regle,
  prefixe: 'crible',
  classe: 'jeu--crible',
  ...SCENE_CRIBLE,
});
