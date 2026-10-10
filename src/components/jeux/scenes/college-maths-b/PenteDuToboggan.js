import { avecVisuel } from '../base';
import { Enonce, ecrire, useEtapes } from './commun';

/**
 * LE PARC AU COUCHANT — « La pente du toboggan » (4e, 3e), le 09/10/2026.
 * La couverture : un grand toboggan d'acier sur une colline, la ville et la
 * mer au soleil couchant, une fille en veste orange qui s'apprête à glisser.
 *   - AVANT : le dessin de la question (le toboggan coté) sur une pancarte
 *     du parc, l'énoncé dessous, le soleil qui descend doucement ;
 *   - APRÈS : un toboggan de couleur : le côté ADJACENT en bleu, l'OPPOSÉ en
 *     vert, l'HYPOTÉNUSE en orange — et une bille qui y glisse. Le tableau
 *     SOH-CAH-TOA allume le bon rapport, et le calcul se pose ligne à ligne.
 */

const P = 'sc-pente-du-toboggan';
const RAD = Math.PI / 180;
const COTES = { sin: ['opp', 'hyp'], cos: ['adj', 'hyp'], tan: ['opp', 'adj'] };
const NOMS = { sin: 'sinus', cos: 'cosinus', tan: 'tangente' };
const ROLES = { adj: 'adjacent', opp: 'opposé', hyp: 'hypoténuse' };
const FONCTIONS = { sin: Math.sin, cos: Math.cos, tan: Math.tan };
const ARCS = { sin: Math.asin, cos: Math.acos, tan: Math.atan };

const rapportDe = (x, y) => Object.keys(COTES).find((f) => COTES[f].includes(x) && COTES[f].includes(y));
const arrondi = (x, n = 3) => ecrire(Math.round(x * 10 ** n) / 10 ** n);

/** Le triangle de la question : l'angle droit, l'angle étudié, et le rôle de chaque côté. */
function lire(q) {
  const droit = (q.match(/rectangle en (\w)/) ?? [])[1];
  const angle = (q.match(/angle (\w{3})/i) ?? [])[1];
  if (!droit || !angle) return null;
  const [W, V] = angle;
  const role = (seg) => {
    if (seg.includes(V) && seg.includes(droit)) return 'adj';
    if (seg.includes(droit) && seg.includes(W)) return 'opp';
    return 'hyp';
  };
  const mesure = Number((q.match(/= (\d+)°/) ?? [])[1]);
  const donnees = [...q.matchAll(/(\w{2}) = (\d+) cm/g)].map((r) => ({ seg: r[1], role: role(r[1]), v: Number(r[2]) }));
  const cherche = (q.match(/(\w{2}) (?:≈|=) \?/) ?? [])[1];
  const connu = (q.match(/On connaît l’angle \w{3} et (\w{2})/) ?? [])[1];
  const voulu = (q.match(/on cherche (\w{2})/) ?? [])[1];
  return {
    angle, role, mesure, donnees, cherche, connu, voulu,
  };
}

/** Les lignes du calcul, et le rapport à allumer. */
function explication(m) {
  const t = lire(String(m.question));
  if (!t) return null;
  const bonne = String(m.bonne);
  const { angle, role } = t;
  if (m.consigne === 'cosinus-rapport') {
    return { f: 'cos', lignes: [`cos(${angle}) = adjacent ÷ hypoténuse`, `= ${bonne}`] };
  }
  if (m.consigne === 'choisir-rapport' && t.connu && t.voulu) {
    const f = rapportDe(role(t.connu), role(t.voulu));
    return {
      f,
      roles: { [role(t.connu)]: t.connu, [role(t.voulu)]: '?' },
      lignes: [`${t.connu} est l’${ROLES[role(t.connu)]}, ${t.voulu} l’${ROLES[role(t.voulu)]}`, `Ces deux côtés-là : le ${NOMS[f]}`],
    };
  }
  if ((m.consigne === 'cosinus-longueur' || m.consigne === 'trigo-longueur') && t.donnees.length && t.cherche && t.mesure) {
    const d = t.donnees[0];
    const rc = role(t.cherche);
    const f = rapportDe(d.role, rc);
    if (!f) return null;
    const val = FONCTIONS[f](t.mesure * RAD);
    const [haut] = COTES[f];
    const enHaut = rc === haut;
    return {
      f,
      roles: { [d.role]: `${d.v} cm`, [rc]: '?' },
      lignes: [
        `${f}(${t.mesure}°) = ${COTES[f].map((r) => (r === d.role ? d.seg : t.cherche)).join(' ÷ ')}`,
        enHaut
          ? `${t.cherche} = ${d.v} × ${f}(${t.mesure}°) = ${d.v} × ${arrondi(val)}`
          : `${t.cherche} = ${d.v} ÷ ${f}(${t.mesure}°) = ${d.v} ÷ ${arrondi(val)}`,
        `${t.cherche} ≈ ${bonne}`,
      ],
    };
  }
  if ((m.consigne === 'cosinus-angle' || m.consigne === 'trigo-angle') && t.donnees.length === 2) {
    const [a, b] = t.donnees;
    const f = rapportDe(a.role, b.role);
    if (!f) return null;
    const [haut] = COTES[f];
    const [h, bas] = a.role === haut ? [a, b] : [b, a];
    const x = h.v / bas.v;
    return {
      f,
      roles: { [a.role]: `${a.v} cm`, [b.role]: `${b.v} cm` },
      lignes: [
        `${f}(${angle}) = ${h.seg} ÷ ${bas.seg} = ${h.v} ÷ ${bas.v} ≈ ${arrondi(x)}`,
        `${angle} = ${f === 'sin' ? 'arcsin' : f === 'cos' ? 'arccos' : 'arctan'}(${arrondi(x)}) ≈ ${arrondi(ARCS[f](x) / RAD, 1)}°`,
        `${angle} ≈ ${bonne}`,
      ],
    };
  }
  return null;
}

