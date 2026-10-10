import { fr, lireNombre, rangee, useDeroule } from './communs';
import './primaire-maths-a.css';

/**
 * MASSES ET CONTENANCES (CM1) ET LES LONGUEURS (CM2) — 09/10/2026. L'écran est
 * celui du « mètre ruban ». La couverture du CM1 : une fontaine où l'on verse
 * l'eau d'un pichet gradué dans un bécher, une balance à plateaux et ses
 * poids, un poteau indicateur « kg, g, L, mL » ; celle du CM2, un mètre ruban
 * jaune déroulé sur un pont, et le poteau « mm, cm, m, km ». La scène :
 *   - LA QUESTION sur une étiquette (au CM2, sur un ruban jaune), à côté du
 *     poteau indicateur qui montre l'unité de départ et l'unité d'arrivée ;
 *     dessous, l'instrument de la grandeur : la balance qui oscille, le
 *     pichet qui verse dans le bécher, ou le ruban que parcourt un escargot ;
 *   - LES RÉPONSES : des étiquettes à ficelle (au CM2, des bouts de ruban)
 *     (`objets: 'sc-mesures-cm1'`) ;
 *   - APRÈS LA RÉPONSE : LE TABLEAU DE CONVERSION. Les chiffres tombent dans
 *     leurs colonnes, la virgule derrière l'unité de départ ; les zéros
 *     arrivent remplir les colonnes vides ; puis la virgule SAUTE derrière
 *     l'unité d'arrivée, et le résultat se lit.
 */

/** Les tableaux de conversion : une colonne par unité, chacune dix fois la suivante. */
const TABLES = {
  masses: ['t', '', '', 'kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'],
  contenances: ['hL', 'daL', 'L', 'dL', 'cL', 'mL'],
  longueurs: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'],
};

/** Ce que dit la question : le nombre de départ, son unité, l'unité d'arrivée. */
export function lireMesure(m) {
  const r = String(m?.question ?? '').match(/^([\d,]+) (\S+) = \? (\S+)$/);
  if (!r) return null;
  const famille = Object.keys(TABLES).find((f) => TABLES[f].includes(r[2]) && TABLES[f].includes(r[3]));
  if (!famille) return null;
  return {
    texte: r[1], de: r[2], vers: r[3], famille,
  };
}

/**
 * LE TABLEAU DE CONVERSION, CASE PAR CASE. Rend les colonnes à montrer, les
 * chiffres du départ, les zéros ajoutés, la place de la virgule avant et
 * après, et le résultat lu dans le tableau — ou `null` si la question ne se
 * range pas (on retombe alors sur un habillage simple).
 */
export function placerDansLeTableau(question) {
  const lu = lireMesure({ question });
  if (!lu) return null;
  const table = TABLES[lu.famille];
  const [entier, decimales = ''] = lu.texte.split(',');
  if (!/^\d+$/.test(entier) || !/^\d*$/.test(decimales)) return null;
  const iDe = table.indexOf(lu.de);
  const iVers = table.indexOf(lu.vers);
  const premier = iDe - (entier.length - 1);
  const dernier = iDe + decimales.length;
  const debut = Math.min(premier, iVers, iDe);
  const fin = Math.max(dernier, iVers, iDe);
  if (debut < 0 || fin >= table.length) return null;
  const chiffres = {};
  [...entier].forEach((c, k) => { chiffres[premier + k] = c; });
  [...decimales].forEach((c, k) => { chiffres[iDe + 1 + k] = c; });
  const zeros = {};
  for (let i = debut; i <= iVers; i += 1) if (chiffres[i] === undefined) zeros[i] = '0';
  const lire = (i) => chiffres[i] ?? zeros[i] ?? '';
  const partieEntiere = rangee(iVers - debut + 1).map((k) => lire(debut + k)).join('') || '0';
  const partieDecimale = rangee(fin - iVers).map((k) => lire(iVers + 1 + k)).join('');
  const resultat = Math.round(lireNombre(`${partieEntiere}${partieDecimale ? `,${partieDecimale}` : ''}`) * 1000) / 1000;
  return {
    famille: lu.famille, colonnes: rangee(fin - debut + 1).map((k) => ({ i: debut + k, nom: table[debut + k] })), chiffres, zeros, iDe, iVers, resultat, lu,
  };
}

