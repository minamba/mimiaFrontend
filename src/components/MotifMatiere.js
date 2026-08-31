/**
 * Motif de fond des cartes de matière.
 *
 * Un enfant reconnaît une matière à son objet — un livre, un globe, une
 * éprouvette — bien avant d'en lire le nom. Les motifs sont volontairement très
 * discrets : ils habillent la carte sans jamais concurrencer le professeur, qui
 * reste l'élément principal.
 *
 * Dessinés en SVG plutôt qu'en images : ils prennent la couleur du professeur
 * et restent nets à toutes les tailles, sans un octet de plus à télécharger.
 */

const MOTIFS = {
  // Symboles mathématiques et figures : compas, angles, opérations.
  MATHS: (
    <>
      <circle cx="30" cy="34" r="15" />
      <path d="M62 24 h18 M71 15 v18" />
      <path d="M14 74 h20 M14 84 h20" />
      <path d="M56 92 L70 66 L84 92 Z" />
      <path d="M96 40 h16" />
      <circle cx="104" cy="76" r="9" />
      <text x="90" y="20" fontSize="15" fontFamily="serif">π</text>
    </>
  ),

  // Livre ouvert, lignes d'écriture, ponctuation.
  FRANCAIS: (
    <>
      <path d="M18 30 q16 -8 30 0 v34 q-14 -7 -30 0 Z" />
      <path d="M48 30 q16 -8 30 0 v34 q-14 -7 -30 0 Z" />
      <path d="M48 30 v34" />
      <path d="M16 80 h44 M16 90 h30" />
      <path d="M86 26 q10 -6 14 4 t-8 12 q-4 2 -6 -2" />
      <circle cx="94" cy="60" r="2.5" />
      <path d="M88 78 h24 M88 88 h16" />
    </>
  ),

  // Globe, méridiens, repère cartographique.
  HISTOIRE_GEO: (
    <>
      <circle cx="38" cy="42" r="22" />
      <path d="M16 42 h44 M38 20 q14 22 0 44 M38 20 q-14 22 0 44" />
      <path d="M78 70 a10 10 0 1 1 20 0 c0 8 -10 20 -10 20 s-10 -12 -10 -20 Z" />
      <circle cx="88" cy="70" r="4" />
      <path d="M14 84 h30 M14 94 h20" />
      <path d="M92 22 l10 10 l-10 10 l-10 -10 Z" />
    </>
  ),

  // Bulles de dialogue : la langue, c'est d'abord parler.
  ANGLAIS: (
    <>
      <path d="M16 26 h44 a6 6 0 0 1 6 6 v22 a6 6 0 0 1 -6 6 h-30 l-12 10 v-10 a6 6 0 0 1 -6 -6 v-22 a6 6 0 0 1 4 -6 Z" />
      <path d="M62 60 h34 a6 6 0 0 1 6 6 v18 a6 6 0 0 1 -6 6 h-22 l-10 8 v-8 a6 6 0 0 1 -6 -6 Z" />
      <circle cx="30" cy="43" r="2.5" />
      <circle cx="40" cy="43" r="2.5" />
      <circle cx="50" cy="43" r="2.5" />
    </>
  ),

  // Éprouvette, atome, feuille : les trois piliers du programme.
  SCIENCES: (
    <>
      <path d="M28 18 v22 L14 76 a6 6 0 0 0 6 8 h28 a6 6 0 0 0 6 -8 L40 40 V18 Z" />
      <path d="M24 18 h20" />
      <path d="M18 64 h32" />
      <circle cx="90" cy="46" r="6" />
      <ellipse cx="90" cy="46" rx="22" ry="9" />
      <ellipse cx="90" cy="46" rx="22" ry="9" transform="rotate(60 90 46)" />
      <ellipse cx="90" cy="46" rx="22" ry="9" transform="rotate(120 90 46)" />
      <path d="M76 92 q14 -18 30 -8 q-6 16 -22 12 Z" />
    </>
  ),

  // Erlenmeyer, atome, éclair : la chimie, la matière, l'électricité.
  PHYSIQUE_CHIMIE: (
    <>
      <path d="M30 14 v20 L12 72 a6 6 0 0 0 6 9 h32 a6 6 0 0 0 6 -9 L44 34 V14 Z" />
      <path d="M26 14 h22" />
      <path d="M20 60 h34" />
      <circle cx="94" cy="32" r="5" />
      <ellipse cx="94" cy="32" rx="20" ry="8" />
      <ellipse cx="94" cy="32" rx="20" ry="8" transform="rotate(60 94 32)" />
      <ellipse cx="94" cy="32" rx="20" ry="8" transform="rotate(120 94 32)" />
      <path d="M96 64 L82 88 h12 l-4 18 l16 -26 h-12 Z" />
    </>
  ),

  // Feuille, double hélice, strates : le vivant, l'hérédité, la Terre.
  //
  // Les deux brins sont symétriques autour de x = 98 et se croisent aux mêmes
  // ordonnées ; les barreaux sont placés là où ils s'écartent le plus, sinon
  // ils tombent sur le croisement et l'hélice se lit comme un simple ruban.
  SVT: (
    <>
      <path d="M20 78 q0 -40 34 -50 q6 34 -34 50 Z" />
      <path d="M20 78 q16 -22 30 -32" />

      <path d="M98 14 C120 24, 120 42, 98 52 C76 62, 76 80, 98 90" />
      <path d="M98 14 C76 24, 76 42, 98 52 C120 62, 120 80, 98 90" />
      <path d="M85 33 h26 M85 71 h26" />

      <path d="M14 96 q20 -13 42 0" />
      <path d="M20 105 q16 -11 32 0" />
    </>
  ),

  // Philosophie : une colonne, un livre ouvert, une spirale.
  //
  // La colonne dit d'où vient la matière, le livre ouvert dit qu'on lit des
  // textes — les deux exercices de l'épreuve tiennent là-dedans. La spirale
  // est le mouvement de la pensée qui revient sur elle-même : c'est le seul
  // motif de la série qui ne représente pas un objet, et c'est voulu, parce
  // que la philosophie n'en a pas.
  PHILOSOPHIE: (
    <>
      <path d="M22 30 h26 M25 30 v56 M45 30 v56 M19 90 h32" />
      <path d="M31 38 v42 M39 38 v42" />

      <path d="M66 46 q18 -10 34 -4 v44 q-16 -6 -34 4 Z" />
      <path d="M66 46 q-8 -4 -14 -2 v44 q6 -2 14 2 Z" />
      <path d="M66 46 v44" />

      <path d="M92 20 q10 0 10 8 t-10 8 t-10 -8" />
    </>
  ),
};

export default function MotifMatiere({ code }) {
  const motif = MOTIFS[code];
  if (!motif) return null;

  return (
    <svg
      className="motif-matiere"
      viewBox="0 0 128 110"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {motif}
    </svg>
  );
}
