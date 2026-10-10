import { VERS, RIMES, richesse as richesseDe } from '../../../../lib/jeux/lycee/versification';
import {
  BoutonsChoix, Lignes, libelleBon, lignesDe, useDeroule,
} from './commun';

/**
 * LE JARDIN DES GLYCINES — « La versification » (2de). La couverture : une
 * allée de glycines, des carillons dorés qui pendent d'une poutre, des pierres
 * de gué posées sur l'eau. La scène la reprend :
 *   - LA QUESTION : le poème sur un rouleau de papier, sous la poutre fleurie ;
 *     des pierres de gué attendent dans l'eau, vides ;
 *   - LES RÉPONSES : des carillons (`choix`) — une clochette dorée et sa
 *     bande de papier, qui se balancent ; on en fait sonner un ;
 *   - APRÈS LA RÉPONSE : le vers traverse l'eau, UNE SYLLABE PAR PIERRE,
 *     comptées une à une ; les e élidés restent sur l'eau, pâles ; la césure
 *     sépare les deux hémistiches de l'alexandrin. Les rimes reçoivent leurs
 *     lettres (A B A B…), la rime pauvre ou riche montre ses sons communs, le
 *     rejet saute d'un vers à l'autre.
 * Rien de tout cela n'est montré avant la réponse : ce serait la donner.
 */

const P = 'sc-versification';

/**
 * LES VERS DU MODULE, SYLLABE PAR SYLLABE — recopiés de ses commentaires.
 * Un tiret sépare les syllabes ; (e) : un e élidé ou final, qui ne se dit pas.
 * Un morceau sans voyelle prononcée (« gn(e) ») n'est pas une syllabe : il
 * s'accroche à la précédente. `note` : la diérèse ou la synérèse à montrer.
 */
const SYLLABES = {
  'Demain, dès l’aube, à l’heure où blanchit la campagne,': { s: 'De-main-dès-l’au-b(e) à-l’heu-r(e) où-blan-chit-la-cam-pa-gn(e)' },
  'Heureux qui, comme Ulysse, a fait un beau voyage,': { s: 'Heu-reux-qui-com-m(e) U-lys-s(e) a-fait-un-beau-vo-ya-g(e)' },
  'Ô temps ! suspends ton vol, et vous, heures propices !': { s: 'Ô-temps-sus-pends-ton-vol-et-vous-heu-res-pro-pi-c(es)' },
  'Comme je descendais des Fleuves impassibles,': { s: 'Com-me-je-des-cen-dais-des-Fleu-ves-im-pas-si-bl(es)' },
  'Souvent, pour s’amuser, les hommes d’équipage': { s: 'Sou-vent-pour-s’a-mu-ser-les-hom-mes-d’é-qui-pa-g(e)' },
  'Prennent des albatros, vastes oiseaux des mers,': { s: 'Pren-nent-des-al-ba-tros-vas-tes-oi-seaux-des-mers' },
  'Je fais souvent ce rêve étrange et pénétrant': { s: 'Je-fais-sou-vent-ce-rê-v(e) é-tran-g(e) et-pé-né-trant' },
  'Ô rage ! ô désespoir ! ô vieillesse ennemie !': { s: 'Ô-ra-g(e) ô-dé-ses-poir-ô-vieil-les-s(e) en-ne-mi(e)' },
  'Le vierge, le vivace et le bel aujourd’hui': { s: 'Le-vier-ge-le-vi-va-c(e) et-le-bel-au-jour-d’hui' },
  'Waterloo ! Waterloo ! Waterloo ! morne plaine !': { s: 'Wa-ter-loo-Wa-ter-loo-Wa-ter-loo-mor-ne-plai-n(e)' },
  'Le Poète est semblable au prince des nuées': { s: 'Le-Po-è-t(e) est-sem-bla-bl(e) au-prin-ce-des-nu-ées', note: [10, 11, 'Diérèse : « nu-ées », deux syllabes'] },
  'C’était pendant l’horreur d’une profonde nuit.': { s: 'C’é-tait-pen-dant-l’hor-reur-d’u-ne-pro-fon-de-nuit' },
  'Sous le pont Mirabeau coule la Seine': { s: 'Sous-le-pont-Mi-ra-beau-cou-le-la-Sei-n(e)' },
  'Maître Corbeau, sur un arbre perché,': { s: 'Maî-tre-Cor-beau-sur-un-ar-bre-per-ché' },
  'Ce toit tranquille, où marchent des colombes,': { s: 'Ce-toit-tran-quil-l(e) où-mar-chent-des-co-lom-b(es)' },
  'Mignonne, allons voir si la rose': { s: 'Mi-gnon-n(e) al-lons-voir-si-la-ro-s(e)' },
  'Las ! voyez comme en peu d’espace,': { s: 'Las-vo-yez-com-m(e) en-peu-d’es-pa-c(e)' },
  'Le ciel est, par-dessus le toit,': { s: 'Le-ciel-est-par-des-sus-le-toit', note: [1, 1, 'Synérèse : « ciel », une seule syllabe'] },
  'Entre les pattes d’un Lion': { s: 'En-tre-les-pat-tes-d’un-Li-on', note: [6, 7, 'Diérèse : « Li-on », deux syllabes'] },
  'Tenait en son bec un fromage.': { s: 'Te-nait-en-son-bec-un-fro-ma-g(e)' },
  'Il pleure dans mon cœur': { s: 'Il-pleu-re-dans-mon-cœur' },
  'Des violons': { s: 'Des-vi-o-lons', note: [1, 2, 'Diérèse : « vi-o-lons »'] },
};

