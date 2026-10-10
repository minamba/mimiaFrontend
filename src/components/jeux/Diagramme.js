import * as diag from '../../lib/jeux/diagramme';
import { repliquesDiagramme } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import TableauxCM1 from './TableauxCM1';
import { ChoixDiagramme, QuestionDiagramme } from './scenes/ce2-maths/SceneDiagramme';

/**
 * LE DIAGRAMME, À L'ÉCRAN — un diagramme en barres dessiné, sa question, trois
 * réponses. Toute la règle vit dans `diagramme.js`.
 *
 * LES VALEURS NE SONT PAS ÉCRITES SUR LES BARRES : les lire sur l'axe est la
 * compétence. Elles apparaissent une fois la réponse trouvée.
 *
 * L'UNIVERS DE LA COUVERTURE (09/10/2026) : le diagramme à la craie sur le
 * tableau noir, la craie qui réagit, des ardoises suspendues pour réponses,
 * et l'explication dessinée à la craie une fois la réponse donnée — voir
 * `scenes/ce2-maths/SceneDiagramme.js`, où vit aussi le dessin des barres.
 */
export const REGLE = {
  MANCHES: diag.MANCHES,
  serie: diag.serie,
  bilan: diag.bilan,
  consigne: () => repliquesDiagramme.consigne,
  choix: (m) => m.choix.map((c) => ({ cle: c, libelle: String(c) })),
  verdict: diag.verdict,
  erreur: (m, sens) => repliquesDiagramme.erreur(sens),
  aide: () => null,
  rendreLesChoix: (p) => <ChoixDiagramme {...p} />,
};

function DiagrammeAvantCM1(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--diagramme"
      rendreQuestion={(m, termine, extra) => <QuestionDiagramme m={m} termine={termine} extra={extra} />}
    />
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `TableauxCM1.js` ; il lit la classe. */
export default function Diagramme({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <TableauxCM1 niveau={niveau} {...props} /> : <DiagrammeAvantCM1 niveau={niveau} {...props} />;
}
