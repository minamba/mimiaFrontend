import {
  Enonce, ecrire, nombre, proprietesChoix, useEtapes,
} from './commun';

/**
 * L'ASCENSEUR DU GRAND HÔTEL — « L'ascenseur » (5e, 4e), le 09/10/2026.
 * La couverture : un atrium doré et bordeaux, des cabines de verre et de
 * laiton. La scène en est la cage d'ascenseur :
 *   - 5e, SOMMES ET DIFFÉRENCES : la cabine attend à l'étage de départ (le
 *     premier nombre) ; APRÈS, elle monte ou descend étage par étage, en
 *     passant le rez-de-chaussée s'il le faut, et ses portes s'ouvrent à
 *     l'arrivée. Une soustraction se réécrit d'abord en addition de l'opposé ;
 *   - 5e, L'ÉCART DE TEMPÉRATURE : le thermomètre doré du hall ; APRÈS, le
 *     mercure monte du matin à l'après-midi, en comptant les degrés ;
 *   - 4e, L'ASCENSEUR DES SIGNES : chaque facteur est une plaque de laiton ;
 *     APRÈS, la flèche de la cabine se retourne à chaque signe moins — un
 *     nombre pair de retournements, et elle remonte.
 *   - LES RÉPONSES : les boutons d'appel en laiton du tableau de bord.
 */

const P = 'sc-ascenseur-des-relatifs';

/** « (−7) » → −7 ; « (+3) » → 3. */
const parentheses = (texte) => (String(texte).match(/\(([+−-]?\d+)\)/g) ?? []).map((t) => nombre(t.slice(1, -1)));

/* --------------------------------------------------------- LA CAGE */

/** La cage d'ascenseur, de `bas` à `haut` ; la cabine à l'étage `etage`. */
function Cage({
  bas, haut, etage, depart = null, arrivee = null, ouverte = false,
}) {
  const n = haut - bas + 1;
  const h = 11;
  const y = (e) => 14 + (haut - e) * h;
  const etages = Array.from({ length: n }, (_, i) => haut - i);
  // Les étages nommés : le départ, l'arrivée, le rez-de-chaussée, et les multiples de 5 qui ne les gênent pas.
  const reperes = [0, depart, arrivee].filter((e) => e !== null);
  const nomme = (e) => reperes.includes(e) || (e % 5 === 0 && reperes.every((r) => Math.abs(r - e) > 1));
  return (
    <div className={`${P}__cage-cadre`}>
      <svg viewBox={`0 0 170 ${n * h + 28}`} className={`${P}__cage`} aria-hidden="true" focusable="false">
        <rect x="58" y="6" width="70" height={n * h + 16} rx="6" className={`${P}__puits`} />
        {etages.map((e) => (
          <g key={e}>
            <line x1="58" x2="128" y1={y(e) + h / 2} y2={y(e) + h / 2} className={e === 0 ? `${P}__rdc` : `${P}__palier`} />
            {nomme(e) && (
              <text x="50" y={y(e) + h / 2 + 4} textAnchor="end" className={`${P}__numero${e === arrivee ? ' est-arrivee' : ''}${e === 0 ? ' est-rdc' : ''}`}>
                {e === 0 ? 'RDC 0' : ecrire(e)}
              </text>
            )}
          </g>
        ))}
        <g className={`${P}__cabine${ouverte ? ' est-ouverte' : ''}`} style={{ transform: `translateY(${y(etage) - h * 1.5 + 2}px)` }}>
          <rect x="66" y="0" width="54" height={h * 2.6} rx="4" className={`${P}__caisse`} />
          <rect x="70" y="4" width="22" height={h * 2.6 - 8} className={`${P}__porte ${P}__porte--g`} />
          <rect x="94" y="4" width="22" height={h * 2.6 - 8} className={`${P}__porte ${P}__porte--d`} />
          <circle cx="93" cy="-4" r="3" className={`${P}__lampe`} />
        </g>
        <line x1="93" x2="93" y1="6" y2={y(etage) - h * 1.5 - 2} className={`${P}__cable`} />
      </svg>
    </div>
  );
}

