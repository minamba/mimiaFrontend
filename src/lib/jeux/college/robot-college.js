/**
 * LE ROBOT DU COLLÈGE — l'algorithmique, de la 6e à la 3e.
 * Professeure : Nora (mathématiques).
 *
 * LE PROGRAMME EST ÉCRIT DANS LA QUESTION, une instruction par ligne, à la
 * façon des blocs de Scratch (« mettre x à 3 », « répéter 4 fois »,
 * « si n > 5 alors »…). Les blocs se ferment par « fin répéter », « fin si »,
 * « fin définir » : la structure reste lisible même si l'écran avale les
 * espaces du début de ligne.
 *
 * LA RÉPONSE N'EST JAMAIS RECOPIÉE : le programme est construit comme un
 * petit arbre, écrit en texte, puis EXÉCUTÉ ici (`executer`). Les pièges sont
 * les mêmes programmes exécutés de travers (une boucle d'un tour de moins, un
 * bloc rejoué une seule fois, les deux branches d'un « si »…).
 *
 * PAR CLASSE (trois sortes de manches, 3 + 3 + 2, mélangées) :
 *   6e — le déplacement sur un quadrillage, la boîte mystère (le nombre
 *        inconnu, en défaisant les étapes) et les suites de motifs ;
 *   5e — boucles et variables : une variable augmentée, une variable
 *        multipliée, le lutin qui avance de x et de y ;
 *   4e — « si… sinon », deux boucles imbriquées, une condition dans une boucle ;
 *   3e — un bloc personnalisé appelé deux fois, un bloc appelé dans une
 *        boucle, « répéter jusqu'à ce que ».
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'robot-college', titre: 'Le robot', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le robot',
    accroche: 'Suis le programme, trouve le nombre caché.',
    competences: ['MATH_6E_ALGO_DEPLACEMENT', 'MATH_6E_ALG_INCONNUE', 'MATH_6E_ALG_MOTIFS'],
  },
  CINQUIEME: {
    titre: 'Le robot et ses boucles',
    accroche: 'Boucles et variables, comme dans Scratch.',
    competences: ['MATH_5E_ALGO_BOUCLE'],
  },
  QUATRIEME: {
    titre: 'Le robot qui choisit',
    accroche: 'Conditions et boucles imbriquées.',
    competences: ['MATH_4E_ALGO_CONDITION'],
  },
  TROISIEME: {
    titre: 'Le robot et ses blocs',
    accroche: 'Variables, boucles et blocs personnalisés.',
    competences: ['MATH_3E_ALGO_FONCTION'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const rel = (n) => (n < 0 ? `−${-n}` : `${n}`);
const pt = (x, y) => `(${rel(x)} ; ${rel(y)})`;

function faire(melanger, consigne, question, bonne, paires, voisin, extra = {}) {
  const liste = troisChoix(bonne, paires.map(([k]) => k), voisin);
  const pieges = {};
  paires.forEach(([k, p]) => {
    if (k !== bonne && liste.includes(k) && !(k in pieges)) pieges[k] = p;
  });
  return {
    consigne, question, choix: melanger(liste).map((c) => ({ cle: c, libelle: c })), bonne, pieges, ...extra,
  };
}

/* ------------------------------------------- le petit langage et sa machine */

/*
 * Expression : un nombre, un nom de variable, ou [op, gauche, droite] avec op
 * parmi '+', '−', '×'. Instruction :
 *   ['mettre', v, e]          « mettre v à e »
 *   ['ajouter', e, v]         « ajouter e à v »
 *   ['repeter', n, corps]     « répéter n fois » … « fin répéter »
 *   ['si', c, alors, sinon]   « si c alors » … (« sinon » …) « fin si »
 *   ['jusqua', c, corps]      « répéter jusqu'à ce que c » … « fin répéter »
 *   ['appel', nom, e]         « nom (e) »
 *   ['bouge', sens, n]        « monter de n », « aller à gauche de n »…
 *   ['aller', x, y]           « aller à x : … y : … »
 * Condition : ['>', e, e], ['<', e, e], ['pair', v], ['impair', v].
 */

function texte(e) {
  if (typeof e === 'number') return rel(e);
  if (typeof e === 'string') return e;
  const [op, a, b] = e;
  const g = op === '×' && Array.isArray(a) && a[0] !== '×' ? `(${texte(a)})` : texte(a);
  const d = Array.isArray(b) && (op !== '+' || b[0] !== '×') ? `(${texte(b)})` : texte(b);
  return `${g} ${op} ${d}`;
}

