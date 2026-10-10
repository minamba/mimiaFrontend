import { Fete, Mascotte, rangee } from './communs';

/**
 * LA COURSE DES TABLES (CE1, CE2) — 09/10/2026. La couverture : un circuit de
 * karting en plein soleil, le portique à damier et ses feux verts, des
 * fanions bleus, des pneus empilés, l'ardoise des tables (« 3 × 4 = ? »), et
 * un petit pilote au poing levé dans son kart bleu et orange numéro 1. La
 * scène :
 *   - LE DÉCOR VIVANT, par-dessus le décor peint : la guirlande de fanions qui
 *     flotte au vent, les nuages qui passent, des traits de vitesse qui filent
 *     au ras de la piste ;
 *   - LA PISTE (par le CSS) : de l'asphalte bordé de vibreurs rouges et
 *     blancs ; la voiture devient LE KART DE LA COUVERTURE, dont les roues
 *     tournent et qui crache sa fumée quand il avance ;
 *   - LE CALCUL SUR L'ARDOISE, à la craie, comme sur la couverture ; les
 *     réponses, des plaques de course numérotées ;
 *   - LA MASCOTTE : le pilote dans son casque. Il attend en clignant des
 *     yeux, lève le poing et agite le drapeau à damier à la réussite, hoche
 *     la tête à l'erreur ;
 *   - LA FÊTE : damiers et confettis en gerbe.
 * La voiture n'avance qu'au score : le décor ne dit jamais le résultat.
 */
export const PREFIXE = 'sc-course-des-tables';

const ECLATS = ['damier', 'bleu', 'orange', 'damier', 'jaune', 'bleu', 'damier', 'orange', 'jaune', 'damier', 'bleu', 'orange', 'damier', 'jaune'];

export function FeteCourse() {
  return <Fete prefixe={PREFIXE} eclats={ECLATS} />;
}

const FANIONS = ['#1d4ed8', '#ffffff', '#f97316', '#1d4ed8', '#ffffff', '#f97316', '#1d4ed8', '#ffffff', '#f97316', '#1d4ed8', '#ffffff', '#f97316'];

/** LE DÉCOR : les fanions, les nuages, les traits de vitesse. */
export function DecorCourse() {
  return (
    <div className={`${PREFIXE}__decor`} aria-hidden="true">
      {rangee(3).map((i) => <span key={`n${i}`} className={`${PREFIXE}__nuage`} style={{ '--i': i }} />)}
      {rangee(4).map((i) => <span key={`v${i}`} className={`${PREFIXE}__vitesse`} style={{ '--i': i }} />)}
      <svg className={`${PREFIXE}__guirlande`} viewBox="0 0 600 40" preserveAspectRatio="none" focusable="false">
        <path d="M0 4 Q300 30 600 4" className={`${PREFIXE}__fil`} />
        {FANIONS.map((couleur, i) => {
          const x = 25 + i * 50;
          // Le fil descend au milieu : chaque fanion suit la courbe.
          const t = x / 600;
          const y = 4 + 2 * t * (1 - t) * 26;
          return (
            <path
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              d={`M${x - 13} ${y} L${x + 13} ${y} L${x} ${y + 24} Z`}
              fill={couleur}
              className={`${PREFIXE}__fanion`}
              style={{ '--i': i }}
            />
          );
        })}
      </svg>
    </div>
  );
}

/**
 * LE KART NUMÉRO 1, capot vers le drapeau (Camara, le 22/09/2026 : « la
 * voiture est à l'envers » — elle roule vers la droite). Le pilote est dans
 * son casque ; les roues tournent quand le kart avance.
 */
