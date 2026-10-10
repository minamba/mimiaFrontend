import { avecVisuel, designer } from '../base';
import { LIBELLES_NOMS, PHRASES, QUATRAINS } from '../../../../lib/jeux/college/compteur-de-syllabes';
import { normaliser, usePas } from './commun';

/**
 * LA PASSERELLE AUX LANTERNES — « Le compteur de syllabes », 4e
 * (09/10/2026). La couverture : une fille accroupie sur une passerelle de
 * bambou, au crépuscule ; des clochettes de verre et des lanternes de papier
 * tout du long, des pétales mauves qui volent.
 *   - LA QUESTION : le vers (ou le quatrain) sur un rouleau de papier pendu
 *     entre deux bambous, des clochettes de verre qui tintent au-dessus, des
 *     pétales qui passent ; le petit compteur de bois affiche « ? » ;
 *   - LES RÉPONSES : des lanternes de papier (`objets`) ;
 *   - APRÈS LA RÉPONSE : le compteur REJOUE le décompte — chaque syllabe
 *     allume sa lanterne, l'une après l'autre, le compteur monte, et les e
 *     muets qui ne comptent pas restent éteints, en gris. Pour les rimes,
 *     chaque fin de vers prend sa lettre et sa couleur (A A B B…) ; pour les
 *     strophes, les vers s'empilent en blocs (le sonnet : 4, 4, 3, 3).
 * Le décompte n'apparaît jamais avant la réponse : ce serait la donner.
 */

const P = 'sc-compteur-de-syllabes';

/**
 * LE DÉCOMPTE DE CHAQUE VERS, syllabe par syllabe, recopié des commentaires
 * du module (`compteur-de-syllabes.js`) : « | » sépare les syllabes, les
 * lettres entre parenthèses sont muettes (élision, e final) et ne comptent
 * pas. Un test vérifie que chaque décompte donne bien le nombre du module.
 */
export const DECOMPTES = {
  'Demain, dès l’aube, à l’heure où blanchit la campagne,': 'De|main|dès|l’au|b(e) à|l’heu|r(e) où|blan|chit|la|cam|pa(gne)',
  'Heureux qui, comme Ulysse, a fait un beau voyage,': 'Heu|reux|qui|com|m(e) U|lys|s(e) a|fait|un|beau|vo|ya(ge)',
  'Je fais souvent ce rêve étrange et pénétrant': 'Je|fais|sou|vent|ce|rê|v(e) é|tran|g(e) et|pé|né|trant',
  'Ô temps ! suspends ton vol, et vous, heures propices !': 'Ô|temps|sus|pends|ton|vol|et|vous|heu|res|pro|pi(ces)',
  'Souvent, pour s’amuser, les hommes d’équipage': 'Sou|vent|pour|s’a|mu|ser|les|hom|mes|d’é|qui|pa(ge)',
  'Oh ! combien de marins, combien de capitaines': 'Oh|com|bien|de|ma|rins|com|bien|de|ca|pi|tai(nes)',
  'J’irai par la forêt, j’irai par la montagne.': 'J’i|rai|par|la|fo|rêt|j’i|rai|par|la|mon|ta(gne)',
  'C’était pendant l’horreur d’une profonde nuit.': 'C’é|tait|pen|dant|l’hor|reur|d’u|ne|pro|fon|de|nuit',
  'Je suis le Ténébreux, — le Veuf, — l’Inconsolé,': 'Je|suis|le|Té|né|breux|le|Veuf|l’In|con|so|lé',
  'Sous le pont Mirabeau coule la Seine': 'Sous|le|pont|Mi|ra|beau|cou|le|la|Sei(ne)',
  'Maître Corbeau, sur un arbre perché,': 'Maî|tre|Cor|beau|sur|un|ar|bre|per|ché',
  'Ce toit tranquille, où marchent des colombes,': 'Ce|toit|tran|quil|l(e) où|mar|chent|des|co|lom(bes)',
  'Le vent du soir passe sur la colline': 'Le|vent|du|soir|pas|se|sur|la|col|li(ne)',
  'Mignonne, allons voir si la rose': 'Mi|gnon|n(e) al|lons|voir|si|la|ro(se)',
  'Las ! voyez comme en peu d’espace,': 'Las|vo|yez|com|m(e) en|peu|d’es|pa(ce)',
  'Le ciel est, par-dessus le toit,': 'Le|ciel|est|par|des|sus|le|toit',
  'Un arbre, par-dessus le toit,': 'Un|ar|bre|par|des|sus|le|toit',
  'Entre les pattes d’un Lion': 'En|tre|les|pat|tes|d’un|Li|on',
  'Tenait en son bec un fromage.': 'Te|nait|en|son|bec|un|fro|ma(ge)',
  'Il pleure dans mon cœur': 'Il|pleu|re|dans|mon|cœur',
  'Comme il pleut sur la ville ;': 'Com|m(e) il|pleut|sur|la|vil(le)',
  'Des violons': 'Des|vi|o|lons',
};

