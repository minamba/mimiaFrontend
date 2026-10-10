import { Boutons, Designe, entreCrochets, laBonne } from './commun';

/**
 * LE CABINET DU DÉTECTIVE — « Le détective des classes » (6e). La couverture
 * montre un bureau de détective : un mur vert, des niches éclairées, et sur
 * chaque objet une ÉTIQUETTE DE COULEUR. La scène la reprend :
 *   - LA QUESTION : le dossier d'enquête épinglé au mur, la phrase dedans, et
 *     une loupe qui tremble au-dessus du mot suspect ;
 *   - LES RÉPONSES : des étiquettes de musée qui pendent à une tringle de
 *     laiton, une couleur par classe de mots — on clique celle qu'on accroche ;
 *   - APRÈS LA RÉPONSE : la bonne étiquette tombe et s'accroche au mot, qui
 *     prend sa couleur, et le tampon « Affaire résolue » s'abat sur le dossier.
 * Avant la réponse, toutes les étiquettes se valent : aucune ne brille.
 */

const P = 'sc-detective-des-classes';

/** Une couleur par classe de mots, la même sur l'étiquette et sur le mot. */
export const TEINTES = {
  nom: '#e03131',
  determinant: '#e8590c',
  adjectif: '#2b8a3e',
  pronom: '#7048e8',
  verbe: '#1971c2',
  adverbe: '#c2255c',
  preposition: '#0b7285',
  conjonction: '#b08800',
};

const ARTICLE = {
  nom: 'un nom',
  determinant: 'un déterminant',
  adjectif: 'un adjectif',
  pronom: 'un pronom',
  verbe: 'un verbe',
  adverbe: 'un adverbe',
  preposition: 'une préposition',
  conjonction: 'une conjonction',
};

const teinte = (cle) => TEINTES[cle] ?? '#5c6b80';

/** Les niches du cabinet, comme sur la couverture : un objet et son étiquette dans chacune. */
function Niches() {
  return (
    <svg className={`${P}__niches`} viewBox="0 0 320 64" aria-hidden="true" focusable="false">
      <rect x="0" y="54" width="320" height="10" rx="3" fill="#6b3f1d" />
      {[
        { x: 18, forme: 'M0 50 V18 A26 26 0 0 1 52 18 V50 Z', objet: <ellipse cx="26" cy="38" rx="11" ry="12" fill="#cfd6c4" stroke="#8a927d" />, c: TEINTES.nom },
        { x: 92, forme: 'M13 0 H39 L52 25 L39 50 H13 L0 25 Z', objet: <path d="M18 18 h16 l-6 12 6 12 h-16 l6 -12 z" fill="#f4e2b8" stroke="#a07a32" />, c: TEINTES.verbe },
        { x: 166, forme: 'M0 50 V8 H52 V50 Z', objet: <g><rect x="16" y="32" width="20" height="14" rx="2" fill="#8a5a2b" /><circle cx="26" cy="24" r="10" fill="#3f8f4f" /></g>, c: TEINTES.adjectif },
        { x: 240, forme: 'M26 0 A26 26 0 1 1 25.9 0 Z', objet: <rect x="17" y="18" width="18" height="16" rx="3" fill="#7a4a24" />, c: TEINTES.pronom },
      ].map((n, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={i} transform={`translate(${n.x} 2)`}>
          <path d={n.forme} fill="#5a3418" stroke="#c9a15b" strokeWidth="2" />
          <path d={n.forme} fill="url(#sc-detective-des-classes-lueur)" />
          {n.objet}
          <g className={`${P}__etiquette-niche`} style={{ '--i': i }}>
            <line x1="44" y1="20" x2="44" y2="28" stroke="#e9dcc0" strokeWidth="1.2" />
            <rect x="38" y="28" width="12" height="16" rx="2" fill={n.c} />
          </g>
        </g>
      ))}
      <defs>
        <radialGradient id="sc-detective-des-classes-lueur" cx="50%" cy="0%" r="90%">
          <stop offset="0%" stopColor="#ffe8a3" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffe8a3" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** La loupe du détective, qui tremble au-dessus du mot suspect (dessin seul). */
const Loupe = () => <span className={`${P}__loupe`} aria-hidden="true" />;

export function QuestionDetective({ m, termine }) {
  const bonne = m.bonne;
  const mot = entreCrochets(m.question);
  return (
    <div className={`${P}${termine ? ' est-resolu' : ''}`} style={termine ? { '--teinte': teinte(bonne) } : undefined}>
      <Niches />
      <div className={`${P}__dossier`}>
        <span className={`${P}__punaise`} aria-hidden="true" />
        <p className={`${P}__entete`} aria-hidden="true">Dossier — le suspect est souligné</p>
        <p className={`${P}__phrase`}>
          <Designe
            texte={m.question}
            classe={`${P}__suspect`}
            apres={termine
              // L'étiquette s'accroche au mot : son nom passe par le CSS, pour ne pas couper la phrase.
              ? <span className={`${P}__accrochee`} data-nom={laBonne(m)} aria-hidden="true" />
              : <Loupe />}
          />
        </p>
        {termine && <span className={`${P}__tampon`} aria-hidden="true">Affaire résolue</span>}
      </div>
      {termine && (
        <p className={`${P}__verdict`} role="status">
          {mot ? `« ${mot} » est ` : 'C’est '}
          <strong>{ARTICLE[bonne] ?? laBonne(m)}</strong>
          .
        </p>
      )}
    </div>
  );
}

/** Les étiquettes qui pendent à la tringle : une par réponse, chacune de sa couleur. */
export function EtiquettesDetective({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__tringle`}>
      <Boutons
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        prefixe={P}
        etiquette="Choisis l’étiquette à accrocher"
        styleDe={(c) => ({ '--teinte': teinte(c.cle) })}
        rendu={(c) => (
          <>
            <span className={`${P}__oeillet`} aria-hidden="true" />
            <span className={`${P}__nom`}>{c.libelle}</span>
          </>
        )}
      />
    </div>
  );
}