export function Kart() {
  return (
    <svg viewBox="0 0 64 34" className="course__dessin-voiture" focusable="false">
      <g className={`${PREFIXE}__fumee`}>
        <circle cx="5" cy="23" r="3" />
        <circle cx="2" cy="19" r="2.2" />
        <circle cx="6" cy="17" r="1.6" />
      </g>
      {/* Le châssis bleu, la bande orange, le nez blanc. */}
      <path d="M7 24 L12 17 L26 15 L40 15 L52 18 L60 22 L60 27 L7 28 Z" fill="#2563eb" stroke="#1e3a8a" strokeWidth="1.2" />
      <path d="M12 21 L58 23 L58 25 L11 24.5 Z" fill="#f97316" />
      <ellipse cx="36" cy="20.5" rx="4.4" ry="3.4" fill="#fff" stroke="#1e3a8a" strokeWidth="0.8" />
      <path d="M35.4 18.6 L36.8 18 L36.8 23 M35 23 L38.4 23" stroke="#1e3a8a" strokeWidth="0.9" fill="none" />
      {/* Le pilote : le casque bleu, la visière, le poing sur le volant. */}
      <circle cx="24" cy="10" r="7" fill="#1d4ed8" stroke="#172554" strokeWidth="1" />
      <path d="M24 6.5 L31 9 L31 12 L24 12 Z" fill="#0f172a" opacity="0.85" />
      <path d="M17.5 9 Q24 3 30 6.5" stroke="#f97316" strokeWidth="1.6" fill="none" />
      <path d="M27 16 L33 13" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
      {/* Les roues, qui tournent. */}
      <g className={`${PREFIXE}__roue`}>
        <circle cx="16" cy="27" r="6.2" fill="#18181b" />
        <circle cx="16" cy="27" r="2.6" fill="#a1a1aa" />
        <path d="M16 22 L16 32 M11 27 L21 27" stroke="#52525b" strokeWidth="1.1" />
      </g>
      <g className={`${PREFIXE}__roue`}>
        <circle cx="50" cy="27" r="6.2" fill="#18181b" />
        <circle cx="50" cy="27" r="2.6" fill="#a1a1aa" />
        <path d="M50 22 L50 32 M45 27 L55 27" stroke="#52525b" strokeWidth="1.1" />
      </g>
    </svg>
  );
}

/**
 * LE PILOTE DANS SON CASQUE. Le bras levé et le drapeau à damier sont des
 * groupes à part : le poing monte à la réussite, le drapeau s'agite.
 */
export function Pilote({ humeur, cle }) {
  return (
    <Mascotte prefixe={PREFIXE} humeur={humeur} cle={cle}>
      <svg viewBox="0 0 100 100" focusable="false">
        <ellipse cx="50" cy="96" rx="32" ry="4" className={`${PREFIXE}__ombre`} />
        {/* Le drapeau à damier, tenu à gauche. */}
        <g className={`${PREFIXE}__drapeau`}>
          <line x1="20" y1="90" x2="20" y2="30" stroke="#5b4636" strokeWidth="3" strokeLinecap="round" />
          {rangee(3).map((l) => rangee(4).map((c) => (
            <rect key={`${l}-${c}`} x={21 + c * 6} y={30 + l * 6} width="6" height="6" fill={(l + c) % 2 ? '#111827' : '#ffffff'} />
          )))}
        </g>
        {/* La combinaison bleue. */}
        <path d="M24 100 Q24 76 50 73 Q76 76 76 100 Z" fill="#1d4ed8" />
        <path d="M44 74 L50 86 L56 74" fill="#f97316" />
        {/* Le casque et son visage. */}
        <circle cx="50" cy="44" r="29" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2" />
        <path d="M23 38 Q50 10 77 38" stroke="#f97316" strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="30" y="37" width="40" height="28" rx="13" fill="#fcd5b4" />
        <rect x="28" y="30" width="44" height="10" rx="5" fill="#0f172a" opacity="0.85" />
        <path d="M34 33 L46 33" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <g className={`${PREFIXE}__yeux`}>
          <ellipse cx="42" cy="49" rx="3.2" ry="4" fill="#3b2412" />
          <ellipse cx="58" cy="49" rx="3.2" ry="4" fill="#3b2412" />
          <circle cx="43" cy="47.6" r="1.1" fill="#fff" />
          <circle cx="59" cy="47.6" r="1.1" fill="#fff" />
        </g>
        <ellipse cx="36" cy="57" rx="3.4" ry="2" fill="#f9a8b8" />
        <ellipse cx="64" cy="57" rx="3.4" ry="2" fill="#f9a8b8" />
        <path d="M43 57 Q50 64 57 57" fill="#9f1239" />
        {/* Le bras droit : il repose, puis lève le poing. */}
        <g className={`${PREFIXE}__bras`}>
          <path d="M72 82 L84 66" stroke="#1d4ed8" strokeWidth="9" strokeLinecap="round" />
          <circle cx="86" cy="62" r="7" fill="#1f2937" />
        </g>
      </svg>
    </Mascotte>
  );
}