/** Le toboggan de couleur : adjacent bleu, opposé vert, hypoténuse orange, et la bille qui glisse. */
function TobogganCouleur({ roles = {}, f }) {
  const W = [40, 30];
  const Pp = [40, 160];
  const V = [250, 160];
  const allume = (r) => (f && COTES[f].includes(r) ? ' est-allume' : '');
  return (
    <svg viewBox="0 0 290 190" className={`${P}__couleurs`} aria-hidden="true" focusable="false">
      <line x1={Pp[0]} y1={Pp[1]} x2={V[0]} y2={V[1]} className={`${P}__cote ${P}__cote--adj${allume('adj')}`} />
      <line x1={W[0]} y1={W[1]} x2={Pp[0]} y2={Pp[1]} className={`${P}__cote ${P}__cote--opp${allume('opp')}`} />
      <line x1={W[0]} y1={W[1]} x2={V[0]} y2={V[1]} className={`${P}__cote ${P}__cote--hyp${allume('hyp')}`} />
      <path d={`M${Pp[0]} ${Pp[1] - 12} h12 v12`} className={`${P}__droit`} />
      <path d={`M${V[0] - 34} ${V[1]} A34 34 0 0 1 ${V[0] - 34 * Math.cos(Math.atan2(130, 210))} ${V[1] - 34 * Math.sin(Math.atan2(130, 210))}`} className={`${P}__arc`} />
      <circle r="9" className={`${P}__bille`} />
      <text x="145" y="182" textAnchor="middle" className={`${P}__role ${P}__role--adj`}>{`adjacent${roles.adj ? ` : ${roles.adj}` : ''}`}</text>
      <text x="30" y="100" textAnchor="end" className={`${P}__role ${P}__role--opp`} transform="rotate(-90 30 100)">{`opposé${roles.opp ? ` : ${roles.opp}` : ''}`}</text>
      <text x="160" y="84" textAnchor="middle" className={`${P}__role ${P}__role--hyp`} transform="rotate(32 160 84)">{`hypoténuse${roles.hyp ? ` : ${roles.hyp}` : ''}`}</text>
    </svg>
  );
}

/** SOH-CAH-TOA : le bon rapport s'allume. */
function Sohcahtoa({ f }) {
  return (
    <div className={`${P}__table`}>
      {Object.keys(COTES).map((g) => (
        <span key={g} className={`${P}__rapport${g === f ? ' est-choisi' : ''}`}>
          <b>{NOMS[g]}</b>
          <i>{`${ROLES[COTES[g][0]]} ÷ ${ROLES[COTES[g][1]]}`}</i>
        </span>
      ))}
    </div>
  );
}

function Glissade({ m }) {
  const e = explication(m);
  const lignes = e?.lignes ?? [`= ${m.bonne}`];
  const k = useEtapes(lignes.length + 1, 1100, 400);
  return (
    <div className={`${P}__atelier`}>
      <TobogganCouleur roles={e?.roles} f={k >= 1 ? e?.f : null} />
      {e?.f && <Sohcahtoa f={k >= 1 ? e.f : null} />}
      <ol className={`${P}__carnet`} aria-label="Le calcul">
        {lignes.map((l, i) => <li key={l} className={i < k - 1 ? 'est-pose' : ''}>{l}</li>)}
      </ol>
    </div>
  );
}

export function QuestionToboggan({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__pancarte`}>
        <span className={`${P}__soleil`} aria-hidden="true" />
        {avecVisuel(m, <Enonce m={m} classe={`${P}__texte`} />)}
      </div>
      {termine && <Glissade m={m} />}
    </div>
  );
}


export const sceneToboggan = {
  question: (m, termine) => <QuestionToboggan m={m} termine={termine} />,
  objets: P,
};