const VOYELLE = /[aeiouyàâäéèêëîïôöûüùœæ]/i;

/** « b(e) à » → [{ dit: 'b', tu: '(e)', suite: ' à' }] : ce qui se dit, ce qui s'élide. */
function morceaux(syllabe) {
  return syllabe.split(/(\([^)]*\))/).filter(Boolean).map((t) => ({ texte: t, elide: /^\(/.test(t) }));
}

/** Le vers découpé : chaque syllabe prononcée, avec ses e élidés accrochés. */
export function decouper(vers) {
  const fiche = SYLLABES[vers];
  if (!fiche) return null;
  const syllabes = [];
  fiche.s.split('-').forEach((piece) => {
    const dite = piece.replace(/\([^)]*\)/g, '');
    if (VOYELLE.test(dite) || syllabes.length === 0) syllabes.push(morceaux(piece));
    else syllabes[syllabes.length - 1].push(...morceaux(piece));
  });
  return { syllabes, note: fiche.note ?? null };
}

/** Le vers d'une manche « compter » ou « mètre » : celui du module qu'elle cite. */
const versDe = (m) => VERS.find(([v]) => m.question.includes(`« ${v} »`)) ?? null;

/** Une grappe de glycine : des fleurs mauves en cône, de plus en plus pâles vers le bas. */
const FLEURS = [[6, 4], [13, 3], [20, 4], [27, 3], [9, 11], [17, 10], [24, 11], [12, 18], [20, 18], [16, 25], [13, 31], [18, 37], [15, 43]];

/** Le décor : la poutre laquée et ses grappes de glycine, qui se balancent. */
function Poutre() {
  return (
    <div className={`${P}__poutre`} aria-hidden="true">
      {Array.from({ length: 7 }, (_, i) => (
        <svg
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={`${P}__grappe`}
          style={{ '--n': i }}
          viewBox="0 0 34 50"
          focusable="false"
        >
          {FLEURS.map(([x, y], k) => (
            // eslint-disable-next-line react/no-array-index-key
            <circle key={k} cx={x} cy={y} r={4.6 - k * 0.18} fill={['#8a5cc7', '#a77de0', '#c9a6f2', '#e7d4ff'][Math.min(3, Math.floor(k / 3.5))]} />
          ))}
        </svg>
      ))}
    </div>
  );
}

