/**
 * L'ESCAPE GAME DE MATHS DU LYCÉE — Nora, de la 2de à la terminale. Camara, le
 * 07/10/2026 : « en 1re, une révision de l'épreuve anticipée ; en terminale,
 * une révision du bac ».
 *
 * UNE HISTOIRE PAR CLASSE, SIX CADENAS, L'ORDRE DU RÉCIT. Chaque étape est un
 * calcul de l'année ; la PIÈCE qu'elle donne est le chiffre des unités de la
 * réponse (la réponse elle-même si c'est un chiffre). Les nombres sont tirés
 * au hasard, les réponses CALCULÉES ici, jamais recopiées ; les pièges sont
 * les vraies erreurs des lycéens, chacune nommée :
 *   - 2de, le serveur piraté : identité remarquable (signe et double produit),
 *     signe d'un produit et bornes, coefficient directeur ou ordonnée à
 *     l'origine, distance dans un repère, probabilité d'une réunion, boucle
 *     Python (range s'arrête AVANT la borne) ;
 *   - 1re, le module spatial (épreuve anticipée) : un automatisme sur les
 *     pourcentages (taux successifs, proportion de proportion, taux
 *     réciproque), Δ ou une racine, nombre dérivé (dont (uv)′ ≠ u′v′), terme
 *     d'une suite (le rang de départ), probabilité conditionnelle (P_A(B)
 *     contre P_B(A)), règles de l'exponentielle ;
 *   - terminale, le message chiffré (bac) : limite d'un quotient en +∞,
 *     logarithme (ln(a + b) ≠ ln a + ln b), intégrale par une primitive, loi
 *     binomiale, dénombrement (ordre et répétitions), orthogonalité ou plan
 *     dans l'espace.
 *
 * Ce qui se DIT (PHRASES) est fixe, sans aucun nombre ; ce qui varie est dans
 * `question` et dans les libellés, affichés.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'escape-maths-lycee', titre: 'Escape game de maths', matiereCode: 'MATHS' };

export const ESCAPE = true;

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Le serveur piraté',
    accroche: 'Six pare-feu verrouillent le serveur.',
    intro: 'Un virus a verrouillé le serveur du lycée derrière six pare-feu, et plus personne ne peut se connecter. Chaque calcul juste te donne un chiffre du code qui le libère.',
    fin: 'Le dernier pare-feu tombe : le serveur redémarre, et tout le lycée peut se reconnecter !',
    competences: [
      'MATH_2DE_CALC_LITTERAL', 'MATH_2DE_SIGNE', 'MATH_2DE_DROITES',
      'MATH_2DE_REPERAGE', 'MATH_2DE_PROBA_EVENEMENTS', 'MATH_2DE_ALGO_PYTHON',
    ],
  },
  PREMIERE: {
    titre: 'Le module spatial',
    accroche: 'Six exercices de l’épreuve anticipée.',
    intro: 'À bord de la station orbitale, l’ordinateur a verrouillé le module de commande derrière six cadenas. Chacun est un exercice de l’épreuve anticipée : réussis-les pour reprendre les commandes.',
    fin: 'Le dernier cadenas s’ouvre : les moteurs se rallument, la station reprend sa route, et l’épreuve anticipée n’a plus de secret pour toi !',
    competences: [
      'MATH_1RE_AUTO_TAUX_SUCCESSIFS', 'MATH_1RE_AUTO_TAUX_RECIPROQUE', 'MATH_1RE_TRINOME_RACINES',
      'MATH_1RE_DERIV_FONCTION', 'MATH_1RE_SUITES_ARITH', 'MATH_1RE_SUITES_GEO',
      'MATH_1RE_PROBA_COND', 'MATH_1RE_AUTO_PROBA_NOTATIONS', 'MATH_1RE_EXP',
    ],
  },
  TERMINALE: {
    titre: 'Le message chiffré',
    accroche: 'Six clés pour déchiffrer le message.',
    intro: 'Ton équipe de cryptographes a intercepté un message chiffré, protégé par six clés. Chaque clé est un exercice du bac : trouve-les toutes pour lire le message en clair.',
    fin: 'La sixième clé tourne : le message s’affiche en clair, et le bac n’a plus de secret pour toi !',
    competences: [
      'MATH_TLE_FONC_LIMITE', 'MATH_TLE_LOG', 'MATH_TLE_PRIMITIVES', 'MATH_TLE_INTEGRALE',
      'MATH_TLE_BINOMIALE', 'MATH_TLE_DENOMBR_KUPLETS', 'MATH_TLE_DENOMBR_PERMUTATIONS',
      'MATH_TLE_DENOMBR_COMBINAISONS', 'MATH_TLE_ORTHOGONALITE', 'MATH_TLE_PLAN_CARTESIEN',
    ],
  },
};

export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 6;

/** Un entier écrit à la française : le signe moins typographique. */
export const ecrire = (n) => (n < 0 ? `−${-n}` : String(n));

/** La pièce d'une réponse : son chiffre des unités. */
export const pieceDe = (n) => String(Math.abs(n) % 10);

const INDICES = '₀₁₂₃₄₅₆₇₈₉';
const EXPOSANTS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const indice = (n) => String(n).split('').map((c) => INDICES[Number(c)]).join('');
const exposant = (n) => (n < 0 ? '⁻' : '') + String(Math.abs(n)).split('').map((c) => EXPOSANTS[Number(c)]).join('');

