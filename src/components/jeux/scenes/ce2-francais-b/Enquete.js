import { CLASSES, NOMS_CLASSES } from '../../../../lib/jeux/detectiveDuVerbe';
import { Cligne, Decor, Mascotte } from './communs';

/**
 * LE DÉTECTIVE DES CLASSES (« le détective du verbe » au CE2), SON UNIVERS
 * (09/10/2026). La couverture est celle du CE1 : un bureau de détective la
 * nuit — la lune et le clocher à la fenêtre, la lampe allumée, la boussole,
 * la tasse « les mots mènent toujours à la bonne réponse », et surtout LE
 * TABLEAU DE LIÈGE où des fiches épinglées sont reliées par des fils rouges
 * (« Qui ? », « Quoi ? », « verbe » entouré de rouge). Le CE1 a pris la carte
 * et la loupe ; le CE2, qui range les mots par classes, prend le tableau :
 *   - LE DÉCOR : la fenêtre de nuit (lune, étoiles qui scintillent, clocher),
 *     le halo de la lampe où dansent des poussières, la boussole dont
 *     l'aiguille hésite, des photos épinglées qui se balancent ;
 *   - LE TABLEAU DE LIÈGE : cinq fiches, une par classe (nom, verbe,
 *     déterminant, adjectif, pronom), reliées par le fil rouge. La fiche
 *     RECHERCHÉE (celle de la consigne) est entourée de rouge et frétille ;
 *   - LA PHRASE devient le dossier de l'enquête (chemise kraft), chaque mot
 *     une fiche à toucher ;
 *   - CHAQUE MOT TOUCHÉ EST CLASSÉ : un mot faux s'épingle sur la fiche de SA
 *     classe (l'erreur apprend quelque chose) ; le bon mot s'épingle sur la
 *     fiche recherchée, le tampon « classé » tombe, le mot s'entoure de rouge
 *     dans le dossier ;
 *   - LA MASCOTTE : la tasse de la couverture, coiffée de la casquette du
 *     détective — sa vapeur monte, elle cligne, saute de joie, penche pour
 *     encourager.
 */

const CLE = 'sc-detective-du-verbe-ce2';

const ETOILES = [[4, 16, 0], [9, 10, 1.2], [13, 22, 2.1], [6, 30, 0.6], [15, 13, 1.7]];
const POUSSIERES = [[78, 2, 7], [84, 4.5, 9], [90, 1, 8], [74, 6, 10], [88, 3.2, 6.5]];

/** Le bureau de la nuit, derrière le tableau et le dossier. */
export function DecorEnquete({ resolu = false }) {
  return (
    <Decor className={`${CLE}__decor${resolu ? ' est-resolu' : ''}`}>
      <span className={`${CLE}__fenetre`}>
        <span className={`${CLE}__lune`} />
        {ETOILES.map(([x, y, d]) => (
          <span key={`${x}-${y}`} className={`${CLE}__etoile-ciel`} style={{ '--x': `${(x - 2) * 7}%`, '--y': `${y * 2}%`, '--delai': `${-d}s` }} />
        ))}
        <svg className={`${CLE}__clocher`} viewBox="0 0 100 60" preserveAspectRatio="none" focusable="false">
          <path d="M0 60 V44 H14 V36 H22 V44 H34 V18 L40 4 L46 18 V44 H60 V38 H74 V30 H82 V40 H100 V60 Z" fill="#141c33" />
          <circle cx="40" cy="26" r="3" fill="#ffd56b" opacity="0.8" />
        </svg>
      </span>
      <span className={`${CLE}__halo`} />
      {POUSSIERES.map(([x, delai, duree]) => (
        <span key={x} className={`${CLE}__poussiere`} style={{ '--x': `${x}%`, '--delai': `${-delai}s`, '--duree': `${duree}s` }} />
      ))}
      <span className={`${CLE}__photo ${CLE}__photo--a`} />
      <span className={`${CLE}__photo ${CLE}__photo--b`} />
      <span className={`${CLE}__boussole`}>
        <svg viewBox="0 0 60 60" focusable="false">
          <circle cx="30" cy="30" r="27" fill="#d4a73a" stroke="#7a5a12" strokeWidth="3" />
          <circle cx="30" cy="30" r="21" fill="#f7efd9" stroke="#b08a2a" strokeWidth="1.5" />
          <path d="M30 11 V15 M30 45 V49 M11 30 H15 M45 30 H49" stroke="#7a5a12" strokeWidth="2" />
          <g className={`${CLE}__aiguille`}>
            <path d="M30 14 L34 30 L30 32 L26 30 Z" fill="#d62828" />
            <path d="M30 46 L34 30 L30 28 L26 30 Z" fill="#33475b" />
          </g>
          <circle cx="30" cy="30" r="2.5" fill="#7a5a12" />
        </svg>
      </span>
    </Decor>
  );
}

