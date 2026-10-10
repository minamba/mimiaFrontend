import * as ruban from '../../lib/jeux/metreRuban';
import { repliquesRuban } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import MesuresCM1 from './MesuresCM1';
import { ChoixRuban, QuestionRuban } from './scenes/ce1-maths/SceneRuban';

/**
 * LE MÈTRE RUBAN, À L'ÉCRAN — la longueur à convertir sur un ruban dessiné,
 * trois réponses. Toute la règle vit dans `metreRuban.js`.
 *
 * L'UNIVERS DE LA COUVERTURE (09/10/2026, `scenes/ce1-maths/SceneRuban.js`) :
 * l'établi de l'atelier, le ruban qui se déroule à chaque manche, le petit
 * mètre ruban qui a des yeux, l'égalité à retenir après la réponse ; les
 * réponses sont des planches graduées (`rendreLesChoix`).
 */
const REGLE = {
  MANCHES: ruban.MANCHES,
  serie: ruban.serie,
  bilan: ruban.bilan,
  consigne: () => repliquesRuban.consigne,
  choix: (m) => m.choix.map((n) => ({ cle: n, libelle: `${ruban.ecrire(n)} ${m.unite}` })),
  verdict: ruban.verdict,
  erreur: (m, sens) => repliquesRuban.erreur(sens),
  aide: (m) => repliquesRuban.erreur(m.relation),
  rendreLesChoix: (props) => <ChoixRuban {...props} />,
};

function MetreRubanAvantCM1(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--ruban"
      rendreQuestion={(m, termine, extra) => <QuestionRuban m={m} termine={termine} extra={extra} />}
    />
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `MesuresCM1.js` ; il lit la classe. */
export default function MetreRuban({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <MesuresCM1 niveau={niveau} {...props} /> : <MetreRubanAvantCM1 niveau={niveau} {...props} />;
}