/**
 * Une somme de termes écrite à la française : [[2, 'x²'], [−1, 'x'], [3, '']]
 * donne « 2x² − x + 3 ». Les termes nuls disparaissent, le coefficient 1 aussi.
 */
function polynome(termes) {
  let s = '';
  termes.filter(([c]) => c !== 0).forEach(([c, v], i) => {
    const corps = v && Math.abs(c) === 1 ? v : `${Math.abs(c)}${v}`;
    if (i === 0) s = (c < 0 ? '−' : '') + corps;
    else s += ` ${c < 0 ? '−' : '+'} ${corps}`;
  });
  return s;
}

/** Le facteur (x − r) : « (x − 3) », « (x + 2) ». */
const facteur = (r) => (r > 0 ? `(x − ${r})` : `(x + ${-r})`);

/** Un nombre non nul entre deux bornes. */
const nonNul = (entre, a, b) => {
  let n = 0;
  while (n === 0) n = entre(a, b);
  return n;
};

const factorielle = (n) => (n <= 1 ? 1 : n * factorielle(n - 1));
/** Les arrangements : k éléments distincts, dans l'ordre, parmi n. */
const arrangements = (n, k) => factorielle(n) / factorielle(n - k);
/** Les combinaisons : k éléments parmi n, sans ordre. */
const combinaisons = (n, k) => arrangements(n, k) / factorielle(k);

/** Les triplets de Pythagore utilisés : [écart, écart, distance]. */
const TRIPLETS = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];

const PREFIXE = { SECONDE: '2de', PREMIERE: '1re', TERMINALE: 'tle' };

/*
 * LES ÉTAPES. Chacune rend { question, bonne, pieges: [[valeur, clé]], unite }.
 * Un piège qui tombe sur la bonne réponse, ou qui n'est pas entier, est écarté ;
 * `positif` écarte aussi les pièges nuls ou négatifs, `max` ceux qui dépassent.
 */
