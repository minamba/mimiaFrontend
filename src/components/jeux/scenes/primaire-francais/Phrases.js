import { useEffect, useState } from 'react';
import { enMorceaux, estUnMot, mouvementReduit } from './outils';

/**
 * TYPES ET FORMES (CM1) — SIMPLE OU COMPLEXE ? (CM2) : LE BUREAU DES TAMPONS
 * (09/10/2026). Les couvertures montrent des panneaux à symboles (« Forme
 * affirmative + », « Forme négative − ») et, au CM2, deux chemins qui se
 * séparent : le bleu de la phrase simple, l'orange de la phrase complexe. La
 * scène :
 *   - LA QUESTION : la phrase, sur une fiche posée sous la lampe du bureau ;
 *   - LES RÉPONSES : des TAMPONS encreurs (un manche, un socle gravé) ; on en
 *     prend un et on tamponne la fiche. Le mauvais tampon se fend ;
 *   - APRÈS LA RÉPONSE : le bon tampon laisse son empreinte sur la fiche, et
 *     la lampe éclaire LES INDICES : la ponctuation de la fin (? ou !), les
 *     deux pinces de la négation (ne… pas, ne… jamais, personne ne), et au CM2
 *     les verbes conjugués qui s'allument UN PAR UN, comptés comme à l'usine —
 *     un seul : chemin bleu, phrase simple ; deux ou plus : chemin orange.
 *     Les infinitifs restent gris : ils ne comptent pas.
 */

const CLE = 'sc-phrases-cm1';

/**
 * LES VERBES CONJUGUÉS DES PHRASES DU CM2 (`phrasesCM2.js`), relevés à la
 * main : on ne devine pas un verbe conjugué par programme. Une phrase absente
 * de cette liste n'a simplement pas de comptage.
 */
const VERBES = {
  'Le petit chat noir de la voisine dort sur le canapé.': { conjugues: ['dort'] },
  'Pendant les longues vacances d’été, nous allons chez nos cousins.': { conjugues: ['allons'] },
  'Léo veut partir à la mer.': { conjugues: ['veut'], infinitifs: ['partir'] },
  'Elle aime lire et dessiner.': { conjugues: ['aime'], infinitifs: ['lire', 'dessiner'] },
  'Il pleut.': { conjugues: ['pleut'] },
  'Il pleut, alors nous restons à la maison.': { conjugues: ['pleut', 'restons'] },
  'Je mange quand j’ai faim.': { conjugues: ['mange', 'ai'] },
  'Le chien aboie et le chat s’enfuit.': { conjugues: ['aboie', 'enfuit'] },
  'Tom sait que sa sœur viendra.': { conjugues: ['sait', 'viendra'] },
  'Elle rit, il chante, nous dansons.': { conjugues: ['rit', 'chante', 'dansons'] },
};

const NEGATION_1 = /^(ne|n’|n')$/i;
const NEGATION_2 = /^(pas|jamais|plus|personne|rien)$/i;

/** Les morceaux de la phrase, les indices marqués : négation, verbes, infinitifs. */
function indices(texte, consigne) {
  const morceaux = enMorceaux(texte);
  const mots = morceaux.filter(estUnMot);
  // La négation n'existe que si « ne » est là.
  const negative = mots.some((w) => NEGATION_1.test(w) || /^n’/i.test(w));
  const verbes = consigne === 'compter' ? VERBES[texte] : null;
  let rang = 0;
  return morceaux.map((morceau) => {
    if (!estUnMot(morceau)) return { texte: morceau };
    // « n’ai » : le n’ de la négation collé au verbe.
    if (negative && (NEGATION_1.test(morceau) || NEGATION_2.test(morceau) || /^n’/i.test(morceau))) {
      return { texte: morceau, sorte: 'pince' };
    }
    if (verbes?.conjugues.includes(morceau)) {
      rang += 1;
      return { texte: morceau, sorte: 'verbe', rang };
    }
    if (verbes?.infinitifs?.includes(morceau)) return { texte: morceau, sorte: 'infinitif' };
    return { texte: morceau };
  });
}

/** La fiche. Une fois la manche finie, les indices s'allument — un verbe de plus à chaque pas. */
function Fiche({ m, termine }) {
  const texte = String(m.question ?? '');
  const morceaux = indices(texte, m.consigne);
  const total = morceaux.filter((x) => x.sorte === 'verbe').length;
  const [allumes, setAllumes] = useState(0);

  // Un verbe de plus toutes les trois quarts de seconde ; tous d'un coup si l'enfant veut moins d'animations.
  useEffect(() => {
    if (!termine || allumes >= total) return undefined;
    const vite = mouvementReduit();
    const id = setTimeout(() => setAllumes((n) => (vite ? total : n + 1)), vite ? 0 : 500 + Math.min(allumes, 1) * 250);
    return () => clearTimeout(id);
  }, [termine, allumes, total]);

  return (
    <p className={`${CLE}__fiche-texte`}>
      {morceaux.map((x, i) => {
        if (!termine || !x.sorte) {
          // Le point final, mis en valeur une fois la manche finie (les espaces restent où ils sont).
          const fin = termine && i === morceaux.length - 1 ? x.texte.match(/^(.*?)([?!])(\s*)$/s) : null;
          if (fin) {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <span key={i}>
                {fin[1]}
                <span className={`${CLE}__ponctuation`}>{fin[2]}</span>
                {fin[3]}
              </span>
            );
          }
          // eslint-disable-next-line react/no-array-index-key
          return <span key={i}>{x.texte}</span>;
        }
        if (x.sorte === 'verbe') {
          const allume = x.rang <= allumes;
          return (
            // eslint-disable-next-line react/no-array-index-key
            <span key={i} className={`${CLE}__verbe${allume ? ' est-allume' : ''}`} data-rang={allume ? x.rang : undefined}>
              {x.texte}
            </span>
          );
        }
        // eslint-disable-next-line react/no-array-index-key
        return <span key={i} className={`${CLE}__${x.sorte}`}>{x.texte}</span>;
      })}
    </p>
  );
}