function valeur(e, env) {
  if (typeof e === 'number') return e;
  if (typeof e === 'string') return env[e];
  const [op, a, b] = e;
  const x = valeur(a, env);
  const y = valeur(b, env);
  if (op === '+') return x + y;
  if (op === '−') return x - y;
  return x * y;
}

function condTexte(c) {
  if (c[0] === 'pair') return `${c[1]} est pair`;
  if (c[0] === 'impair') return `${c[1]} est impair`;
  return `${texte(c[1])} ${c[0]} ${texte(c[2])}`;
}

function vrai(c, env) {
  if (c[0] === 'pair') return env[c[1]] % 2 === 0;
  if (c[0] === 'impair') return Math.abs(env[c[1]] % 2) === 1;
  const a = valeur(c[1], env);
  const b = valeur(c[2], env);
  return c[0] === '>' ? a > b : a < b;
}

const SENS = {
  haut: ['monter de', 0, 1], bas: ['descendre de', 0, -1], droite: ['aller à droite de', 1, 0], gauche: ['aller à gauche de', -1, 0],
};
const RETRAIT = '    ';

function lignes(corps, n = 0) {
  const r = RETRAIT.repeat(n);
  return corps.flatMap((i) => {
    switch (i[0]) {
      case 'mettre': return [`${r}mettre ${i[1]} à ${texte(i[2])}`];
      case 'ajouter': return [`${r}ajouter ${texte(i[1])} à ${i[2]}`];
      case 'repeter': return [`${r}répéter ${i[1]} fois`, ...lignes(i[2], n + 1), `${r}fin répéter`];
      case 'jusqua': return [`${r}répéter jusqu'à ce que ${condTexte(i[1])}`, ...lignes(i[2], n + 1), `${r}fin répéter`];
      case 'si': return [
        `${r}si ${condTexte(i[1])} alors`, ...lignes(i[2], n + 1),
        ...(i[3] ? [`${r}sinon`, ...lignes(i[3], n + 1)] : []), `${r}fin si`,
      ];
      case 'appel': return [`${r}${i[1]} (${texte(i[2])})`];
      case 'bouge': return [`${r}${SENS[i[1]][0]} ${i[2]}`];
      default: return [`${r}aller à x : ${rel(i[1])} y : ${rel(i[2])}`];
    }
  });
}

/** Le programme écrit : les blocs définis d'abord, puis le script. */
export function ecrire(programme) {
  const defs = (programme.defs ?? []).flatMap((d) => [`définir ${d.nom} (${d.param})`, ...lignes(d.corps, 1), 'fin définir']);
  return [...defs, ...lignes(programme.corps)].join('\n');
}

/** Exécute le programme et rend ses variables à la fin. */
export function executer(programme, depart = {}) {
  const env = { ...depart };
  const defs = Object.fromEntries((programme.defs ?? []).map((d) => [d.nom, d]));
  let garde = 0;
  const run = (corps) => corps.forEach((i) => {
    garde += 1;
    if (garde > 10000) throw new Error('programme sans fin');
    if (i[0] === 'mettre') env[i[1]] = valeur(i[2], env);
    else if (i[0] === 'ajouter') env[i[2]] += valeur(i[1], env);
    else if (i[0] === 'repeter') for (let k = 0; k < i[1]; k += 1) run(i[2]);
    else if (i[0] === 'jusqua') while (!vrai(i[1], env)) run(i[2]);
    else if (i[0] === 'si') { if (vrai(i[1], env)) run(i[2]); else if (i[3]) run(i[3]); } else if (i[0] === 'appel') {
      const d = defs[i[1]];
      env[d.param] = valeur(i[2], env);
      run(d.corps);
    } else if (i[0] === 'bouge') {
      env.x += SENS[i[1]][1] * i[2];
      env.y += SENS[i[1]][2] * i[2];
    } else {
      [, env.x, env.y] = i;
    }
  });
  run(programme.corps);
  return env;
}

/* ------------------------------------------------------------------ 6e */