/** L'eau et ses pierres de gué : vides avant la réponse, une syllabe par pierre après. */
function Gue({ m }) {
  const trouve = versDe(m);
  const decoupe = trouve ? decouper(trouve[0]) : null;
  const total = decoupe?.syllabes.length ?? 0;
  // Le découpage ne colle pas au compte du module : on ne montre que le compte.
  const fiable = decoupe && trouve && total === trouve[2];
  const n = useDeroule(fiable ? total : 0, 420);
  if (!fiable) {
    return (
      <div className={`${P}__eau`}>
        <p className={`${P}__total`} role="status">{`${libelleBon(m)}${m.consigne === 'compter' ? ' syllabes' : ''}`}</p>
      </div>
    );
  }
  const [debut, fin, texteNote] = decoupe.note ?? [];
  const alexandrin = total === 12;
  return (
    <div className={`${P}__eau`}>
      <ol className={`${P}__pierres`} aria-label="Le vers, syllabe par syllabe">
        {decoupe.syllabes.map((morceauxSyl, i) => (
          <li
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={`${P}__pierre${i < n ? ` ${P}__pierre--posee` : ''}${i >= debut && i <= fin ? ` ${P}__pierre--note` : ''}${alexandrin && i === 6 ? ` ${P}__pierre--cesure` : ''}`}
            style={{ '--n': i }}
          >
            <span className={`${P}__syllabe`}>
              {morceauxSyl.map((x, k) => (
                // eslint-disable-next-line react/no-array-index-key
                <span key={k} className={x.elide ? `${P}__elide` : undefined}>{x.texte}</span>
              ))}
            </span>
            <span className={`${P}__rang`}>{i + 1}</span>
          </li>
        ))}
      </ol>
      <p className={`${P}__total${n >= total ? ` ${P}__total--fini` : ''}`} role="status">
        {n >= total ? `${total} syllabes${m.consigne === 'metre' ? ` : ${libelleBon(m).toLowerCase()}` : ''}` : `${n}…`}
      </p>
      {n >= total && (
        <p className={`${P}__regle`}>
          {alexandrin ? 'La césure coupe l’alexandrin en deux hémistiches de six syllabes. ' : ''}
          {texteNote ? `${texteNote}. ` : ''}
          Les e pâles s’élident ou tombent en fin de vers : ils ne comptent pas.
        </p>
      )}
    </div>
  );
}

/** Le dernier mot d'un vers, pour y poser la lettre de sa rime. */
const DERNIER_MOT = /([\p{L}’'-]+)([^\p{L}]*)$/u;

const MOTIFS = { suivies: 'AABB', croisees: 'ABAB', embrassees: 'ABBA' };

/** Les quatre vers du quatrain : sa source, s'il en a une, vient après. */
function Rimes({ m }) {
  const motif = MOTIFS[m.bonne] ?? '';
  const n = useDeroule(4, 500);
  return (
    <div className={`${P}__eau ${P}__eau--rimes`}>
      <ol className={`${P}__lettres`} aria-label="Le schéma des rimes">
        {motif.split('').map((lettre, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} className={`${P}__lettre ${P}__lettre--${lettre}${i < n ? ` ${P}__lettre--posee` : ''}`}>{lettre}</li>
        ))}
      </ol>
      <p className={`${P}__total ${P}__total--fini`} role="status">{`Rimes ${libelleBon(m).charAt(0).toLowerCase()}${libelleBon(m).slice(1)}`}</p>
    </div>
  );
}

/** Pauvre, suffisante, riche : les sons communs, posés un à un sur des pierres. */
function Sons({ m }) {
  const rime = RIMES.find(([a, b]) => m.question === `« ${a} » / « ${b} »`);
  const sons = rime?.[2] ?? [];
  const n = useDeroule(sons.length, 600);
  if (!rime || richesseDe(sons) !== m.bonne) {
    return <div className={`${P}__eau`}><p className={`${P}__total ${P}__total--fini`} role="status">{libelleBon(m)}</p></div>;
  }
  return (
    <div className={`${P}__eau`}>
      <ol className={`${P}__pierres`} aria-label="Les sons communs aux deux mots">
        {sons.map((son, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} className={`${P}__pierre ${P}__pierre--son${i < n ? ` ${P}__pierre--posee` : ''}`} style={{ '--n': i }}>
            <span className={`${P}__syllabe`}>{`[${son}]`}</span>
            <span className={`${P}__rang`}>{i + 1}</span>
          </li>
        ))}
      </ol>
      <p className={`${P}__total${n >= sons.length ? ` ${P}__total--fini` : ''}`} role="status">
        {n >= sons.length
          ? `${sons.length} son${sons.length > 1 ? 's' : ''} commun${sons.length > 1 ? 's' : ''} : rime ${libelleBon(m).toLowerCase()}`
          : `${n}…`}
      </p>
    </div>
  );
}

