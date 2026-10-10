import * as regle from '../../lib/jeux/tableauxCM1';
import * as regleCM2 from '../../lib/jeux/tableauxCM2';
import jeuSimple from './JeuSimple';
import { SCENE_MARCHE } from './scenes/primaire-maths-b/EtalDuMarche';

/**
 * LES TABLEAUX DU CM1 — le diagramme au CM1, à l'écran. Toute la règle vit
 * dans `tableauxCM1.js` (et `tableauxCM2.js` au CM2). Le tableau, les
 * diagrammes, l'étal du marché et ses cagettes-réponses vivent dans
 * `scenes/primaire-maths-b/EtalDuMarche.js` (09/10/2026).
 */
export default jeuSimple({
  module: regle,
  prefixe: 'tableaux-cm1',
  classe: 'jeu--diagramme',
  ...SCENE_MARCHE,
  parNiveau: { CM2: { module: regleCM2, prefixe: 'tableaux-cm2' } },
});