/** Le vers d'une question « « vers »\n— auteur », sans les guillemets. */
export const versDe = (question) => String(question ?? '').match(/«\s*(.+?)\s*»/)?.[1] ?? null;

/** Les syllabes d'un vers : [{ dite, muette }], `muette` = ce qui ne se prononce pas. */
export function syllabesDe(vers) {
  const decompte = DECOMPTES[vers];
  if (!decompte) return null;
  return decompte.split('|').map((s) => {
    const morceaux = s.split(/(\([^)]*\))/).filter(Boolean);
    return morceaux.map((x) => (x.startsWith('(') ? { muette: x.slice(1, -1) } : { dite: x }));
  });
}

const MOTIFS = { plates: 'AABB', croisees: 'ABAB', embrassees: 'ABBA' };

/** Les blocs d'une strophe, selon la bonne réponse : 4 pour un quatrain, 4-4-3-3 pour le sonnet… */
function blocsDe(bonne) {
  const b = String(bonne);
  if (b === '14' || /deux quatrains/.test(b)) return [4, 4, 3, 3];
  if (/quatrain/.test(b)) return [4];
  if (/tercet/.test(b)) return [3];
  if (/distique/.test(b)) return [2];
  if (/sizain/.test(b)) return [6];
  return null;
}

/** Les clochettes de verre, en haut de la passerelle. */
function Clochettes() {
  return (
    <svg className={`${P}__clochettes`} viewBox="0 0 820 64" preserveAspectRatio="xMidYMin meet" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="820" height="8" rx="4" fill="#7a9a3a" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
        const x = 50 + i * 90;
        return (
          <g key={x} className={`${P}__clochette`} style={{ '--n': i, transformOrigin: `${x}px 6px` }}>
            <line x1={x} y1="6" x2={x} y2="16" stroke="#5a5a3a" strokeWidth="1.5" />
            <path d={`M${x - 13} 32 q0 -16 13 -16 q13 0 13 16 z`} fill="rgba(200, 230, 255, 0.9)" stroke="#8ab0d0" strokeWidth="1.5" />
            <path d={`M${x - 7} 22 q3 -3 6 -3`} stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
            <line x1={x} y1="32" x2={x} y2="38" stroke="#5a5a3a" strokeWidth="1" />
            <rect x={x - 5} y="38" width="10" height="24" rx="1.5" fill={['#c9a7ff', '#a7d8ff', '#ffc4d8'][i % 3]} />
          </g>
        );
      })}
    </svg>
  );
}

/** Le compteur de bois : « ? » avant, le nombre qui monte après. */
function Compteur({ valeur }) {
  return (
    <span className={`${P}__compteur`} aria-hidden="true">
      <strong key={String(valeur)}>{valeur}</strong>
    </span>
  );
}

/** Après un compte : les lanternes s'allument, syllabe après syllabe. */
function Lanternes({ syllabes, nom }) {
  const n = usePas(syllabes.length, 420);
  return (
    <div className={`${P}__allumage`} role="status">
      <ol className={`${P}__lanternes`} aria-label={`${syllabes.length} syllabes`}>
        {syllabes.map((morceaux, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} className={`${P}__lanterne${i < n ? ' est-allumee' : ''}`}>
            <span className={`${P}__rang`} aria-hidden="true">{i + 1}</span>
            <span className={`${P}__syllabe`}>
              {morceaux.map((x, k) => (x.muette
                // eslint-disable-next-line react/no-array-index-key
                ? <span key={k} className={`${P}__muette`}>{x.muette}</span>
                // eslint-disable-next-line react/no-array-index-key
                : <span key={k}>{x.dite}</span>))}
            </span>
          </li>
        ))}
      </ol>
      <p className={`${P}__total${n >= syllabes.length ? ' est-fini' : ''}`}>
        <Compteur valeur={n} />
        {n >= syllabes.length && (
          <span>
            {syllabes.length} syllabes
            {nom ? ` : ${nom.toLowerCase()}` : ''}
          </span>
        )}
      </p>
      {syllabes.some((s) => s.some((x) => x.muette)) && (
        <p className={`${P}__note`}>En gris : les e muets qui ne comptent pas.</p>
      )}
    </div>
  );
}