/** Le groupe signalé (« → « Tranquille. » »), et où il tombe : début ou fin de vers. */
function debordement(m) {
  const lignes = lignesDe(m.question);
  const groupe = /→ « (.+) »\s*$/.exec(m.question)?.[1];
  if (!groupe || lignes.length < 2) return null;
  return {
    groupe, vers1: lignes[0], vers2: lignes[1], rejet: lignes[1].startsWith(groupe),
  };
}

/** Le rejet saute au vers suivant ; le contre-rejet ouvre la phrase au bout du vers. */
function Saut({ m }) {
  const d = debordement(m);
  if (!d) return <div className={`${P}__eau`}><p className={`${P}__total ${P}__total--fini`} role="status">{libelleBon(m)}</p></div>;
  const fin1 = d.rejet ? d.vers1.split(' ').slice(-3).join(' ') : d.vers1.slice(0, d.vers1.lastIndexOf(d.groupe)).trim().split(' ').slice(-3).join(' ');
  const debut2 = d.rejet ? d.vers2.slice(d.groupe.length).trim().split(' ').slice(0, 3).join(' ') : d.vers2.split(' ').slice(0, 3).join(' ');
  return (
    <div className={`${P}__eau ${P}__eau--saut`}>
      <div className={`${P}__deux-vers`}>
        <p className={`${P}__ligne-vers`}>
          {`… ${fin1} `}
          {!d.rejet && <mark className={`${P}__groupe`}>{d.groupe}</mark>}
          <span className={`${P}__fin-vers`} aria-hidden="true">⏎</span>
        </p>
        <svg className={`${P}__fleche`} viewBox="0 0 120 50" aria-hidden="true" focusable="false">
          <path d={d.rejet ? 'M110 6 C 110 40, 20 10, 14 44' : 'M14 6 C 20 40, 110 10, 110 44'} />
          <path d={d.rejet ? 'M6 36 L14 46 L22 37' : 'M102 36 L110 46 L118 37'} />
        </svg>
        <p className={`${P}__ligne-vers`}>
          {d.rejet && <mark className={`${P}__groupe`}>{d.groupe}</mark>}
          {` ${debut2} …`}
        </p>
      </div>
      <p className={`${P}__total ${P}__total--fini`} role="status">
        {d.rejet ? 'Rejet : la phrase finit au début du vers suivant' : 'Contre-rejet : la phrase commence au bout du vers'}
      </p>
    </div>
  );
}

