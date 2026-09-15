/**
 * LES ÉCARTS ENTRE LA DICTÉE ET LA COPIE, NUMÉROTÉS AU MÊME ENDROIT DES DEUX
 * CÔTÉS.
 *
 * Voulu par Camara le 11/09/2026 : au tableau comme dans « Mes dictées »,
 * chaque erreur est surlignée sur la copie de l'enfant ET à l'endroit
 * correspondant du texte dicté, avec le même badge — 1, 2, 3… dans l'ordre du
 * texte. L'enfant voit d'un coup d'œil où il s'est trompé, et ce qu'il
 * fallait écrire.
 *
 * CALCULÉ ICI, JAMAIS DEMANDÉ AU MODÈLE. Un numéro posé par le professeur
 * tomberait une fois sur deux à côté du mot — c'est la leçon de toute la
 * mécanique de dictée : une garantie d'usage s'impose dans le code. Les deux
 * textes sont là, mot pour mot ; les aligner est un calcul, pas un jugement.
 *
 * CE QUI COMPTE COMME UNE ERREUR
 * ------------------------------
 * - un mot mal écrit — lettre, accent, terminaison : « levée » pour « levé »,
 *   « a » pour « à » ;
 * - un mot oublié, ou tout un passage : des tirets numérotés « ----- »
 *   marquent le trou dans la copie — voulu par Camara le 11/09/2026, plus
 *   parlant pour un enfant que le signe ‸ des correcteurs ;
 * - un mot en trop ou inventé : le même repère marque sa place dans la
 *   dictée ;
 * - un mot coupé ou soudé — « ilse » pour « ils se » : UNE erreur, pas deux.
 *
 * CE QUI NE COMPTE PAS, DÉLIBÉRÉMENT : la ponctuation et les majuscules. Au
 * clavier, un enfant n'en tape presque aucune — les compter couvrirait la
 * copie de badges et noierait les vraies fautes d'orthographe. Le professeur
 * reste libre d'en parler. De même « coeur » vaut « cœur » : la ligature ne
 * se tape pas sur un clavier ordinaire.
 */

// Chinois et japonais : pas d'espaces entre les mots — chaque caractère est
// une unité, sans quoi une phrase entière passerait pour un seul « mot ».
const MORCEAUX = /(\s+)|([぀-ヿ㐀-䶿一-鿿豈-﫿])|([^\s぀-ヿ㐀-䶿一-鿿豈-﫿]+)/gu;

/** La forme d'un mot qu'on compare : ni casse, ni ponctuation autour. */
export function cleMot(mot) {
  return (mot ?? '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

/** Le texte en morceaux, dans l'ordre : blancs, mots, ponctuation isolée. */
function decouper(texte) {
  const morceaux = [];

  for (const trouve of (texte ?? '').normalize('NFC').matchAll(MORCEAUX)) {
    if (trouve[1]) {
      morceaux.push({ texte: trouve[1], cle: '' });
    } else {
      morceaux.push({ texte: trouve[0], cle: cleMot(trouve[0]) });
    }
  }

  return morceaux;
}

const estMot = (morceau) => morceau.cle !== '';

/** Distance d'édition : combien de lettres changer pour passer de l'un à l'autre. */
function distance(a, b) {
  const ligne = Array.from({ length: b.length + 1 }, (_, j) => j);

  for (let i = 1; i <= a.length; i += 1) {
    let diagonale = ligne[0];
    ligne[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const dessus = ligne[j];
      ligne[j] = Math.min(
        ligne[j] + 1,
        ligne[j - 1] + 1,
        diagonale + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonale = dessus;
    }
  }

  return ligne[b.length];
}

/**
 * Deux mots assez proches pour être LE MÊME MOT mal écrit.
 *
 * C'est ce qui fait tomber « batton » en face de « battant » plutôt qu'en
 * face du mot d'après : un mot mal orthographié reste le mot qu'il voulait
 * écrire, et c'est en face de lui que le badge doit se poser.
 */
function proches(a, b) {
  return distance(a, b) <= Math.max(1, Math.floor(Math.max(a.length, b.length) / 2));
}

const COUT_REMPLACEMENT_LOINTAIN = 2.5;

/**
 * L'alignement mot à mot, au moindre coût.
 *
 * Un mot identique ne coûte rien ; un mot proche mal écrit, 1 ; un mot oublié
 * ou ajouté, 1. Deux mots sans rapport ne se font jamais face : ils coûtent
 * plus cher qu'un oubli suivi d'un ajout, et c'est ainsi qu'ils sont lus.
 */
function aligner(a, b) {
  const n = a.length;
  const m = b.length;

  const remplacement = (i, j) => {
    if (a[i] === b[j]) return 0;
    return proches(a[i], b[j]) ? 1 : COUT_REMPLACEMENT_LOINTAIN;
  };

  const cout = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  for (let i = 0; i <= n; i += 1) cout[i][0] = i;
  for (let j = 0; j <= m; j += 1) cout[0][j] = j;

  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      cout[i][j] = Math.min(
        cout[i - 1][j - 1] + remplacement(i - 1, j - 1),
        cout[i - 1][j] + 1,
        cout[i][j - 1] + 1,
      );
    }
  }

  const operations = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const prix = remplacement(i - 1, j - 1);

      if (prix < COUT_REMPLACEMENT_LOINTAIN && cout[i][j] === cout[i - 1][j - 1] + prix) {
        operations.push({ type: prix === 0 ? 'egal' : 'faute', a: i - 1, b: j - 1 });
        i -= 1;
        j -= 1;
        continue;
      }
    }

    if (i > 0 && cout[i][j] === cout[i - 1][j] + 1) {
      operations.push({ type: 'oubli', a: i - 1 });
      i -= 1;
      continue;
    }

    operations.push({ type: 'ajout', b: j - 1 });
    j -= 1;
  }

  return operations.reverse();
}

