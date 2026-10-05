/**
 * LES MATHS DITES À VOIX HAUTE, ÉCRITES EN MATHS — Camara, le 26/09/2026.
 *
 * Remontée d'un parent : Syan répond à l'oral « x est égal à moins cinq », et
 * la transcription l'écrit en toutes lettres. En mathématiques, on n'écrit pas
 * ça : le professeur attend « x = -5 », et l'enfant doit voir sa réponse
 * écrite comme il l'écrirait sur sa copie.
 *
 * POURQUOI ICI ET PAS DANS LA TRANSCRIPTION. Le service de transcription ne
 * reçoit qu'une liste de mots pour orienter son oreille : il ne sait pas
 * qu'on veut des symboles, et lui en souffler des exemples a déjà montré ses
 * limites — il lui arrive de recopier ce qu'on lui souffle. La réécriture est
 * donc faite ici, par des règles, sur le texte qui revient.
 *
 * PRUDENT PAR CONSTRUCTION. Seule une vraie EXPRESSION est réécrite : un
 * terme, un opérateur, un terme — au moins. Un nombre seul, un « moins » seul,
 * un « fois » seul restent des mots :
 *   « au moins cinq élèves »      → inchangé (pas d'expression)
 *   « je l'ai fait deux fois »    → inchangé (« fois » sans second terme)
 *   « un exercice »               → inchangé
 *   « x est égal moins cinq »     → « x = -5 »
 * Le reste de la phrase ne bouge pas : « Faire une double distributivité. x
 * est égal moins cinq. » devient « Faire une double distributivité. x = -5. »
 *
 * MATHÉMATIQUES SEULEMENT. En physique, « la masse est égale à deux kilos » se
 * dit en phrase, et le professeur attend une phrase.
 */

/** La matière où l'oral se réécrit en symboles. */
export const estMatiereMaths = (code) => /^MATH/i.test(code ?? '');

const UNITES = {
  zero: 0, 'zéro': 0, un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6,
  sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11, douze: 12, treize: 13,
  quatorze: 14, quinze: 15, seize: 16,
};

const DIZAINES = {
  vingt: 20, vingts: 20, trente: 30, quarante: 40, cinquante: 50, soixante: 60,
};

const estMotNombre = (m) => m in UNITES || m in DIZAINES
  || m === 'cent' || m === 'cents' || m === 'mille' || m === 'et';

// LES COMPARAISONS, avec et sans « est », avec et sans accents : « x est
// inférieur à 3 », « x inférieur à 3 », « x est égal a 3 » (transcription sans
// accent). Du plus long au plus court, pour que « est égal à » passe avant
// « égal », et « plus petit que » avant « plus ».
const COMPARAISONS = [
  ['inférieur ou égal à', '≤'], ['inferieur ou egal a', '≤'],
  ['supérieur ou égal à', '≥'], ['superieur ou egal a', '≥'],
  ['plus petit que', '<'], ['plus grand que', '>'],
  ['égal à', '='], ['égale à', '='], ['egal a', '='], ['egale a', '='],
  ['inférieur à', '<'], ['inferieur a', '<'],
  ['supérieur à', '>'], ['superieur a', '>'],
  ['égal', '='], ['égale', '='], ['egal', '='], ['egale', '='],
].flatMap(([mots, symbole]) => [
  [['est', ...mots.split(' ')], symbole],
  [mots.split(' '), symbole],
]).sort((a, b) => b[0].length - a[0].length);

const OPERATEURS = [
  ...COMPARAISONS,
  [['égalent'], '='],
  [['multiplié', 'par'], '×'], [['multiplie', 'par'], '×'],
  [['divisé', 'par'], '÷'], [['divise', 'par'], '÷'],
  [['plus'], '+'], [['moins'], '-'], [['fois'], '×'],
  [['='], '='], [['+'], '+'], [['-'], '-'], [['×'], '×'], [['*'], '×'], [['÷'], '÷'], [['/'], '÷'],
  [['<'], '<'], [['>'], '>'], [['≤'], '≤'], [['≥'], '≥'],
];