function deplacement(o) {
  const { entre, au, melanger } = o;
  for (;;) {
    const x0 = entre(2, 6);
    const y0 = entre(2, 6);
    const n = entre(3, 4);
    const pas = Array.from({ length: n }, () => [au(['haut', 'bas', 'droite', 'gauche']), entre(1, 4)]);
    const horiz = pas.filter(([s]) => s === 'droite' || s === 'gauche');
    const vert = pas.filter(([s]) => s === 'haut' || s === 'bas');
    const recule = pas.some(([s]) => s === 'bas' || s === 'gauche');
    if (horiz.length && vert.length && recule) {
      // Toujours dans le quadrillage, à chaque pas.
      let x = x0;
      let y = y0;
      let dedans = true;
      pas.forEach(([s, k]) => {
        x += SENS[s][1] * k;
        y += SENS[s][2] * k;
        if (x < 0 || y < 0) dedans = false;
      });
      if (dedans) {
        const programme = { corps: pas.map(([s, k]) => ['bouge', s, k]) };
        const fin = executer(programme, { x: x0, y: y0 });
        const somme = (liste) => liste.reduce((t, [s, k]) => t + (SENS[s][1] + SENS[s][2]) * k, 0);
        const absolue = (liste) => liste.reduce((t, [, k]) => t + k, 0);
        return faire(melanger, 'deplacement', `Le lutin part de ${pt(x0, y0)}.\n${ecrire(programme)}\nOù arrive-t-il ?`, pt(fin.x, fin.y), [
          [pt(x0 + somme(vert), y0 + somme(horiz)), 'deplacement-axes'],
          [pt(x0 + absolue(horiz), y0 + absolue(vert)), 'deplacement-sens'],
        ], (i) => pt(fin.x + i, fin.y), { programme, depart: { x: x0, y: y0 } });
      }
    }
  }
}

function inconnue(o) {
  const { entre, au, melanger } = o;
  const a = entre(2, 5);
  const b = a * entre(1, 3);
  const ajoute = au([true, false]);
  const n = entre(b + 1, b + 12);
  const r = ajoute ? n * a + b : n * a - b;
  const question = ajoute
    ? `Je pense à un nombre. Je le multiplie par ${a}, puis j'ajoute ${b} : j'obtiens ${r}.\nQuel est ce nombre ?`
    : `Je pense à un nombre. Je le multiplie par ${a}, puis je retire ${b} : j'obtiens ${r}.\nQuel est ce nombre ?`;
  const ordre = ajoute ? r / a - b : r / a + b; // b multiple de a : un entier
  const oubli = ajoute ? r - b : r + b;
  return faire(melanger, 'inconnue', question, rel(n), [
    [rel(ordre), 'inconnue-ordre'],
    [rel(oubli), 'inconnue-oubli'],
  ], (i) => rel(n + i), { mystere: { a, b, ajoute, r } });
}

const OBJETS = ['allumettes', 'carreaux', 'jetons', 'cubes'];

function motifs(o) {
  const { entre, au, melanger } = o;
  const d = entre(2, 5);
  const c = entre(1, 4);
  const n = entre(8, 20);
  const u = (k) => c + k * d;
  const quoi = au(OBJETS);
  return faire(melanger, 'motifs',
    `Motif 1 : ${u(1)} ${quoi}\nMotif 2 : ${u(2)} ${quoi}\nMotif 3 : ${u(3)} ${quoi}\nMotif ${n} : combien ?`, rel(u(n)), [
      [rel(n * u(1)), 'motifs-proportion'],
      [rel(n * d), 'motifs-depart'],
    ], (i) => rel(u(n) + i * d));
}

/* ------------------------------------------------------------------ 5e */

function boucleAjout(o) {
  const { entre, melanger } = o;
  const x0 = entre(1, 9);
  const n = entre(3, 7);
  const p = entre(2, 9);
  const programme = { corps: [['mettre', 'x', x0], ['repeter', n, [['ajouter', p, 'x']]]] };
  const { x } = executer(programme);
  return faire(melanger, 'boucle-variable', `${ecrire(programme)}\nQue vaut x à la fin ?`, rel(x), [
    [rel(x0 + (n - 1) * p), 'boucle-tours'],
    [rel(n * p), 'variable-depart'],
  ], (i) => rel(x + i * p), { programme });
}

function boucleProduit(o) {
  const { entre, melanger } = o;
  const x0 = entre(1, 3);
  const n = entre(3, 4);
  const m = entre(2, 3);
  const programme = { corps: [['mettre', 'x', x0], ['repeter', n, [['mettre', 'x', ['×', 'x', m]]]]] };
  const { x } = executer(programme);
  return faire(melanger, 'boucle-variable', `${ecrire(programme)}\nQue vaut x à la fin ?`, rel(x), [
    [rel(x0 * m * n), 'boucle-multiplier'],
    [rel(x / m), 'boucle-tours'],
  ], (i) => rel(x * m ** i), { programme });
}