/**
 * Regroupe les opérations en erreurs numérotées, dans l'ordre du texte.
 *
 * - chaque mot mal écrit est UNE erreur, même collé au suivant ;
 * - une suite d'oublis ou d'ajouts est UNE erreur — une phrase oubliée ne
 *   vaut pas quinze badges ;
 * - un seul oubli ou ajout collé à un mot mal écrit s'y rattache : c'est un
 *   mot coupé ou soudé, « ilse » pour « ils se ».
 */
function numeroter(operations) {
  let numero = 0;
  let region = null;

  operations.forEach((op) => {
    if (op.type === 'egal') {
      region = null;
      return;
    }

    const rejoint = region && (op.type === 'faute'
      ? !region.faute && region.trous <= 1
      : (region.faute ? region.trous === 0 : true));

    if (!rejoint) {
      numero += 1;
      region = { numero, faute: false, trous: 0 };
    }

    if (op.type === 'faute') region.faute = true;
    else region.trous += 1;

    op.erreur = region.numero;
  });

  return numero;
}

const contientUnMot = (texte) => /[\p{L}\p{N}]/u.test(texte);

/**
 * UN GROUPE DE MOTS SE LIT COMME UN SEUL BLOC.
 *
 * Relevé par Camara le 11/09/2026 : « une dernière fois » oublié, trois mots
 * surlignés chacun de son côté — on pouvait croire à trois erreurs, ou à la
 * seule première. Les blancs ENTRE deux mots d'une même erreur sont donc
 * surlignés eux aussi. Jamais par-dessus un retour à la ligne, jamais
 * par-dessus un mot juste.
 */
function relierLesGroupes(segments) {
  let precedent = -1;

  segments.forEach((segment, i) => {
    if (segment.type !== 'mot') {
      if (segment.type === 'texte' && contientUnMot(segment.texte)) precedent = -1;
      if (segment.type === 'manque') precedent = -1;
      return;
    }

    if (precedent >= 0 && segments[precedent].erreur === segment.erreur) {
      const entre = segments.slice(precedent + 1, i);
      const reliables = entre.every((s) => s.type === 'texte' && !s.texte.includes('\n'));

      if (reliables) {
        for (let k = precedent + 1; k < i; k += 1) {
          segments[k] = { type: 'mot', texte: segments[k].texte, erreur: segment.erreur, badge: false };
        }
      }
    }

    precedent = i;
  });
}

/**
 * LE BADGE FERME L'ERREUR, IL NE L'OUVRE PAS. Relevé le même jour : posé
 * après « une », il désignait « une » seul, alors que l'erreur était « une
 * dernière fois ». Il se pose donc après le DERNIER mot de chaque erreur —
 * pour un mot seul, c'est ce mot-là.
 */
