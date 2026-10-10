import { decouper } from '../../../../lib/jeux/aQuiLePronom';
import {
  capitale, chercherMot, DessinDuFil, useFil,
} from './outils';

/**
 * À QUI RENVOIE LE PRONOM ? — LE FIL DU PRONOM (09/10/2026). La couverture : un
 * village au bord de la mer, des panneaux de bois fléchés (il, elle, ils…), un
 * chat qui dort sur le muret, une ardoise. La scène la reprend :
 *   - LA QUESTION : le texte écrit à la craie sur l'ardoise, le mot en couleur
 *     surligné (comme avant), et les noms du texte qui pourraient convenir
 *     soulignés en pointillés — tous pareils : ce sont les suspects ;
 *   - LES RÉPONSES : des panneaux fléchés en bois, plantés comme sur la
 *     couverture ; le panneau faux penche et se barre ;
 *   - APRÈS LA RÉPONSE : un fil part du pronom et file jusqu'au bon nom, qui
 *     s'allume ; les autres suspects pâlissent ; le chat se réveille ; et la
 *     méthode du jeu se fait sous nos yeux : on REMPLACE le mot par le nom, et
 *     la phrase garde son sens.
 */

const CLE = 'sc-a-qui-le-pronom';

/** Le nom qui porte le sens : « le corbeau » → « corbeau », « la grand-mère » → « grand-mère ». */
const teteDe = (groupe) => String(groupe).trim().split(/\s+/).pop();

/** Le texte, ses suspects soulignés ; le bon s'allume une fois la manche finie. */
function AvecSuspects({ texte, tetes, bonne, termine, dejaMarque }) {
  const morceaux = [];
  let reste = texte;
  let k = 0;
  // On cherche, à chaque tour, le suspect qui vient le premier dans ce qui reste.
  for (;;) {
    let premier = null;
    for (const t of tetes) {
      const i = chercherMot(reste, t);
      if (i >= 0 && (!premier || i < premier.i)) premier = { i, t };
    }
    if (!premier) break;
    const mot = reste.slice(premier.i, premier.i + premier.t.length);
    const estBonne = premier.t === bonne;
    const fil = estBonne && termine && !dejaMarque.fait;
    if (fil) dejaMarque.fait = true;
    morceaux.push(reste.slice(0, premier.i));
    morceaux.push(
      <span
        key={k}
        className={`${CLE}__suspect${termine ? (estBonne ? ' est-bonne' : ' est-ecarte') : ''}`}
        data-antecedent={fil ? 'oui' : undefined}
      >
        {mot}
      </span>,
    );
    k += 1;
    reste = reste.slice(premier.i + premier.t.length);
  }
  morceaux.push(reste);
  return morceaux;
}

/** Le chat du muret : il dort tant qu'on cherche, il se réveille quand on a trouvé. */
function Chat({ reveille }) {
  return (
    <svg className={`${CLE}__chat${reveille ? ' est-reveille' : ''}`} viewBox="0 0 120 70" aria-hidden="true" focusable="false">
      <path className={`${CLE}__queue`} d="M96 52 q20 -2 18 -22" fill="none" stroke="#e7a95b" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="66" cy="50" rx="34" ry="17" fill="#f2c27f" />
      <path d="M50 38 q8 6 4 18 M66 35 q8 7 3 19 M82 38 q7 6 2 16" stroke="#d48d3c" strokeWidth="3" fill="none" strokeLinecap="round" />
      <g className={`${CLE}__tete`}>
        <path d="M14 30 l4 -16 l10 10 z M40 24 l6 -14 l4 16 z" fill="#f2c27f" stroke="#d48d3c" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="30" cy="38" r="17" fill="#f7d29a" stroke="#d48d3c" strokeWidth="2" />
        <g className={`${CLE}__yeux-fermes`}>
          <path d="M20 37 q4 3 8 0 M33 37 q4 3 8 0" stroke="#5a3a1a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
        <g className={`${CLE}__yeux-ouverts`}>
          <circle cx="24" cy="36" r="3.4" fill="#2c3a1a" />
          <circle cx="37" cy="36" r="3.4" fill="#2c3a1a" />
          <circle cx="25" cy="35" r="1.1" fill="#fff" />
          <circle cx="38" cy="35" r="1.1" fill="#fff" />
        </g>
        <path d="M28 43 l2 2 l2 -2" stroke="#b35b4a" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <g className={`${CLE}__zzz`}>
        <text x="48" y="16">z</text>
        <text x="58" y="8">z</text>
      </g>
    </svg>
  );
}

