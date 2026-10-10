import { autourDuTrou, laBonne } from './commun';

/**
 * L'ATELIER D'HORLOGERIE — « Le participe passé » (6e, 4e). La couverture :
 * une horlogère dans son atelier, des engrenages de laiton partout. L'accord
 * du participe est une mécanique : un mot COMMANDE, le participe SUIT — ou
 * reste immobile.
 *   - LA QUESTION : la phrase gravée sur une plaque de laiton rivetée, le trou
 *     en forme de logement vide ; des engrenages tournent au-dessus ;
 *   - LES RÉPONSES : des pignons de laiton (`objets: 'sc-participe-passe-college'`) ;
 *   - APRÈS LA RÉPONSE : le participe se loge dans la phrase, et on voit le
 *     mécanisme : le mot qui commande (le sujet avec être, le COD placé avant
 *     avec avoir) porte un engrenage qui ENTRAÎNE celui du participe, la
 *     terminaison gagnée s'affiche (+es, +s…) ; quand rien ne commande (avoir
 *     et COD après, « se » COI), l'engrenage du participe reste à l'arrêt :
 *     invariable.
 */

const P = 'sc-participe-passe-college';

const SUJET_ETRE = /^(.*?)(\s+(?:(?:se|me|te|nous|vous)\s+|s’|m’|t’)?(?:sont|est|sommes|êtes|suis|es)(?:\s+toujours)?\s*)$/;
const SUJET_AVOIR = /^(.*?)(\s+(?:a|ont|ai|as|avons|avez)\s*)$/;
const COUPURES = new Set(['avec', 'en', 'dans', 'sur', 'pour', 'pendant', 'chaque', 'hier', 'à']);

/** Le premier groupe après le verbe (« le doigt avec un couteau » → « le doigt »). */
function premierGroupe(texte) {
  const debut = /^\s*/.exec(texte)[0];
  const mots = texte.slice(debut.length).replace(/[.!?]\s*$/, '').split(/\s+/);
  const garde = [];
  for (let i = 0; i < mots.length; i += 1) {
    if (i > 0 && COUPURES.has(mots[i])) break;
    garde.push(mots[i]);
  }
  const groupe = garde.join(' ');
  return [debut, groupe, texte.slice(debut.length + groupe.length)];
}

/**
 * La dernière occurrence d'un petit mot : [avant, le mot, après], ou null. Le
 * motif a deux groupes : ce qui précède (début ou non-lettre), puis le mot.
 */
function dernier(texte, motif) {
  let r = null;
  let t;
  const re = new RegExp(motif.source, 'gu');
  // eslint-disable-next-line no-cond-assign
  while ((t = re.exec(texte)) !== null) r = t;
  if (!r) return null;
  const debut = r.index + r[1].length;
  return [texte.slice(0, debut), r[2], texte.slice(debut + r[2].length)];
}

const ROLES = {
  commande: 'sujet : il commande',
  ignore: 'sujet : ne commande pas',
  'cod-apres': 'COD placé après',
  'cod-avant': 'COD avant : il commande',
  coi: 'se = COI',
};

/** Ce que dit la mécanique, selon la sorte de manche (`m.aide`). */
const LEGENDES = {
  'etre-oubli': 'Avec être, le sujet entraîne le participe',
  'avoir-cod-avant': 'Avec avoir, le COD placé avant entraîne le participe',
  'pronominal-sujet': 'Ici, le sujet entraîne le participe',
  'avoir-sujet': 'Avec avoir, le sujet ne commande pas, et le COD vient après : le participe ne s’accorde pas.',
  'pronominal-cod-apres': 'Le COD est placé après le verbe : le participe ne s’accorde pas.',
  'pronominal-coi': '« Se » veut dire « à soi », « l’un à l’autre » : c’est un COI, le participe ne s’accorde pas.',
};

/** La phrase découpée en morceaux, chacun avec son rôle dans la mécanique. */
export function mecanique(question, aide) {
  const coupe = autourDuTrou(question);
  if (!coupe) return null;
  const [avant, apres] = coupe;
  const plain = (t) => ({ t });
  let gauche = [plain(avant)];
  let droite = [plain(apres)];
  let accorde = false;
  if (aide === 'etre-oubli' || aide === 'pronominal-sujet') {
    const r = SUJET_ETRE.exec(avant);
    if (r) gauche = [{ t: r[1], role: 'commande' }, plain(r[2])];
    accorde = true;
  } else if (aide === 'avoir-sujet' || aide === 'pronominal-cod-apres') {
    const r = aide === 'avoir-sujet' ? SUJET_AVOIR.exec(avant) : null;
    if (r) gauche = [{ t: r[1], role: 'ignore' }, plain(r[2])];
    const [esp, groupe, reste] = premierGroupe(apres);
    if (groupe) droite = [plain(esp), { t: groupe, role: 'cod-apres' }, plain(reste)];
  } else if (aide === 'avoir-cod-avant') {
    const r = dernier(avant, /(^|[^\p{L}’])(que |qu’|les |l’)/u);
    if (r) gauche = [plain(r[0]), { t: r[1].trim(), role: 'cod-avant' }, plain(r[1].endsWith(' ') ? ` ${r[2]}` : r[2])];
    accorde = true;
  } else if (aide === 'pronominal-coi') {
    const r = dernier(avant, /(^|[^\p{L}’])(se |s’)/u);
    if (r) gauche = [plain(r[0]), { t: r[1].trim(), role: 'coi' }, plain(r[1].endsWith(' ') ? ` ${r[2]}` : r[2])];
  }
  return { gauche, droite, accorde };
}