function poserLesBadges(segments) {
  const dernier = new Map();

  segments.forEach((segment, i) => {
    if (segment.type === 'mot' && contientUnMot(segment.texte)) dernier.set(segment.erreur, i);
  });

  dernier.forEach((i) => { segments[i].badge = true; });
}

/**
 * Le texte d'un côté, prêt à afficher : les mots en erreur portent leur
 * numéro (badge après le dernier de chaque erreur), et les trous leur repère.
 */
function segmenter(morceaux, erreurParMot, trousParPosition) {
  const segments = [];
  let rang = 0;

  const poserTrous = (position) => {
    (trousParPosition.get(position) ?? []).forEach((n) => {
      segments.push({ type: 'manque', erreur: n });
    });
  };

  morceaux.forEach((morceau) => {
    if (!estMot(morceau)) {
      segments.push({ type: 'texte', texte: morceau.texte });
      return;
    }

    if (rang === 0) poserTrous(0);

    const n = erreurParMot.get(rang);

    if (n) {
      segments.push({ type: 'mot', texte: morceau.texte, erreur: n, badge: false });
    } else {
      segments.push({ type: 'texte', texte: morceau.texte });
    }

    rang += 1;

    // Le repère d'un trou se pose JUSTE APRÈS le mot qui le précède — avant
    // l'espace et la ponctuation qui suivent : « ses notes----- avant ».
    poserTrous(rang);
  });

  if (rang === 0) poserTrous(0);

  relierLesGroupes(segments);
  poserLesBadges(segments);

  return segments;
}

const ajouter = (carte, cle, valeur) => carte.set(cle, [...(carte.get(cle) ?? []), valeur]);

/**
 * Compare la dictée et la copie.
 *
 * `comparable` est faux quand la copie ne ressemble pas assez au texte pour
 * qu'un surlignage veuille dire quelque chose — une copie « arrivée en
 * photo » encore jamais relue, un texte sans rapport. Mieux vaut alors ne
 * rien surligner que couvrir une page de badges absurdes.
 */
export function comparerDictee(dicte, copie) {
  const morceauxDicte = decouper(dicte);
  const morceauxCopie = decouper(copie);

  const motsDicte = morceauxDicte.filter(estMot).map((m) => m.cle);
  const motsCopie = morceauxCopie.filter(estMot).map((m) => m.cle);

  const operations = aligner(motsDicte, motsCopie);
  const erreurs = numeroter(operations);

  const erreursDicte = new Map();
  const erreursCopie = new Map();
  const trousDicte = new Map();
  const trousCopie = new Map();
  const regions = new Map();

  let rangDicte = 0;
  let rangCopie = 0;

  operations.forEach((op) => {
    if (op.erreur) {
      const region = regions.get(op.erreur)
        ?? { dicte: false, copie: false, positionDicte: rangDicte, positionCopie: rangCopie };

      if (op.type !== 'ajout') {
        erreursDicte.set(op.a, op.erreur);
        region.dicte = true;
      }

      if (op.type !== 'oubli') {
        erreursCopie.set(op.b, op.erreur);
        region.copie = true;
      }

      regions.set(op.erreur, region);
    }

    if (op.type !== 'ajout') rangDicte += 1;
    if (op.type !== 'oubli') rangCopie += 1;
  });

  // Une erreur absente d'un côté — un oubli dans la copie, un ajout face à
  // la dictée — y laisse un repère, pour que le même numéro se retrouve des
  // deux côtés.
  regions.forEach((region, n) => {
    if (!region.dicte) ajouter(trousDicte, region.positionDicte, n);
    if (!region.copie) ajouter(trousCopie, region.positionCopie, n);
  });

  const communs = operations.filter((op) => op.type === 'egal').length;

  return {
    dicte: segmenter(morceauxDicte, erreursDicte, trousDicte),
    copie: segmenter(morceauxCopie, erreursCopie, trousCopie),
    erreurs,
    comparable: motsDicte.length > 0
      && motsCopie.length > 0
      && communs >= Math.max(1, motsDicte.length * 0.3),
  };
}

/** Les mots d'un texte, en ensemble, pour mesurer une ressemblance. */
const motsDe = (texte) => new Set(decouper(texte).filter(estMot).map((m) => m.cle));

/** La part des mots de `texte` qu'on retrouve dans `reference`. */
function partage(texte, reference) {
  const mots = [...motsDe(texte)];
  if (mots.length === 0) return 0;

  const connus = motsDe(reference);
  return mots.filter((m) => connus.has(m)).length / mots.length;
}