function boucleLutin(o) {
  const { entre, melanger } = o;
  const X = 10 * entre(-10, 10);
  const Y = 10 * entre(-10, 10);
  const n = entre(3, 6);
  const p = 10 * entre(1, 5) * (entre(0, 1) ? 1 : -1);
  const q = 10 * entre(1, 5) * (entre(0, 1) ? 1 : -1);
  const programme = { corps: [['aller', X, Y], ['repeter', n, [['ajouter', p, 'x'], ['ajouter', q, 'y']]]] };
  const fin = executer(programme);
  return faire(melanger, 'boucle-lutin', `${ecrire(programme)}\nOù arrive le lutin ?`, pt(fin.x, fin.y), [
    [pt(fin.x, Y + q), 'boucle-bloc'],
    [pt(fin.x - p, fin.y - q), 'boucle-tours'],
  ], (i) => pt(fin.x + 10 * i, fin.y), { programme });
}

/* ------------------------------------------------------------------ 4e */

function condition(o) {
  const { entre, au, melanger } = o;
  const t = entre(5, 15);
  const v = t + entre(-2, 2);
  const op = au(['>', '<']);
  const m = entre(2, 4);
  const p = entre(3, 9);
  const alors = [['mettre', 'n', ['×', 'n', m]]];
  const sinon = [['ajouter', p, 'n']];
  const programme = { corps: [['mettre', 'n', v], ['si', [op, 'n', t], alors, sinon]] };
  const { n } = executer(programme);
  const pris = vrai([op, 'n', t], { n: v });
  const autre = executer({ corps: [['mettre', 'n', v], ...(pris ? sinon : alors)] }).n;
  const deux = v * m + p;
  return faire(melanger, 'condition', `${ecrire(programme)}\nQue vaut n à la fin ?`, rel(n), [
    [rel(autre), 'condition-branche'],
    [rel(deux), 'condition-les-deux'],
  ], (i) => rel(n + i), { programme });
}

function imbriquees(o) {
  const { entre, melanger } = o;
  const a = entre(2, 5);
  const b = a === 2 ? entre(3, 5) : entre(2, 5);
  const p = entre(2, 5);
  const programme = { corps: [['mettre', 's', 0], ['repeter', a, [['repeter', b, [['ajouter', p, 's']]]]]] };
  const { s } = executer(programme);
  return faire(melanger, 'imbriquees', `${ecrire(programme)}\nQue vaut s à la fin ?`, rel(s), [
    [rel((a + b) * p), 'boucles-imbriquees'],
    [rel(b * p), 'boucle-exterieure'],
  ], (i) => rel(s + i * p), { programme });
}

function boucleCondition(o) {
  const { entre, au, melanger } = o;
  const k = entre(5, 9);
  const parite = au(['pair', 'impair']);
  const programme = {
    corps: [['mettre', 's', 0], ['mettre', 'n', 1], ['repeter', k, [['si', [parite, 'n'], [['ajouter', 'n', 's']]], ['ajouter', 1, 'n']]]],
  };
  const { s } = executer(programme);
  const tous = (k * (k + 1)) / 2;
  return faire(melanger, 'boucle-condition', `${ecrire(programme)}\nQue vaut s à la fin ?`, rel(s), [
    [rel(tous), 'condition-dans-boucle'],
    [rel(tous - s), 'condition-parite'],
  ], (i) => rel(s + i), { programme });
}

/* ------------------------------------------------------------------ 3e */

function blocDeuxFois(o) {
  const { entre, au, melanger } = o;
  const p = entre(2, 5);
  const q = entre(1, 6);
  const op = au(['+', '−']);
  const x0 = entre(1, 5);
  const nom = au(['calcul', 'machine', 'transforme']);
  const programme = {
    defs: [{ nom, param: 'a', corps: [['mettre', 'r', [op, ['×', 'a', p], q]]] }],
    corps: [['mettre', 'x', x0], ['appel', nom, 'x'], ['appel', nom, 'r']],
  };
  const { r } = executer(programme);
  const une = executer({ ...programme, corps: programme.corps.slice(0, 2) }).r;
  const g = (a) => a * (op === '+' ? p + q : p - q);
  return faire(melanger, 'bloc', `${ecrire(programme)}\nQue vaut r à la fin ?`, rel(r), [
    [rel(une), 'bloc-deux-appels'],
    [rel(g(g(x0))), 'bloc-priorite'],
  ], (i) => rel(r + i), { programme });
}

