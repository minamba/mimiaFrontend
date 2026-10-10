import { avecVisuel } from '../base';
import { Reponses, Texte, sur } from './commun';

/**
 * LES TERRASSES DES FONCTIONS DE RÉFÉRENCE (09/10/2026). La couverture : des
 * terrasses de marbre au-dessus de la mer, au coucher du soleil, des canaux
 * d'eau claire, une sphère armillaire, des pavés de marbre posés sur l'eau.
 *   - LA QUESTION est sur un panneau de marbre, à côté de la courbe du module
 *     (gardée telle quelle) ; une sphère armillaire tourne au-dessus ;
 *   - POUR COMPARER (deux nombres, deux images), une balance de marbre porte
 *     les deux quantités : elle hésite avant la réponse, penche du bon côté
 *     après — ou reste en suspens quand « on ne peut pas conclure » ;
 *   - LES RÉPONSES sont des pavés de marbre qui flottent sur le canal : on
 *     saute sur le bon (`choix`).
 */

const P = 'sc-fonctions-de-reference';

/** Les deux plateaux de la balance, ou null : « 1/3,4 … 1/3 », « Que dire de a² et b² ? ». */
export function plateauxDe(m) {
  const q = String(m.question);
  if (m.consigne === 'comparer-nombres') {
    const [g, d] = q.split('…').map((s) => s.trim());
    return g && d ? { gauche: g, droite: d } : null;
  }
  if (m.consigne === 'comparer-images') {
    const r = q.match(/Que dire de (.+) et (.+) \?/);
    return r ? { gauche: r[1], droite: r[2] } : null;
  }
  return null;
}

const COMPORTEMENTS = {
  carré: 'x ↦ x² descend jusqu’en 0, puis remonte : minimum 0, atteint en 0.',
  cube: 'x ↦ x³ monte toujours, sur tout ℝ : elle garde l’ordre.',
  inverse: 'x ↦ 1/x descend sur ]−∞ ; 0[ et sur ]0 ; +∞[ : elle retourne l’ordre.',
  'racine carrée': 'x ↦ √x monte toujours, sur [0 ; +∞[ : elle garde l’ordre.',
};

/** LA LEÇON DE LA TERRASSE, après la réponse : le comportement de la fonction en jeu. */
export function leconDe(m) {
  const q = String(m.question);
  if (m.consigne === 'extremum-tableau') return 'On lit la ligne f(x) : la plus haute valeur est le maximum, la plus basse le minimum.';
  const nom = (q.match(/la fonction (carré|cube|inverse|racine carrée)/) ?? [])[1]
    ?? (/√/.test(q) ? 'racine carrée' : /²/.test(q) ? 'carré' : /³/.test(q) ? 'cube' : /1\//.test(q) ? 'inverse' : null); // eslint-disable-line no-nested-ternary
  return nom ? COMPORTEMENTS[nom] : null;
}

/** Le sens de la balance une fois la réponse donnée : −1 penche à gauche, 1 à droite, 0 en suspens. */
function penchant(m) {
  const b = String(m.bonne);
  if (m.consigne === 'comparer-nombres') return b === '>' ? -1 : 1;
  if (/</.test(b)) return 1;
  if (/>/.test(b)) return -1;
  return 0;
}

function SphereArmillaire() {
  return (
    <svg className={`${P}__sphere`} viewBox="0 0 120 130" aria-hidden="true" focusable="false">
      <circle cx="60" cy="56" r="44" className={`${P}__anneau`} />
      <ellipse cx="60" cy="56" rx="44" ry="14" className={`${P}__anneau ${P}__anneau--tourne`} />
      <ellipse cx="60" cy="56" rx="14" ry="44" className={`${P}__anneau ${P}__anneau--tourne ${P}__anneau--lent`} />
      <ellipse cx="60" cy="56" rx="44" ry="20" className={`${P}__anneau ${P}__anneau--penche`} />
      <circle cx="60" cy="56" r="9" className={`${P}__soleil`} />
      <path d="M50 102 L70 102 L66 112 L54 112 Z M44 112 H76 V120 H44 Z" className={`${P}__pied`} />
    </svg>
  );
}

function Balance({ gauche, droite, sens }) {
  const angle = sens === null ? null : sens * 12;
  return (
    <svg className={`${P}__balance${sens === null ? ' est-hesitante' : ''}${sens === 0 ? ' est-en-suspens' : ''}`} viewBox="0 0 300 120" aria-hidden="true" focusable="false">
      <path d="M150 30 L138 110 H162 Z" className={`${P}__colonne`} />
      <rect x="118" y="106" width="64" height="10" rx="3" className={`${P}__colonne`} />
      <g className={`${P}__fleau`} style={angle === null ? undefined : { transform: `rotate(${angle}deg)` }}>
        <rect x="40" y="26" width="220" height="8" rx="4" />
        <g className={`${P}__plateau`}>
          <line x1="60" y1="34" x2="40" y2="70" />
          <line x1="60" y1="34" x2="80" y2="70" />
          <path d="M30 70 H90 Q60 86 30 70 Z" />
          <text x="60" y="62" textAnchor="middle">{gauche}</text>
        </g>
        <g className={`${P}__plateau`}>
          <line x1="240" y1="34" x2="220" y2="70" />
          <line x1="240" y1="34" x2="260" y2="70" />
          <path d="M210 70 H270 Q240 86 210 70 Z" />
          <text x="240" y="62" textAnchor="middle">{droite}</text>
        </g>
      </g>
      <circle cx="150" cy="30" r="7" className={`${P}__pivot`} />
      {sens === 0 && <text x="150" y="20" textAnchor="middle" className={`${P}__doute`}>?</text>}
    </svg>
  );
}

export function QuestionFonctions({ m, termine }) {
  const plateaux = sur(() => plateauxDe(m));
  const lecon = termine ? sur(() => leconDe(m)) : null;
  const panneau = (
    <div className={`${P}__panneau`}>
      <SphereArmillaire />
      <div className={`${P}__marbre`}>
        <Texte m={m} classe={`${P}__texte`} />
        {plateaux && <Balance {...plateaux} sens={termine ? penchant(m) : null} />}
        {termine && lecon && <p className={`${P}__lecon`}>{lecon}</p>}
      </div>
    </div>
  );
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      {avecVisuel(m, panneau)}
    </div>
  );
}

/** Les pavés de marbre sur le canal : on saute sur le bon. */
export function PavesFonctions({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__canal`}>
      <Reponses
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        prefixe={P}
        etiquette="Saute sur le bon pavé"
        decor={() => <span className={`${P}__reflet`} aria-hidden="true" />}
      />
    </div>
  );
}