/** Les notions : la réponse gravée sur une pierre, et le sonnet ou l'alexandrin dessinés. */
function Notion({ m }) {
  const bonne = libelleBon(m);
  const sonnet = /sonnet/i.test(m.question) && /quatrain|14/.test(bonne);
  const alexandrin = /alexandrin|hémistiche/i.test(m.question);
  return (
    <div className={`${P}__eau`}>
      {sonnet && (
        <div className={`${P}__sonnet`} aria-label="Le sonnet : deux quatrains, deux tercets">
          {[4, 4, 3, 3].map((k, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={i} className={`${P}__strophe`} style={{ '--n': i }}>
              {Array.from({ length: k }, (_, j) => <span key={j} className={`${P}__trait`} />)}
            </span>
          ))}
        </div>
      )}
      {alexandrin && (
        <ol className={`${P}__pierres ${P}__pierres--petites`} aria-label="Un alexandrin : six syllabes, la césure, six syllabes">
          {Array.from({ length: 12 }, (_, i) => (
            <li key={i} className={`${P}__pierre ${P}__pierre--posee${i === 6 ? ` ${P}__pierre--cesure` : ''}`} style={{ '--n': i }}>
              <span className={`${P}__rang`}>{i + 1}</span>
            </li>
          ))}
        </ol>
      )}
      <p className={`${P}__total ${P}__total--fini`} role="status">{bonne}</p>
    </div>
  );
}

const EXPLICATIONS = {
  compter: Gue, metre: Gue, rimes: Rimes, richesse: Sons, coupe: Saut, notion: Notion,
};

/** Une ligne du poème : le vers, la source (« — Hugo »), ou le groupe signalé (« → … »). */
function ligne(m, termine) {
  const motif = termine && m.consigne === 'rimes' ? MOTIFS[m.bonne] : null;
  const d = termine && m.consigne === 'coupe' ? debordement(m) : null;
  return (l, i) => {
    if (/^— /.test(l)) return <span className={`${P}__source`}>{l}</span>;
    if (/^→ /.test(l)) return <span className={`${P}__signal`}>{l}</span>;
    if (motif && i < 4) {
      const t = DERNIER_MOT.exec(l);
      if (t) {
        const debut = l.slice(0, t.index);
        return (
          <>
            {debut}
            <span className={`${P}__rime ${P}__rime--${motif[i]}`}>{t[1]}</span>
            {t[2]}
          </>
        );
      }
    }
    if (d && (i === 0 || i === 1)) {
      const at = l.indexOf(d.groupe);
      if (at >= 0) {
        return (
          <>
            {l.slice(0, at)}
            <mark className={`${P}__groupe`}>{d.groupe}</mark>
            {l.slice(at + d.groupe.length)}
          </>
        );
      }
    }
    return l;
  };
}

export function QuestionVersification({ m, termine }) {
  const Explication = termine ? EXPLICATIONS[m.consigne] : null;
  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      <Poutre />
      <div className={`${P}__rouleau`}>
        <Lignes
          texte={m.question}
          className={`${P}__poeme${m.question.includes('\n') ? '' : ` ${P}__poeme--court`}`}
          classeLigne={`${P}__vers`}
          rendreLigne={ligne(m, termine)}
        />
      </div>
      {Explication ? <Explication m={m} /> : (
        <div className={`${P}__eau ${P}__eau--calme`} aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => <span key={i} className={`${P}__galet`} style={{ '--n': i }} />)}
          {Array.from({ length: 4 }, (_, i) => <span key={`p${i}`} className={`${P}__petale`} style={{ '--n': i }} />)}
        </div>
      )}
    </div>
  );
}

/** Les carillons : une clochette dorée, sa bande de papier ; on en fait sonner un. */
export function ChoixVersification({ choix, fautes, choisir }) {
  return (
    <BoutonsChoix
      p={P}
      choix={choix}
      fautes={fautes}
      choisir={choisir}
      etiquette="Fais sonner le bon carillon"
      deco={() => (
        <span className={`${P}__clochette`} aria-hidden="true">
          <span className={`${P}__battant`} />
        </span>
      )}
    />
  );
}