/** Le poteau indicateur : l'unité de départ et l'unité d'arrivée, la plus grande en haut. */
function Poteau({ lu }) {
  const table = TABLES[lu.famille];
  const [haut, bas] = table.indexOf(lu.de) < table.indexOf(lu.vers) ? [lu.de, lu.vers] : [lu.vers, lu.de];
  const role = (u) => (u === lu.de ? 'de' : 'vers');
  return (
    <div className="sc-mesures-cm1__poteau" aria-hidden="true">
      {[haut, bas].map((u, i) => (
        <span key={u} className={`sc-mesures-cm1__fleche sc-mesures-cm1__fleche--${role(u)}`} style={{ '--n': i }}>{u}</span>
      ))}
    </div>
  );
}

/** La balance à plateaux, qui oscille doucement. */
function Balance() {
  return (
    <svg className="sc-mesures-cm1__balance" viewBox="0 0 160 110" aria-hidden="true" focusable="false">
      <rect x="50" y="98" width="60" height="10" rx="3" fill="#8a6a2f" />
      <rect x="76" y="34" width="8" height="66" fill="#b8913f" />
      <g className="sc-mesures-cm1__fleau">
        <rect x="14" y="30" width="132" height="6" rx="3" fill="#d4a94f" stroke="#8a6a2f" strokeWidth="1.5" />
        <g className="sc-mesures-cm1__plateau">
          <path d="M22 36 l-10 34 M22 36 l10 34" stroke="#8a6a2f" strokeWidth="1.5" />
          <path d="M2 70 h40 q-4 10 -20 10 q-16 0 -20 -10 Z" fill="#d4a94f" stroke="#8a6a2f" strokeWidth="1.5" />
          <rect x="12" y="54" width="20" height="16" rx="3" fill="#495057" />
          <rect x="18" y="50" width="8" height="5" rx="2" fill="#495057" />
        </g>
        <g className="sc-mesures-cm1__plateau">
          <path d="M138 36 l-10 34 M138 36 l10 34" stroke="#8a6a2f" strokeWidth="1.5" />
          <path d="M118 70 h40 q-4 10 -20 10 q-16 0 -20 -10 Z" fill="#d4a94f" stroke="#8a6a2f" strokeWidth="1.5" />
          <rect x="124" y="58" width="12" height="12" rx="2" fill="#868e96" />
          <rect x="138" y="62" width="9" height="8" rx="2" fill="#adb5bd" />
        </g>
      </g>
      <circle cx="80" cy="33" r="5" fill="#ffd43b" stroke="#8a6a2f" strokeWidth="1.5" />
    </svg>
  );
}

/** Le pichet qui verse dans le bécher. */
function Pichet() {
  return (
    <svg className="sc-mesures-cm1__pichet" viewBox="0 0 170 120" aria-hidden="true" focusable="false">
      <g transform="rotate(-28 50 40)">
        <path d="M20 14 h52 l-4 64 h-44 Z" fill="rgba(220,240,255,0.55)" stroke="#e8f4ff" strokeWidth="2.5" />
        <path d="M24 40 h46 l-2 38 h-44 Z" fill="#4dabf7" opacity="0.85" />
        <path d="M72 22 q18 4 14 28 q-6 2 -12 -4" fill="none" stroke="#e8f4ff" strokeWidth="4" />
        {[30, 46, 62].map((y) => <line key={y} x1="24" y1={y} x2="34" y2={y} stroke="#fff" strokeWidth="1.5" />)}
      </g>
      <path className="sc-mesures-cm1__filet" d="M22 46 q6 18 92 30" fill="none" stroke="#74c0fc" strokeWidth="5" strokeLinecap="round" />
      <path d="M96 54 h52 l-4 62 h-44 Z" fill="rgba(220,240,255,0.5)" stroke="#e8f4ff" strokeWidth="2.5" />
      <rect className="sc-mesures-cm1__niveau" x="99" y="80" width="46" height="34" fill="#4dabf7" opacity="0.85" />
      {[68, 80, 92, 104].map((y) => <line key={y} x1="100" y1={y} x2="110" y2={y} stroke="#fff" strokeWidth="1.5" />)}
      <circle className="sc-mesures-cm1__goutte" cx="120" cy="72" r="3" fill="#a5d8ff" />
    </svg>
  );
}