/** Le cadran doré au-dessus des portes : l'étage où est la cabine. */
function Cadran({ etage, fin = false }) {
  return (
    <div className={`${P}__cadran${fin ? ' est-fini' : ''}`} role="status">
      <span className={`${P}__cadran-titre`}>Étage</span>
      <strong key={String(etage)}>{etage === null ? '…' : ecrire(etage)}</strong>
    </div>
  );
}

/* --------------------------------------------------------- LES SORTES 5e */

/** Le trajet : départ, déplacement (signé), et la réécriture éventuelle. */
function trajetDe(m) {
  const q = m.question;
  if (m.consigne === 'ascenseur') {
    const r = q.match(/niveau ([−\d]+)\.\nIl (monte|descend) de (\d+)/);
    if (!r) return null;
    const depart = nombre(r[1]);
    const pas = Number(r[3]) * (r[2] === 'monte' ? 1 : -1);
    return { depart, pas, lignes: [`${ecrire(depart)} ${pas > 0 ? '+' : '−'} ${Math.abs(pas)} = ${ecrire(depart + pas)}`] };
  }
  const [a, b] = parentheses(q);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const par = (n) => (n < 0 ? `(−${-n})` : `(+${n})`);
  if (m.consigne === 'soustraction-relatifs') {
    return {
      depart: a,
      pas: -b,
      lignes: [
        `Soustraire ${par(b)}, c’est ajouter son opposé ${par(-b)}`,
        `${par(a)} + ${par(-b)} = ${ecrire(a - b)}`,
      ],
    };
  }
  return { depart: a, pas: b, lignes: [`${par(a)} + ${par(b)} = ${ecrire(a + b)}`] };
}

function Trajet({ m, termine }) {
  const t = trajetDe(m);
  if (!t) return null;
  return termine ? <Voyage {...t} /> : (
    <div className={`${P}__hall`}>
      <Cage bas={t.depart - 13} haut={t.depart + 13} etage={t.depart} depart={t.depart} />
      <Cadran etage={t.depart} />
    </div>
  );
}

/** La cabine part : un étage à la fois, puis les portes s'ouvrent. */
function Voyage({ depart, pas, lignes }) {
  const d = Math.abs(pas);
  const prelude = lignes.length - 1;
  const k = useEtapes(prelude + d + 1, Math.min(520, 5200 / Math.max(d, 1)), 500);
  const faits = Math.max(0, Math.min(d, k - prelude));
  const etage = depart + Math.sign(pas) * faits;
  const arrive = k >= prelude + d + 1;
  return (
    <div className={`${P}__hall`}>
      <Cage bas={depart - 13} haut={depart + 13} etage={etage} depart={depart} arrivee={arrive ? depart + pas : null} ouverte={arrive} />
      <div className={`${P}__colonne`}>
        <Cadran etage={etage} fin={arrive} />
        <ol className={`${P}__registre`} aria-label="Le calcul">
          {lignes.map((l, i) => <li key={l} className={(i < lignes.length - 1 ? k >= i + 1 : arrive) ? 'est-pose' : ''}>{l}</li>)}
        </ol>
        {!arrive && faits > 0 && <span className={`${P}__sens`}>{`${pas > 0 ? '▲ monte' : '▼ descend'} : ${faits} étage${faits > 1 ? 's' : ''}`}</span>}
      </div>
    </div>
  );
}

/** Le thermomètre doré du hall. */
function Temperature({ m, termine }) {
  const r = m.question.match(/il fait ([−\d]+) °C\.\nL’après-midi, il fait ([−\d]+) °C/);
  if (!r) return null;
  const froid = nombre(r[1]);
  const chaud = nombre(r[2]);
  if (!Number.isFinite(froid) || !Number.isFinite(chaud)) return null;
  return termine ? <Mercure froid={froid} chaud={chaud} /> : <Thermometre froid={froid} chaud={chaud} niveau={froid} />;
}

