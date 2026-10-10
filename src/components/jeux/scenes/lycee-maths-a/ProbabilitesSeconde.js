import { Texte, sur, useDeroule } from './commun';

/**
 * LA SERRE AUX BILLES (09/10/2026). La couverture : une serre de verre et de
 * fer vert, des colonnes de verre où tombent des billes blanches et vertes,
 * des bassins de billes au sol.
 *   - LA QUESTION est sur une vitre de la serre ; à côté, la colonne de verre
 *     où les billes tombent sans fin ;
 *   - L'ÉNONCÉ EST DESSINÉ EN BILLES : les issues du dé ou de l'urne, les
 *     cases du tableau croisé (des bocaux, leurs effectifs), les ensembles A
 *     et B (deux bassins qui se chevauchent) ;
 *   - LES RÉPONSES sont des bocaux de billes (`objets`) ;
 *   - APRÈS LA RÉPONSE, les bonnes billes s'allument : les issues de
 *     l'événement demandé, les bocaux qu'on additionne (33 + 11 + 27 = 71),
 *     la partie du bassin qui correspond (A ∪ B, A ∩ B, Ā).
 */

const P = 'sc-probabilites-seconde';

/** Une propriété d'issue : « le résultat est impair », « … inférieur ou égal à 4 »… */
function predicat(texte) {
  const t = String(texte);
  let r;
  if (/impair/.test(t)) return (n) => n % 2 === 1;
  if (/pair/.test(t)) return (n) => n % 2 === 0;
  if ((r = t.match(/inférieur ou égal à (\d+)/))) return (n) => n <= Number(r[1]); // eslint-disable-line no-cond-assign
  if ((r = t.match(/supérieur ou égal à (\d+)/))) return (n) => n >= Number(r[1]); // eslint-disable-line no-cond-assign
  if ((r = t.match(/multiple de (\d+)/))) return (n) => n % Number(r[1]) === 0; // eslint-disable-line no-cond-assign
  if ((r = t.match(/strictement inférieur à (\d+)/))) return (n) => n < Number(r[1]); // eslint-disable-line no-cond-assign
  if ((r = t.match(/strictement supérieur à (\d+)/))) return (n) => n > Number(r[1]); // eslint-disable-line no-cond-assign
  return null;
}

/** Les issues (dé ou urne), l'appartenance à A et à B, et l'ensemble-réponse. */
export function issuesDe(m) {
  if (m.consigne !== 'evenements') return null;
  const q = String(m.question);
  const r = q.match(/de 1 à (\d+)/);
  const n = /dé à six faces/.test(q) ? 6 : r ? Number(r[1]) : null; // eslint-disable-line no-nested-ternary
  if (!n || n > 12) return null;
  const a = q.match(/A : « ([^»]+) »/);
  const b = q.match(/B : « ([^»]+) »/);
  const pa = a ? predicat(a[1]) : null;
  const pb = b ? predicat(b[1]) : null;
  const bonne = String(m.bonne) === '∅' ? [] : (String(m.bonne).match(/\d+/g) ?? []).map(Number);
  return {
    sorte: /dé/.test(q) ? 'de' : 'urne',
    issues: Array.from({ length: n }, (_, i) => ({
      n: i + 1, dansA: pa ? pa(i + 1) : false, dansB: pb ? pb(i + 1) : false, bonne: bonne.includes(i + 1),
    })),
  };
}

/** Le tableau croisé : 2 lignes × 2 colonnes, l'effectif total, et les cases à additionner. */
export function tableauDe(m) {
  if (m.consigne !== 'tableau-croise') return null;
  const lignes = String(m.question).split('\n');
  const total = Number((lignes[0].match(/\((\d+) au total\)/) ?? [])[1]);
  const lire = (l) => l.match(/^(.+?) : (\d+) (.+?), (\d+) (.+)$/);
  const l1 = lire(lignes[1] ?? '');
  const l2 = lire(lignes[2] ?? '');
  const evts = String(m.question).match(/(\w) : « [^»]+ » ; (\w) : « [^»]+ »/);
  const demande = String(m.question).match(/P\((\w)(?: ([∩∪]) (\w))?\) = \?/);
  if (!l1 || !l2 || !evts || !demande || !total) return null;
  const [, ligneEvt, colonneEvt] = evts;
  const dans = (i, j, e) => (e === ligneEvt ? i === 0 : e === colonneEvt ? j === 0 : false); // eslint-disable-line no-nested-ternary
  const compte = (i, j) => {
    const x = dans(i, j, demande[1]);
    if (!demande[2]) return x;
    const y = dans(i, j, demande[3]);
    return demande[2] === '∩' ? x && y : x || y;
  };
  const cases = [[Number(l1[2]), Number(l1[4])], [Number(l2[2]), Number(l2[4])]];
  return {
    total,
    lignes: [l1[1], l2[1]],
    colonnes: [l1[3], l1[5]],
    cases: cases.map((ligne, i) => ligne.map((n, j) => ({ n, compte: compte(i, j) }))),
  };
}

