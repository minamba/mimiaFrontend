/**
 * LA FRISE DES CLASSES — du CP à la terminale.
 *
 * Camara, le 23/09/2026 : « une frise qui va du CP jusqu'en terminale ; selon
 * le niveau de l'enfant il accède aux jeux des classes inférieures, et les
 * classes supérieures portent un cadenas ».
 *
 * DOUZE ÉTAPES, PAS VINGT-SIX. La base porte vingt-six classes parce qu'une
 * année de lycée se décline en voies (première générale, technologique,
 * professionnelle, STMG, ST2S, STL). Une frise n'a pas à les distinguer : elle
 * dit l'ANNÉE, et trois voies partagent la même. C'est exactement ce que fait
 * déjà `Ordre` en base, où ces trois-là valent 11 — voir `ReferentielSeeder`.
 *
 * LE RANG, ET NON LE PROGRAMME. Ce rang sert à comparer des années entre
 * elles, rien d'autre : ce qu'un élève travaille dépend de sa voie, pas de son
 * rang. Aucun contenu ne se choisit ici.
 *
 * UN FILET, COMME `cycleDuNiveau`. La classe arrive par deux chemins — le code
 * (`SECONDE_PRO`) quand il est là, le libellé (« Seconde professionnelle »)
 * pour les sessions ouvertes avant que le code n'existe. Les deux sont lus.
 */

/** Les douze années, dans l'ordre. `code` est celui de `NiveauScolaire`. */
export const FRISE = [
  { code: 'CP', court: 'CP', libelle: 'CP', rang: 1, cycle: 'Primaire' },
  { code: 'CE1', court: 'CE1', libelle: 'CE1', rang: 2, cycle: 'Primaire' },
  { code: 'CE2', court: 'CE2', libelle: 'CE2', rang: 3, cycle: 'Primaire' },
  { code: 'CM1', court: 'CM1', libelle: 'CM1', rang: 4, cycle: 'Primaire' },
  { code: 'CM2', court: 'CM2', libelle: 'CM2', rang: 5, cycle: 'Primaire' },
  { code: 'SIXIEME', court: '6e', libelle: 'la 6e', rang: 6, cycle: 'Collège' },
  { code: 'CINQUIEME', court: '5e', libelle: 'la 5e', rang: 7, cycle: 'Collège' },
  { code: 'QUATRIEME', court: '4e', libelle: 'la 4e', rang: 8, cycle: 'Collège' },
  { code: 'TROISIEME', court: '3e', libelle: 'la 3e', rang: 9, cycle: 'Collège' },
  { code: 'SECONDE', court: '2de', libelle: 'la seconde', rang: 10, cycle: 'Lycée' },
  { code: 'PREMIERE', court: '1re', libelle: 'la première', rang: 11, cycle: 'Lycée' },
  { code: 'TERMINALE', court: 'Tle', libelle: 'la terminale', rang: 12, cycle: 'Lycée' },
];

/** Les vingt-six codes de `NiveauScolaire`, ramenés à leur année. */
const PAR_CODE = {
  CP: 1, CE1: 2, CE2: 3, CM1: 4, CM2: 5,
  SIXIEME: 6, CINQUIEME: 7, QUATRIEME: 8, TROISIEME: 9, TROISIEME_PREPA: 9,
  SECONDE: 10, SECONDE_PRO: 10,
  PREMIERE: 11, PREMIERE_TECHNO: 11, PREMIERE_PRO: 11,
  PREMIERE_STMG: 11, PREMIERE_ST2S: 11, PREMIERE_STL: 11,
  TERMINALE: 12, TERMINALE_TECHNO: 12, TERMINALE_PRO: 12,
  TERMINALE_STMG: 12, TERMINALE_ST2S: 12, TERMINALE_STL: 12,
};

/** Sans accents ni casse : « Première générale » et « PREMIERE » se rejoignent. */
const nu = (texte) => (texte ?? '')
  .trim()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toUpperCase();

/**
 * L'année d'une classe, de 1 (CP) à 12 (terminale) — ou `null` si le libellé
 * n'apprend rien. Le code est lu d'abord ; le libellé sert de repli.
 */
export function rangDeLaClasse(valeur) {
  const texte = nu(valeur);
  if (!texte) return null;

  const parCode = PAR_CODE[texte.replace(/[\s-]+/g, '_')];
  if (parCode) return parCode;

  // Le repli par libellé. « 6e prépa-métiers », « Seconde professionnelle »…
  // seul le début du libellé porte l'année.
  const college = texte.match(/^([3-6])E\b/);
  if (college) return 12 - Number(college[1]);

  if (texte.startsWith('SECONDE')) return 10;
  if (texte.startsWith('PREMIERE')) return 11;
  if (texte.startsWith('TERMINALE')) return 12;

  return null;
}

/**
 * La frise telle qu'elle s'affiche pour un enfant.
 *
 * `aDesJeux(code)` dit si la classe a des jeux écrits : une classe ouverte mais
 * vide n'est pas un cadenas, c'est un « bientôt ». Les deux ne se disent pas
 * pareil à un enfant — l'un le renvoie à son niveau, l'autre à notre travail.
 *
 * CLASSE INCONNUE : rien n'est verrouillé. C'est le cas d'une session ouverte
 * avant que le code de classe n'existe ; refuser tout à un enfant dont on ne
 * sait rien serait le punir d'un défaut qui n'est pas le sien.
 */
export function frisePourLaClasse(niveauCode, aDesJeux = () => false) {
  const rang = rangDeLaClasse(niveauCode);

  return FRISE.map((etape) => ({
    ...etape,
    sienne: rang !== null && etape.rang === rang,
    verrouillee: rang !== null && etape.rang > rang,
    desJeux: Boolean(aDesJeux(etape.code)),
  }));
}
