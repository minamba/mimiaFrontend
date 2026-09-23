/**
 * OÙ, QUAND, COMMENT ? — le premier nouveau jeu de français du CE2.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CE2_LANG_COMPLEMENTS — « Repérer les compléments qui répondent à où,
 *   quand, comment »
 *
 * LE JEU. Une phrase, un groupe surligné : répond-il à « où ? », « quand ? »
 * ou « comment ? » ? Neuf phrases, trois de chaque.
 *
 * LE GROUPE N'EST PAS TOUJOURS À LA FIN : « Ce matin, nous partons » — un
 * complément se déplace, c'est même ce qui le fait reconnaître. L'erreur
 * donne la question qui marche, posée sur la phrase.
 */

export const MANCHES = 9;

export const QUESTIONS = [
  { cle: 'ou', libelle: 'Où ?' },
  { cle: 'quand', libelle: 'Quand ?' },
  { cle: 'comment', libelle: 'Comment ?' },
];

/** `avant`, le `groupe` surligné, `apres` ; `type` est la question à laquelle il répond. */
export const PHRASES_JEU = [
  { avant: 'Le chat dort', groupe: 'sous la table', apres: '.', type: 'ou' },
  { avant: 'Les oiseaux volent', groupe: 'dans le ciel', apres: '.', type: 'ou' },
  { avant: 'Nous mangeons', groupe: 'à la cantine', apres: '.', type: 'ou' },
  { avant: 'Les enfants jouent', groupe: 'dans la cour', apres: '.', type: 'ou' },
  { avant: '', groupe: 'Ce matin', apres: ', nous partons à l’école.', type: 'quand' },
  { avant: '', groupe: 'Demain', apres: ', il neigera.', type: 'quand' },
  { avant: '', groupe: 'Le soir', apres: ', papa lit une histoire.', type: 'quand' },
  { avant: 'Le train arrive', groupe: 'à midi', apres: '.', type: 'quand' },
  { avant: 'Léa chante', groupe: 'doucement', apres: '.', type: 'comment' },
  { avant: 'Tom court', groupe: 'très vite', apres: '.', type: 'comment' },
  { avant: 'Elle écrit', groupe: 'avec soin', apres: '.', type: 'comment' },
  { avant: 'Le bébé dort', groupe: 'calmement', apres: '.', type: 'comment' },
];

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;

  return () => {
    etat = (etat * 16807) % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/** Neuf phrases, trois de chaque sorte, mêlées. */
export function serie(graine = Date.now()) {
  const tirer = suite(graine);
  const melanger = (liste) => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };
  return melanger(QUESTIONS.flatMap((q) => melanger(PHRASES_JEU.filter((p) => p.type === q.cle)).slice(0, 3)));
}

export function verdict(p, choix) {
  return choix === p.type ? 'juste' : p.type;
}

/** Le mot de la fin — le même dans tous les jeux. */
export function bilan(duPremierCoup, manches = MANCHES) {
  if (duPremierCoup === manches) return 'Sans une seule erreur. Bravo !';
  if (duPremierCoup >= manches - 2) return 'Presque parfait !';
  if (duPremierCoup >= manches / 2) return 'C’est de mieux en mieux !';
  return 'Tu y arrives. On recommence ?';
}

/**
 * LES PHRASES DU JEU, ÉCRITES ET DITES. Elles vivent ici pour n'exister qu'en
 * un exemplaire : voir `voix/repliques.js`.
 */
export const PHRASES = {
  consigne: 'Le groupe surligné répond à quelle question : où, quand, ou comment ?',
  ou: 'Ce groupe dit l’endroit : il répond à la question « où ? ».',
  quand: 'Ce groupe dit le moment : il répond à la question « quand ? ».',
  comment: 'Ce groupe dit la manière : il répond à la question « comment ? ».',
};
