import { avecVisuel, classeQuestion } from '../base';
import { Etapes, Explication, nombresDe } from './outils';

/**
 * L'OBSERVATOIRE DE LAITON — « Le rapporteur », 6e (09/10/2026). La
 * couverture : une terrasse de marbre bleu et blanc au-dessus de la mer,
 * des sphères armillaires et un grand cadran de laiton, une jeune
 * astronome qui tient son instrument. La scène :
 *   - LA QUESTION : l'angle de la question (son dessin, gardé tel quel)
 *     cerclé de laiton, la question gravée sur une plaque ; une sphère
 *     armillaire tourne lentement, des étoiles scintillent ;
 *   - LES RÉPONSES : un grand CADRAN de laiton — les réponses sont des
 *     médaillons posés sur son arc, l'alidade balaie le ciel ;
 *   - APRÈS LA RÉPONSE : le rapporteur s'explique — l'échelle qui part de
 *     zéro s'allume et l'arc de l'angle se trace dessus ; la jauge aigu /
 *     droit / obtus et son aiguille ; l'angle entier partagé en deux.
 */
const P = 'sc-rapporteur';

const CX = 110;
const CY = 104;
const R = 88;
const point = (deg, r = R) => [CX + r * Math.cos((deg * Math.PI) / 180), CY - r * Math.sin((deg * Math.PI) / 180)];
const arc = (de, a, r = R) => {
  const [x0, y0] = point(de, r);
  const [x1, y1] = point(a, r);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${a - de > 180 ? 1 : 0} 0 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};

/** Le demi-disque gradué, ses deux échelles ; `zero` dit laquelle part de zéro sur [OA]. */
function DemiDisque({
  zero = null, angle = null, secteurs = [], aiguille = null, zones = false,
}) {
  const graduations = Array.from({ length: 19 }, (_, i) => i * 10);
  return (
    <svg className={`${P}__demi-disque`} viewBox="0 0 220 122" aria-hidden="true" focusable="false">
      {zones && (
        <>
          <path d={`${arc(0, 90)} L${CX} ${CY} Z`} className={`${P}__zone ${P}__zone--aigu`} />
          <path d={`${arc(90, 180)} L${CX} ${CY} Z`} className={`${P}__zone ${P}__zone--obtus`} />
          <text x={CX + 50} y={CY - 18} textAnchor="middle" className={`${P}__nom-zone`}>aigu</text>
          <text x={CX - 50} y={CY - 18} textAnchor="middle" className={`${P}__nom-zone`}>obtus</text>
          <text x={CX} y="10" textAnchor="middle" className={`${P}__nom-zone`}>droit</text>
        </>
      )}
      <path d={`${arc(0, 180)} Z`} className={`${P}__corps`} />
      {graduations.map((g) => {
        const [x0, y0] = point(g, R);
        const [x1, y1] = point(g, g % 30 ? R - 6 : R - 10);
        return <line key={g} x1={x0} y1={y0} x2={x1} y2={y1} className={`${P}__graduation`} />;
      })}
      {!zones && graduations.filter((g) => g % 30 === 0).map((g) => {
        // Les graduations 0 et 180 se lisent un peu au-dessus de la base, pour ne pas se coucher sur elle.
        const a = Math.min(173, Math.max(7, g));
        const [xe, ye] = point(a, R - 18);
        const [xi, yi] = point(a, R - 34);
        return (
          <g key={g}>
            <text x={xe} y={ye} textAnchor="middle" dominantBaseline="central" className={`${P}__echelle-ext${zero === 'extérieure' ? ' est-lue' : ''}`}>{g}</text>
            <text x={xi} y={yi} textAnchor="middle" dominantBaseline="central" className={`${P}__echelle-int${zero === 'intérieure' ? ' est-lue' : ''}`}>{180 - g}</text>
          </g>
        );
      })}
      {secteurs.map(({ de, a, classe, texte }) => {
        const [xt, yt] = point((de + a) / 2, 42);
        return (
          <g key={`${de}-${a}`} className={`${P}__secteur ${classe}`}>
            <path d={`${arc(de, a, 56)} L${CX} ${CY} Z`} />
            <text x={xt} y={yt} textAnchor="middle" dominantBaseline="central">{texte}</text>
          </g>
        );
      })}
      {angle && (
        <>
          <line x1={CX} y1={CY} x2={point(angle.oa)[0]} y2={point(angle.oa)[1]} className={`${P}__cote`} />
          <line x1={CX} y1={CY} x2={point(angle.ob)[0]} y2={point(angle.ob)[1]} className={`${P}__cote ${P}__cote--b`} />
          <path d={arc(Math.min(angle.oa, angle.ob), Math.max(angle.oa, angle.ob), 30)} className={`${P}__arc`} pathLength="1" />
        </>
      )}
      {aiguille !== null && (
        <line x1={CX} y1={CY} x2={CX + R - 4} y2={CY} className={`${P}__aiguille`} style={{ '--a': `${-aiguille}deg` }} />
      )}
      <circle cx={CX} cy={CY} r="4" className={`${P}__centre`} />
    </svg>
  );
}

