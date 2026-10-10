/**
 * LES BRIQUES DES SCÈNES « COLLÈGE, MATHS A » (09/10/2026) — lire un nombre
 * écrit à la française, calculer juste avec des fractions, faire apparaître
 * une explication pas à pas. Rien d'affiché ici : chaque jeu garde son
 * univers et ses classes (`sc-<cle-du-jeu>__…`), ces briques reçoivent le
 * préfixe du jeu qui les emploie.
 *
 * LA RÈGLE D'OR : avant la réponse, rien de calculé ; une fois la réponse
 * donnée, l'explication tombe ligne à ligne (des retards CSS, aucune
 * minuterie), et sous `prefers-reduced-motion`, tout est là d'un coup.
 */

/** Les espaces d'un nombre écrit à la française : espace, insécable, fine insécable. */
const ESPACES = /[\s  ]/g;

/** Un nombre écrit à la française (« 4 609 567 », « 21,771 », « −3 »). */
export const MOTIF_NOMBRE = /[−-]?\d{1,3}(?:[   ]\d{3})+(?:,\d+)?|[−-]?\d+(?:,\d+)?/g;

/** « 3 450,25 » → 3450.25 ; illisible → null. */
export function lireNombre(texte) {
  if (texte === null || texte === undefined) return null;
  const t = String(texte).replace(ESPACES, '').replace('−', '-').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}

/** Tous les nombres d'un texte, dans l'ordre. */
export function nombresDe(texte) {
  return (String(texte ?? '').match(MOTIF_NOMBRE) ?? []).map(lireNombre).filter((n) => n !== null);
}

/** Un nombre écrit à la française : virgule, et milliers séparés dès 10 000 (« 4 760 » aussi). */
export function ecrireNombre(x, { grouper = true } = {}) {
  if (!Number.isFinite(x)) return '?';
  const arrondi = Math.round(x * 1e9) / 1e9;
  const negatif = arrondi < 0;
  const [entier, decimales] = Math.abs(arrondi).toString().split('.');
  const groupe = grouper && entier.length > 3 ? entier.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : entier;
  return `${negatif ? '−' : ''}${groupe}${decimales ? `,${decimales}` : ''}`;
}

/** Le plus grand diviseur commun, et le plus petit multiple commun. */
export function pgcd(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) [x, y] = [y, x % y];
  return x || 1;
}
export const ppcm = (a, b) => Math.abs((a / pgcd(a, b)) * b);

/** Une fraction { n, d } : « 3/4 », « 21 » (d = 1), « −2/5 ». */
export function lireFraction(texte) {
  const t = String(texte ?? '').replace(ESPACES, '').replace('−', '-');
  const f = /^(-?\d+)\/(\d+)$/.exec(t);
  if (f && Number(f[2]) !== 0) return { n: Number(f[1]), d: Number(f[2]) };
  if (/^-?\d+$/.test(t)) return { n: Number(t), d: 1 };
  return null;
}

export const ecrireFraction = ({ n, d }) => (d === 1 ? `${n}` : `${n}/${d}`);

export function reduire({ n, d }) {
  const g = pgcd(n, d);
  const s = d < 0 ? -1 : 1;
  return { n: (s * n) / g, d: (s * d) / g };
}

export const plus = (a, b) => reduire({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
export const moins = (a, b) => reduire({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
export const fois = (a, b) => reduire({ n: a.n * b.n, d: a.d * b.d });
export const divise = (a, b) => reduire({ n: a.n * b.d, d: a.d * b.n });
export const egales = (a, b) => a.n * b.d === b.n * a.d;

/** Le libellé de la bonne réponse, tel que l'enfant l'a vu sur le bouton. */
export function libelleBonne(m) {
  const c = (m.choix ?? []).find((x) => String(x.cle) === String(m.bonne));
  return typeof c?.libelle === 'string' ? c.libelle : String(m.bonne ?? '');
}

/**
 * LES LIGNES D'UNE EXPLICATION tombent l'une après l'autre : chaque ligne
 * porte son retard (`--d`), le CSS du jeu fait le reste.
 */
export function Etapes({ p, lignes, depart = 0.2, pas = 0.75 }) {
  return (
    <ol className={`${p}__etapes`}>
      {lignes.filter(Boolean).map((ligne, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={i} className={`${p}__etape`} style={{ '--d': `${(depart + i * pas).toFixed(2)}s` }}>{ligne}</li>
      ))}
    </ol>
  );
}

/** La bonne réponse, au bout de l'explication — toujours, quoi qu'on ait su dessiner. */
export function Resultat({ p, m, retard = 0, avant = '' }) {
  return (
    <p className={`${p}__resultat`} style={{ '--d': `${retard.toFixed(2)}s` }}>
      {avant ? <span className={`${p}__resultat-avant`}>{avant}</span> : null}
      <strong>{libelleBonne(m)}</strong>
    </p>
  );
}

/**
 * L'EXPLICATION D'UNE MANCHE : le dessin du jeu (s'il a su lire la question),
 * sinon un simple rappel de la bonne réponse — jamais rien de vide, jamais
 * d'exception. `data-repli` marque ce repli : les tests vérifient qu'aucune
 * sorte de manche n'y tombe.
 */
export function Explication({ p, m, contenu, retard = 0 }) {
  let rendu = null;
  try {
    rendu = contenu();
  } catch {
    rendu = null;
  }
  if (!rendu) {
    return (
      <div className={`${p}__explication`} data-explication data-repli>
        <Resultat p={p} m={m} avant="La bonne réponse : " />
      </div>
    );
  }
  return (
    <div className={`${p}__explication`} data-explication>
      {rendu}
      <Resultat p={p} m={m} retard={retard} />
    </div>
  );
}

/** Une heure ou une durée : « 7 h 45 », « 2 h 55 min », « 105 min » → minutes. */
export function lireDuree(texte) {
  const t = String(texte ?? '');
  const hm = /(\d+(?:,\d+)?)\s*h(?:\s*(\d+))?/.exec(t);
  if (hm) return Math.round(lireNombre(hm[1]) * 60) + (hm[2] ? Number(hm[2]) : 0);
  const mn = /(\d+)\s*min/.exec(t);
  return mn ? Number(mn[1]) : null;
}

/** Des minutes → « 2 h 55 min » (durée) ou « 19 h 25 » (heure de la journée). */
export function ecrireDuree(minutes, { heure = false } = {}) {
  const h = Math.floor(minutes / 60);
  const mn = minutes % 60;
  if (heure) return mn ? `${h % 24} h ${String(mn).padStart(2, '0')}` : `${h % 24} h`;
  if (h === 0) return `${mn} min`;
  return mn ? `${h} h ${mn} min` : `${h} h`;
}
