/**
 * LE MÈTRE RUBAN — le premier nouveau jeu de maths du CE2.
 *
 * Voulu par Camara le 21/09/2026 : « lance dans cet ordre et développe tous
 * les jeux ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CE2_MES_CONVERSION — « Convertir les unités de longueur usuelles »
 *
 * LE JEU. Une longueur dans une unité ; l'enfant choisit la même longueur dans
 * une autre, parmi trois. Huit manches : mètres et centimètres, centimètres et
 * millimètres, kilomètres et mètres, dans les deux sens, et des longueurs
 * composées (1 m 45 cm).
 *
 * LES PIÈGES SONT CEUX DU CE2 :
 *   - un zéro de trop ou de moins (2 m = 20 cm, 2 m = 2 000 cm) : on a pris
 *     la mauvaise unité ;
 *   - les nombres COLLÉS : 1 m 45 cm = 1 045 cm, parce qu'on a écrit 1 puis
 *     45 ;
 *   - les nombres AJOUTÉS : 1 m 45 cm = 46 cm.
 *
 * L'ERREUR DONNE L'ÉGALITÉ À RETENIR (« 1 mètre, c'est 100 centimètres »), la
 * seule chose qu'il faut savoir par cœur pour convertir.
 */

export const MANCHES = 8;

/** Les relations entre unités : combien de petites dans une grande. */
export const RELATIONS = {
  'm-cm': { grande: 'm', petite: 'cm', facteur: 100 },
  'cm-mm': { grande: 'cm', petite: 'mm', facteur: 10 },
  'km-m': { grande: 'km', petite: 'm', facteur: 1000 },
};

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;

  return () => {
    etat = (etat * 16807) % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/** « 1 450 » : un nombre écrit avec l'espace des milliers. */
export const ecrire = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/**
 * LES SORTES DE MANCHES : vers la petite unité, vers la grande, et composée
 * (grande et petite ensemble, vers la petite).
 */
const SORTES = ['vers-petite', 'vers-grande', 'composee'];

function manche(relation, sorte, tirer) {
  const { grande, petite, facteur } = RELATIONS[relation];
  const entre = (a, b) => a + Math.floor(tirer() * (b - a + 1));
  if (sorte === 'vers-petite') {
    const n = entre(2, 9);
    return {
      relation, sorte, question: `${n} ${grande} = ? ${petite}`, unite: petite,
      bonne: n * facteur, choix: [n * facteur, (n * facteur) / 10, n * facteur * 10],
    };
  }
  if (sorte === 'vers-grande') {
    const n = entre(2, 9);
    return {
      relation, sorte, question: `${ecrire(n * facteur)} ${petite} = ? ${grande}`, unite: grande,
      bonne: n, choix: [n, n * 10, n * facteur * 10],
    };
  }
  const a = entre(1, 4);
  const b = entre(11, facteur - 1);
  const colle = Number(`${a}0${b}`.replace(/^(\d)0(\d{3})$/, '$1$2'));
  return {
    relation, sorte, question: `${a} ${grande} ${b} ${petite} = ? ${petite}`, unite: petite,
    bonne: a * facteur + b, choix: [a * facteur + b, colle === a * facteur + b ? a * facteur + b + facteur : colle, a + b],
  };
}

/**
 * Huit manches : les composées demandent m et cm (1 m 45 cm), la relation la
 * plus utile au CE2 ; les autres tournent entre les trois relations.
 */
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
  const plan = [
    ['m-cm', 'vers-petite'], ['cm-mm', 'vers-petite'], ['km-m', 'vers-petite'],
    ['m-cm', 'vers-grande'], ['cm-mm', 'vers-grande'], ['km-m', 'vers-grande'],
    ['m-cm', 'composee'], ['m-cm', 'composee'],
  ];
  return plan.map(([r, s]) => {
    const m = manche(r, s, tirer);
    return { ...m, choix: melanger([...new Set(m.choix)]) };
  });
}

/** Juste, ou la relation à retenir, ou le piège des nombres collés ou ajoutés. */
export function verdict(m, choix) {
  if (choix === m.bonne) return 'juste';
  if (m.sorte === 'composee' && choix !== m.bonne) return 'composee';
  return m.relation;
}

export { SORTES };

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
  consigne: 'Quelle est la même longueur, dans l’autre unité ?',
  'm-cm': 'Un mètre, c’est cent centimètres.',
  'cm-mm': 'Un centimètre, c’est dix millimètres.',
  'km-m': 'Un kilomètre, c’est mille mètres.',
  composee: 'Change d’abord les mètres en centimètres, puis ajoute les centimètres.',
};
