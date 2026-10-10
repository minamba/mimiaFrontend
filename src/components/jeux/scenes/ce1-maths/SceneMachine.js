import { Fete, Mascotte, rangee } from './communs';

/**
 * LA MACHINE À DIX (CE1, CE2) — 09/10/2026. La couverture : un atelier aux
 * grandes verrières, des tuyaux, des lampes suspendues, une machine bleue
 * à l'écran lumineux « × 10 », hérissée d'engrenages dorés, un entonnoir où
 * tombent des cubes de couleur, un tapis roulant qui mène la caisse « 7 » à
 * la caisse « 70 », et un petit mécanicien aux lunettes sur le front qui
 * appuie sur le gros bouton rouge. La scène :
 *   - LE DÉCOR VIVANT, par-dessus le décor peint : les lampes qui se
 *     balancent, le grand engrenage qui tourne au bord de l'atelier, des
 *     étincelles qui s'envolent de la machine ;
 *   - LA MACHINE DU JEU, HABILLÉE (par le CSS, sans changer son nom pour le
 *     lecteur d'écran) : les deux bouches deviennent des caisses en carton
 *     sur un tapis roulant qui défile, le corps devient la machine bleue à
 *     l'écran lumineux, coiffée de deux engrenages qui tournent ;
 *   - APRÈS LA RÉPONSE, la caisse qui manquait arrive au bout du tapis avec
 *     un rebond, l'écran clignote, les engrenages s'emballent ;
 *   - LES RÉPONSES : des cubes de couleur, comme ceux de l'entonnoir ;
 *   - LA MASCOTTE : le mécanicien et son gros bouton rouge. Il attend en
 *     clignant des yeux, tape sur le bouton et sautille à la réussite, hoche
 *     la tête à l'erreur ;
 *   - LA FÊTE : étincelles et cubes en gerbe.
 * Le tapis tourne avant la réponse, mais à vide : il ne montre rien.
 */
export const PREFIXE = 'sc-machine-a-dix';

const ECLATS = ['etincelle', 'rouge', 'bleu', 'etincelle', 'vert', 'jaune', 'etincelle', 'rouge', 'bleu', 'etincelle', 'vert', 'jaune', 'etincelle', 'rouge'];

export function FeteMachine() {
  return <Fete prefixe={PREFIXE} eclats={ECLATS} />;
}