/**
 * LA PREUVE PAR LE REMPLACEMENT — la méthode que dit le jeu quand on se
 * trompe. Pour un sujet (il, elle, « le vieux marin »), on récrit la phrase
 * avec le nom à la place ; pour « l’ » ou « les », placés avant le verbe, la
 * phrase récrite serait bancale : on dit seulement qui ils remplacent.
 */
function Remplacement({ avant, mot, apres, bonne }) {
  const sujet = /^(il|elle|ils|elles)$/i.test(mot) || /\s/.test(mot.trim());
  if (!sujet) {
    return (
      <p className={`${CLE}__preuve`}>
        <mark className={`${CLE}__egal-mot`}>{mot}</mark>
        <span className={`${CLE}__egal`} aria-hidden="true">=</span>
        <strong>{bonne}</strong>
      </p>
    );
  }
  // La phrase du pronom : depuis le dernier point avant lui jusqu'au point suivant.
  const point = avant.lastIndexOf('. ');
  const avantPhrase = point >= 0 ? avant.slice(point + 2) : avant;
  const fin = apres.search(/[.!?](\s|$)/);
  const apresPhrase = fin >= 0 ? apres.slice(0, fin + 1) : apres;
  const nom = /^\p{Lu}/u.test(mot) && !/\S/.test(avantPhrase) ? capitale(bonne) : bonne;
  return (
    <p className={`${CLE}__preuve`}>
      <span className={`${CLE}__preuve-titre`}>Je remplace, je relis :</span>
      {' '}
      {avantPhrase}
      <strong className={`${CLE}__remplace`}>{nom}</strong>
      {apresPhrase}
      <span className={`${CLE}__coche`} aria-hidden="true"> ✔</span>
    </p>
  );
}

export function QuestionPronom({ m, termine }) {
  const texte = String(m.texte ?? m.question ?? '');
  const avecMot = texte.includes('[') && texte.includes(']');
  const [avant, mot, apres] = avecMot ? decouper(texte) : [texte, '', ''];
  const tetes = (m.choix ?? []).map((c) => teteDe(c.libelle)).filter(Boolean);
  const bonne = teteDe(m.bonne ?? '');
  const marque = { fait: false };
  const [conteneur, fil] = useFil(termine && avecMot, `.${CLE}__pronom`, `[data-antecedent="oui"]`);

  return (
    <div className={`${CLE}${termine ? ' est-termine' : ''}`}>
      <div className={`${CLE}__ardoise`} ref={conteneur}>
        <span className={`${CLE}__craie`} aria-hidden="true" />
        <p className={`texte-a-lire ${CLE}__texte`}>
          <AvecSuspects texte={avant} tetes={tetes} bonne={bonne} termine={termine} dejaMarque={marque} />
          {avecMot && <mark className={`surligne ${CLE}__pronom`}>{mot}</mark>}
          <AvecSuspects texte={apres} tetes={tetes} bonne={bonne} termine={termine} dejaMarque={marque} />
        </p>
        <DessinDuFil fil={fil} className={`${CLE}__fil`} />
        <Chat reveille={termine} />
      </div>
      {termine && avecMot && <Remplacement avant={avant} mot={mot} apres={apres} bonne={m.bonne} />}
    </div>
  );
}

/** Les panneaux fléchés : un par nom, plantés sur un même poteau, tour à tour à gauche et à droite. */
export function PanneauxPronom({ choix, fautes, choisir }) {
  return (
    <ul className={`${CLE}__poteau`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} className={`${CLE}__planche-place`} style={{ '--i': i }}>
            <button
              type="button"
              className={`${CLE}__planche ${CLE}__planche--${i % 2 ? 'droite' : 'gauche'}${faux ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={faux}
            >
              {libelle}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const scene = {
  question: (m, termine) => <QuestionPronom m={m} termine={termine} />,
  // La réponse est dans la scène : le fil, le nom allumé, la phrase récrite.
  apres: () => null,
  choix: ({ choix, fautes, choisir }) => <PanneauxPronom choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
