import * as roue from '../../lib/jeux/roueDesVerbes';
import { repliquesRoue } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import TempsCM1 from './TempsCM1';
import { SceneRoue, TicketsForains } from './scenes/cp-ce1-francais/Roue';

/**
 * LA ROUE DES VERBES, À L'ÉCRAN — une roue des huit pronoms, arrêtée sur l'un
 * d'eux, le verbe à l'infinitif, et trois formes. Toute la règle vit dans
 * `roueDesVerbes.js`.
 *
 * L'UNIVERS DE LA COUVERTURE, AU CE1 ET AU CE2 (09/10/2026) — voir
 * `scenes/cp-ce1-francais/Roue.js` : la roue foraine en bois couronnée
 * d'ampoules, que le levier lance à chaque manche ; les formes en tickets de
 * manège suspendus (`rendreLesChoix`) ; Lumi l'ampoule qui réagit ; la
 * terminaison qui s'allume une fois la réponse donnée. La règle, les voix et
 * le déroulé ne changent pas.
 */
const regle = (niveau) => ({
  MANCHES: roue.MANCHES,
  serie: (graine) => roue.serie(graine, niveau),
  bilan: roue.bilan,
  consigne: () => (niveau === 'CE2' ? repliquesRoue.consigneCE2 : repliquesRoue.consigne),
  choix: (m) => m.choix.map((f) => ({ cle: f, libelle: f })),
  verdict: roue.verdict,
  erreur: (m, sens) => repliquesRoue.regle(sens),
  aide: (m) => repliquesRoue.regle(roue.verdict(m, '')),
  rendreLesChoix: ({ choix, fautes, choisir }) => <TicketsForains choix={choix} fautes={fautes} choisir={choisir} />,
});
const REGLES = { CE1: regle('CE1'), CE2: regle('CE2') };

function RoueDesVerbesAvantCM1({ niveau = 'CE1', ...props }) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLES[niveau] ?? REGLES.CE1}
      classe="jeu--roue sc-cp-ce1-francais sc-roue-des-verbes"
      rendreQuestion={(m, termine, extra) => <SceneRoue m={m} termine={termine} extra={extra} />}
    />
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `TempsCM1.js` ; il lit la classe. */
export default function RoueDesVerbes({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <TempsCM1 niveau={niveau} {...props} /> : <RoueDesVerbesAvantCM1 niveau={niveau} {...props} />;
}