function contenu(m) {
  const q = m.question;
  if (m.consigne === 'lire-angle') {
    const zero = /0 de l’échelle (intérieure|extérieure)/.exec(q)?.[1];
    const r = /par (\d+) sur l’échelle intérieure et (\d+) sur l’échelle extérieure/.exec(q);
    if (!zero || !r) return null;
    const ext = Number(r[2]);
    // Sur ce rapporteur, l'échelle extérieure part de 0 à droite, l'intérieure de 0 à gauche.
    const oa = zero === 'extérieure' ? 0 : 180;
    const lu = zero === 'extérieure' ? ext : Number(r[1]);
    return (
      <>
        <DemiDisque zero={zero} angle={{ oa, ob: ext }} />
        <Etapes
          p={P}
          depart={1.4}
          lignes={[`[OA] passe par le 0 de l’échelle ${zero} : on lit sur l’échelle ${zero}, et seulement elle.`, `Elle indique ${lu} sur [OB].`]}
        />
      </>
    );
  }
  if (m.consigne === 'nature-angle') {
    const [a] = nombresDe(q);
    if (a === undefined) return null;
    let phrase = `${a}° < 90° : plus petit qu’un angle droit.`;
    if (a === 90) phrase = '90° tout juste : c’est un angle droit.';
    else if (a > 90) phrase = `90° < ${a}° < 180° : plus grand qu’un angle droit.`;
    return (
      <>
        <DemiDisque zones aiguille={a} />
        <Etapes p={P} depart={1.6} lignes={[phrase]} />
      </>
    );
  }
  if (m.consigne === 'angle-partage') {
    const [a] = nombresDe(q);
    const entier = /angle droit/.test(q) ? 90 : 180;
    if (a === undefined || a >= entier) return null;
    return (
      <>
        <DemiDisque
          secteurs={[
            { de: 0, a, classe: `${P}__secteur--connu`, texte: `${a}°` },
            { de: a, a: entier, classe: `${P}__secteur--cherche`, texte: `${entier - a}°` },
          ]}
        />
        <Etapes p={P} depart={1.4} lignes={[`Un angle ${entier === 90 ? 'droit' : 'plat'} mesure ${entier}° : ${entier}° − ${a}° = ${entier - a}°`]} />
      </>
    );
  }
  return null;
}

/** Le décor : une sphère armillaire qui tourne, des étoiles qui scintillent. */
function Observatoire() {
  return (
    <div className={`${P}__observatoire`} aria-hidden="true">
      <svg className={`${P}__armillaire`} viewBox="0 0 80 80" focusable="false">
        <circle cx="40" cy="40" r="30" />
        <ellipse cx="40" cy="40" rx="30" ry="10" className={`${P}__anneau-tourne`} />
        <ellipse cx="40" cy="40" rx="10" ry="30" className={`${P}__anneau-tourne ${P}__anneau-tourne--2`} />
        <circle cx="40" cy="40" r="5" className={`${P}__globe`} />
        <line x1="40" y1="70" x2="40" y2="80" />
      </svg>
      {[18, 40, 63, 84].map((x, i) => (
        <span key={x} className={`${P}__etoile`} style={{ left: `${x}%`, top: `${(i * 23) % 60}%`, animationDelay: `${(i * -0.7).toFixed(1)}s` }} />
      ))}
    </div>
  );
}

export function QuestionRapporteur({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      {!termine && <Observatoire />}
      {avecVisuel(m, (
        <div className={`${P}__plaque`}>
          <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
        </div>
      ))}
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={2.6} />}
    </div>
  );
}

/** Les réponses : des médaillons de laiton sur l'arc du grand cadran ; l'alidade balaie. */
export function Cadran({ choix, fautes, choisir }) {
  // Le premier choix à droite, près du zéro, comme sur un rapporteur : « aigu » y tombe du côté des petits angles.
  const places = choix.map((_, i) => 20 + (140 * i) / Math.max(1, choix.length - 1));
  return (
    <div className={`${P}__cadran`}>
      <span className={`${P}__arc-cadran`} aria-hidden="true" />
      <span className={`${P}__alidade`} aria-hidden="true" />
      <ul className={`${P}__medaillons`} aria-label="Choisis ta réponse">
        {choix.map(({ cle, libelle }, i) => {
          const a = (places[i] * Math.PI) / 180;
          return (
            <li key={cle} style={{ '--x': `${(50 + 40 * Math.cos(a)).toFixed(1)}%`, '--y': `${(92 - 78 * Math.sin(a)).toFixed(1)}%`, '--i': i }}>
              <button
                type="button"
                className={`${P}__medaillon${fautes.includes(cle) ? ' est-fausse' : ''}`}
                onClick={() => choisir(cle)}
                disabled={fautes.includes(cle)}
              >
                {libelle}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
