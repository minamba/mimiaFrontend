/**
 * PRÉFIXES ET SYNONYMES (CM1) — SENS ET NIVEAUX DE LANGUE (CM2) : L'ATELIER DES
 * MOTS (09/10/2026). La couverture du CM1 : deux poteaux couverts de planches
 * — les préfixes (re-, dé-, in-, pré-…) à gauche, une échelle de synonymes
 * (grand, immense, énorme, gigantesque…) à droite, des montagnes au fond.
 * Celle du CM2 : des bulles de parole autour d'un globe, et trois panneaux
 * « Familier, Courant, Soutenu ». La scène :
 *   - LA QUESTION : le mot à travailler, taillé dans un bloc de bois sur
 *     l'établi, et la consigne gravée au-dessus. Pour un préfixe, une encoche
 *     vide attend devant le mot ; pour un niveau, le mot attend au pied d'un
 *     ESCALIER à trois marches ;
 *   - LES RÉPONSES : des PIÈCES DE PUZZLE qui s'emboîtent (le faux se fend) ;
 *     pour les niveaux de langue, les trois MARCHES de l'escalier elles-mêmes ;
 *   - APRÈS LA RÉPONSE : la pièce s'emboîte. Le préfixe se colle au mot et la
 *     lettre qui décide s'allume (devant p, b, m : im ; devant l : il ; devant
 *     r : ir) ; l'adverbe se fabrique en deux temps (lent → lente → lentement) ;
 *     les synonymes se tiennent la main, les contraires se repoussent comme
 *     deux aimants ; le mot monte sur sa marche de l'escalier.
 */

const CLE = 'sc-vocabulaire-cm1';

/** Le premier mot entre guillemets, puis le second : « … » Ici, « souris » veut dire… */
const entreGuillemets = (texte) => [...String(texte).matchAll(/«\s*([^»]+?)\s*»/g)].map((r) => r[1]);

function regleDuPrefixe(mot) {
  const l = String(mot)[0]?.toLowerCase();
  if ('pbm'.includes(l)) return `devant ${l}, on écrit « im »`;
  if (l === 'l') return 'devant l, on écrit « il »';
  if (l === 'r') return 'devant r, on écrit « ir »';
  return 'ailleurs, on écrit « in »';
}

function Prefixe({ mot, bonne, termine }) {
  const colle = termine && bonne.endsWith(mot);
  const prefixe = colle ? bonne.slice(0, bonne.length - mot.length) : null;
  return (
    <div className={`${CLE}__etabli`}>
      <span className={`${CLE}__assemblage`} aria-hidden="true">
        <span className={`${CLE}__encoche${prefixe ? ' est-remplie' : ''}`}>{prefixe ?? '?'}</span>
        <span className={`${CLE}__bloc`}>
          <span className={`${CLE}__lettre-cle${prefixe ? ' est-allumee' : ''}`}>{mot[0]}</span>
          {mot.slice(1)}
        </span>
      </span>
      {prefixe && <p className={`${CLE}__regle`}>{`${bonne} : ${regleDuPrefixe(mot)}.`}</p>}
    </div>
  );
}

function Suffixe({ mot, bonne, termine }) {
  const feminin = bonne.endsWith('ment') ? bonne.slice(0, -4) : null;
  return (
    <div className={`${CLE}__etabli`}>
      <span className={`${CLE}__chaine`} aria-hidden="true">
        <span className={`${CLE}__bloc`}>{mot}</span>
        {termine && feminin && (
          <>
            <span className={`${CLE}__fleche`} style={{ '--i': 0 }}>→</span>
            <span className={`${CLE}__bloc ${CLE}__bloc--etape`} style={{ '--i': 0 }}>{feminin}</span>
            <span className={`${CLE}__fleche`} style={{ '--i': 1 }}>→</span>
            <span className={`${CLE}__bloc ${CLE}__bloc--etape ${CLE}__bloc--fin`} style={{ '--i': 1 }}>
              {feminin}
              <span className={`${CLE}__ment`}>ment</span>
            </span>
          </>
        )}
      </span>
      {termine && feminin && <p className={`${CLE}__regle`}>{`On part du féminin, « ${feminin} », puis on ajoute -ment : ${bonne}.`}</p>}
    </div>
  );
}

