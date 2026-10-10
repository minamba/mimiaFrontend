import { Fete, Mascotte, rangee } from './communs';

/**
 * LE COFFRE DES CENTAINES (CE1, CE2) — 09/10/2026. La couverture : la grande
 * salle d'un château, une bannière bleue qui range « centaines, dizaines,
 * unités », un coffre au trésor ouvert d'où jaillissent des plaques bleues,
 * des barres vertes et des cubes jaunes, des éclats dorés partout. La scène :
 *   - LE DÉCOR VIVANT, par-dessus le décor peint : des rayons de lumière qui
 *     tombent de la fenêtre et passent lentement, des étincelles qui
 *     scintillent, des cubes de lumière qui montent ;
 *   - LE MATÉRIEL AUX COULEURS DE LA COUVERTURE (par le CSS, sans toucher au
 *     dessin ni au rôle des pièces) : plaque bleue, barre verte, cube jaune ;
 *     chaque pièce posée tombe dans sa case avec un petit rebond ;
 *   - LA MASCOTTE : un petit coffre au trésor qui a des yeux. Il attend en se
 *     dandinant, il ouvre grand son couvercle et en fait jaillir trois cubes à
 *     la réussite, il hoche la tête à l'erreur ;
 *   - LA FÊTE : pièces d'or et cubes en gerbe, le grand coffre qui brille.
 * Rien de tout cela ne dit le nombre : la fête ne part qu'une fois juste.
 */
export const PREFIXE = 'sc-coffre-des-centaines';

/** Les éclats de la fête : pièces d'or et cubes des trois couleurs. */
const ECLATS = ['piece', 'bleu', 'piece', 'vert', 'piece', 'jaune', 'piece', 'bleu', 'piece', 'vert', 'piece', 'jaune', 'piece', 'bleu'];

export function FeteCoffre() {
  return <Fete prefixe={PREFIXE} eclats={ECLATS} />;
}

/** Où scintillent les éclats dorés, en pour cent du décor : au bord, jamais sur le jeu. */
const SCINTILLES = [[5, 34], [93, 22], [12, 70], [88, 58], [70, 9], [24, 12], [95, 80]];

/** LE DÉCOR : les rayons de la fenêtre, les étincelles, les cubes de lumière. */
export function DecorCoffre() {
  return (
    <div className={`${PREFIXE}__decor`} aria-hidden="true">
      {/* Les rayons de lumière qui tombent de la grande fenêtre, et passent lentement. */}
      {rangee(3).map((i) => <span key={`r${i}`} className={`${PREFIXE}__rayon`} style={{ '--i': i }} />)}
      {SCINTILLES.map(([x, y], i) => (
        <span key={`${x}-${y}`} className={`${PREFIXE}__scintille`} style={{ '--i': i, left: `${x}%`, top: `${y}%` }} />
      ))}
      {rangee(5).map((i) => (
        <span key={`c${i}`} className={`${PREFIXE}__cube-volant ${PREFIXE}__cube-volant--${['bleu', 'vert', 'jaune'][i % 3]}`} style={{ '--i': i }} />
      ))}
    </div>
  );
}

/**
 * LE PETIT COFFRE QUI A DES YEUX. Le couvercle est un groupe à part : il se
 * soulève à la réussite et laisse jaillir trois cubes (bleu, vert, jaune).
 */
export function Coffret({ humeur, cle }) {
  return (
    <Mascotte prefixe={PREFIXE} humeur={humeur} cle={cle}>
      <svg viewBox="0 0 100 100" focusable="false">
        <ellipse cx="50" cy="94" rx="36" ry="5" className={`${PREFIXE}__ombre`} />
        {/* La lumière du trésor et les trois cubes qui sautent dehors. */}
        <ellipse cx="50" cy="44" rx="30" ry="9" className={`${PREFIXE}__lueur`} />
        <rect x="30" y="36" width="12" height="12" rx="2" className={`${PREFIXE}__saute ${PREFIXE}__saute--bleu`} />
        <rect x="45" y="34" width="10" height="10" rx="2" className={`${PREFIXE}__saute ${PREFIXE}__saute--jaune`} />
        <rect x="59" y="35" width="6" height="14" rx="2" className={`${PREFIXE}__saute ${PREFIXE}__saute--vert`} />
        {/* Le corps du coffre : du bois, des ferrures d'or, la serrure. */}
        <rect x="12" y="46" width="76" height="44" rx="6" className={`${PREFIXE}__bois`} />
        <rect x="12" y="52" width="76" height="5" className={`${PREFIXE}__ferrure`} />
        <rect x="18" y="46" width="6" height="44" className={`${PREFIXE}__ferrure`} />
        <rect x="76" y="46" width="6" height="44" className={`${PREFIXE}__ferrure`} />
        <rect x="44" y="55" width="12" height="13" rx="3" className={`${PREFIXE}__ferrure`} />
        <circle cx="50" cy="60" r="2" className={`${PREFIXE}__trou`} />
        <path d="M49 61 L51 61 L51.6 65 L48.4 65 Z" className={`${PREFIXE}__trou`} />
        {/* Le visage. */}
        <g className={`${PREFIXE}__yeux`}>
          <circle cx="34" cy="70" r="5" className={`${PREFIXE}__oeil`} />
          <circle cx="66" cy="70" r="5" className={`${PREFIXE}__oeil`} />
          <circle cx="35.6" cy="68.4" r="1.6" className={`${PREFIXE}__reflet`} />
          <circle cx="67.6" cy="68.4" r="1.6" className={`${PREFIXE}__reflet`} />
        </g>
        <ellipse cx="28" cy="79" rx="4" ry="2.4" className={`${PREFIXE}__joue`} />
        <ellipse cx="72" cy="79" rx="4" ry="2.4" className={`${PREFIXE}__joue`} />
        <path d="M42 78 Q50 86 58 78" className={`${PREFIXE}__sourire`} />
        {/* Le couvercle, qui pivote sur sa charnière (à gauche). */}
        <g className={`${PREFIXE}__couvercle`}>
          <path d="M12 47 L12 36 Q50 16 88 36 L88 47 Z" className={`${PREFIXE}__bois`} />
          <path d="M12 41 Q50 22 88 41" className={`${PREFIXE}__ferrure-trait`} />
          <rect x="44" y="40" width="12" height="7" rx="2" className={`${PREFIXE}__ferrure`} />
        </g>
      </svg>
    </Mascotte>
  );
}