function Thermometre({
  froid, chaud, niveau, compte = null,
}) {
  const bas = Math.min(froid, 0) - 2;
  const haut = Math.max(chaud, 0) + 2;
  const y = (t) => 20 + ((haut - t) / (haut - bas)) * 200;
  const traits = [];
  for (let t = bas; t <= haut; t += 1) traits.push(t);
  return (
    <svg viewBox="0 0 170 260" className={`${P}__thermometre`} aria-hidden="true" focusable="false">
      <rect x="66" y="10" width="26" height="222" rx="13" className={`${P}__tube`} />
      <circle cx="79" cy="236" r="20" className={`${P}__bulbe`} />
      <rect x="72" y={y(niveau)} width="14" height={236 - y(niveau)} className={`${P}__mercure`} />
      {traits.map((t) => (
        <g key={t}>
          <line x1="92" x2={t % 5 === 0 ? 106 : 100} y1={y(t)} y2={y(t)} className={`${P}__degre`} />
          {(t === 0 || t === froid || t === chaud) && (
            <text x="110" y={y(t) + 5} className={`${P}__temp${t === 0 ? ' est-zero' : ''}`}>{`${ecrire(t)} °C`}</text>
          )}
        </g>
      ))}
      <text x="10" y={y(froid) + 5} className={`${P}__moment`}>matin</text>
      <text x="10" y={y(chaud) + 5} className={`${P}__moment`}>après-midi</text>
      {compte !== null && compte > 0 && (
        <text x="10" y={y(niveau) - 22} className={`${P}__montee`}>{`+${compte}`}</text>
      )}
    </svg>
  );
}

function Mercure({ froid, chaud }) {
  const d = chaud - froid;
  const k = useEtapes(d, Math.min(380, 4800 / d), 400);
  return (
    <div className={`${P}__hall`}>
      <Thermometre froid={froid} chaud={chaud} niveau={froid + k} compte={k} />
      <ol className={`${P}__registre`} aria-label="Le calcul">
        <li className={k >= -froid ? 'est-pose' : ''}>{`De ${ecrire(froid)} °C à 0 °C : ${-froid} degrés`}</li>
        <li className={k >= d ? 'est-pose' : ''}>{`De 0 °C à ${chaud} °C : ${chaud} degrés`}</li>
        <li className={k >= d ? 'est-pose' : ''}>{`${-froid} + ${chaud} = ${d} degrés`}</li>
      </ol>
    </div>
  );
}

/* --------------------------------------------------------- LES SORTES 4e */

/** La flèche de la cabine : montante (positif) ou descendante (négatif). */
function Fleche({ signe }) {
  return (
    <span className={`${P}__fleche${signe === null ? ' est-muette' : ''}${signe < 0 ? ' est-retournee' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 40 40"><path d="M20 4 L36 26 H26 V37 H14 V26 H4 Z" /></svg>
      <em>{signe === null ? 'la cabine ?' : `${signe > 0 ? 'monte : +' : 'descend : −'}`}</em>
    </span>
  );
}

function Signes({ m, termine }) {
  const q = m.question;
  const priorite = q.match(/^(−?\d+) ([+−]) (\d+) × \((−\d+)\) = \?$/);
  if (priorite) return <Priorites a={nombre(priorite[1])} s={priorite[2] === '+' ? 1 : -1} b={Number(priorite[3])} c={nombre(priorite[4])} termine={termine} />;
  const facteurs = parentheses(q);
  if (facteurs.length < 2 || facteurs.some((f) => !Number.isFinite(f))) return null;
  const division = q.includes('÷');
  return termine
    ? <Retournements facteurs={facteurs} division={division} />
    : (
      <div className={`${P}__plaques`}>
        {facteurs.map((f, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__plaque${f < 0 ? ' est-negative' : ''}`}>{f < 0 ? `(−${-f})` : `(+${f})`}</span>
        ))}
        <Fleche signe={null} />
      </div>
    );
}