function Paire({ mot, bonne, sorte, termine }) {
  return (
    <div className={`${CLE}__etabli`}>
      <span className={`${CLE}__paire ${CLE}__paire--${sorte}${termine ? ' est-formee' : ''}`}>
        <span className={`${CLE}__bloc ${CLE}__bloc--gauche`}>{mot}</span>
        <span className={`${CLE}__lien`}>{sorte === 'synonyme' ? '≈' : '⇄'}</span>
        <span className={`${CLE}__bloc ${CLE}__bloc--droite`}>{termine ? bonne : '?'}</span>
      </span>
      {termine && (
        <p className={`${CLE}__regle`}>
          {sorte === 'synonyme' ? 'Des jumeaux : ils veulent dire la même chose.' : 'Deux aimants qui se repoussent : ils disent le contraire.'}
        </p>
      )}
    </div>
  );
}

const MARCHES = [
  ['soutenu', 'dans les livres'],
  ['courant', 'partout'],
  ['familier', 'entre copains'],
];

function Escalier({ mot, bonne }) {
  return (
    <div className={`${CLE}__escalier-fini`}>
      {MARCHES.map(([niveau, dit], i) => (
        <span key={niveau} className={`${CLE}__marche-fixe ${CLE}__marche--${niveau}${niveau === bonne ? ' est-la' : ''}`} style={{ '--i': i }}>
          {niveau === bonne && <span className={`${CLE}__grimpeur`}>{mot}</span>}
          <span className={`${CLE}__marche-nom`}>{`${niveau} : ${dit}`}</span>
        </span>
      ))}
    </div>
  );
}

function Polysemie({ phrase, mot, bonne, termine }) {
  return (
    <div className={`${CLE}__etabli`}>
      <span className={`${CLE}__bulle-sens`}>
        <strong>{mot}</strong>
        {' = '}
        {termine ? bonne : '?'}
      </span>
      {termine && phrase && <p className={`${CLE}__regle`}>Le reste de la phrase dit de quoi on parle.</p>}
    </div>
  );
}

function Dessin({ m, termine }) {
  const cites = entreGuillemets(m.question);
  const mot = m.consigne === 'polysemie' ? cites[1] : cites[0];
  if (!mot) return null;
  const bonne = String(m.bonne);
  if (m.consigne === 'prefixe') return <Prefixe mot={mot} bonne={bonne} termine={termine} />;
  if (m.consigne === 'suffixe') return <Suffixe mot={mot} bonne={bonne} termine={termine} />;
  if (m.consigne === 'synonyme' || m.consigne === 'contraire') return <Paire mot={mot} bonne={bonne} sorte={m.consigne} termine={termine} />;
  if (m.consigne === 'niveau') return termine ? <Escalier mot={mot} bonne={bonne} /> : null;
  if (m.consigne === 'polysemie') return <Polysemie phrase={cites[0]} mot={mot} bonne={bonne} termine={termine} />;
  return null;
}

export function QuestionVocabulaire({ m, termine }) {
  return (
    <div className={`${CLE}${termine ? ' est-termine' : ''}`}>
      <p className={`phrase-a-trou ${CLE}__enseigne`}>{m.question}</p>
      <Dessin m={m} termine={termine} />
    </div>
  );
}

/** Les pièces de puzzle ; pour les niveaux de langue, les marches d'un escalier. */
export function PiecesOuMarches({ m, choix, fautes, choisir }) {
  const escalier = m.consigne === 'niveau';
  // L'escalier se lit de haut en bas : soutenu en haut, familier en bas.
  const ordre = escalier ? [...choix].sort((a, b) => MARCHES.findIndex(([n]) => n === a.cle) - MARCHES.findIndex(([n]) => n === b.cle)) : choix;
  return (
    <ul className={`${CLE}__${escalier ? 'escalier' : 'pieces'}`} aria-label="Choisis ta réponse">
      {ordre.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <button
              type="button"
              className={`${CLE}__${escalier ? 'marche' : 'piece'} ${CLE}__teinte--${i % 3}${faux ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={faux}
            >
              {!escalier && <span className={`${CLE}__tenon`} aria-hidden="true" />}
              {libelle}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const scene = {
  question: (m, termine) => <QuestionVocabulaire m={m} termine={termine} />,
  // Le mot fabriqué, la paire formée, le mot sur sa marche : la réponse est dans la scène.
  apres: () => null,
  choix: ({
    m, choix, fautes, choisir,
  }) => <PiecesOuMarches m={m} choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