function blocBoucle(o) {
  const { entre, au, melanger } = o;
  const m = entre(3, 5);
  const k0 = entre(1, 3);
  const c = entre(2, 5);
  const corpsBloc = au([['×', 'n', 'n'], ['×', 'n', c], ['+', 'n', c]]);
  const programme = {
    defs: [{ nom: 'ajoute', param: 'n', corps: [['ajouter', corpsBloc, 's']] }],
    corps: [['mettre', 's', 0], ['mettre', 'k', k0], ['repeter', m, [['appel', 'ajoute', 'k'], ['ajouter', 1, 'k']]]],
  };
  const { s } = executer(programme);
  const fige = m * valeur(corpsBloc, { n: k0 });
  let simples = 0;
  for (let i = 0; i < m; i += 1) simples += k0 + i;
  return faire(melanger, 'bloc-boucle', `${ecrire(programme)}\nQue vaut s à la fin ?`, rel(s), [
    [rel(fige), 'variable-qui-change'],
    [rel(simples), 'bloc-definition'],
  ], (i) => rel(s + i), { programme });
}

function jusqua(o) {
  const { entre, au, melanger } = o;
  const X = entre(60, 120);
  const d = entre(7, 15);
  const L = entre(10, 30);
  const programme = {
    corps: [['mettre', 'x', X], ['mettre', 'n', 0], ['jusqua', ['<', 'x', L], [['mettre', 'x', ['−', 'x', d]], ['ajouter', 1, 'n']]]],
  };
  const fin = executer(programme);
  if (au(['n', 'x']) === 'n') {
    return faire(melanger, 'jusqua', `${ecrire(programme)}\nQue vaut n à la fin ?`, rel(fin.n), [
      [rel(fin.n - 1), 'jusqua-condition'],
      [rel(fin.n + 1), 'jusqua-condition'],
    ], (i) => rel(fin.n + 1 + i), { programme });
  }
  return faire(melanger, 'jusqua', `${ecrire(programme)}\nQue vaut x à la fin ?`, rel(fin.x), [
    [rel(fin.x + d), 'jusqua-condition'],
    [rel(fin.x - d), 'jusqua-condition'],
  ], (i) => rel(fin.x - d - i), { programme });
}

/* ------------------------------------------------------------- la série */

const fois = (n, f, o) => Array.from({ length: n }, () => f(o));