const TYPES = { declarative: ['Déclarative', 'raconte'], interrogative: ['Interrogative', 'pose une question'], imperative: ['Impérative', 'donne un ordre'] };

/** Les indices nommés, une fois la manche finie. */
function Indices({ m }) {
  if (m.consigne === 'compter') {
    const n = VERBES[m.question]?.conjugues.length;
    return (
      <div className={`${CLE}__chemin ${CLE}__chemin--${m.bonne === 'complexe' ? 'complexe' : 'simple'}`}>
        {n ? <strong>{`${n} verbe${n > 1 ? 's' : ''} conjugué${n > 1 ? 's' : ''}`}</strong> : null}
        <span>{m.bonne === 'complexe' ? ' → phrase complexe' : ' → phrase simple'}</span>
        {VERBES[m.question]?.infinitifs && <span className={`${CLE}__note`}>l’infinitif ne compte pas</span>}
      </div>
    );
  }
  const [type, neg, excl] = String(m.bonne).split('.');
  if (!TYPES[type]) return null;
  return (
    <ul className={`${CLE}__badges`}>
      <li className={`${CLE}__badge`} style={{ '--i': 0 }}>
        <span aria-hidden="true">{type === 'interrogative' ? '❓' : type === 'imperative' ? '👉' : '💬'}</span>
        {` ${TYPES[type][0]} : elle ${TYPES[type][1]}`}
      </li>
      <li className={`${CLE}__badge`} style={{ '--i': 1 }}>
        <span className={`${CLE}__signe`} aria-hidden="true">{neg === 'neg' ? '−' : '+'}</span>
        {neg === 'neg' ? ' Négative : ne… pas' : ' Affirmative : pas de négation'}
      </li>
      {excl === 'excl' && (
        <li className={`${CLE}__badge`} style={{ '--i': 2 }}>
          <span className={`${CLE}__signe`} aria-hidden="true">!</span>
          {' Exclamative : une émotion'}
        </li>
      )}
    </ul>
  );
}

export function QuestionPhrases({ m, termine }) {
  const empreinte = (m.choix ?? []).find((c) => c.cle === m.bonne)?.libelle;
  return (
    <div className={`${CLE}${termine ? ' est-termine' : ''}`}>
      <span className={`${CLE}__lampe`} aria-hidden="true" />
      <div className={`${CLE}__fiche`}>
        <Fiche m={m} termine={termine} />
        {termine && empreinte && <span className={`${CLE}__empreinte`} data-texte={empreinte} aria-hidden="true" />}
      </div>
      {termine && <Indices m={m} />}
    </div>
  );
}

/** Les tampons : un manche rond, un socle où la réponse est gravée. */
export function Tampons({ choix, fautes, choisir }) {
  return (
    <ul className={`${CLE}__tampons`} aria-label="Choisis ton tampon">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <button
              type="button"
              className={`${CLE}__tampon ${CLE}__encre--${i % 3}${faux ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={faux}
            >
              <span className={`${CLE}__manche`} aria-hidden="true" />
              <span className={`${CLE}__socle`}>{libelle}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const scene = {
  question: (m, termine) => <QuestionPhrases m={m} termine={termine} />,
  // L'empreinte du bon tampon sur la fiche, et les indices : la réponse est dans la scène.
  apres: () => null,
  choix: ({ choix, fautes, choisir }) => <Tampons choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