/** Les deux bassins A et B : quelle partie s'allume après la réponse. */
export function bassinsDe(m) {
  if (!['contraire', 'formule-union', 'formule-inter'].includes(m.consigne)) return null;
  const demande = String(m.question).split('\n').pop();
  if (/A ∪ Ā|A ∩ Ā/.test(demande)) return { partie: /∪/.test(demande) ? 'tout' : 'rien', seulA: true };
  if (/P\(Ā\)/.test(demande)) return { partie: 'contraire', seulA: true };
  if (/^P\(A\) = \?/.test(demande)) return { partie: 'a', seulA: true };
  if (/A ∪ B/.test(demande)) return { partie: 'union', seulA: false };
  if (/A ∩ B/.test(demande)) return { partie: 'inter', seulA: false };
  return null;
}

function Colonne() {
  return (
    <svg className={`${P}__colonne`} viewBox="0 0 80 160" aria-hidden="true" focusable="false">
      <rect x="22" y="6" width="36" height="128" rx="14" className={`${P}__verre`} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={34 + (i % 2) * 12} cy="20" r="6" className={`${P}__bille-tombe${i % 2 ? ' est-verte' : ''}`} style={{ '--i': i }} />
      ))}
      <ellipse cx="40" cy="148" rx="36" ry="10" className={`${P}__bassin-sol`} />
      <circle cx="26" cy="146" r="5" className={`${P}__bille-sol`} />
      <circle cx="40" cy="149" r="5" className={`${P}__bille-sol est-verte`} />
      <circle cx="54" cy="146" r="5" className={`${P}__bille-sol`} />
      <path d="M10 6 V160 M70 6 V160" className={`${P}__fer`} />
    </svg>
  );
}

function Issues({ sorte, issues, termine }) {
  return (
    <ul className={`${P}__issues${termine ? ' est-termine' : ''}`} aria-label={sorte === 'de' ? 'Les faces du dé' : 'Les boules de l’urne'}>
      {issues.map((x) => (
        <li
          key={x.n}
          className={`${P}__issue${termine && x.bonne ? ' est-bonne' : ''}${termine && x.dansA ? ' est-dans-a' : ''}${termine && x.dansB ? ' est-dans-b' : ''}`}
          style={{ '--i': x.n }}
        >
          {x.n}
        </li>
      ))}
    </ul>
  );
}

function Bocaux({ tableau, termine }) {
  const allumes = tableau.cases.flat().filter((c) => c.compte);
  const n = useDeroule(termine ? allumes.length : 0, 500);
  return (
    <div className={`${P}__tableau`}>
      <table>
        <thead>
          <tr>
            <th aria-hidden="true" />
            {tableau.colonnes.map((c) => <th key={c}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {tableau.cases.map((ligne, i) => (
            <tr key={tableau.lignes[i]}>
              <th>{tableau.lignes[i]}</th>
              {ligne.map((c, j) => {
                const allume = termine && c.compte && allumes.indexOf(c) < n;
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <td key={j} className={allume ? 'est-allume' : ''}>
                    <span className={`${P}__bocal`} style={{ '--remplissage': Math.min(1, c.n / Math.max(1, tableau.total / 2)) }} aria-hidden="true" />
                    <strong>{c.n}</strong>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {termine && allumes.length > 0 && n >= allumes.length && (
        <p className={`${P}__somme`}>
          {`${allumes.map((c) => c.n).join(' + ')} = ${allumes.reduce((s, c) => s + c.n, 0)}  sur ${tableau.total}`}
        </p>
      )}
    </div>
  );
}

function Bassins({ partie, seulA, termine }) {
  const id = `${P}-a`;
  return (
    <svg className={`${P}__bassins${termine ? ` est-${partie}` : ''}`} viewBox="0 0 220 120" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={id}><circle cx={seulA ? 110 : 88} cy="60" r="42" /></clipPath>
      </defs>
      <rect x="4" y="4" width="212" height="112" rx="14" className={`${P}__univers`} />
      <circle cx={seulA ? 110 : 88} cy="60" r="42" className={`${P}__ensemble ${P}__ensemble--a`} />
      {!seulA && <circle cx="132" cy="60" r="42" className={`${P}__ensemble ${P}__ensemble--b`} />}
      {!seulA && <circle cx="132" cy="60" r="42" clipPath={`url(#${id})`} className={`${P}__intersection`} />}
      <text x={seulA ? 110 : 70} y="66" textAnchor="middle">A</text>
      {!seulA && <text x="150" y="66" textAnchor="middle">B</text>}
      {seulA && <text x="190" y="28" textAnchor="middle">Ā</text>}
      {termine && partie === 'rien' && <text x="110" y="108" textAnchor="middle" className={`${P}__vide`}>A ∩ Ā = ∅</text>}
    </svg>
  );
}

export function QuestionProbabilitesSeconde({ m, termine }) {
  const issues = sur(() => issuesDe(m));
  const tableau = sur(() => tableauDe(m));
  const bassins = sur(() => bassinsDe(m));
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__serre`}>
        <Colonne />
        <div className={`${P}__vitre`}>
          <Texte m={m} classe={`${P}__texte`} />
        </div>
      </div>
      {issues && <Issues {...issues} termine={termine} />}
      {tableau && <Bocaux key={String(termine)} tableau={tableau} termine={termine} />}
      {bassins && <Bassins {...bassins} termine={termine} />}
    </div>
  );
}