/** Un engrenage à `dents` dents, centré en 0, de rayon `r`. */
function Roue({ dents = 10, r = 20, className }) {
  const pas = (2 * Math.PI) / dents;
  const points = rangee(dents).flatMap((i) => {
    const a = i * pas;
    return [
      [Math.cos(a - pas * 0.18) * r, Math.sin(a - pas * 0.18) * r],
      [Math.cos(a - pas * 0.12) * (r + 5), Math.sin(a - pas * 0.12) * (r + 5)],
      [Math.cos(a + pas * 0.12) * (r + 5), Math.sin(a + pas * 0.12) * (r + 5)],
      [Math.cos(a + pas * 0.18) * r, Math.sin(a + pas * 0.18) * r],
    ];
  });
  const d = `M${points.map(([x, y]) => `${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`).join(' L')} Z`;
  return (
    <g className={className}>
      <path d={d} />
      <circle r={r * 0.42} className={`${PREFIXE}__moyeu`} />
    </g>
  );
}

/** LES DEUX ENGRENAGES QUI COIFFENT LA MACHINE (à la place du « ⚙ »). */
export function Engrenages() {
  return (
    <svg className={`${PREFIXE}__engrenages`} viewBox="-60 -30 120 50" aria-hidden="true" focusable="false">
      <g transform="translate(-24 0)"><Roue dents={9} r={15} className={`${PREFIXE}__roue ${PREFIXE}__roue--horaire`} /></g>
      <g transform="translate(14 -4)"><Roue dents={8} r={12} className={`${PREFIXE}__roue ${PREFIXE}__roue--inverse`} /></g>
    </svg>
  );
}

/** LE TAPIS ROULANT sous la machine : des chevrons qui défilent. */
export function Tapis() {
  return (
    <span className={`${PREFIXE}__tapis`} aria-hidden="true">
      <span className={`${PREFIXE}__chevrons`} />
      <span className={`${PREFIXE}__galets`}>
        {rangee(9).map((i) => <span key={i} />)}
      </span>
    </span>
  );
}

/** LE DÉCOR : les lampes, le grand engrenage, les étincelles. */
export function DecorMachine() {
  return (
    <div className={`${PREFIXE}__decor`} aria-hidden="true">
      {rangee(2).map((i) => (
        <span key={i} className={`${PREFIXE}__lampe`} style={{ '--i': i }}>
          <svg viewBox="0 0 40 70" focusable="false">
            <line x1="20" y1="0" x2="20" y2="34" stroke="#3a3f47" strokeWidth="2" />
            <path d="M6 52 Q8 36 20 34 Q32 36 34 52 Z" fill="#2f3b4a" />
            <ellipse cx="20" cy="54" rx="9" ry="5" className={`${PREFIXE}__ampoule`} />
          </svg>
        </span>
      ))}
      <svg className={`${PREFIXE}__grand-engrenage`} viewBox="-40 -40 80 80" focusable="false">
        <Roue dents={12} r={28} className={`${PREFIXE}__roue ${PREFIXE}__roue--lente`} />
      </svg>
      {/* Les étincelles qui s'envolent de la machine, puis s'éteignent. */}
      {rangee(6).map((i) => <span key={`e${i}`} className={`${PREFIXE}__etincelle`} style={{ '--i': i }} />)}
    </div>
  );
}

/**
 * LE MÉCANICIEN AUX LUNETTES. Sa main est un groupe à part : elle tape sur le
 * gros bouton rouge à la réussite.
 */
export function Mecano({ humeur, cle }) {
  return (
    <Mascotte prefixe={PREFIXE} humeur={humeur} cle={cle}>
      <svg viewBox="0 0 100 100" focusable="false">
        <ellipse cx="50" cy="97" rx="34" ry="3.5" className={`${PREFIXE}__ombre`} />
        {/* La veste bleue. */}
        <path d="M20 100 Q20 76 48 72 Q76 76 76 100 Z" fill="#2563eb" />
        <path d="M40 74 L48 88 L56 74" fill="#f8fafc" />
        {/* La tête, les cheveux en épis. */}
        <circle cx="48" cy="50" r="21" fill="#fbd7b8" />
        <path d="M26 46 L24 30 L32 36 L32 22 L40 30 L44 16 L50 28 L58 16 L60 30 L70 24 L68 38 L74 40 L69 46 Q60 34 48 36 Q36 34 26 46 Z" fill="#26263a" />
        {/* Les lunettes sur le front. */}
        <path d="M27 38 L69 38" stroke="#5b4636" strokeWidth="4" />
        <circle cx="39" cy="37" r="7.5" fill="#bae6fd" stroke="#475569" strokeWidth="2.6" />
        <circle cx="57" cy="37" r="7.5" fill="#bae6fd" stroke="#475569" strokeWidth="2.6" />
        <path d="M35 34 L38 31" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M53 34 L56 31" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        <g className={`${PREFIXE}__yeux`}>
          <ellipse cx="41" cy="52" rx="3" ry="3.8" fill="#3b2412" />
          <ellipse cx="56" cy="52" rx="3" ry="3.8" fill="#3b2412" />
          <circle cx="42" cy="50.6" r="1.1" fill="#fff" />
          <circle cx="57" cy="50.6" r="1.1" fill="#fff" />
        </g>
        <ellipse cx="35" cy="59" rx="3.2" ry="2" fill="#f9a8b8" />
        <ellipse cx="62" cy="59" rx="3.2" ry="2" fill="#f9a8b8" />
        <path d="M41 60 Q48.5 68 56 60 Z" fill="#9f1239" />
        {/* Le gros bouton rouge, et la main qui va taper dessus. */}
        <rect x="70" y="80" width="28" height="14" rx="3" fill="#64748b" />
        <ellipse cx="84" cy="80" rx="10" ry="4.5" className={`${PREFIXE}__bouton-rouge`} />
        <g className={`${PREFIXE}__main`}>
          <path d="M70 84 Q74 70 82 66" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" fill="none" />
          <circle cx="84" cy="66" r="6" fill="#fbd7b8" />
        </g>
      </svg>
    </Mascotte>
  );
}