/** Le mètre ruban et l'escargot qui le parcourt (CM2). */
function Ruban() {
  return (
    <div className="sc-mesures-cm1__ruban" aria-hidden="true">
      <span className="sc-mesures-cm1__graduations" />
      <svg className="sc-mesures-cm1__escargot" viewBox="0 0 70 44" focusable="false">
        <path d="M6 40 h50 q8 0 8 -6 q-14 2 -22 -2 Z" fill="#c9a26b" stroke="#8a6a2f" strokeWidth="1.5" />
        <circle cx="34" cy="22" r="16" fill="#e8a33d" stroke="#8a5a1a" strokeWidth="2" />
        <path d="M34 22 m-9 0 a9 9 0 1 1 9 9 a5 5 0 1 1 -5 -5" fill="none" stroke="#8a5a1a" strokeWidth="2" />
        <path d="M56 36 l4 -16 M62 36 l6 -14" stroke="#8a6a2f" strokeWidth="2" />
        <circle cx="60" cy="19" r="2.6" fill="#1b1d3a" />
        <circle cx="68" cy="21" r="2.6" fill="#1b1d3a" />
      </svg>
    </div>
  );
}

/** LA QUESTION : l'étiquette (ou le ruban), le poteau, l'instrument. */
export function QuestionMesures({ m, termine }) {
  if (termine) return <ApresMesures m={m} />;
  const lu = lireMesure(m);
  const famille = lu?.famille ?? 'masses';
  let instrument = <Balance />;
  if (famille === 'contenances') instrument = <Pichet />;
  if (famille === 'longueurs') instrument = <Ruban />;
  return (
    <div className={`sc-mesures-cm1 sc-mesures-cm1--${famille}`}>
      <div className="sc-mesures-cm1__etal">
        {lu && <Poteau lu={lu} />}
        <div className="sc-mesures-cm1__centre">
          <p className="sc-mesures-cm1__etiquette">{m.question}</p>
          {instrument}
        </div>
      </div>
    </div>
  );
}

/** APRÈS LA RÉPONSE : le tableau de conversion, pas à pas. */
export function ApresMesures({ m }) {
  const t = placerDansLeTableau(m.question);
  const pas = useDeroule(3, 1200, 450);
  const famille = t?.famille ?? lireMesure(m)?.famille ?? 'masses';
  if (!t) {
    return (
      <div className={`sc-mesures-cm1 sc-mesures-cm1--${famille}`}>
        <p className="sc-mesures-cm1__etiquette">{m.question}</p>
      </div>
    );
  }
  const virgule = pas >= 3 ? t.iVers : t.iDe;
  // Des zéros après la virgule, au bout, ne se lisent pas : 3,500 kg se lit 3,5 kg.
  const derniers = t.colonnes.map(({ i }) => i).filter((i) => i > t.iVers && (t.chiffres[i] ?? t.zeros[i]) !== undefined);
  const significatif = Math.max(t.iVers, ...derniers.filter((i) => (t.chiffres[i] ?? '0') !== '0'));
  const legende = [
    'Le tableau : chaque colonne vaut dix fois la suivante.',
    `On écrit ${t.lu.texte} : le chiffre des unités dans la colonne ${t.lu.de}.`,
    Object.keys(t.zeros).length ? 'On complète avec des zéros jusqu’à la nouvelle unité.' : 'Rien à compléter : tout est déjà là.',
    `La virgule saute derrière ${t.lu.vers} : ${t.lu.texte} ${t.lu.de} = ${fr(t.resultat)} ${t.lu.vers}.`,
  ][pas];
  return (
    <div className={`sc-mesures-cm1 sc-mesures-cm1--${famille} sc-mesures-cm1--apres`}>
      <p className="sc-mesures-cm1__etiquette">{m.question}</p>
      <div className="sc-mesures-cm1__defile">
        <table className="sc-mesures-cm1__tableau">
          <thead>
            <tr>
              {t.colonnes.map(({ i, nom }) => (
                <th key={i} scope="col" className={i === t.iDe ? 'est-de' : i === t.iVers ? 'est-vers' : undefined}>{nom || '·'}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {t.colonnes.map(({ i }) => {
                const chiffre = pas >= 1 ? t.chiffres[i] : undefined;
                const zero = pas >= 2 && chiffre === undefined ? t.zeros[i] : undefined;
                const inutile = pas >= 3 && i > significatif;
                return (
                  <td key={i} className={`${i === t.iDe ? 'est-de' : ''}${i === t.iVers ? ' est-vers' : ''}${inutile ? ' est-inutile' : ''}`}>
                    {chiffre !== undefined && <span className="sc-mesures-cm1__chiffre">{chiffre}</span>}
                    {zero !== undefined && <span className="sc-mesures-cm1__zero">{zero}</span>}
                    {pas >= 1 && i === virgule && <span key={`v${virgule}`} className="sc-mesures-cm1__virgule">,</span>}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <p className={`sc-mesures-cm1__legende${pas >= 3 ? ' est-fini' : ''}`}>{legende}</p>
    </div>
  );
}
