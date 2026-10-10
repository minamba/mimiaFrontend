import { Fete, Mascotte, rangee } from './communs';

/**
 * LES PARTS DE PIZZA (CE1, CE2) — 09/10/2026. La couverture : une pizzeria
 * italienne au bord de la mer, le store rayé rouge et blanc, le four à bois
 * où dansent les flammes, le basilic en pot, les tomates, et une petite
 * pizzaïola en toque qui fait un clin d'œil, une part filante à la main. La
 * scène :
 *   - LE DÉCOR VIVANT, par-dessus le décor peint (qui a déjà son four et ses
 *     pots) : le store festonné qui ondule, la vapeur des pizzas chaudes qui
 *     monte du comptoir, des feuilles de basilic qui tombent en tournoyant ;
 *   - LES PIZZAS RESTENT CELLES DU JEU (mêmes parts, même rôle, même nom pour
 *     le lecteur d'écran) : on ajoute sur chaque part garnie une boule de
 *     mozzarella et une feuille de basilic, et la sauce prend la couleur de
 *     la tomate ; les parts vides restent de la pâte ;
 *   - LES RÉPONSES : des étiquettes de boîte à pizza, en carton ;
 *   - LA MASCOTTE : la pizzaïola en toque. Elle attend en balançant sa
 *     queue-de-cheval, lève sa part et fait un clin d'œil à la réussite,
 *     hoche la tête à l'erreur ;
 *   - LA FÊTE : feuilles de basilic, rondelles de tomate et étoiles.
 */
export const PREFIXE = 'sc-parts-de-pizza';

const ECLATS = ['basilic', 'tomate', 'etoile', 'basilic', 'mozza', 'tomate', 'basilic', 'etoile', 'tomate', 'mozza', 'basilic', 'tomate', 'etoile', 'basilic'];

export function FetePizza() {
  return <Fete prefixe={PREFIXE} eclats={ECLATS} />;
}

/** LE DÉCOR : le store rayé, la vapeur, le basilic qui tombe. */
export function DecorPizza() {
  return (
    <div className={`${PREFIXE}__decor`} aria-hidden="true">
      <span className={`${PREFIXE}__store`} />
      {/* La vapeur des pizzas chaudes, qui monte du comptoir. */}
      {rangee(4).map((i) => <span key={`v${i}`} className={`${PREFIXE}__vapeur`} style={{ '--i': i }} />)}
      {/* Des feuilles de basilic qui tombent doucement, en tournoyant. */}
      {rangee(5).map((i) => (
        <span key={`b${i}`} className={`${PREFIXE}__basilic`} style={{ '--i': i }}>
          <svg viewBox="0 0 24 36" focusable="false">
            <path d="M12 34 Q0 22 4 8 Q12 0 20 8 Q24 22 12 34 Z" fill="#3fa34d" />
            <path d="M12 32 L12 8" stroke="#2a7a36" strokeWidth="1.4" />
          </svg>
        </span>
      ))}
    </div>
  );
}

/**
 * LA GARNITURE D'UNE PART : une boule de mozzarella et une feuille de basilic,
 * posées au milieu de la part `i` sur `d`. Elle se dessine DANS le SVG de la
 * pizza du jeu, sans en changer les parts.
 */
export function Garniture({ i, d }) {
  const a = ((i + 0.5) / d) * 2 * Math.PI - Math.PI / 2;
  const x = 50 + 37 * Math.cos(a);
  const y = 50 + 37 * Math.sin(a);
  const bx = 50 + 15 * Math.cos(a);
  const by = 50 + 15 * Math.sin(a);
  const t = Math.min(1, 6 / d);
  return (
    <g aria-hidden="true">
      <circle cx={x} cy={y} r={3.4 * t + 1.4} className={`${PREFIXE}__mozza`} />
      <ellipse cx={bx} cy={by} rx={4.2 * t + 1.2} ry={2 * t + 0.8} transform={`rotate(${(a * 180) / Math.PI} ${bx} ${by})`} className={`${PREFIXE}__feuille`} />
    </g>
  );
}

/**
 * LA PIZZAÏOLA EN TOQUE. La queue-de-cheval se balance ; la part de pizza et
 * l'œil qui cligne sont des groupes à part, montrés à la réussite.
 */
export function Pizzaiola({ humeur, cle }) {
  return (
    <Mascotte prefixe={PREFIXE} humeur={humeur} cle={cle}>
      <svg viewBox="0 0 100 110" focusable="false">
        <ellipse cx="50" cy="106" rx="30" ry="4" className={`${PREFIXE}__ombre`} />
        {/* La queue-de-cheval, derrière la tête. */}
        <path className={`${PREFIXE}__queue`} d="M70 44 Q90 52 84 78 Q80 66 70 60 Z" fill="#5b3420" />
        {/* Le tablier rouge sur la veste blanche. */}
        <path d="M22 110 Q22 82 50 78 Q78 82 78 110 Z" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.5" />
        <path d="M34 110 L36 86 L64 86 L66 110 Z" fill="#dc2626" />
        <path d="M44 92 L56 92 L56 98 L44 98 Z" fill="#16a34a" />
        <path d="M48 92 L52 92 L52 98 L48 98 Z" fill="#ffffff" />
        <path d="M40 78 L50 90 L60 78 Z" fill="#dc2626" />
        {/* Le visage et les cheveux. */}
        <path d="M27 54 Q26 28 50 28 Q74 28 73 54 Q74 64 70 70 L30 70 Q26 64 27 54 Z" fill="#5b3420" />
        <circle cx="50" cy="56" r="20" fill="#fddcc0" />
        <path d="M30 50 Q38 36 50 40 Q60 34 70 50 Q62 42 50 44 Q40 42 30 50 Z" fill="#5b3420" />
        <g className={`${PREFIXE}__yeux`}>
          <ellipse cx="42" cy="56" rx="3.2" ry="4" fill="#3b2412" />
          <circle cx="43" cy="54.6" r="1.1" fill="#fff" />
          <g className={`${PREFIXE}__oeil-ouvert`}>
            <ellipse cx="58" cy="56" rx="3.2" ry="4" fill="#3b2412" />
            <circle cx="59" cy="54.6" r="1.1" fill="#fff" />
          </g>
          <path className={`${PREFIXE}__oeil-clin`} d="M54 56 Q58 52 62 56" stroke="#3b2412" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
        <ellipse cx="36" cy="63" rx="3.6" ry="2.1" fill="#f9a8b8" />
        <ellipse cx="64" cy="63" rx="3.6" ry="2.1" fill="#f9a8b8" />
        <path d="M44 64 Q50 71 56 64" fill="#b91c1c" />
        {/* La toque, avec son bandeau. */}
        <g className={`${PREFIXE}__toque`}>
          <circle cx="37" cy="22" r="11" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.2" />
          <circle cx="50" cy="15" r="13" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.2" />
          <circle cx="63" cy="22" r="11" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.2" />
          <rect x="30" y="24" width="40" height="12" rx="3" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.2" />
        </g>
        {/* La part qu'elle lève à la réussite, avec son fromage qui file. */}
        <g className={`${PREFIXE}__part-levee`}>
          <path d="M80 38 L96 22 Q100 34 92 44 Z" fill="#f4c46b" stroke="#c98a2b" strokeWidth="1" />
          <circle cx="90" cy="32" r="2.2" fill="#c0392b" />
          <path d="M82 40 Q80 52 84 60" stroke="#fff3c4" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="82" cy="46" r="5" fill="#fddcc0" />
        </g>
      </svg>
    </Mascotte>
  );
}
