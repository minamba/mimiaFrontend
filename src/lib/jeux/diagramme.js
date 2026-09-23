/**
 * LE DIAGRAMME — le sixième nouveau jeu de maths du CE2.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CE2_DATA_DIAGRAMME — « Lire et construire un tableau ou un diagramme
 *   en barres »
 *
 * LE JEU. Un diagramme en barres — les fruits préférés de la classe, les
 * sports, les animaux… — et une question. Quatre sortes, deux fois chacune :
 *   - LIRE une barre : combien d'élèves préfèrent les pommes ?
 *   - LE PLUS : quel fruit est le plus aimé ?
 *   - COMBIEN DE PLUS : combien d'élèves de plus aiment les pommes que les
 *     poires ? (le piège : additionner au lieu de soustraire) ;
 *   - EN TOUT : combien d'élèves ont répondu ?
 *
 * LA GRADUATION VA DE 2 EN 2 et certaines barres s'arrêtent ENTRE deux
 * traits : lire 7 là où l'axe ne montre que 6 et 8 est la vraie lecture d'un
 * diagramme. Le piège : lire le trait d'à côté.
 *
 * « CONSTRUIRE » UN DIAGRAMME DEMANDE UNE RÈGLE ET DU PAPIER : le jeu en
 * travaille la lecture.
 */

export const MANCHES = 8;

export const THEMES = [
  { titre: 'Les fruits préférés de la classe', categories: ['pomme', 'banane', 'fraise', 'poire'] },
  { titre: 'Le sport préféré de la classe', categories: ['foot', 'danse', 'judo', 'natation'] },
  { titre: 'L’animal préféré de la classe', categories: ['chat', 'chien', 'lapin', 'cheval'] },
  { titre: 'La couleur préférée de la classe', categories: ['bleu', 'rouge', 'vert', 'jaune'] },
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

const SORTES = ['lire', 'plus', 'difference', 'total'];

export function serie(graine = Date.now()) {
  const tirer = suite(graine);
  const entre = (a, b) => a + Math.floor(tirer() * (b - a + 1));
  const melanger = (liste) => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };
  const sortes = melanger([...SORTES, ...SORTES]);

  return sortes.map((sorte, k) => {
    const theme = THEMES[k % THEMES.length];
    // Quatre valeurs différentes, dont au moins une impaire (entre deux traits).
    let valeurs;
    do {
      valeurs = theme.categories.map(() => entre(2, 12));
    } while (new Set(valeurs).size < 4 || !valeurs.some((v) => v % 2 === 1));

    const noms = theme.categories;
    const i = Math.floor(tirer() * 4);
    let j = Math.floor(tirer() * 4);
    while (j === i) j = Math.floor(tirer() * 4);
    const [grand, petit] = valeurs[i] > valeurs[j] ? [i, j] : [j, i];
    const total = valeurs.reduce((a, b) => a + b, 0);
    const max = valeurs.indexOf(Math.max(...valeurs));

    let question;
    let bonne;
    let choix;
    if (sorte === 'lire') {
      // La barre à lire est de préférence une barre entre deux traits.
      const impair = valeurs.findIndex((v) => v % 2 === 1);
      question = `Combien d’élèves ont choisi « ${noms[impair]} » ?`;
      bonne = valeurs[impair];
      choix = [bonne, bonne + 1, bonne - 1];
    } else if (sorte === 'plus') {
      question = 'Quel choix a été le plus aimé ?';
      bonne = noms[max];
      const autres = noms.filter((n) => n !== bonne);
      choix = [bonne, autres[0], autres[1]];
    } else if (sorte === 'difference') {
      question = `Combien d’élèves de plus ont choisi « ${noms[grand]} » que « ${noms[petit]} » ?`;
      bonne = valeurs[grand] - valeurs[petit];
      choix = [bonne, valeurs[grand] + valeurs[petit], valeurs[grand]];
    } else {
      question = 'Combien d’élèves ont répondu en tout ?';
      bonne = total;
      choix = [total, total - valeurs[max], Math.max(...valeurs)];
    }
    const uniques = [...new Set(choix)];
    while (uniques.length < 3) uniques.push(typeof bonne === 'number' ? bonne + uniques.length + 1 : noms.find((n) => !uniques.includes(n)));
    return {
      sorte, titre: theme.titre, noms, valeurs, question, bonne, choix: melanger(uniques),
    };
  });
}

export function verdict(m, choix) {
  return choix === m.bonne ? 'juste' : m.sorte;
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
  consigne: 'Lis le diagramme, puis réponds à la question.',
  lire: 'Suis le haut de la barre jusqu’aux nombres : une barre peut s’arrêter entre deux traits.',
  plus: 'Le plus aimé, c’est la barre la plus haute.',
  difference: 'Combien de plus : on enlève le petit nombre du grand.',
  total: 'En tout : on additionne toutes les barres.',
};