const MARQUEUR_COPIE_CLAVIER = '[DICTÉE AU CLAVIER';

/**
 * LA VRAIE COPIE DE L'ÉLÈVE, PAS CELLE QUE LE PROFESSEUR RÉÉCRIT.
 *
 * Relevé par Camara le 11/09/2026 : en reprenant une correction, le
 * professeur a recopié au tableau la copie DÉJÀ CORRIGÉE — plus une faute,
 * donc plus un badge. Les badges ne doivent jamais dépendre de ce qu'il
 * recopie. On cherche donc, dans les messages, la copie telle qu'elle est
 * arrivée :
 *
 * 1. rendue au clavier — le message de l'élève qui porte le constat
 *    « DICTÉE AU CLAVIER », mot pour mot ce qu'il a tapé ;
 * 2. sinon, la PREMIÈRE fois que cette dictée a été posée au tableau — au
 *    cahier, c'est la retranscription de la photo, faite avant toute
 *    correction.
 *
 * Null si rien ne correspond : le tableau garde alors ce qui y est écrit.
 */
export function copieDeReference(messages, contenu, { retirerMarqueur = (t) => t } = {}) {
  const lue = lireComparaison(contenu);
  if (!lue) return null;

  const liste = messages ?? [];

  for (let i = liste.length - 1; i >= 0; i -= 1) {
    const message = liste[i];
    if (message?.role !== 'user' || !(message.contenu ?? '').includes(MARQUEUR_COPIE_CLAVIER)) continue;

    const copie = retirerMarqueur(message.contenu).trim();
    if (copie && partage(copie, lue.dicte) >= 0.5) return copie;
  }

  for (const message of liste) {
    if (message?.role !== 'assistant') continue;

    const tableaux = (message.contenu ?? '').match(/\[ARDOISE\][\s\S]*?\[\/ARDOISE\]/g) ?? [];

    for (const tableau of tableaux) {
      const premiere = lireComparaison(tableau.replace(/^\[ARDOISE\]|\[\/ARDOISE\]$/g, ''));

      if (premiere
        && partage(premiere.dicte, lue.dicte) >= 0.6
        && partage(lue.dicte, premiere.dicte) >= 0.6) {
        return premiere.copie;
      }
    }
  }

  return null;
}

/**
 * LES DEUX TITRES, DANS TOUTES LES LANGUES ENSEIGNÉES.
 *
 * La consigne demande au professeur d'écrire « La dictée » et « Ta copie »
 * quelle que soit la langue du cours. Mais un professeur d'espagnol qui
 * traduit ses titres ne doit pas priver l'élève de ses badges : on reconnaît
 * donc aussi les formes traduites. Une langue de plus, c'est un mot de plus
 * ici.
 */
const TITRE_DICTEE = /^\s*(?:la\s+|le\s+|el\s+|il\s+|the\s+|das\s+)?(?:dict[ée]e|dictation|dictado|dettato|diktat|听写)\s*[:：]?\s*$/i;
const TITRE_COPIE = /^\s*(?:ta\s+|ma\s+|your\s+|tu\s+|la\s+tua\s+|deine\s+|你的\s*)?(?:copie|copy|copia|abschrift|抄写|答案)\s*[:：]?\s*$/i;

/**
 * Le tableau de correction d'une dictée : « La dictée », le texte, puis
 * « Ta copie », la copie — le format que la consigne demande au professeur.
 *
 * Null pour tout autre contenu de tableau : il s'affiche alors tel quel.
 */
export function lireComparaison(contenu) {
  const lignes = (contenu ?? '').normalize('NFC').split('\n');

  const indexDictee = lignes.findIndex((l) => TITRE_DICTEE.test(l));
  if (indexDictee < 0) return null;

  const indexCopie = lignes.findIndex((l, i) => i > indexDictee && TITRE_COPIE.test(l));
  if (indexCopie < 0) return null;

  const dicte = lignes.slice(indexDictee + 1, indexCopie).join('\n').trim();
  const copie = lignes.slice(indexCopie + 1).join('\n').trim();

  if (!dicte || !copie) return null;

  return {
    avant: lignes.slice(0, indexDictee).join('\n').trim(),
    titreDictee: lignes[indexDictee].trim(),
    titreCopie: lignes[indexCopie].trim(),
    dicte,
    copie,
  };
}
