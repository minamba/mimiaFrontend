import * as roue from '../../lib/jeux/roueDesVerbes';
import { repliquesRoue } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import TempsCM1 from './TempsCM1';

/**
 * LA ROUE DES VERBES, À L'ÉCRAN — une roue des huit pronoms, arrêtée sur l'un
 * d'eux, le verbe à l'infinitif, et trois formes. Toute la règle vit dans
 * `roueDesVerbes.js`.
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
});
const REGLES = { CE1: regle('CE1'), CE2: regle('CE2') };

function RoueDesVerbesAvantCM1({ niveau = 'CE1', ...props }) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLES[niveau] ?? REGLES.CE1}
      classe="jeu--roue"
      rendreQuestion={(m, termine) => (
        <div className="roue__scene">
          <Roue pronom={m.pronom} />
          <p className="roue__question">
            {/* AU CE2, LE MOMENT : hier, aujourd'hui, demain — il dit le temps. */}
            {m.temps && (
              <span className={`roue__moment roue__moment--${m.temps}`}>
                {roue.TEMPS.find((t) => t.cle === m.temps).moment}
              </span>
            )}
            <span className="roue__verbe">{m.verbe}</span>
            <span className="roue__phrase">
              {termine ? roue.avecPronom(m.pronom, roue.forme(m.verbe, m.pronom, m.temps)) : `${m.pronom} …`}
            </span>
          </p>
        </div>
      )}
    />
  );
}

/** La roue : huit parts, une par pronom, et la flèche sur celui du tirage. */
function Roue({ pronom }) {
  const n = roue.PRONOMS.length;
  const i = roue.PRONOMS.indexOf(pronom);
  // La roue tourne pour amener le pronom tiré sous la flèche, en haut.
  const angle = -((i + 0.5) / n) * 360;
  return (
    <svg className="roue" viewBox="-60 -66 120 126" role="img" aria-label={`La roue s’est arrêtée sur « ${pronom} »`}>
      <g style={{ transform: `rotate(${angle}deg)` }} className="roue__disque">
        {roue.PRONOMS.map((p, k) => {
          const a0 = (k / n) * 2 * Math.PI - Math.PI / 2;
          const a1 = ((k + 1) / n) * 2 * Math.PI - Math.PI / 2;
          const am = (a0 + a1) / 2;
          return (
            <g key={p}>
              <path
                d={`M0 0 L${54 * Math.cos(a0)} ${54 * Math.sin(a0)} A54 54 0 0 1 ${54 * Math.cos(a1)} ${54 * Math.sin(a1)} Z`}
                className={`roue__part${p === pronom ? ' est-tiree' : ''}${k % 2 ? ' roue__part--b' : ''}`}
              />
              <text
                x={36 * Math.cos(am)}
                y={36 * Math.sin(am)}
                textAnchor="middle"
                dominantBaseline="central"
                className="roue__pronom"
                // TOUJOURS DROIT : la roue tourne, ses mots non — « snou », à
                // l'envers en bas de la roue, un enfant de sept ans ne le lit pas.
                transform={`rotate(${-angle} ${36 * Math.cos(am)} ${36 * Math.sin(am)})`}
              >
                {p}
              </text>
            </g>
          );
        })}
      </g>
      <circle r="8" className="roue__axe" />
      <path d="M-7 -64 L7 -64 L0 -52 Z" className="roue__fleche" />
    </svg>
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `TempsCM1.js` ; il lit la classe. */
export default function RoueDesVerbes({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <TempsCM1 niveau={niveau} {...props} /> : <RoueDesVerbesAvantCM1 niveau={niveau} {...props} />;
}