/** Après les rimes : chaque fin de vers prend sa lettre. */
function Rimes({ m }) {
  const motif = MOTIFS[m.bonne] ?? null;
  const entree = QUATRAINS.find(([q]) => q === m.question);
  if (!motif || !entree) return null;
  const vers = entree[0].split('\n');
  return (
    <div className={`${P}__rimes`} role="status">
      <ol className={`${P}__quatrain`}>
        {vers.map((v, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} className={`${P}__vers-rime ${P}__vers-rime--${motif[i]}`} style={{ '--n': i }}>
            <span>{v}</span>
            <strong className={`${P}__lettre`}>{motif[i]}</strong>
          </li>
        ))}
      </ol>
      <p className={`${P}__note`}>{PHRASES[`rimes-${m.bonne}`]}</p>
    </div>
  );
}

/** Après une strophe : les vers empilés en blocs. */
function Strophes({ m }) {
  const blocs = blocsDe(m.bonne);
  if (!blocs) return null;
  return (
    <div className={`${P}__strophes`} role="status">
      <span className={`${P}__blocs`} aria-hidden="true">
        {blocs.map((n, b) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={b} className={`${P}__bloc`} style={{ '--n': b }}>
            {Array.from({ length: n }, (_, k) => <span key={k} />)}
          </span>
        ))}
      </span>
      <strong className={`${P}__total est-fini`}>{m.choix?.find((c) => c.cle === m.bonne)?.libelle ?? m.bonne}</strong>
    </div>
  );
}

function Explication({ m }) {
  if (m.consigne === 'rimes') return <Rimes m={m} />;
  if (m.consigne === 'strophe') return <Strophes m={m} />;
  const syllabes = syllabesDe(versDe(m.question));
  const nom = m.consigne === 'nommer' ? LIBELLES_NOMS[m.bonne] : null;
  if (syllabes) return <Lanternes syllabes={syllabes} nom={nom} />;
  // Un vers inconnu : le nombre seul, sans décompte.
  return <p className={`${P}__total est-fini`} role="status">{nom ?? `${m.bonne} syllabes`}</p>;
}

export function QuestionSyllabes({ m, termine }) {
  const compte = m.consigne === 'compter' || m.consigne === 'nommer';
  return avecVisuel(m, (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Clochettes />
      <span className={`${P}__petales`} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ '--n': i }} />)}
      </span>
      <div className={`${P}__passerelle`}>
        <span className={`${P}__bambou`} aria-hidden="true" />
        <div className={`${P}__rouleau`}>
          <p className={`${P}__texte`}>{designer(m.question)}</p>
          {compte && !termine && <Compteur valeur="?" />}
        </div>
        <span className={`${P}__bambou`} aria-hidden="true" />
      </div>
      {termine && <Explication m={m} />}
    </div>
  ));
}

/** Pour les tests : le nombre de syllabes d'un décompte. */
export const compterDecompte = (vers) => syllabesDe(vers)?.length ?? null;

/** Pour les tests : le décompte reprend-il le vers lettre pour lettre (ponctuation et espaces mis à part) ? */
const lettres = (t) => normaliser(t).replace(/[|()\s,;.!?—-]/g, '');
export const decompteFidele = (vers) => Boolean(DECOMPTES[vers]) && lettres(DECOMPTES[vers]) === lettres(vers);

const scene = {
  question: (m, termine) => <QuestionSyllabes m={m} termine={termine} />,
  // Le compteur, les lettres des rimes ou les blocs montrent déjà la bonne réponse.
  apres: () => null,
  objets: P,
};

export default scene;
