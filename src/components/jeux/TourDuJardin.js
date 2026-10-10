import * as jardin from '../../lib/jeux/tourDuJardin';
import { repliquesJardin } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import AiresCM1 from './AiresCM1';
import { ChoixJardin, QuestionJardin } from './scenes/ce2-maths/SceneJardin';

/**
 * LE TOUR DU JARDIN, À L'ÉCRAN — le jardin dessiné, ses côtés écrits, trois
 * longueurs de clôture. Toute la règle vit dans `tourDuJardin.js`.
 *
 * L'UNIVERS DE LA COUVERTURE (09/10/2026) : le plan épinglé au milieu du
 * jardin, le rouge-gorge qui réagit, des rouleaux de clôture pour réponses,
 * et la coccinelle qui fait le tour une fois la réponse donnée — voir
 * `scenes/ce2-maths/SceneJardin.js`, où vit aussi le dessin du jardin.
 */
export const REGLE = {
  MANCHES: jardin.MANCHES,
  serie: jardin.serie,
  bilan: jardin.bilan,
  consigne: () => repliquesJardin.consigne,
  choix: (m) => m.choix.map((n) => ({ cle: n, libelle: `${n} m` })),
  verdict: jardin.verdict,
  erreur: (m, sens) => repliquesJardin.erreur(sens),
  aide: () => null,
  rendreLesChoix: (p) => <ChoixJardin {...p} />,
};

function TourDuJardinAvantCM1(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--jardin"
      rendreQuestion={(m, termine, extra) => <QuestionJardin m={m} termine={termine} extra={extra} />}
    />
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `AiresCM1.js` ; il lit la classe. */
export default function TourDuJardin({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <AiresCM1 niveau={niveau} {...props} /> : <TourDuJardinAvantCM1 niveau={niveau} {...props} />;
}