/** Le petit dessin de chaque classe, sur sa fiche. */
function IconeClasse({ classe }) {
  const dessins = {
    // Le nom : une chose — une maisonnette.
    nom: <path d="M4 12 L12 4 L20 12 V20 H4 Z M10 20 V14 H14 V20" />,
    // Le verbe : l'action — un éclair.
    verbe: <path d="M13 2 L5 13 H11 L9 22 L19 9 H13 Z" />,
    // Le déterminant : le petit mot qui va DEVANT le nom — une flèche vers une boîte.
    determinant: <path d="M2 12 H10 M7 8 L11 12 L7 16 M13 6 H22 V18 H13 Z" />,
    // L'adjectif : comment est le nom — une palette.
    adjectif: <path d="M12 3 C6 3 2 7 2 12 C2 17 6 21 11 21 C13 21 13 19 12 18 C11 16 12 15 14 15 H17 C20 15 22 13 22 10 C22 6 18 3 12 3 Z M7 11 h.1 M10 7 h.1 M15 7 h.1 M18 10 h.1" />,
    // Le pronom : il remplace le nom — une silhouette.
    pronom: <path d="M12 3 A4 4 0 1 1 12 11 A4 4 0 1 1 12 3 Z M4 21 C4 15 8 13 12 13 C16 13 20 15 20 21 Z" />,
  };
  return (
    <svg className={`${CLE}__icone`} viewBox="0 0 24 24" focusable="false">
      {dessins[classe] ?? <circle cx="12" cy="12" r="6" />}
    </svg>
  );
}

/** Un mot tel qu'on l'épingle : sans sa ponctuation finale. */
export const motNu = (mot) => String(mot ?? '').replace(/[,.!?;:]+$/, '');

/**
 * QUI VA SUR QUELLE FICHE. Les mots faux, sur la fiche de leur classe (un mot
 * d'aucune des cinq classes ne s'épingle nulle part) ; une fois la manche
 * finie, le mot trouvé — ou, montrés après deux erreurs, tous les mots de la
 * classe cherchée — sur la fiche recherchée. Jamais avant la fin.
 */
export function epingles(p, cible, fautes = [], trouve = null, montrer = false) {
  const parClasse = Object.fromEntries(CLASSES.map((c) => [c, []]));
  if (!p?.mots || !p?.classes) return parClasse;
  fautes.forEach((i) => {
    const c = p.classes[i];
    if (parClasse[c]) parClasse[c].push({ i, mot: motNu(p.mots[i]), bon: false });
  });
  if (parClasse[cible]) {
    if (trouve !== null && trouve !== undefined) parClasse[cible].push({ i: trouve, mot: motNu(p.mots[trouve]), bon: true });
    else if (montrer) {
      p.classes.forEach((c, i) => {
        if (c === cible) parClasse[cible].push({ i, mot: motNu(p.mots[i]), bon: true });
      });
    }
  }
  return parClasse;
}

/**
 * LE TABLEAU DE LIÈGE : cinq fiches reliées par le fil rouge. Il ne fait que
 * reprendre ce que l'écran a déjà dit (la classe cherchée, la classe des mots
 * faux) : il est `aria-hidden`.
 */
