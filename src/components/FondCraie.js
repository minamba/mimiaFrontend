/**
 * Fond de héros : des notes de cours qui s'écrivent à la craie.
 *
 * Deux registres, comme sur un vrai tableau :
 *   — les formules manuscrites, révélées de gauche à droite (on « écrit »)
 *   — les figures de géométrie, tracées trait par trait (stroke-dashoffset)
 *
 * Purement décoratif : aucune interception de clic, masqué aux lecteurs
 * d'écran, et complètement figé si l'utilisateur a demandé moins d'animations.
 */

/** Formule manuscrite révélée par un volet qui balaie vers la droite. */
function Note({ x, y, taille, delai, duree, children, rotation = 0 }) {
  const id = `voletCraie-${x}-${y}`.replace(/\./g, '_');

  return (
    <g transform={`rotate(${rotation} ${x} ${y})`}>
      <defs>
        <clipPath id={id}>
          {/* La largeur part de 0 sous l'effet de l'animation CSS. Si celle-ci
              ne s'applique pas, l'attribut laisse la note visible : on dégrade
              vers « affiché » plutôt que vers « invisible ». */}
          <rect
            className="craie__volet"
            x={x - 10}
            y={y - taille}
            width="600"
            height={taille * 2}
            style={{ animationDelay: `${delai}s`, animationDuration: `${duree}s` }}
          />
        </clipPath>
      </defs>

      <text
        className="craie__note"
        x={x}
        y={y}
        clipPath={`url(#${id})`}
        style={{ fontSize: taille, animationDelay: `${delai}s`, animationDuration: `${duree}s` }}
      >
        {children}
      </text>
    </g>
  );
}

/** Figure de géométrie qui se trace, comme au compas. */
function Trace({ d, delai, duree, longueur = 400 }) {
  return (
    <path
      className="craie__trace"
      d={d}
      style={{
        strokeDasharray: longueur,
        strokeDashoffset: longueur,
        // Reprise par les keyframes : sans ça toutes les figures partiraient
        // du même décalage et les plus longues apparaîtraient déjà à moitié tracées.
        '--l': `${longueur}px`,
        animationDelay: `${delai}s`,
        animationDuration: `${duree}s`,
      }}
    />
  );
}

export default function FondCraie() {
  return (
    <div className="fond-craie" aria-hidden="true">
      {/* Un cahier de cours, pas une feuille d'exercices de maths : chaque
          matière du catalogue a ses notes, y compris celles pas encore
          ouvertes. Le fond raconte le produit complet. */}
      <svg viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice">
        {/* ---------------------- colonne de gauche ---------------------- */}

        {/* Maths */}
        <Note x={38} y={92} taille={36} delai={0} duree={16} rotation={-3}>
          3/4 + 1/8 = ?
        </Note>

        <Trace
          d="M 58 156 L 190 156 L 124 248 Z M 58 156 L 58 174 L 76 174"
          delai={1.8}
          duree={16}
          longueur={400}
        />

        {/* Français — conjugaison */}
        <Note x={36} y={336} taille={28} delai={3.6} duree={16} rotation={2}>
          je fus, tu fus, il fut
        </Note>

        {/* Histoire */}
        <Note x={52} y={588} taille={34} delai={5.2} duree={16} rotation={-2}>
          1789
        </Note>

        {/* Anglais — verbes irréguliers */}
        <Note x={40} y={666} taille={26} delai={6.6} duree={16} rotation={1}>
          to be, was, been
        </Note>

        {/* ---------------------- colonne de droite ---------------------- */}

        {/* Maths — cercle et rayon */}
        <Trace
          d="M 1030 140 m -58 0 a 58 58 0 1 0 116 0 a 58 58 0 1 0 -116 0"
          delai={0.9}
          duree={16}
          longueur={370}
        />
        <Trace d="M 1030 140 L 1080 110" delai={2.4} duree={16} longueur={60} />

        {/* Géographie — l'hexagone */}
        <Trace
          d="M 1000 258 L 1054 289 L 1054 351 L 1000 382 L 946 351 L 946 289 Z"
          delai={4.2}
          duree={16}
          longueur={380}
        />

        {/* Sciences */}
        <Note x={906} y={468} taille={26} delai={6} duree={16} rotation={-1}>
          photosynthèse
        </Note>

        <Trace
          d="M 1040 570 m -18 0 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0
             M 992 602 m -11 0 a 11 11 0 1 0 22 0 a 11 11 0 1 0 -22 0
             M 1088 602 m -11 0 a 11 11 0 1 0 22 0 a 11 11 0 1 0 -22 0
             M 1026 580 L 1003 594 M 1054 580 L 1077 594"
          delai={7.4}
          duree={16}
          longueur={330}
        />

        <Note x={996} y={672} taille={28} delai={8.8} duree={16} rotation={1}>
          H2O
        </Note>

        {/* ------------------------ bas, au centre ----------------------- */}

        {/* Français — analyse grammaticale */}
        <Note x={452} y={724} taille={24} delai={10} duree={16} rotation={-1}>
          sujet · verbe · complément
        </Note>
      </svg>
    </div>
  );
}
