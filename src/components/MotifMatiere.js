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

  // Un éventail et une bulle « ¡Hola! » : la langue se parle d'abord.
  ESPAGNOL: (
    <>
      <path d="M40 80 L14 44 A36 36 0 0 1 66 44 Z" />
      <path d="M40 80 L26 38 M40 80 L40 36 M40 80 L54 38" />
      <path d="M74 30 h38 a6 6 0 0 1 6 6 v20 a6 6 0 0 1 -6 6 h-24 l-10 8 v-8 a6 6 0 0 1 -4 -6 v-20 a6 6 0 0 1 6 -6 Z" />
      <text x="80" y="52" fontSize="13" fontFamily="serif">¡Hola!</text>
      <path d="M72 88 h40 M72 98 h26" />
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

  // ---------------------------------------------------------------------
  // LES SPÉCIALITÉS DES SÉRIES TECHNOLOGIQUES (14/09/2026). Même principe :
  // l'objet du métier, reconnaissable avant le nom.
  // ---------------------------------------------------------------------

  // Un graphique en barres et une calculatrice : la gestion, ses chiffres.
  SCIENCES_GESTION: (
    <>
      <path d="M16 90 h48 M22 90 v-20 M36 90 v-36 M50 90 v-52" />
      <rect x="76" y="20" width="36" height="52" rx="5" />
      <path d="M82 28 h24 v10 h-24 Z" />
      <circle cx="86" cy="50" r="2.5" /><circle cx="94" cy="50" r="2.5" /><circle cx="102" cy="50" r="2.5" />
      <circle cx="86" cy="62" r="2.5" /><circle cx="94" cy="62" r="2.5" /><circle cx="102" cy="62" r="2.5" />
    </>
  ),

  // Un organigramme : l'organisation, ses décisions.
  MANAGEMENT: (
    <>
      <rect x="48" y="14" width="32" height="18" rx="4" />
      <path d="M64 32 v14 M28 46 h72 M28 46 v12 M64 46 v12 M100 46 v12" />
      <rect x="14" y="58" width="28" height="16" rx="4" />
      <rect x="50" y="58" width="28" height="16" rx="4" />
      <rect x="86" y="58" width="28" height="16" rx="4" />
      <path d="M20 94 h40 M72 94 h36" />
    </>
  ),

  // Une balance et une pièce : la règle et l'échange.
  DROIT_ECONOMIE: (
    <>
      <path d="M40 18 v62 M22 80 h36 M18 30 h44" />
      <path d="M18 30 l-8 22 h16 Z M62 30 l-8 22 h16 Z" />
      <circle cx="94" cy="56" r="18" />
      <path d="M94 44 v24 M88 50 q6 -4 12 0 q-12 6 0 12 q6 2 12 -2" />
    </>
  ),

  // Une boîte de Petri et une double hélice : le vivant au laboratoire.
  BIOTECHNOLOGIES: (
    <>
      <ellipse cx="38" cy="70" rx="26" ry="10" />
      <path d="M12 70 v8 q26 16 52 0 v-8" />
      <circle cx="30" cy="68" r="3" /><circle cx="44" cy="72" r="2" />
      <path d="M92 14 C112 24, 112 42, 92 52 C72 62, 72 80, 92 90" />
      <path d="M92 14 C72 24, 72 42, 92 52 C112 62, 112 80, 92 90" />
    </>
  ),

  // Une ampoule à décanter et un thermomètre : la mesure en laboratoire.
  SPCL: (
    <>
      <path d="M30 14 h16 M38 14 v10 q-20 10 -20 34 q0 20 20 22 q20 -2 20 -22 q0 -24 -20 -34" />
      <path d="M38 80 v14 M32 94 h12" />
      <path d="M92 16 v56 a8 8 0 1 0 8 0 v-56 a4 4 0 0 0 -8 0 Z" />
      <path d="M104 30 h6 M104 42 h6 M104 54 h6" />
    </>
  ),

  // Un cœur et un stéthoscope : le corps et la santé.
  BIOLOGIE_HUMAINE: (
    <>
      <path d="M40 84 q-30 -22 -30 -40 a14 14 0 0 1 30 -6 a14 14 0 0 1 30 6 q0 18 -30 40 Z" />
      <path d="M84 16 v26 q0 16 14 16 q14 0 14 -16 v-26" />
      <path d="M98 58 v18 a10 10 0 1 1 -10 10" />
    </>
  ),

  // Des mains qui se tiennent et une croix : le soin, la solidarité.
  SANITAIRE_SOCIAL: (
    <>
      <circle cx="30" cy="30" r="9" /><circle cx="62" cy="30" r="9" />
      <path d="M16 72 q0 -26 14 -26 q10 0 16 12 q6 -12 16 -12 q14 0 14 26" />
      <path d="M92 42 h10 v-12 h10 v12 h10 v10 h-10 v12 h-10 v-12 h-10 Z" />
    </>
  ),

  // Un chemin qui serpente vers une étoile : ce n'est pas une matière, c'est
  // la carte de progression elle-même. Les trois points sont les notions
  // déjà passées ; l'étoile, au bout, dit qu'on continue d'avancer.
  CARTE: (
    <>
      <path d="M10 96 Q34 88 26 66 T52 40 Q68 30 66 12" strokeDasharray="1 10" />
      <circle cx="26" cy="66" r="4" />
      <circle cx="52" cy="40" r="4" />
      <path
        d="M96 14 l5 11 l12 1.5 l-9 8.5 l2.5 12 L96 41 l-10.5 5.5 L88 34.5
           l-9 -8.5 l12 -1.5 Z"
      />
    </>
  ),

  // Deux courbes qui se croisent sur des axes, un point d'équilibre et un
  // euro : l'offre, la demande, les SES.
  SES: (
    <>
      <path d="M18 16 v76 h84" />
      <path d="M28 28 L88 84" />
      <path d="M28 84 L88 28" />
      <circle cx="58" cy="56" r="4" />
      <path d="M118 26 a10 10 0 1 0 0 18 M104 32 h11 M104 38 h11" />
    </>
  ),

  // Des chevrons de code et des bits : la NSI.
  NSI: (
    <>
      <path d="M36 34 L16 56 L36 78 M76 34 L96 56 L76 78 M64 26 L48 86" />
      <text x="100" y="26" fontSize="13" fontFamily="monospace">01</text>
      <text x="100" y="98" fontSize="13" fontFamily="monospace">10</text>
    </>
  ),

  // Un chronomètre et un ballon : l'EPPCS.
  EPPCS: (
    <>
      <circle cx="40" cy="60" r="26" />
      <path d="M40 60 L40 42 M34 26 h12 M40 26 v8" />
      <circle cx="96" cy="70" r="16" />
      <path d="M80 70 h32 M96 54 q8 16 0 32 M96 54 q-8 16 0 32" />
    </>
  ),

  // Une palette et une croche : les arts, les sept enseignements de Jeanne.
  ARTS: (
    <>
      <path d="M58 22 c-26 0 -44 18 -44 38 c0 18 14 28 26 26 c8 -1 8 -9 14 -10 c8 -1 14 6 22 2 c12 -6 26 -18 26 -30 c0 -16 -18 -26 -44 -26 Z" />
      <circle cx="42" cy="46" r="4" />
      <circle cx="60" cy="38" r="4" />
      <circle cx="78" cy="46" r="4" />
      <path d="M108 92 v-30 l14 -4 v26" />
      <circle cx="104" cy="92" r="5" />
      <circle cx="118" cy="86" r="5" />
    </>
  ),

  // Un calendrier mural : le corps, ses deux anneaux, une grille de jours
  // avec un jour marqué. Comme CARTE, ce n'est pas une matière — c'est
  // « Mon calendrier », le pendant de « Ma carte ».
  CALENDRIER: (
    <>
      <rect x="20" y="30" width="88" height="66" rx="8" />
      <path d="M20 48 h88" />
      <path d="M42 18 v20 M86 18 v20" />
      <circle cx="42" cy="66" r="3" />
      <circle cx="64" cy="66" r="3" />
      <circle cx="86" cy="66" r="3" />
      <circle cx="42" cy="82" r="3" />
      <circle cx="64" cy="82" r="6" fill="currentColor" />
      <circle cx="86" cy="82" r="3" />
    </>
  ),
};

// L'HGGSP et l'HLP prolongent la matière de leur professeur : le globe de
// Salim, les colonnes de Camille.
MOTIFS.HGGSP = MOTIFS.HISTOIRE_GEO;
MOTIFS.HLP = MOTIFS.PHILOSOPHIE;
MOTIFS.LLCER_ANGLAIS = MOTIFS.ANGLAIS;
MOTIFS.AMC = MOTIFS.ANGLAIS;
MOTIFS.LLCER_ESPAGNOL = MOTIFS.ESPAGNOL;
MOTIFS.SI = MOTIFS.PHYSIQUE_CHIMIE;
MOTIFS.LLCA_LATIN = MOTIFS.FRANCAIS;
MOTIFS.LLCA_GREC = MOTIFS.FRANCAIS;
['ARTS_PLASTIQUES', 'HISTOIRE_ARTS', 'CINEMA_AUDIOVISUEL', 'MUSIQUE', 'THEATRE', 'DANSE', 'ARTS_CIRQUE']
  .forEach((code) => { MOTIFS[code] = MOTIFS.ARTS; });

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