export function TableauDeLiege({
  p, cible, fautes = [], trouve = null, montrer = false,
}) {
  const termine = trouve !== null || montrer;
  const classes = epingles(p, cible, fautes, trouve, montrer);
  return (
    <div className={`${CLE}__liege${termine ? ' est-termine' : ''}`} aria-hidden="true">
      <svg className={`${CLE}__fil`} viewBox="0 0 100 20" preserveAspectRatio="none" focusable="false">
        <path d="M10 5 Q20 14 30 5 Q40 14 50 5 Q60 14 70 5 Q80 14 90 5" />
      </svg>
      <ul className={`${CLE}__fiches`}>
        {CLASSES.map((c, n) => {
          const recherchee = c === cible;
          return (
            <li
              key={c}
              className={`${CLE}__fiche ${CLE}__fiche--${c}${recherchee ? ' est-recherchee' : ''}${classes[c].length ? ' est-garnie' : ''}`}
              style={{ '--n': n }}
              data-classe={c}
            >
              <span className={`${CLE}__punaise`} />
              <span className={`${CLE}__titre`}>
                <IconeClasse classe={c} />
                {NOMS_CLASSES[c].replace(/^une? /, '')}
              </span>
              <span className={`${CLE}__pieces`}>
                {classes[c].map(({ i, mot, bon }) => (
                  <span key={i} className={`${CLE}__piece${bon ? ' est-bon' : ' est-faux'}`}>{mot}</span>
                ))}
              </span>
              {recherchee && <span className={`${CLE}__cercle`} />}
              {recherchee && termine && (
                <svg className={`${CLE}__tampon`} viewBox="0 0 60 60" focusable="false">
                  <circle cx="30" cy="30" r="26" fill="none" stroke="#d62828" strokeWidth="4" />
                  <path d="M17 31 L26 40 L44 20" fill="none" stroke="#d62828" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** La tasse du détective, coiffée de sa casquette à carreaux ; sa vapeur monte. */
export function Tasse({ humeur, declic }) {
  return (
    <Mascotte nom="tasse" humeur={humeur} declic={declic} className={`${CLE}__tasse`}>
      <svg viewBox="0 0 130 150" focusable="false">
        <g className={`${CLE}__vapeurs`}>
          <path className={`${CLE}__vapeur`} style={{ '--n': 0 }} d="M66 44 Q58 34 66 24 Q74 14 66 4" />
          <path className={`${CLE}__vapeur`} style={{ '--n': 1 }} d="M82 46 Q74 36 82 26 Q90 16 82 6" />
          <path className={`${CLE}__vapeur`} style={{ '--n': 2 }} d="M50 46 Q42 36 50 26 Q58 16 50 6" />
        </g>
        <path d="M100 74 Q124 74 122 96 Q120 118 96 116" fill="none" stroke="#e9e4da" strokeWidth="11" strokeLinecap="round" />
        <path d="M100 74 Q124 74 122 96 Q120 118 96 116" fill="none" stroke="#9a8f80" strokeWidth="2" opacity="0.5" />
        <path d="M22 54 H104 V122 Q104 144 82 144 H44 Q22 144 22 122 Z" fill="#fbf8f2" stroke="#8a7d6c" strokeWidth="3" />
        <ellipse cx="63" cy="55" rx="41" ry="8" fill="#6b3f1d" stroke="#8a7d6c" strokeWidth="3" />
        <ellipse cx="56" cy="54" rx="14" ry="2.5" fill="#9a6435" opacity="0.7" />
        <path d="M22 118 H104" stroke="#d62828" strokeWidth="5" opacity="0.85" />
        <g className={`${CLE}__visage`}>
          <Cligne decalage={0.9}>
            <ellipse cx="50" cy="86" rx="5" ry="6.5" fill="#2b1d12" />
            <ellipse cx="76" cy="86" rx="5" ry="6.5" fill="#2b1d12" />
            <circle cx="51.5" cy="83.5" r="1.8" fill="#fff" />
            <circle cx="77.5" cy="83.5" r="1.8" fill="#fff" />
          </Cligne>
          <ellipse cx="40" cy="98" rx="6" ry="3.5" fill="#ffa4a4" opacity="0.7" />
          <ellipse cx="86" cy="98" rx="6" ry="3.5" fill="#ffa4a4" opacity="0.7" />
          <path className="sc-ce2-francais-b__sourire" d="M55 98 Q63 105 71 98" fill="none" stroke="#2b1d12" strokeWidth="2.5" strokeLinecap="round" />
          <path className="sc-ce2-francais-b__bouche" d="M54 97 Q63 112 72 97 Z" fill="#c2334f" stroke="#2b1d12" strokeWidth="2" />
        </g>
        <g className={`${CLE}__casquette`}>
          <path d="M12 54 Q10 30 34 26 Q56 24 60 46 Q36 40 12 54 Z" fill="#8a6a45" stroke="#4e3117" strokeWidth="2.5" />
          <path d="M18 46 Q34 36 56 42 M26 30 V48 M40 27 V44" stroke="#5e4428" strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M8 52 Q2 58 10 60 Q22 56 30 50 Z" fill="#8a6a45" stroke="#4e3117" strokeWidth="2" />
          <path d="M30 26 Q36 18 44 26" stroke="#4e3117" strokeWidth="2.5" fill="none" />
        </g>
      </svg>
    </Mascotte>
  );
}