/** À chaque signe moins, la flèche se retourne ; puis on multiplie (ou divise) les distances à zéro. */
function Retournements({ facteurs, division }) {
  const k = useEtapes(facteurs.length + 1, 750, 450);
  const vus = facteurs.slice(0, Math.min(k, facteurs.length));
  const moins = vus.filter((f) => f < 0).length;
  const signe = k === 0 ? 1 : (-1) ** moins;
  const distances = facteurs.map(Math.abs);
  const valeur = division ? distances[0] / distances[1] : distances.reduce((a, b) => a * b, 1);
  const fini = k > facteurs.length;
  const total = facteurs.filter((f) => f < 0).length;
  return (
    <div className={`${P}__hall`}>
      <div className={`${P}__plaques`}>
        {facteurs.map((f, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__plaque${f < 0 ? ' est-negative' : ''}${i < k ? ' est-lue' : ''}`}>{f < 0 ? `(−${-f})` : `(+${f})`}</span>
        ))}
        <Fleche signe={signe} />
      </div>
      <ol className={`${P}__registre`} aria-label="Le calcul">
        <li className="est-pose">{`Signes moins comptés : ${moins}${fini ? ` — ${total % 2 ? 'impair : résultat négatif' : 'pair : résultat positif'}` : ''}`}</li>
        <li className={fini ? 'est-pose' : ''}>{`Distances à zéro : ${distances.join(division ? ' ÷ ' : ' × ')} = ${ecrire(valeur)}`}</li>
        <li className={fini ? 'est-pose' : ''}>{`Résultat : ${ecrire((total % 2 ? -1 : 1) * valeur)}`}</li>
      </ol>
    </div>
  );
}

/** a ± b × (c) : la multiplication d'abord, avec sa règle des signes, puis l'addition. */
function Priorites({
  a, s, b, c, termine,
}) {
  const k = useEtapes(termine ? 2 : 0, 1200, 400);
  const sb = s * b;
  const produit = sb * c;
  return (
    <div className={`${P}__hall`}>
      <div className={`${P}__plaques`}>
        <span className={`${P}__plaque${a < 0 ? ' est-negative' : ''}`}>{ecrire(a)}</span>
        <span className={`${P}__operation`}>{s > 0 ? '+' : '−'}</span>
        <span className={`${P}__groupe${termine && k >= 1 ? ' est-lue' : ''}`}>
          <span className={`${P}__plaque`}>{b}</span>
          <span className={`${P}__operation`}>×</span>
          <span className={`${P}__plaque est-negative`}>{`(${ecrire(c)})`}</span>
        </span>
      </div>
      {termine && (
        <ol className={`${P}__registre`} aria-label="Le calcul">
          <li className={k >= 1 ? 'est-pose' : ''}>{`D’abord la multiplication : ${ecrire(sb)} × (${ecrire(c)}) = ${ecrire(produit)}`}</li>
          <li className={k >= 2 ? 'est-pose' : ''}>{`Puis l’addition : ${ecrire(a)} + (${ecrire(produit)}) = ${ecrire(a + produit)}`}</li>
        </ol>
      )}
    </div>
  );
}

const SORTES = {
  'addition-relatifs': Trajet,
  'soustraction-relatifs': Trajet,
  ascenseur: Trajet,
  'ecart-temperature': Temperature,
  'produit-relatifs': Signes,
  'quotient-relatifs': Signes,
  'plusieurs-facteurs': Signes,
  'calcul-priorites': Signes,
};

export function QuestionAscenseur({ m, termine }) {
  const Sorte = SORTES[m.consigne];
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Enonce m={m} classe={`${P}__plaque-doree`} />
      {Sorte && <Sorte key={termine ? 'apres' : 'avant'} m={m} termine={termine} />}
    </div>
  );
}

/** Les réponses : le tableau de bord de la cabine, ses boutons d'appel en laiton. */
export function TableauDeBord({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__tableau`}>
      <span className={`${P}__tableau-titre`} aria-hidden="true">Appelle le bon étage</span>
      <ul className={`${P}__boutons`} aria-label="Choisis ta réponse">
        {choix.map(({ cle, libelle }, i) => (
          <li key={cle} style={{ '--i': i }}>
            <button {...proprietesChoix(cle, fautes, choisir)} className={`${P}__bouton${fautes.includes(cle) ? ' est-faux' : ''}`}>
              {libelle}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const sceneAscenseur = {
  question: (m, termine) => <QuestionAscenseur m={m} termine={termine} />,
  choix: (props) => <TableauDeBord {...props} />,
};