/** La marque gagnée par l'accord : « arrivées » face à « arrivé » → « es ». */
function marque(m) {
  const formes = (m.choix ?? []).map((c) => c.libelle);
  const base = formes.reduce((a, b) => (b.length < a.length ? b : a), formes[0] ?? '');
  const bonne = laBonne(m);
  if (!base || !bonne.startsWith(base) || bonne === base) return null;
  return bonne.slice(base.length);
}

const Rouage = ({ tourne = true }) => <span className={`${P}__rouage${tourne ? ' est-entraine' : ''}`} aria-hidden="true" />;

function Morceau({ m: morceau }) {
  if (!morceau.role) return morceau.t;
  return (
    <span className={`${P}__piece ${P}__piece--${morceau.role}`} data-role={ROLES[morceau.role]}>
      <Rouage tourne={morceau.role === 'commande' || morceau.role === 'cod-avant'} />
      {morceau.t}
    </span>
  );
}

/** Les engrenages de l'atelier : trois roues de laiton qui s'entraînent. */
function Engrenages() {
  const roue = (cx, cy, r, dents, sens, n) => (
    <g className={`${P}__roue`} style={{ '--sens': sens, '--n': n }}>
      {Array.from({ length: dents }, (_, i) => (
        <rect key={i} x={cx - 3} y={cy - r - 5} width="6" height="8" rx="1" fill="#c99a2e" transform={`rotate(${(i * 360) / dents} ${cx} ${cy})`} />
      ))}
      <circle cx={cx} cy={cy} r={r} fill="#e2b23c" stroke="#8f6410" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="#8f6410" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={r * 0.2} fill="#6b4a12" />
    </g>
  );
  return (
    <svg className={`${P}__engrenages`} viewBox="0 0 220 70" aria-hidden="true" focusable="false">
      {roue(40, 38, 24, 12, 1, 0)}
      {roue(92, 30, 16, 8, -1, 1)}
      {roue(136, 40, 22, 11, 1, 2)}
      {roue(184, 28, 14, 7, -1, 3)}
    </svg>
  );
}

export function QuestionParticipe({ m, termine }) {
  const coupe = autourDuTrou(m.question);
  const meca = termine ? mecanique(m.question, m.aide) : null;
  const gain = termine && meca?.accorde ? marque(m) : null;
  return (
    <div className={`${P}${termine ? ' est-monte' : ''}`}>
      <Engrenages />
      <div className={`${P}__plaque`}>
        <span className={`${P}__rivet`} aria-hidden="true" />
        <span className={`${P}__rivet`} aria-hidden="true" />
        <p className={`${P}__phrase`}>
          {coupe ? (
            <>
              {coupe[0]}
              <span className={`${P}__logement`}>___</span>
              {coupe[1]}
            </>
          ) : m.question}
        </p>
      </div>
      {meca && (
        <div className={`${P}__mecanisme`} role="status">
          <p className={`${P}__remplie`}>
            {/* eslint-disable-next-line react/no-array-index-key */}
            {meca.gauche.map((x, i) => <Morceau key={`g${i}`} m={x} />)}
            <span className={`${P}__participe${meca.accorde ? ' est-accorde' : ' est-invariable'}`} data-role={meca.accorde ? 'accordé' : 'invariable'}>
              <Rouage tourne={meca.accorde} />
              {laBonne(m)}
            </span>
            {/* eslint-disable-next-line react/no-array-index-key */}
            {meca.droite.map((x, i) => <Morceau key={`d${i}`} m={x} />)}
          </p>
          <p className={`${P}__legende`}>
            {meca.accorde
              ? `${LEGENDES[m.aide] ?? 'Le mot qui commande entraîne le participe'}${gain ? ` : il gagne « ${gain} ».` : ' : masculin singulier, pas de marque.'}`
              : (LEGENDES[m.aide] ?? 'Rien n’entraîne le participe : il ne s’accorde pas.')}
          </p>
        </div>
      )}
    </div>
  );
}
