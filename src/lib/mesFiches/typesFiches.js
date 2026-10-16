/**
 * LES SIX TYPES DE FICHES DE RÉVISION — Camara, le 14/10/2026.
 *
 * Un module à part : l'enfant importe son cours, choisit une matière et un
 * type, et la fiche est générée. Rien n'est transmis aux professeurs.
 *
 * `decoupe` dit si un cours long donne UNE FICHE PAR NOTION (« notion ») ou
 * une seule fiche pour tout le chapitre (« chapitre ») :
 * - par notion pour réviser une chose à la fois — la fiche reste courte ;
 * - par chapitre pour l'Express (« l'essentiel sur une page ») et la
 *   Spéciale contrôle (une évaluation porte sur tout le chapitre).
 *
 * `rangMin` : la première classe où le type est proposé (1 = CP). La fiche
 * méthode et la spéciale contrôle n'ont pas de sens avant le CE2.
 */
export const TYPES_FICHES = [
  {
    code: 'classique',
    libelle: 'Fiche classique',
    accroche: 'Définitions, notions essentielles et exemples',
    decoupe: 'notion',
    rangMin: 1,
  },
  {
    code: 'express',
    libelle: 'Fiche express',
    accroche: 'L’essentiel à retenir sur une page',
    decoupe: 'chapitre',
    rangMin: 1,
  },
  {
    code: 'visuelle',
    libelle: 'Fiche visuelle',
    accroche: 'Les notions organisées en carte mentale',
    decoupe: 'notion',
    rangMin: 1,
  },
  {
    code: 'questions',
    libelle: 'Fiche questions/réponses',
    accroche: 'Pour mémoriser activement',
    decoupe: 'notion',
    rangMin: 1,
  },
  {
    code: 'controle',
    libelle: 'Fiche spéciale contrôle et examens',
    accroche: 'La synthèse des notions à maîtriser pour une évaluation',
    decoupe: 'chapitre',
    rangMin: 3,
  },
  {
    code: 'methode',
    libelle: 'Fiche méthode',
    accroche: 'Les étapes à suivre pour résoudre un exercice',
    decoupe: 'notion',
    rangMin: 3,
  },
];

export const typeFiche = (code) => TYPES_FICHES.find((t) => t.code === code) ?? null;

/** Les types proposés à une classe donnée, par son rang (1 = CP, 12 = terminale). */
export const typesPourLeRang = (rang) =>
  TYPES_FICHES.filter((t) => !Number.isFinite(rang) || rang >= t.rangMin);

/**
 * La palette des familles d'une carte. Huit teintes qui se distinguent entre
 * elles ET sur le papier : le texte posé dessus reste foncé, la teinte sert au
 * contour, au trait et au fond pâle de l'étiquette.
 */
export const COULEURS_FAMILLES = [
  'sarcelle', 'violet', 'vert', 'orange', 'rose', 'ambre', 'bleu', 'rouge',
];

export const couleurFamille = (rang) => COULEURS_FAMILLES[rang % COULEURS_FAMILLES.length];
