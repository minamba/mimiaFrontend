import * as regle from '../../lib/jeux/geometrieCM1';
import * as regleCM2 from '../../lib/jeux/geometrieCM2';
import jeuSimple from './JeuSimple';
import { SCENE_GEOMETRIE } from './scenes/primaire-maths-b/AtelierGeometrie';

/**
 * LA GÉOMÉTRIE DU CM1 — le miroir au CM1, à l'écran. Toute la règle vit dans
 * `geometrieCM1.js` (et `geometrieCM2.js` au CM2). Les angles, les droites,
 * le miroir et les figures se dessinent dans l'atelier de géométrie,
 * `scenes/primaire-maths-b/AtelierGeometrie.js` (09/10/2026) : le poteau
 * indicateur, les outils, les planches-réponses et la preuve par l'outil.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'geometrie-cm1',
  classe: 'jeu--miroir',
  ...SCENE_GEOMETRIE,
  parNiveau: { CM2: { module: regleCM2, prefixe: 'geometrie-cm2' } },
});
