/**
 * LE DÉTECTIVE DU VERBE — le cinquième nouveau jeu de français du CE1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CE1_LANG_VERBE_SUJET — « Identifier le verbe et son sujet dans une
 *   phrase simple »
 *
 * LE JEU, EN DEUX TEMPS, comme la méthode de la classe :
 *   1. TROUVER LE VERBE : l'enfant touche un mot de la phrase.
 *   2. TROUVER LE SUJET : Adrien demande « Qui est-ce qui aboie ? », et
 *      l'enfant touche un mot du sujet — tout le groupe s'éclaire.
 *
 * LES OUTILS DU CE1, ET CE QUE L'ERREUR RAPPELLE :
 *   - le verbe est le mot qui change quand on dit « hier » ou « demain » ;
 *   - le sujet répond à « Qui est-ce qui … ? ».
 *
 * LE SUJET N'EST PAS TOUJOURS EN TÊTE : « Dans la forêt, le loup court. » Le
 * premier groupe de la phrase n'est pas forcément le sujet, et c'est le
 * piège que ces phrases-là tendent exprès.
 *
 * LES PHRASES SONT ÉCRITES À LA MAIN, découpées en mots : `verbe` est la place
 * du verbe, `sujet` les places des mots du sujet, `question` la question
 * « Qui est-ce qui … ? » à la troisième personne du singulier — « Qui est-ce
 * qui joue ? », jamais « jouent ».
 */

export const MANCHES = 8;

export const PHRASES_JEU = [
  { mots: ['Le', 'chien', 'aboie', 'dans', 'le', 'jardin.'], verbe: 2, sujet: [0, 1], question: 'aboie' },
  { mots: ['Ma', 'petite', 'sœur', 'dessine', 'une', 'maison.'], verbe: 3, sujet: [0, 1, 2], question: 'dessine' },
  { mots: ['Les', 'enfants', 'jouent', 'au', 'ballon.'], verbe: 2, sujet: [0, 1], question: 'joue' },
  { mots: ['Dans', 'la', 'forêt,', 'le', 'loup', 'court.'], verbe: 5, sujet: [3, 4], question: 'court' },
  { mots: ['Nous', 'mangeons', 'des', 'crêpes.'], verbe: 1, sujet: [0], question: 'mange' },
  { mots: ['Le', 'soir,', 'papa', 'lit', 'une', 'histoire.'], verbe: 3, sujet: [2], question: 'lit' },
  { mots: ['Tom', 'et', 'Léa', 'font', 'un', 'gâteau.'], verbe: 3, sujet: [0, 1, 2], question: 'fait' },
  { mots: ['Le', 'vent', 'souffle', 'très', 'fort.'], verbe: 2, sujet: [0, 1], question: 'souffle' },
  { mots: ['Mes', 'amis', 'arrivent', 'demain.'], verbe: 2, sujet: [0, 1], question: 'arrive' },
  { mots: ['Le', 'boulanger', 'vend', 'du', 'pain.'], verbe: 2, sujet: [0, 1], question: 'vend' },
  { mots: ['Ce', 'matin,', 'le', 'chat', 'dort.'], verbe: 4, sujet: [2, 3], question: 'dort' },
  { mots: ['La', 'maîtresse', 'écrit', 'au', 'tableau.'], verbe: 2, sujet: [0, 1], question: 'écrit' },
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

/** Huit phrases différentes, dont toujours au moins une où le sujet n'est pas en tête. */
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
  let choisies;
  do {
    choisies = melanger(PHRASES_JEU).slice(0, MANCHES);
  } while (!choisies.some((p) => p.sujet[0] !== 0));
  return choisies.map((p) => PHRASES_JEU.indexOf(p));
}

export const phrase = (i) => PHRASES_JEU[i];

/** Le verbe touché ? Le sujet touché ? */
export const estVerbe = (p, i) => i === p.verbe;
export const estSujet = (p, i) => p.sujet.includes(i);

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
export function questionSujet(p) {
  return `Qui est-ce qui ${p.question} ? Touche le sujet.`;
}

export const PHRASES = {
  consigneVerbe: 'Trouve le verbe : touche-le.',
  erreurVerbe: 'Ce n’est pas le verbe. Le verbe, c’est le mot qui change si on dit « hier » ou « demain ».',
  erreurSujet: 'Ce n’est pas le sujet. Pose la question : qui est-ce qui fait l’action ?',
};