const BANQUES = {
  SIXIEME: (o) => [...fois(3, deplacement, o), ...fois(3, inconnue, o), ...fois(2, motifs, o)],
  CINQUIEME: (o) => [...fois(3, boucleAjout, o), ...fois(3, boucleLutin, o), ...fois(2, boucleProduit, o)],
  QUATRIEME: (o) => [...fois(3, condition, o), ...fois(3, imbriquees, o), ...fois(2, boucleCondition, o)],
  TROISIEME: (o) => [...fois(3, blocDeuxFois, o), ...fois(3, blocBoucle, o), ...fois(2, jusqua, o)],
};

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const o = outils(graine);
  const banque = BANQUES[niveau] ?? BANQUES.SIXIEME;
  return o.melanger(banque(o));
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // 6e
  deplacement: 'Suis le programme pas à pas : où arrive le lutin ?',
  'deplacement-axes': 'Monter et descendre changent la seconde coordonnée ; aller à droite ou à gauche change la première.',
  'deplacement-sens': 'Descendre et aller à gauche font diminuer la coordonnée : on retire, on n’ajoute pas.',
  'deplacement-regle': 'Note la position après chaque instruction : droite et gauche pour la première coordonnée, haut et bas pour la seconde.',
  inconnue: 'Retrouve le nombre de départ.',
  'inconnue-ordre': 'Pour remonter au départ, on défait les étapes en partant de la dernière : d’abord l’addition ou la soustraction, ensuite la multiplication.',
  'inconnue-oubli': 'Il reste une étape à défaire : la multiplication se défait par une division.',
  'inconnue-regle': 'Défais chaque étape à l’envers, de la dernière à la première, puis vérifie en refaisant le calcul.',
  motifs: 'Combien en faut-il pour ce motif ?',
  'motifs-proportion': 'Le nombre ne double pas quand le numéro du motif double : regarde de combien il augmente à chaque étape, et ce qu’il y a au départ.',
  'motifs-depart': 'Tu as bien l’augmentation à chaque étape, mais il faut aussi compter ce qu’il y a en plus dès le début.',
  'motifs-regle': 'Trouve de combien on augmente d’un motif au suivant, puis compte les étapes depuis le premier motif.',
  // 5e
  'boucle-variable': 'Que vaut la variable à la fin du programme ?',
  'boucle-tours': 'Compte bien les tours : la boucle rejoue ce qu’elle contient autant de fois qu’annoncé, ni une fois de moins, ni une de plus.',
  'variable-depart': 'La variable ne part pas de zéro : n’oublie pas sa valeur de départ.',
  'boucle-multiplier': 'À chaque tour, on repart de la nouvelle valeur : la variable est multipliée, puis encore multipliée.',
  'boucle-variable-regle': 'Écris la valeur de la variable après chaque tour de boucle.',
  'boucle-lutin': 'Où arrive le lutin à la fin du programme ?',
  'boucle-bloc': 'Toutes les instructions placées dans la boucle sont répétées, pas seulement la première.',
  'boucle-lutin-regle': 'Écris la position du lutin après chaque tour : x et y changent tous les deux à chaque tour.',
  // 4e
  condition: 'Teste la condition : que vaut la variable à la fin ?',
  'condition-branche': 'Teste la condition avec la valeur de la variable : on ne fait que le bloc qui correspond. Attention, plus grand et plus petit sont stricts : en cas d’égalité, la condition est fausse.',
  'condition-les-deux': 'Avec « si… sinon », un seul des deux blocs s’exécute, jamais les deux.',
  'condition-regle': 'Remplace la variable par sa valeur dans la condition, décide si elle est vraie ou fausse, puis fais seulement le bon bloc.',
  imbriquees: 'Deux boucles l’une dans l’autre : que vaut la variable à la fin ?',
  'boucles-imbriquees': 'Une boucle dans une boucle : les nombres de tours se multiplient, ils ne s’ajoutent pas.',
  'boucle-exterieure': 'La boucle intérieure est rejouée en entier à chaque tour de la boucle extérieure.',
  'imbriquees-regle': 'Compte les tours de la boucle intérieure, multiplie par les tours de la boucle extérieure, puis par ce qu’on ajoute à chaque fois.',
  'boucle-condition': 'Une condition dans une boucle : que vaut la variable à la fin ?',
  'condition-dans-boucle': 'La condition se teste à chaque tour : quand elle est fausse, on n’ajoute rien à ce tour-là.',
  'condition-parite': 'Relis la condition : un nombre pair se divise par deux sans reste, un nombre impair, non.',
  'boucle-condition-regle': 'Fais un tableau : à chaque tour, la valeur de n, la condition vraie ou fausse, et la valeur de s.',
  // 3e
  bloc: 'Suis les appels du bloc : que vaut la variable à la fin ?',
  'bloc-deux-appels': 'Le bloc est appelé deux fois : le second appel repart du résultat du premier.',
  'bloc-priorite': 'Dans le bloc, la multiplication passe avant l’addition et la soustraction.',
  'bloc-regle': 'À chaque appel, remplace le paramètre par la valeur donnée, calcule en respectant les priorités, et garde le résultat pour la suite.',
  'bloc-boucle': 'Le bloc est appelé dans une boucle : que vaut la variable à la fin ?',
  'variable-qui-change': 'La valeur donnée au bloc change à chaque tour, puisque la boucle l’augmente de un.',
  'bloc-definition': 'Relis ce que fait le bloc avec la valeur qu’on lui donne : c’est ce résultat qu’on ajoute à chaque appel.',
  'bloc-boucle-regle': 'Fais un tableau : à chaque tour, la valeur donnée au bloc, ce qu’il ajoute, et le total.',
  jusqua: 'Répéter jusqu’à ce que : que vaut la variable à la fin ?',
  'jusqua-condition': 'La condition se teste avant chaque tour, et la boucle s’arrête dès qu’elle est vraie : compte les tours un par un.',
  'jusqua-regle': 'Fais un tableau des valeurs tour après tour, et arrête-toi dès que la condition devient vraie.',
};