/** Une lettre seule, comme en algèbre. « a » et « y » compris : « il y a » ne forme pas d'expression. */
const estVariable = (m) => /^[a-z]$/.test(m);

/** Un nombre déjà écrit en chiffres par la transcription : « 5 », « -5 », « 2,5 ». */
const CHIFFRES = /^-?\d+(?:[.,]\d+)?$/;

/**
 * Découpe en mots, en gardant la ponctuation collée à part : « cinq. » donne
 * le mot « cinq » et la fin « . ». Une ponctuation forte (point, point
 * d'interrogation…) referme toute expression.
 */
function decouper(texte) {
  return texte.split(/(\s+)/).map((brut) => {
    if (/^\s+$/.test(brut) || brut === '') return { brut, espace: true };

    const m = /^([«"(]*)(.*?)([.,;:!?»")]*)$/.exec(brut);
    const coeur = m[2];

    // « -5 » ou « 2,5 » gardent leur virgule et leur signe : ce sont des nombres.
    return {
      brut, debut: m[1], coeur, fin: m[3], mot: coeur.toLowerCase(), espace: false,
    };
  });
}

/** Lit un nombre écrit en lettres à partir du mot `i` : `{ valeur, fin }` ou null. */
function lireNombreEnLettres(mots, i) {
  let total = 0;
  let courant = 0;
  let j = i;
  let lu = false;

  while (j < mots.length) {
    const brut = mots[j].mot;
    // « dix-sept », « quatre-vingt-dix » : les traits d'union séparent des mots.
    const parties = brut.split('-').filter(Boolean);
    if (parties.length === 0 || !parties.every(estMotNombre)) break;

    // « et » n'est un nombre que dans « vingt et un », « soixante et onze ».
    if (parties.length === 1 && parties[0] === 'et') {
      const suivant = mots[j + 1]?.mot;
      if (!lu || !(suivant === 'un' || suivant === 'une' || suivant === 'onze')) break;
      j += 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    for (const p of parties) {
      if (p === 'et') {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (p in UNITES) courant += UNITES[p];
      else if (p === 'vingt' || p === 'vingts') {
        // « quatre-vingt » : vingt MULTIPLIE ce qui précède.
        courant = courant > 0 && courant < 20 && courant % 10 !== 0 ? courant * 20 : courant + 20;
      } else if (p in DIZAINES) courant += DIZAINES[p];
      else if (p === 'cent' || p === 'cents') courant = (courant || 1) * 100;
      else if (p === 'mille') {
        total += (courant || 1) * 1000;
        courant = 0;
      }
    }

    lu = true;
    j += 1;

    // Une ponctuation après le mot referme le nombre.
    if (mots[j - 1].fin && !/^,$/.test(mots[j - 1].fin)) break;
  }

  if (!lu) return null;
  return { valeur: String(total + courant), fin: j };
}

/** Un nombre, en chiffres ou en lettres, avec « virgule » pour les décimaux. */
function lireNombre(mots, i) {
  if (i >= mots.length) return null;

  if (CHIFFRES.test(mots[i].coeur)) {
    return { valeur: mots[i].coeur.replace('.', ','), fin: i + 1 };
  }

  const entier = lireNombreEnLettres(mots, i);
  if (!entier) return null;

  // « deux virgule cinq » → 2,5
  if (mots[entier.fin]?.mot === 'virgule' && !mots[entier.fin - 1].fin) {
    const decimale = lireNombreEnLettres(mots, entier.fin + 1)
      ?? (CHIFFRES.test(mots[entier.fin + 1]?.coeur ?? '') ? { valeur: mots[entier.fin + 1].coeur, fin: entier.fin + 2 } : null);
    if (decimale) return { valeur: `${entier.valeur},${decimale.valeur}`, fin: decimale.fin };
  }

  return entier;
}

/** L'opérateur qui commence au mot `i`, ou null. */
function lireOperateur(mots, i) {
  for (const [suite, symbole] of OPERATEURS) {
    if (suite.every((m, k) => mots[i + k]?.mot === m)
      // Un opérateur ne traverse pas une ponctuation forte.
      && suite.slice(0, -1).every((_, k) => !mots[i + k].fin)) {
      return { symbole, fin: i + suite.length };
    }
  }
  return null;
}

/** Un terme : [moins] (nombre [lettre] | lettre) [au carré | au cube]. */
function lireTerme(mots, i) {
  let j = i;
  let signe = '';

  if (mots[j]?.mot === 'moins' && !mots[j].fin) {
    signe = '-';
    j += 1;
  }

  let texte = '';
  const nombre = lireNombre(mots, j);

  if (nombre) {
    texte = nombre.valeur;
    j = nombre.fin;

    // « trois x » → 3x
    if (!mots[j - 1].fin && mots[j] && estVariable(mots[j].mot)) {
      texte += mots[j].coeur;
      j += 1;
    }
  } else if (mots[j] && estVariable(mots[j].mot)) {
    texte = mots[j].coeur;
    j += 1;
  } else {
    return null;
  }

  // « x au carré » → x², « au cube » → x³
  if (!mots[j - 1].fin && mots[j]?.mot === 'au' && !mots[j].fin) {
    if (mots[j + 1]?.mot === 'carré' || mots[j + 1]?.mot === 'carre') {
      texte += '²';
      j += 2;
    } else if (mots[j + 1]?.mot === 'cube') {
      texte += '³';
      j += 2;
    }
  }

  // Un signe collé à un nombre déjà négatif ne se double pas.
  if (signe && texte.startsWith('-')) texte = texte.slice(1);
  else texte = signe + texte;

  return { texte, fin: j };
}

/**
 * Une expression complète à partir du mot `i` : terme (opérateur terme)+.
 * `{ texte, fin }`, ou null si ce n'en est pas une.
 */
function lireExpression(mots, i) {
  const premier = lireTerme(mots, i);
  if (!premier) return null;

  const morceaux = [premier.texte];
  let j = premier.fin;
  let operations = 0;

  while (j < mots.length && !mots[j - 1].fin) {
    const op = lireOperateur(mots, j);
    if (!op || mots[op.fin - 1].fin) break;

    const terme = lireTerme(mots, op.fin);
    if (!terme) break;

    morceaux.push(op.symbole, terme.texte);
    j = terme.fin;
    operations += 1;
  }

  return operations > 0 ? { texte: morceaux.join(' '), fin: j } : null;
}

/**
 * Le texte, avec chaque expression dite à voix haute réécrite en symboles.
 * Tout le reste est rendu tel quel, espaces et ponctuation compris.
 */
export function ecrireEnMaths(texte) {
  if (!texte) return texte;

  const elements = decouper(texte);
  const mots = elements.filter((e) => !e.espace);
  if (mots.length === 0) return texte;

  // Pour chaque mot, sa réécriture éventuelle : [debut, fin, texte].
  const remplacements = [];
  let i = 0;

  while (i < mots.length) {
    const expression = lireExpression(mots, i);
    if (expression) {
      remplacements.push([i, expression.fin, expression.texte]);
      i = expression.fin;
    } else {
      i += 1;
    }
  }

  if (remplacements.length === 0) return texte;

  // Recomposition : les mots hors expression gardent leur forme d'origine,
  // une expression reprend la ponctuation qui entourait ses bords.
  const sortie = [];
  let k = 0;
  let r = 0;

  while (k < mots.length) {
    const rem = remplacements[r];
    if (rem && rem[0] === k) {
      sortie.push(`${mots[rem[0]].debut}${rem[2]}${mots[rem[1] - 1].fin}`);
      k = rem[1];
      r += 1;
    } else {
      sortie.push(mots[k].brut);
      k += 1;
    }
  }

  return sortie.join(' ');
}
