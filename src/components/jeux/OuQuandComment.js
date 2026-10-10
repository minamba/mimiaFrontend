import * as oqc from '../../lib/jeux/ouQuandComment';
import { repliquesComplements } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import ComplementsCM1 from './ComplementsCM1';
import { sceneDe } from './scenes/ce2-francais';

const SCENE = sceneDe('ou-quand-comment');

/**
 * OÙ, QUAND, COMMENT ?, À L'ÉCRAN — la phrase, le groupe surligné, trois
 * questions. Toute la règle vit dans `ouQuandComment.js`. L'univers de la
 * couverture (le tableau à la craie, la lanterne, les trois cercles de craie
 * qu'on touche ou qu'on glisse sur le groupe) vit dans
 * `scenes/ce2-francais/Tableau.js` (09/10/2026).
 */
const REGLE = {
  MANCHES: oqc.MANCHES,
  serie: oqc.serie,
  bilan: oqc.bilan,
  consigne: () => repliquesComplements.consigne,
  choix: () => oqc.QUESTIONS.map(({ cle, libelle }) => ({ cle, libelle })),
  verdict: oqc.verdict,
  erreur: (p, type) => repliquesComplements.indice(type),
  aide: (p) => repliquesComplements.indice(p.type),
  rendreLesChoix: SCENE.choix,
};

function OuQuandCommentAvantCM1(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--complements"
      // La phrase et son groupe surligné, sur le tableau : voir la scène.
      rendreQuestion={SCENE.question}
    />
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `ComplementsCM1.js` ; il lit la classe. */
export default function OuQuandComment({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <ComplementsCM1 niveau={niveau} {...props} /> : <OuQuandCommentAvantCM1 niveau={niveau} {...props} />;
}
