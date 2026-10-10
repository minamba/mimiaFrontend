import * as miroir from '../../lib/jeux/miroir';
import { repliquesMiroir } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import GeometrieCM1 from './GeometrieCM1';
import { ChoixMiroir, QuestionMiroir } from './scenes/ce2-maths/SceneMiroir';

/**
 * LE MIROIR, À L'ÉCRAN — une figure et trois lignes, ou un triangle et ses
 * trois coins. Toute la règle vit dans `miroir.js`.
 *
 * UNE FOIS L'AXE TROUVÉ, IL S'ÉCLAIRE en pointillé vert, comme le pli d'une
 * feuille. Une fois l'angle droit trouvé, le petit carré de l'équerre s'y pose.
 *
 * L'UNIVERS DE LA COUVERTURE (09/10/2026) : la figure dans le miroir à cadre
 * de bois, le papillon qui réagit, des crayons de couleur pour réponses, et
 * la figure qui se plie le long de l'axe (ou l'équerre qui se cale) une fois
 * la réponse donnée — voir `scenes/ce2-maths/SceneMiroir.js`, où vivent aussi
 * les dessins de la figure et du triangle.
 */
export const REGLE = {
  MANCHES: miroir.MANCHES,
  serie: miroir.serie,
  bilan: miroir.bilan,
  consigne: (m) => repliquesMiroir.consigne(m.mode),
  choix: (m) => m.choix.map((l) => ({ cle: l, libelle: l })),
  verdict: miroir.verdict,
  erreur: (m, sens) => repliquesMiroir.erreur(sens),
  aide: () => null,
  rendreLesChoix: (p) => <ChoixMiroir {...p} />,
};

function MiroirAvantCM1(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--miroir"
      rendreQuestion={(m, termine, extra) => <QuestionMiroir m={m} termine={termine} extra={extra} />}
    />
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `GeometrieCM1.js` ; il lit la classe. */
export default function Miroir({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <GeometrieCM1 niveau={niveau} {...props} /> : <MiroirAvantCM1 niveau={niveau} {...props} />;
}