// ------------------------------------------------------------ le CE2

/**
 * AU CE2, LES CLASSES DE MOTS — Camara, le 21/09/2026. Compétence :
 *   FR_CE2_LANG_CLASSES — « Distinguer nom, verbe, déterminant, adjectif et
 *   pronom »
 *
 * LE MÊME DÉTECTIVE, UNE AUTRE ENQUÊTE : on demande une classe (« touche un
 * adjectif »), l'enfant touche un mot. S'il se trompe, le jeu lui dit ce
 * qu'est le mot touché, puis rappelle ce qu'on cherche — deux informations,
 * pas un « non ».
 *
 * CHAQUE MOT EST ÉTIQUETÉ À LA MAIN. « Dans », « et » ne sont d'aucune des
 * cinq classes du CE2 : ils portent « autre », et ne sont jamais demandés.
 */

export const CLASSES = ['nom', 'verbe', 'determinant', 'adjectif', 'pronom'];

export const PHRASES_CE2 = [
  { mots: ['Le', 'petit', 'chat', 'dort.'], classes: ['determinant', 'adjectif', 'nom', 'verbe'] },
  { mots: ['Elle', 'mange', 'une', 'pomme', 'rouge.'], classes: ['pronom', 'verbe', 'determinant', 'nom', 'adjectif'] },
  { mots: ['Nous', 'regardons', 'un', 'grand', 'bateau.'], classes: ['pronom', 'verbe', 'determinant', 'adjectif', 'nom'] },
  { mots: ['Ma', 'sœur', 'porte', 'une', 'robe', 'bleue.'], classes: ['determinant', 'nom', 'verbe', 'determinant', 'nom', 'adjectif'] },
  { mots: ['Il', 'lit', 'un', 'livre', 'amusant.'], classes: ['pronom', 'verbe', 'determinant', 'nom', 'adjectif'] },
  { mots: ['Les', 'oiseaux', 'chantent.'], classes: ['determinant', 'nom', 'verbe'] },
  { mots: ['Tu', 'dessines', 'une', 'maison', 'jaune.'], classes: ['pronom', 'verbe', 'determinant', 'nom', 'adjectif'] },
  { mots: ['Ce', 'gros', 'chien', 'aboie.'], classes: ['determinant', 'adjectif', 'nom', 'verbe'] },
  { mots: ['Ils', 'jouent', 'dans', 'le', 'jardin.'], classes: ['pronom', 'verbe', 'autre', 'determinant', 'nom'] },
  { mots: ['Mon', 'frère', 'range', 'sa', 'chambre.'], classes: ['determinant', 'nom', 'verbe', 'determinant', 'nom'] },
];

/**
 * Huit enquêtes : chaque classe demandée au moins une fois, chacune dans une
 * phrase qui la contient.
 */
export function serieCE2(graine = Date.now()) {
  const tirer = suite(graine);
  const melanger = (liste) => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };
  const cibles = melanger([...CLASSES, ...melanger(CLASSES).slice(0, MANCHES - CLASSES.length)]);
  return cibles.map((cible) => {
    const possibles = PHRASES_CE2.map((p, i) => i).filter((i) => PHRASES_CE2[i].classes.includes(cible));
    return { phrase: possibles[Math.floor(tirer() * possibles.length)], cible };
  });
}

export const NOMS_CLASSES = {
  nom: 'un nom', verbe: 'un verbe', determinant: 'un déterminant', adjectif: 'un adjectif', pronom: 'un pronom',
};

export const PHRASES_CLASSES = {
  consigne: (c) => `Touche ${NOMS_CLASSES[c]}.`,
  estUn: (c) => (c === 'autre' ? 'Ce mot n’est d’aucune de ces cinq classes.' : `Ce mot est ${NOMS_CLASSES[c]}.`),
  definition: {
    nom: 'Un nom désigne une personne, un animal ou une chose.',
    verbe: 'Le verbe dit ce que l’on fait ; il change si on dit hier ou demain.',
    determinant: 'Le déterminant est le petit mot devant le nom : le, une, mon.',
    adjectif: 'L’adjectif dit comment est le nom : petit, rouge, amusant.',
    pronom: 'Le pronom remplace un nom : il, elle, nous.',
  },
};
