/**
 * Les libellés et les dates des jeux de tests : les mêmes à l'écran et dans le PDF.
 * Voir `JeuxTestsAdmin` et `JeuTestPdf`.
 */
export const SECTIONS = [
  { code: 'elementaire', libelle: 'Élémentaire', cycle: 'Primaire' },
  { code: 'college', libelle: 'Collège', cycle: 'College' },
  { code: 'lycee', libelle: 'Lycée', cycle: 'Lycee' },
  // TESTS GÉNÉRAUX — Min's, le 22/11/2026 : tout ce qui n'est ni un cours ni un professeur (compte parent, ajout
  // d'enfant, abonnements, administration…). Une seule « classe », du même nom ; leurs blocs ont une CATÉGORIE libre.
  { code: 'generaux', libelle: 'Tests Généraux', generale: true },
];

export const SECTION_GENERAUX = 'generaux';
export const CLASSE_GENERAUX = 'Tests Généraux';

/** Le code de « matière » d'un bloc des tests généraux : son libellé est la catégorie. Voir `StatutsDeTest.CodeCategorie`. */
export const CODE_CATEGORIE = 'categorie';

/** Le même plafond que le serveur (`StatutsDeTest.CategorieMax`). */
export const CATEGORIE_MAX = 100;

export const estGeneraux = (jeuOuSection) => (typeof jeuOuSection === 'string' ? jeuOuSection : jeuOuSection?.section) === SECTION_GENERAUX;

/**
 * LES CATÉGORIES PROPOSÉES D'OFFICE (exemples de Min's, 22/11/2026) : la liste les montre même avant le premier bloc.
 * Adam en écrit d'autres librement ; celles déjà employées (serveur) s'y ajoutent, sans doublon à la casse près.
 */
export const CATEGORIES_DE_DEPART = ['Admin', 'Abonnements', 'Ajout d’enfant', 'Compte parent', 'Technique', 'UX'];

const comparerFr = (a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' });

export const categoriesProposees = (employees = [], courante = null) => {
  const vues = new Map();
  // La catégorie du bloc d'abord : elle doit rester choisie telle qu'elle est écrite, même si une autre casse existe.
  [...(courante ? [courante] : []), ...(employees ?? []), ...CATEGORIES_DE_DEPART].forEach((c) => {
    const propre = (c ?? '').trim();
    if (propre && !vues.has(propre.toLocaleLowerCase('fr'))) vues.set(propre.toLocaleLowerCase('fr'), propre);
  });
  return [...vues.values()].sort(comparerFr);
};

/** « Élémentaire · CP » ; pour les tests généraux, « Tests Généraux » une seule fois. */
export const sectionEtClasse = (jeu) => (estGeneraux(jeu)
  ? CLASSE_GENERAUX
  : `${libelleSection(jeu?.section)} · ${jeu?.classe ?? ''}`);

export const STATUTS_LIGNE = [
  { code: 'a_tester', libelle: 'À tester' },
  { code: 'en_cours', libelle: 'En cours de test' },
  { code: 'ok', libelle: 'OK' },
  { code: 'ko', libelle: 'KO' },
];

export const STATUTS_JEU = {
  non_demarre: 'Non démarré',
  en_cours: 'En cours',
  ok: 'OK',
};

export const libelleSection = (code) => SECTIONS.find((s) => s.code === code)?.libelle ?? code;

export const libelleStatut = (code) => STATUTS_LIGNE.find((s) => s.code === code)?.libelle ?? code;

export const dateLisible = (iso) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '—');

/**
 * « 2026-11-04… » lu à la main : le serveur écrit déjà l'heure de France, elle ne doit pas glisser avec le fuseau.
 *
 * AVEC L'HEURE (Camara, 06/11/2026 et 08/11/2026) : le serveur la pose dès qu'un élément de la ligne change —
 * « 06/11/2026 à 14:32 ». Seules les dates choisies autrefois au calendrier n'en ont pas (minuit pile) : le jour seul.
 */
export const jourLisible = (iso) => {
  if (!iso) return '—';
  const [annee, mois, jour] = iso.slice(0, 10).split('-');
  // Le « Z » de la fin : l'API marque toutes ses dates ainsi (ConvertisseursDate), même celles écrites à l'heure de France.
  const sansHeure = /^(00:00(:00(\.0+)?)?(Z|[+-]\d\d:\d\d)?)?$/.test(iso.slice(11));
  return sansHeure ? `${jour}/${mois}/${annee}` : `${jour}/${mois}/${annee} à ${iso.slice(11, 16)}`;
};

/**
 * DÉPLACER UNE LIGNE — Camara, le 08/11/2026. `emplacement` compte les trous entre les lignes (0 = au-dessus de la
 * première) ; le serveur attend le rang une fois la ligne retirée de sa place, d'où le décalage quand on descend.
 */
export const positionApresDeplacement = (depart, emplacement) => (emplacement > depart ? emplacement - 1 : emplacement);

export const lignesDuTest = (nombre) => `${nombre} ligne${nombre > 1 ? 's' : ''}`;

/**
 * LE COMPTE DES LIGNES PAR STATUT, SUR LA BANNIÈRE D'UN TEST — Camara, le 07/11/2026 : « mets le nombre de tests à OK,
 * à KO, en cours de test et à tester ». Dans cet ordre, les quatre toujours présents (un zéro se lit aussi).
 */
const ORDRE_DU_COMPTE = [
  { code: 'ok', libelle: 'OK' },
  { code: 'ko', libelle: 'KO' },
  { code: 'en_cours', libelle: 'En cours' },
  { code: 'a_tester', libelle: 'À tester' },
];

export const compteParStatut = (lignes) => ORDRE_DU_COMPTE.map(({ code, libelle }) => ({
  code,
  libelle,
  nombre: (lignes ?? []).filter((l) => l?.statut === code).length,
}));

/**
 * LES TESTS D'UN JEU, REGROUPÉS PAR MATIÈRE (OU PAR CATÉGORIE POUR LES TESTS GÉNÉRAUX) — Camara, le 07/11/2026 : « j'aimerais qu'on regroupe les blocs en fonction
 * de la matière ». Les matières par ordre alphabétique ; dans une matière, les tests gardent l'ordre du jeu.
 */
export const regrouperParMatiere = (tests) => {
  const groupes = new Map();
  (tests ?? []).forEach((test) => {
    // Une CATÉGORIE (tests généraux) se regroupe sur son libellé : toutes partagent le même code.
    const cle = test?.matiereCode === CODE_CATEGORIE
      ? `${CODE_CATEGORIE}:${(test?.matiere ?? '').toLocaleLowerCase('fr')}`
      : test?.matiereCode ?? test?.matiere ?? '';
    if (!groupes.has(cle)) groupes.set(cle, { cle, matiere: test?.matiere ?? 'Sans matière', matiereCode: test?.matiereCode, tests: [] });
    groupes.get(cle).tests.push(test);
  });
  return [...groupes.values()].sort((a, b) => a.matiere.localeCompare(b.matiere, 'fr'));
};
