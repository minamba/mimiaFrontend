import * as temps from '../../lib/jeux/combienDeTemps';
import { repliquesDuree } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import DureesCM1 from './DureesCM1';
import { ChoixTemps, QuestionTemps } from './scenes/ce2-maths/SceneTemps';

/**
 * COMBIEN DE TEMPS ?, À L'ÉCRAN — l'heure de début, l'heure de fin, trois
 * durées ; une fois trouvée, le chemin par l'heure pile. Toute la règle vit
 * dans `combienDeTemps.js`.
 *
 * L'UNIVERS DE LA COUVERTURE (09/10/2026) : le quai de la gare de montagne,
 * son horloge et son tableau des départs, Tic le réveil qui réagit, des
 * valises pour réponses, et le train du temps qui s'accroche wagon par wagon
 * une fois la réponse donnée — voir `scenes/ce2-maths/SceneTemps.js`.
 */
export const REGLE = {
  MANCHES: temps.MANCHES,
  serie: temps.serie,
  bilan: temps.bilan,
  consigne: () => repliquesDuree.consigne,
  choix: (m) => m.choix.map((d) => ({ cle: d, libelle: temps.ecrireDuree(d) })),
  verdict: temps.verdict,
  erreur: (m, sens) => repliquesDuree.erreur(sens),
  aide: () => repliquesDuree.erreur('naif'),
  rendreLesChoix: (p) => <ChoixTemps {...p} />,
};

function CombienDeTempsAvantCM1(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--duree"
      rendreQuestion={(m, termine, extra) => <QuestionTemps m={m} termine={termine} extra={extra} />}
    />
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `DureesCM1.js` ; il lit la classe. */
export default function CombienDeTemps({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <DureesCM1 niveau={niveau} {...props} /> : <CombienDeTempsAvantCM1 niveau={niveau} {...props} />;
}