const ETAPES = {
  SECONDE: [
    {
      recit: 'Le premier pare-feu affiche une identité remarquable à moitié effacée. Retrouve le coefficient manquant.',
      tirer: ({ entre, au }) => {
        const k = au([1, 2, 3]);
        const a = entre(2, 9);
        const s = au([-1, 1]);
        const carre = `(${k === 1 ? '' : k}x ${s < 0 ? '−' : '+'} ${a})²`;
        const b = 2 * k * s * a;
        if (au([true, true, false])) {
          return {
            question: `${carre} = ${polynome([[k * k, 'x²']])} + bx + ${a * a}. b = ?`,
            bonne: b,
            pieges: [[-b, 'identite-signe'], [k * s * a, 'identite-double-produit']],
          };
        }
        return {
          question: `${carre} = ${polynome([[k * k, 'x²'], [b, 'x']])} + c. c = ?`,
          bonne: a * a,
          pieges: [[-a * a, 'identite-carre-signe'], [2 * a, 'identite-carre-double']],
        };
      },
    },
    {
      recit: 'Le deuxième pare-feu ne laisse passer que les entiers qui rendent un produit négatif. Combien sont-ils ?',
      tirer: ({ entre, au }) => {
        let r1; let r2;
        do {
          r1 = entre(-8, 6);
          r2 = entre(r1 + 3, 9);
        } while (r1 === 0 || r2 === 0);
        const [f1, f2] = au([true, false]) ? [r1, r2] : [r2, r1];
        const large = au([true, false]);
        const n = r2 - r1;
        return {
          question: `${facteur(f1)}${facteur(f2)} ${large ? '≤' : '<'} 0 : combien d’entiers x sont solutions ?`,
          bonne: large ? n + 1 : n - 1,
          pieges: large
            ? [[n - 1, 'signe-bornes-incluses'], [n, 'signe-compter']]
            : [[n + 1, 'signe-bornes-exclues'], [n, 'signe-compter']],
          positif: true,
        };
      },
    },
    {
      recit: 'Dans le journal du virus, une droite relie deux de ses attaques. Le troisième pare-feu demande ce qui la caractérise.',
      tirer: ({ entre, au }) => {
        const m = au([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
        if (au([true, false])) {
          const xa = entre(-6, 6);
          const ya = entre(-9, 9);
          const dx = au([-4, -3, -2, 2, 3, 4]);
          return {
            question: `Droite (AB) : A(${ecrire(xa)} ; ${ecrire(ya)}) et B(${ecrire(xa + dx)} ; ${ecrire(ya + m * dx)}). Coefficient directeur ?`,
            bonne: m,
            pieges: [[-m, 'coeff-ordre'], [m * dx, 'coeff-diviser']],
          };
        }
        const x = nonNul(entre, -5, 5);
        const y = entre(-9, 9);
        return {
          question: `La droite y = ${polynome([[m, 'x']])} + p passe par A(${ecrire(x)} ; ${ecrire(y)}). p = ?`,
          bonne: y - m * x,
          pieges: [[y + m * x, 'ordonnee-signe']],
        };
      },
    },
    {
      recit: 'Deux serveurs relais sont placés sur le plan de la salle, un repère orthonormé. Le quatrième pare-feu veut la longueur du câble qui les relie.',
      tirer: ({ entre, au }) => {
        const [p, q, c] = au(TRIPLETS);
        const [dx, dy] = au([true, false]) ? [p, q] : [q, p];
        const xa = entre(-5, 5);
        const ya = entre(-5, 5);
        const xb = xa + au([-1, 1]) * dx;
        const yb = ya + au([-1, 1]) * dy;
        return {
          question: `A(${ecrire(xa)} ; ${ecrire(ya)}) et B(${ecrire(xb)} ; ${ecrire(yb)}) dans un repère orthonormé. AB = ?`,
          bonne: c,
          pieges: [[dx + dy, 'distance-somme'], [dx * dx + dy * dy, 'distance-racine']],
        };
      },
    },
    {
      recit: 'Le virus attaque par deux portes, A et B. Le cinquième pare-feu veut la probabilité qu’au moins l’une des deux cède.',
      tirer: ({ entre }) => {
        let a; let b; let c;
        do {
          a = 5 * entre(4, 14);
          b = 5 * entre(4, 14);
          c = 5 * entre(1, 8);
        } while (c >= Math.min(a, b) || a + b - c > 95);
        return {
          question: `P(A) = ${a} %, P(B) = ${b} % et P(A ∩ B) = ${c} %. P(A ∪ B), en % ?`,
          bonne: a + b - c,
          pieges: [[a + b, 'union-intersection'], [a + b - 2 * c, 'union-exclusif']],
          unite: ' %',
          positif: true,
          max: 100,
        };
      },
    },
    {
      recit: 'Le dernier pare-feu est un programme Python. Le code est le nombre qu’il affiche.',
      tirer: ({ entre, au }) => {
        if (au([true, true, false])) {
          const debut = au([0, 0, 1, 2]);
          const fin = entre(debut + 4, debut + 9);
          const appel = debut === 0 ? `range(${fin})` : `range(${debut}, ${fin})`;
          const somme = (a, b) => (b * (b + 1) - a * (a - 1)) / 2;
          return {
            question: `s = 0\nfor i in ${appel}:\n    s = s + i\nprint(s)`,
            bonne: somme(debut, fin - 1),
            pieges: [[somme(debut, fin), 'range-exclut'], [fin - 1, 'boucle-derniere-valeur']],
          };
        }
        const a = entre(1, 5);
        const n = entre(3, 6);
        return {
          question: `x = ${a}\nfor i in range(${n}):\n    x = 2 * x\nprint(x)`,
          bonne: a * 2 ** n,
          pieges: [[a * 2 ** (n - 1), 'range-nombre-tours'], [a + 2 * n, 'boucle-multiplier']],
        };
      },
    },
  ],

  PREMIERE: [
    {
      recit: 'Le journal de bord de la station s’affiche, plein de pourcentages. Le premier cadenas est un automatisme.',
      tirer: ({ entre, au }) => {
        const sorte = au(['successifs', 'proportion', 'reciproque']);
        if (sorte === 'successifs') {
          const a = 10 * entre(1, 5);
          const b = 10 * entre(1, 5);
          return {
            question: `Une hausse de ${a} %, puis une baisse de ${b} % : évolution globale, en % ?`,
            bonne: ((100 + a) * (100 - b) - 10000) / 100,
            pieges: [[a - b, 'taux-additionner']],
            unite: ' %',
          };
        }
        if (sorte === 'proportion') {
          const p1 = 10 * entre(2, 9);
          const p2 = 10 * entre(2, 9);
          return {
            question: `${p1} % des passagers sont des scientifiques, et ${p2} % d’entre eux sont biologistes. Part des biologistes parmi tous les passagers, en % ?`,
            bonne: (p1 * p2) / 100,
            pieges: [[p1 + p2, 'proportion-additionner'], [p2, 'proportion-reference']],
            unite: ' %',
            max: 100,
          };
        }
        const t = au([20, 50, 60, 75, 80]);
        return {
          question: `Un prix baisse de ${t} %. Quelle hausse, en %, le ramène au prix de départ ?`,
          bonne: (100 * t) / (100 - t),
          pieges: [[t, 'taux-reciproque']],
          unite: ' %',
        };
      },
    },
    {
      recit: 'La trajectoire d’amarrage suit une parabole. Le deuxième cadenas porte un trinôme du second degré.',
      tirer: ({ entre, au }) => {
        if (au([true, false])) {
          const a = entre(1, 3);
          const b = nonNul(entre, -9, 9);
          const c = nonNul(entre, -9, 9);
          return {
            question: `Discriminant Δ de ${polynome([[a, 'x²'], [b, 'x'], [c, '']])} ?`,
            bonne: b * b - 4 * a * c,
            pieges: [
              [b * b + 4 * a * c, 'delta-signe'],
              b < 0 ? [-b * b - 4 * a * c, 'delta-carre-negatif'] : [2 * b - 4 * a * c, 'delta-carre'],
            ],
          };
        }
        let r1; let r2;
        do {
          r1 = nonNul(entre, -9, 8);
          r2 = nonNul(entre, r1 + 1, 9);
        } while (r1 + r2 === 0);
        return {
          question: `Plus grande racine de ${polynome([[1, 'x²'], [-(r1 + r2), 'x'], [r1 * r2, '']])} ?`,
          bonne: r2,
          pieges: [[-r1, 'racines-signe'], [r2 - r1, 'racines-formule']],
        };
      },
    },
    {
      recit: 'Le moteur ajuste sa poussée selon la pente d’une courbe. Le troisième cadenas demande un nombre dérivé.',
      tirer: ({ entre, au }) => {
        if (au([true, false])) {
          const a = entre(1, 4);
          const b = nonNul(entre, -9, 9);
          const c = nonNul(entre, -9, 9);
          const k = nonNul(entre, -4, 4);
          return {
            question: `f(x) = ${polynome([[a, 'x²'], [b, 'x'], [c, '']])}. f′(${ecrire(k)}) = ?`,
            bonne: 2 * a * k + b,
            pieges: [[a * k * k + b * k + c, 'derivee-image'], [a * k + b, 'derivee-puissance']],
          };
        }
        const p = entre(1, 3);
        const q = entre(1, 3);
        const u = nonNul(entre, -6, 6);
        const v = nonNul(entre, -6, 6);
        const k = nonNul(entre, -3, 3);
        return {
          question: `f(x) = (${polynome([[p, 'x'], [u, '']])})(${polynome([[q, 'x'], [v, '']])}). f′(${ecrire(k)}) = ?`,
          bonne: p * (q * k + v) + q * (p * k + u),
          pieges: [[p * q, 'derivee-produit'], [(p * k + u) * (q * k + v), 'derivee-image']],
        };
      },
    },
    {
      recit: 'Les réserves d’oxygène se calculent mois après mois, comme une suite. Le quatrième cadenas veut un de ses termes.',
      tirer: ({ entre, au }) => {
        if (au([true, false])) {
          const s = au([0, 1]);
          const a = entre(-9, 20);
          const r = au([-1, 1]) * entre(2, 9);
          const n = entre(8, 20);
          return {
            question: `(uₙ) arithmétique : u${indice(s)} = ${ecrire(a)}, raison ${ecrire(r)}. u${indice(n)} = ?`,
            bonne: a + (n - s) * r,
            pieges: [[s === 0 ? a + (n - 1) * r : a + n * r, 'suite-rang'], [a * r, 'suite-arith-produit']],
          };
        }
        const a = entre(1, 5);
        const q = au([2, 3]);
        const n = q === 2 ? entre(3, 7) : entre(3, 5);
        return {
          question: `(vₙ) géométrique : v₀ = ${a}, raison ${q}. v${indice(n)} = ?`,
          bonne: a * q ** n,
          pieges: [[a * q ** (n - 1), 'suite-rang'], [a + n * q, 'suite-geo-arith']],
        };
      },
    },
    {
      recit: 'Il faut choisir au hasard un membre d’équipage pour la sortie dans l’espace. Le cinquième cadenas est une probabilité conditionnelle.',
      tirer: ({ entre, au }) => {
        let nP; let nI; let nPI;
        do {
          nP = au([20, 25, 40, 50]);
          nI = au([20, 25, 40, 50]);
          nPI = entre(2, Math.min(nP, nI) - 2);
        } while (nP === nI || (nPI * 100) % nP !== 0 || (nPI * 100) % nI !== 0);
        const sachantPilote = au([true, false]);
        return {
          question: `Équipage de 100 personnes : ${nP} pilotes, ${nI} ingénieurs, dont ${nPI} sont les deux. On choisit au hasard ${sachantPilote ? 'un pilote : probabilité qu’il soit aussi ingénieur' : 'un ingénieur : probabilité qu’il soit aussi pilote'}, en % ?`,
          bonne: (100 * nPI) / (sachantPilote ? nP : nI),
          pieges: [[(100 * nPI) / (sachantPilote ? nI : nP), 'proba-cond-inverse'], [nPI, 'proba-cond-intersection']],
          unite: ' %',
        };
      },
    },
    {
      recit: 'Le dernier cadenas protège les moteurs, et sa serrure ne parle qu’en exponentielles.',
      tirer: ({ entre, au }) => {
        if (au([true, true, false])) {
          const a = nonNul(entre, -5, 7);
          const b = nonNul(entre, -5, 7);
          const c = nonNul(entre, -5, 7);
          return {
            question: `e${exposant(a)} × e${exposant(b)} ÷ e${exposant(c)} = eⁿ. n = ?`,
            bonne: a + b - c,
            pieges: [[a + b + c, 'exp-quotient'], [a * b - c, 'exp-produit']],
          };
        }
        const a = au([-1, 1]) * entre(2, 6);
        const b = entre(2, 5);
        return {
          question: `(e${exposant(a)})${exposant(b)} = eⁿ. n = ?`,
          bonne: a * b,
          pieges: [[a + b, 'exp-puissance']],
        };
      },
    },
  ],

  TERMINALE: [
    {
      recit: 'La première clé est cachée dans le comportement d’une fonction quand x devient immense.',
      tirer: ({ entre, au }) => {
        if (au([true, true, false])) {
          const d = entre(1, 4);
          const k = nonNul(entre, -6, 6);
          const b = nonNul(entre, -9, 9);
          const e = nonNul(entre, -9, 9);
          const f = au([-2, -1, 1, 2]);
          let j = nonNul(entre, -9, 9);
          while (j === k) j = nonNul(entre, -9, 9);
          return {
            question: `Limite en +∞ de (${polynome([[k * d, 'x²'], [b, 'x'], [f * j, '']])})/(${polynome([[d, 'x²'], [e, 'x'], [f, '']])}) ?`,
            bonne: k,
            pieges: [[j, 'limite-constantes'], [k * d, 'limite-denominateur']],
          };
        }
        const a = entre(2, 9);
        const b = nonNul(entre, -9, 9);
        const c = entre(1, 9);
        return {
          question: `Limite en +∞ de (${polynome([[a, 'x'], [b, '']])})/(${polynome([[1, 'x²'], [c, '']])}) ?`,
          bonne: 0,
          pieges: [[a, 'limite-degres'], [b / c, 'limite-constantes']],
        };
      },
    },
    {
      recit: 'La deuxième clé est écrite en logarithmes népériens. Simplifie-la jusqu’à un seul nombre.',
      tirer: ({ entre, au }) => {
        if (au([true, true, false])) {
          let a; let b; let c;
          do {
            a = entre(2, 12);
            b = entre(2, 12);
            c = entre(2, 12);
          } while ((a * b) % c !== 0 || (a * b) / c < 2);
          return {
            question: `ln(${a}) + ln(${b}) − ln(${c}) = ln(n). n = ?`,
            bonne: (a * b) / c,
            pieges: [[a + b - c, 'ln-somme'], [a * b * c, 'ln-quotient']],
            positif: true,
          };
        }
        const k = au([2, 3]);
        const a = k === 2 ? entre(2, 9) : entre(2, 6);
        return {
          question: `${k} ln(${a}) = ln(n). n = ?`,
          bonne: a ** k,
          pieges: [[k * a, 'ln-puissance']],
        };
      },
    },
    {
      recit: 'La troisième clé est une aire sous une courbe, que le message donne sous forme d’intégrale.',
      tirer: ({ entre, au }) => {
        const m = au([0, 1]);
        let a; let b; let k;
        do {
          k = entre(m + 2, 6);
          a = entre(1, 6);
          b = nonNul(entre, -9, 9);
        } while ((a * (k * k - m * m)) % 2 !== 0);
        const F = (x) => (a * x * x) / 2 + b * x;
        const moitie = [a * (k * k - m * m) + b * (k - m), 'primitive-moitie'];
        const derivee = [a * (k - m), 'integrale-primitive'];
        return {
          question: `∫${indice(m)}${exposant(k)} (${polynome([[a, 'x'], [b, '']])}) dx = ?`,
          bonne: F(k) - F(m),
          pieges: m === 1 ? [[F(k), 'integrale-borne-inf'], moitie, derivee] : [moitie, derivee],
        };
      },
    },
    {
      recit: 'La quatrième clé dépend d’une expérience répétée : chaque tentative de décodage réussit ou échoue, indépendamment des autres.',
      tirer: ({ au }) => {
        const esperance = au([true, false]);
        let n; let P;
        do {
          n = au([20, 40, 50, 100, 200]);
          P = au([10, 20, 25, 40, 50, 75]);
        } while (esperance ? (n * P) % 100 !== 0 : (n * P * (100 - P)) % 10000 !== 0);
        const p = String(P / 100).replace('.', ',');
        if (esperance) {
          return {
            question: `X suit la loi binomiale B(${n} ; ${p}). E(X) = ?`,
            bonne: (n * P) / 100,
            pieges: [[(n * (100 - P)) / 100, 'binomiale-echecs']],
          };
        }
        const V = (n * P * (100 - P)) / 10000;
        return {
          question: `X suit la loi binomiale B(${n} ; ${p}). V(X) = ?`,
          bonne: V,
          pieges: [[(n * P) / 100, 'variance-esperance'], [Math.sqrt(V), 'variance-ecart-type']],
        };
      },
    },
    {
      recit: 'Pour la cinquième clé, il faut compter toutes les combinaisons possibles avant de les essayer.',
      tirer: ({ entre, au }) => {
        const sorte = au(['kuplets', 'arrangements', 'combinaisons']);
        if (sorte === 'kuplets') {
          const k = au([2, 3]);
          const n = entre(4, 10);
          return {
            question: `Une clé de ${k} caractères, chacun pris parmi ${n} symboles, répétitions permises. Combien de clés ?`,
            bonne: n ** k,
            pieges: [[n * k, 'denombrer-produit'], [arrangements(n, k), 'kuplets-distincts']],
          };
        }
        if (sorte === 'arrangements') {
          const n = entre(5, 10);
          const k = au([2, 3]);
          return {
            question: `${n} agents, ${k} rôles différents à attribuer, un agent par rôle. Combien de répartitions ?`,
            bonne: arrangements(n, k),
            pieges: [[combinaisons(n, k), 'arrangement-ordre'], [n ** k, 'arrangement-repetition']],
          };
        }
        const n = entre(5, 10);
        const k = entre(2, Math.min(4, n - 2));
        return {
          question: `Former une équipe de ${k} agents parmi ${n}, sans rôle. Combien d’équipes ?`,
          bonne: combinaisons(n, k),
          pieges: [[arrangements(n, k), 'combinaison-ordre'], [n * k, 'denombrer-produit']],
        };
      },
    },
    {
      recit: 'La dernière clé est cachée dans l’espace : le satellite émetteur et sa station sont repérés dans un repère orthonormé.',
      tirer: ({ entre, au }) => {
        if (au([true, false])) {
          let a; let b; let d; let e; let f; let m;
          do {
            a = nonNul(entre, -4, 4);
            b = nonNul(entre, -3, 3);
            d = nonNul(entre, -4, 4);
            f = au([-3, -2, -1, 1, 2, 3]);
            m = nonNul(entre, -5, 5);
            e = (-m * f - a * d) / b;
          } while (!Number.isInteger(e) || Math.abs(e) > 6 || e === 0);
          return {
            question: `Vecteurs u(${ecrire(a)} ; ${ecrire(b)} ; m) et v(${ecrire(d)} ; ${ecrire(e)} ; ${ecrire(f)}) orthogonaux. m = ?`,
            bonne: m,
            pieges: [[-m, 'orthogonal-signe'], [m * f, 'orthogonal-diviser']],
          };
        }
        const a = nonNul(entre, -4, 4);
        const b = nonNul(entre, -4, 4);
        const c = au([-4, -3, -2, 2, 3, 4]);
        const x = entre(-4, 4);
        const y = entre(-4, 4);
        const z = nonNul(entre, -6, 6);
        const d = -(a * x + b * y + c * z);
        return {
          question: `Plan P : ${polynome([[a, 'x'], [b, 'y'], [c, 'z'], [d, '']])} = 0. A(${ecrire(x)} ; ${ecrire(y)} ; z) ∈ P. z = ?`,
          bonne: z,
          pieges: [[-z, 'plan-signe'], [c * z, 'plan-diviser']],
        };
      },
    },
  ],
};

/** Les choix d'une étape : la bonne réponse, ses pièges entiers, et des voisins. */
function choixDe(melanger, brut) {
  const bonne = ecrire(brut.bonne);
  const pieges = {};
  const candidats = [];
  brut.pieges.forEach(([v, cle]) => {
    if (!Number.isInteger(v)) return;
    if (brut.positif && v <= 0) return;
    if (brut.max !== undefined && v > brut.max) return;
    const s = ecrire(v);
    if (s === bonne || candidats.includes(s)) return;
    candidats.push(s);
    pieges[s] = cle;
  });
  const voisin = (k) => {
    const d = Math.ceil(k / 2);
    const v = k % 2 ? brut.bonne + d : brut.bonne - d;
    return ecrire(brut.bonne >= 0 && v < 0 ? brut.bonne + d + 3 : v);
  };
  const liste = troisChoix(bonne, candidats, voisin);
  Object.keys(pieges).forEach((s) => { if (!liste.includes(s)) delete pieges[s]; });
  const unite = brut.unite ?? '';
  return {
    bonne,
    pieges,
    choix: melanger(liste).map((c) => ({ cle: c, libelle: `${c}${unite}` })),
  };
}

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const o = outils(graine);
  const classe = ETAPES[niveau] ? niveau : CLASSES[0];
  const prefixe = PREFIXE[classe];
  const avant = [];
  return ETAPES[classe].map((etape, i) => {
    const brut = etape.tirer(o);
    const { bonne, pieges, choix } = choixDe(o.melanger, brut);
    const piece = pieceDe(brut.bonne);
    const manche = {
      consigne: `${prefixe}-etape-${i + 1}`,
      recit: etape.recit,
      question: brut.question,
      choix,
      bonne,
      pieges,
      cadenas: { avant: [...avant], piece, total: MANCHES },
    };
    avant.push(piece);
    return manche;
  });
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // ----------------------------------------------- 2de : le serveur piraté
  '2de-etape-1': 'Premier pare-feu : développe le carré, et trouve le coefficient qui manque.',
  '2de-etape-2': 'Deuxième pare-feu : étudie le signe du produit, puis compte les entiers solutions.',
  '2de-etape-3': 'Troisième pare-feu : retrouve ce qui caractérise la droite.',
  '2de-etape-4': 'Quatrième pare-feu : calcule la distance entre les deux points.',
  '2de-etape-5': 'Cinquième pare-feu : calcule la probabilité de la réunion.',
  '2de-etape-6': 'Dernier pare-feu : lis le programme Python, et dis ce qu’il affiche.',
  '2de-etape-1-regle': 'Développe avec l’identité remarquable : le carré du premier terme, plus ou moins deux fois le produit des deux termes, plus le carré du second.',
  '2de-etape-2-regle': 'Un produit de deux facteurs du premier degré, ici, est négatif entre ses deux racines. Les racines sont solutions avec inférieur ou égal, pas avec strictement inférieur.',
  '2de-etape-3-regle': 'Le coefficient directeur, c’est la différence des ordonnées divisée par la différence des abscisses, dans le même ordre. L’ordonnée à l’origine se trouve en remplaçant x et y par les coordonnées d’un point de la droite.',
  '2de-etape-4-regle': 'Dans un repère orthonormé, la distance est la racine carrée de la somme des carrés des écarts d’abscisses et d’ordonnées.',
  '2de-etape-5-regle': 'La probabilité de A ou B, c’est celle de A, plus celle de B, moins celle de A et B, sinon l’intersection est comptée deux fois.',
  '2de-etape-6-regle': 'Fais tourner le programme à la main, tour par tour, en notant chaque variable ; range s’arrête juste avant la borne de fin.',
  'identite-signe': 'Le bon nombre, mais pas le bon signe : avec une différence au carré, le double produit est négatif ; avec une somme, il est positif.',
  'identite-double-produit': 'Tu as oublié le deux du double produit : c’est deux fois le premier terme, fois le second.',
  'identite-carre-signe': 'Un carré est toujours positif : le dernier terme est le carré du second nombre, avec un signe plus.',
  'identite-carre-double': 'Le dernier terme est le carré du second nombre, pas son double : multiplie-le par lui-même.',
  'signe-bornes-incluses': 'Avec inférieur ou égal, les deux racines annulent le produit : elles sont solutions. Compte-les aussi.',
  'signe-bornes-exclues': 'Avec strictement inférieur, les racines annulent le produit, qui n’est donc pas négatif : elles ne sont pas solutions.',
  'signe-compter': 'On ne compte pas l’écart entre les racines, mais les entiers eux-mêmes : de deux à cinq, il y a quatre entiers, pas trois.',
  'coeff-ordre': 'Garde le même ordre en haut et en bas : ordonnée de B moins ordonnée de A, sur abscisse de B moins abscisse de A.',
  'coeff-diviser': 'Tu as la différence des ordonnées : il reste à la diviser par la différence des abscisses.',
  'ordonnee-signe': 'Remplace x et y par les coordonnées du point, puis isole p : p, c’est y moins m fois x.',
  'distance-somme': 'On n’ajoute pas les écarts : on ajoute leurs carrés, puis on prend la racine carrée.',
  'distance-racine': 'Tu as trouvé le carré de la distance. Il reste à prendre sa racine carrée.',
  'union-intersection': 'En ajoutant les deux probabilités, tu comptes deux fois l’intersection : retire-la une fois.',
  'union-exclusif': 'Tu as retiré l’intersection deux fois : ça, c’est la probabilité qu’un seul des deux événements se produise. La réunion la garde une fois.',
  'range-exclut': 'range s’arrête juste avant la borne de fin : la dernière valeur prise par i est la borne de fin moins un.',
  'boucle-derniere-valeur': 'Ça, c’est la dernière valeur de i. Mais s accumule : à chaque tour, on ajoute i à ce qu’il y avait déjà.',
  'range-nombre-tours': 'range de n fait exactement n tours, de zéro à n moins un : la variable est doublée n fois.',
  'boucle-multiplier': 'La ligne multiplie x par deux à chaque tour, elle n’ajoute pas deux.',

  // --------------------------------------------- 1re : le module spatial
  '1re-etape-1': 'Premier cadenas : un automatisme sur les pourcentages.',
  '1re-etape-2': 'Deuxième cadenas : le second degré.',
  '1re-etape-3': 'Troisième cadenas : calcule le nombre dérivé.',
  '1re-etape-4': 'Quatrième cadenas : calcule le terme demandé de la suite.',
  '1re-etape-5': 'Cinquième cadenas : calcule cette probabilité conditionnelle.',
  '1re-etape-6': 'Dernier cadenas : trouve l’exposant avec les règles de l’exponentielle.',
  '1re-etape-1-regle': 'Traduis chaque évolution par un coefficient multiplicateur : une hausse de t pour cent, c’est multiplier par un plus t sur cent. Les évolutions successives se multiplient, elles ne s’ajoutent pas.',
  '1re-etape-2-regle': 'Delta, c’est b au carré moins quatre a c. S’il est positif, les racines valent moins b, plus ou moins racine de delta, le tout sur deux a.',
  '1re-etape-3-regle': 'Dérive terme à terme : x au carré devient deux x, une constante disparaît ; pour un produit, u prime v plus u v prime. Puis remplace x par la valeur donnée.',
  '1re-etape-4-regle': 'Arithmétique : on ajoute la raison à chaque pas. Géométrique : on multiplie par la raison à chaque pas. Compte bien le nombre de pas depuis le terme donné.',
  '1re-etape-5-regle': 'Sachant un événement, on se restreint à lui : on divise l’effectif de l’intersection par l’effectif de l’événement qu’on sait réalisé.',
  '1re-etape-6-regle': 'Un produit d’exponentielles ajoute les exposants, un quotient les soustrait, une puissance les multiplie.',
  'taux-additionner': 'Les taux ne s’additionnent pas : multiplie les coefficients multiplicateurs, puis retire un pour retrouver le taux global.',
  'taux-reciproque': 'Une baisse et une hausse du même taux ne se compensent pas : la hausse s’applique à un prix plus petit. Divise un par le coefficient de la baisse.',
  'proportion-additionner': 'Une proportion d’une proportion ne s’additionne pas : on prend une part d’une part, on multiplie les deux proportions.',
  'proportion-reference': 'Ça, c’est la part parmi les scientifiques seulement. Rapporte-la à tous les passagers : multiplie les deux proportions.',
  'delta-signe': 'Delta, c’est b au carré moins quatre a c, et non plus. Attention aux signes : moins par moins donne plus.',
  'delta-carre-negatif': 'Le carré d’un nombre négatif est positif : le carré de moins trois, c’est neuf, pas moins neuf.',
  'delta-carre': 'b au carré, c’est b fois b, pas deux fois b.',
  'racines-signe': 'Le signe de b est inversé : les racines s’obtiennent avec moins b, plus ou moins racine de delta, sur deux a.',
  'racines-formule': 'Racine de delta n’est pas une racine du trinôme : ajoute-la à moins b, puis divise par deux a.',
  'derivee-image': 'Ça, c’est l’image, f de x, pas le nombre dérivé : dérive d’abord, puis remplace x.',
  'derivee-puissance': 'La dérivée de x au carré est deux x : fais descendre l’exposant devant.',
  'derivee-produit': 'La dérivée d’un produit n’est pas le produit des dérivées : c’est u prime v plus u v prime.',
  'suite-rang': 'Attention au rang de départ : du terme de rang p au terme de rang n, il y a n moins p pas.',
  'suite-arith-produit': 'Dans une suite arithmétique, on ajoute la raison à chaque pas, autant de fois qu’il y a de pas : on ne multiplie pas le premier terme par la raison.',
  'suite-geo-arith': 'La suite est géométrique : on multiplie par la raison à chaque pas, on ne l’ajoute pas.',
  'proba-cond-inverse': 'Tu as divisé par le mauvais groupe : on divise par l’effectif du groupe dans lequel on choisit. Ne confonds pas P sachant A de B, et P sachant B de A.',
  'proba-cond-intersection': 'Ça, c’est la probabilité de l’intersection, sur tout l’équipage. Sachant le groupe choisi, on divise par son effectif seulement.',
  'exp-quotient': 'Diviser par une exponentielle, c’est soustraire son exposant, pas l’ajouter.',
  'exp-produit': 'Un produit d’exponentielles ajoute les exposants, il ne les multiplie pas.',
  'exp-puissance': 'Une puissance d’exponentielle multiplie les exposants, elle ne les ajoute pas.',

  // ------------------------------------------- terminale : le message chiffré
  'tle-etape-1': 'Première clé : calcule la limite en plus l’infini.',
  'tle-etape-2': 'Deuxième clé : simplifie avec les propriétés du logarithme népérien.',
  'tle-etape-3': 'Troisième clé : calcule l’intégrale avec une primitive.',
  'tle-etape-4': 'Quatrième clé : utilise la loi binomiale.',
  'tle-etape-5': 'Cinquième clé : dénombre les possibilités.',
  'tle-etape-6': 'Dernière clé : la géométrie dans l’espace.',
  'tle-etape-1-regle': 'Pour un quotient de polynômes en plus l’infini, factorise par le terme de plus haut degré : la limite est celle du quotient des termes de plus haut degré.',
  'tle-etape-2-regle': 'Le logarithme transforme les produits en sommes : ln de a b, c’est ln a plus ln b ; ln de a sur b, ln a moins ln b ; ln de a puissance n, n fois ln a.',
  'tle-etape-3-regle': 'Trouve une primitive F, puis calcule F de la borne du haut moins F de la borne du bas.',
  'tle-etape-4-regle': 'Pour la loi binomiale de paramètres n et p, l’espérance vaut n p, et la variance n p fois un moins p.',
  'tle-etape-5-regle': 'Demande-toi si l’ordre compte et si les répétitions sont permises : n puissance k avec répétitions ; des arrangements sans répétition quand l’ordre compte ; des combinaisons quand il ne compte pas.',
  'tle-etape-6-regle': 'Deux vecteurs sont orthogonaux quand leur produit scalaire, x x prime plus y y prime plus z z prime, est nul. Un point est dans un plan quand ses coordonnées vérifient son équation.',
  'limite-constantes': 'Les termes constants donnent la limite en zéro, pas en plus l’infini : en plus l’infini, ce sont les termes de plus haut degré qui l’emportent.',
  'limite-denominateur': 'Tu as gardé le terme dominant du numérateur : il faut encore le diviser par celui du dénominateur.',
  'limite-degres': 'Le dénominateur est de plus haut degré que le numérateur : il l’emporte, et le quotient tend vers zéro.',
  'ln-somme': 'Le logarithme d’une somme n’est pas la somme des logarithmes : ln a plus ln b, c’est ln de a fois b.',
  'ln-quotient': 'Retrancher ln c, c’est diviser par c, pas multiplier.',
  'ln-puissance': 'n fois ln a, c’est ln de a puissance n, pas ln de n fois a.',
  'integrale-borne-inf': 'Tu as oublié de soustraire F de la borne du bas : l’intégrale, c’est F du haut moins F du bas.',
  'primitive-moitie': 'Une primitive de x est x au carré sur deux : n’oublie pas de diviser par deux.',
  'integrale-primitive': 'Tu as calculé la fonction elle-même aux deux bornes : il faut d’abord une primitive F, puis F du haut moins F du bas.',
  'binomiale-echecs': 'Ça, c’est le nombre moyen d’échecs. L’espérance compte les succès : n fois p.',
  'variance-esperance': 'Ça, c’est l’espérance. La variance multiplie encore par un moins p.',
  'variance-ecart-type': 'Ça, c’est l’écart type. La variance, c’est son carré : n p fois un moins p.',
  'denombrer-produit': 'On ne multiplie pas le nombre d’objets par le nombre de places : à chaque place, on multiplie le nombre de possibilités.',
  'kuplets-distincts': 'Les répétitions sont permises : chaque caractère garde toutes les possibilités. C’est n puissance k.',
  'arrangement-ordre': 'Ici, l’ordre compte, puisque les rôles sont différents : ce sont des arrangements, pas des combinaisons.',
  'arrangement-repetition': 'Un agent ne peut pas tenir deux rôles : sans répétition, les possibilités diminuent d’une à chaque choix.',
  'combinaison-ordre': 'Ici, l’ordre ne compte pas : une équipe reste la même dans n’importe quel ordre. Divise les arrangements par factorielle k.',
  'orthogonal-signe': 'Le bon nombre, mais pas le bon signe : en isolant m, les autres termes changent de côté, donc de signe.',
  'orthogonal-diviser': 'Il reste à diviser par la troisième coordonnée de v pour isoler m.',
  'plan-signe': 'Attention au signe : en isolant z, les autres termes changent de côté, donc de signe.',
  'plan-diviser': 'Il reste à diviser par le coefficient de z pour l’isoler.',
};
