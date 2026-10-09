/**
 * L'ESCAPE GAME DE MATHS DU COLLÈGE — Nora, de la 6e à la 3e. Camara, le
 * 06/10/2026 : « les escape games pour les maths, l'histoire-géo, le français,
 * l'anglais et les sciences ».
 *
 * UNE HISTOIRE PAR CLASSE, SIX CADENAS, L'ORDRE DU RÉCIT. Chaque étape est un
 * calcul ou un petit problème de l'année ; la PIÈCE qu'elle donne est le
 * chiffre des unités de la réponse (la réponse elle-même si c'est un chiffre).
 * Les nombres sont tirés au hasard, les réponses CALCULÉES ici, jamais
 * recopiées ; les pièges sont les vraies erreurs des élèves, chacune nommée :
 *   - 6e, le coffre du pirate : priorités, fraction d'une quantité, reste
 *     d'une division euclidienne, périmètre, aire du triangle, pourcentage ;
 *   - 5e, le sous-marin en panne : relatifs, parenthèses, substitution,
 *     somme des angles, moyenne, quatrième proportionnelle ;
 *   - 4e, le laboratoire verrouillé : puissances, produit de relatifs,
 *     équation, Pythagore, vitesse, probabilité ;
 *   - 3e, la chambre forte (révision du brevet) : équation, Thalès, fonction
 *     affine, deux épreuves, médiane, Pythagore pour un côté de l'angle droit.
 *
 * Ce qui se DIT (PHRASES) est fixe, sans aucun nombre ; ce qui varie est dans
 * `question` et dans les libellés, affichés.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'escape-maths', titre: 'Escape game de maths', matiereCode: 'MATHS' };

export const ESCAPE = true;

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le coffre du pirate',
    accroche: 'Six cadenas gardent le coffre du pirate.',
    intro: 'Tu viens d’échouer sur l’île du capitaine Barbe-Grise, et son coffre est fermé par six cadenas. Chaque calcul juste te donne un chiffre du code.',
    fin: 'Le dernier cadenas saute : le coffre du capitaine s’ouvre, et son trésor est à toi !',
    competences: [
      'MATH_6E_CALC_PRIORITES', 'MATH_6E_FRAC_QUANTITE', 'MATH_6E_CALC_DIV_EUCL',
      'MATH_6E_MES_PERIMETRE', 'MATH_6E_MES_AIRE', 'MATH_6E_PROP_POURCENT',
    ],
  },
  CINQUIEME: {
    titre: 'Le sous-marin en panne',
    accroche: 'Relance les moteurs et remonte !',
    intro: 'Ton sous-marin est bloqué au fond de l’océan, et la salle des machines s’est verrouillée. Ouvre ses six cadenas pour relancer les moteurs.',
    fin: 'Les moteurs grondent : le sous-marin remonte vers la lumière, tout l’équipage est sauvé !',
    competences: [
      'MATH_5E_REL_ADD', 'MATH_5E_PRIORITES', 'MATH_5E_LITT_SUBSTITUER',
      'MATH_5E_GEO_TRI_ANGLES', 'MATH_5E_STAT_MOYENNE', 'MATH_5E_PROP_QUATRIEME',
    ],
  },
  QUATRIEME: {
    titre: 'Le laboratoire verrouillé',
    accroche: 'Arrête l’expérience avant qu’elle déborde.',
    intro: 'Le laboratoire du professeur Volta s’est verrouillé tout seul, et sa dernière expérience bouillonne de plus en plus fort. Six cadenas te séparent du bouton d’arrêt.',
    fin: 'Tu appuies sur le bouton rouge : l’expérience s’arrête net, le laboratoire est sauvé !',
    competences: [
      'MATH_4E_PUISSANCES', 'MATH_4E_REL_MULT', 'MATH_4E_EQUATION',
      'MATH_4E_PYTHAGORE', 'MATH_4E_PROP_VITESSE', 'MATH_4E_PROBA_CALCUL',
    ],
  },
  TROISIEME: {
    titre: 'La chambre forte',
    accroche: 'Six exercices du brevet pour sortir.',
    intro: 'Une alarme a refermé sur toi la porte de la chambre forte de la banque. Six cadenas, six exercices du brevet : réussis-les avant la fin du compte à rebours.',
    fin: 'La porte blindée pivote : tu sors de la chambre forte, et le brevet n’a plus de secret pour toi !',
    competences: [
      'MATH_3E_EQ_PROBLEME', 'MATH_3E_THALES', 'MATH_3E_FONC_AFFINE',
      'MATH_3E_PROBA_DEUX', 'MATH_3E_STAT_QUARTILES', 'MATH_3E_RACINE',
    ],
  },
};

export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 6;

/** Un entier écrit à la française : le signe moins typographique. */
export const ecrire = (n) => (n < 0 ? `−${-n}` : String(n));

/** La pièce d'une réponse : son chiffre des unités. */
export const pieceDe = (n) => String(Math.abs(n) % 10);

const EXPOSANTS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const exposant = (n) => String(n).split('').map((c) => EXPOSANTS[Number(c)]).join('');
const pgcd = (a, b) => (b === 0 ? a : pgcd(b, a % b));
/** La marque du pluriel : « 1 fiole », « 3 fioles ». */
const pluriel = (n) => (n > 1 ? 's' : '');

/** Les triplets de Pythagore utilisés : [côté, côté, hypoténuse]. */
const TRIPLETS = [
  [3, 4, 5], [6, 8, 10], [9, 12, 15], [12, 16, 20], [15, 20, 25], [5, 12, 13],
  [10, 24, 26], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37],
];

const PREFIXE = {
  SIXIEME: '6e', CINQUIEME: '5e', QUATRIEME: '4e', TROISIEME: '3e',
};

/*
 * LES ÉTAPES. Chacune rend { question, bonne, pieges: [[valeur, clé]], unite }.
 * Un piège qui tombe sur la bonne réponse, ou qui n'est pas entier, est écarté ;
 * `positif` écarte aussi les pièges nuls ou négatifs (une longueur, un compte).
 */
const ETAPES = {
  SIXIEME: [
    {
      recit: 'Sur la plage, une bouteille s’est échouée. Le message qu’elle contient est un calcul.',
      tirer: ({ entre }) => {
        const a = entre(2, 20);
        const b = entre(2, 9);
        const c = entre(2, 9);
        return {
          question: `${a} + ${b} × ${c} = ?`,
          bonne: a + b * c,
          pieges: [[(a + b) * c, 'priorites-gauche-droite']],
        };
      },
    },
    {
      recit: 'Dans la cabine du capitaine, une bourse de pièces d’or porte une étiquette. Elle dit quelle part du trésor tu peux prendre.',
      tirer: ({ entre, au }) => {
        const d = au([3, 4, 5, 6, 8, 10]);
        let n = entre(2, d - 1);
        while (pgcd(n, d) !== 1) n = entre(2, d - 1);
        const m = entre(2, 12);
        const q = d * m;
        return {
          question: `${n}/${d} de ${q} pièces d’or = ?`,
          bonne: n * m,
          pieges: [[m, 'fraction-une-part'], [q / n, 'fraction-inverser']],
        };
      },
    },
    {
      recit: 'L’équipage partage les pièces à parts égales. Celles qu’on ne peut plus partager te reviennent.',
      tirer: ({ entre }) => {
        let k; let q; let r;
        do {
          k = entre(3, 9);
          q = entre(4, 15);
          r = entre(1, k - 1);
        } while (q === r);
        return {
          question: `${k * q + r} pièces pour ${k} pirates : combien en reste-t-il ?`,
          bonne: r,
          pieges: [[q, 'reste-pas-quotient']],
        };
      },
    },
    {
      recit: 'La carte montre un enclos rectangulaire autour de l’endroit où dort le coffre. Il faut savoir la longueur de sa clôture.',
      tirer: ({ entre }) => {
        const L = entre(5, 30);
        const l = entre(2, L - 1);
        return {
          question: `Rectangle de ${L} m sur ${l} m : périmètre ?`,
          bonne: 2 * (L + l),
          pieges: [[L + l, 'perimetre-moitie'], [L * l, 'perimetre-aire']],
          unite: ' m',
        };
      },
    },
    {
      recit: 'La voile du canot est déchirée, et elle a la forme d’un triangle. Pour la recoudre, il faut connaître sa surface.',
      tirer: ({ entre }) => {
        let b; let h;
        do {
          b = entre(3, 16);
          h = entre(2, 14);
        } while ((b * h) % 2 !== 0);
        return {
          question: `Triangle : base ${b} cm, hauteur ${h} cm. Aire ?`,
          bonne: (b * h) / 2,
          pieges: [[b * h, 'aire-triangle-moitie'], [b + h, 'aire-pas-somme']],
          unite: ' cm²',
        };
      },
    },
    {
      recit: 'Le coffre est enfin devant toi. Sur le couvercle, le capitaine a gravé sa dernière énigme.',
      tirer: ({ entre, au }) => {
        const p = au([10, 25, 50]);
        const m = entre(3, 19);
        const q = (100 / p) * m;
        return {
          question: `${p} % de ${q} = ?`,
          bonne: m,
          pieges: [[q - p, 'pourcentage-soustraire']],
          positif: true,
        };
      },
    },
  ],

  CINQUIEME: [
    {
      recit: 'L’écran de profondeur clignote en rouge. Le sous-marin remonte un peu : calcule sa nouvelle position.',
      tirer: ({ entre }) => {
        const a = entre(5, 20);
        let b = entre(1, 20);
        while (b === a) b = entre(1, 20);
        return {
          question: `−${a} + ${b} = ?`,
          bonne: b - a,
          pieges: [[-(a + b), 'relatifs-ajouter-distances'], [a - b, 'relatifs-signe']],
        };
      },
    },
    {
      recit: 'Le tableau de bord du moteur affiche un calcul à parenthèses. Le bon résultat règle la puissance.',
      tirer: ({ entre }) => {
        const a = entre(2, 6);
        const b = entre(2, 9);
        const c = entre(2, 9);
        const d = entre(1, 9);
        return {
          question: `${a} × (${b} + ${c}) − ${d} = ?`,
          bonne: a * (b + c) - d,
          pieges: [[a * b + c - d, 'priorites-parentheses']],
        };
      },
    },
    {
      recit: 'Sur la porte de la soute, la formule de la pression est écrite à la craie. Il suffit d’y remplacer la lettre.',
      tirer: ({ entre }) => {
        const k = entre(2, 9);
        const m = entre(2, 9);
        const p = entre(1, 15);
        return {
          question: `Pour x = ${k}, calcule ${m}x + ${p}.`,
          bonne: m * k + p,
          pieges: [[Number(`${m}${k}`) + p, 'substituer-coller'], [m + k + p, 'substituer-ajouter']],
        };
      },
    },
    {
      recit: 'Le gouvernail est une plaque triangulaire dont un angle est effacé. Retrouve-le pour redresser la barre.',
      tirer: ({ entre }) => {
        const a = entre(30, 90);
        const b = entre(20, 160 - a);
        return {
          question: `Deux angles d’un triangle : ${a}° et ${b}°. Le troisième ?`,
          bonne: 180 - a - b,
          pieges: [[360 - a - b, 'angles-trois-cent-soixante'], [180 - a, 'angles-oublier-un']],
          unite: '°',
        };
      },
    },
    {
      recit: 'Quatre capteurs ont relevé la température de l’eau. L’ordinateur de bord réclame leur moyenne.',
      tirer: ({ entre }) => {
        let x; let dernier; let moyenne;
        do {
          x = [entre(6, 20), entre(6, 20), entre(6, 20)];
          moyenne = entre(10, 16);
          dernier = 4 * moyenne - x[0] - x[1] - x[2];
        } while (dernier < 6 || dernier > 20);
        const valeurs = [...x, dernier];
        const somme = 4 * moyenne;
        return {
          question: `Moyenne de ${valeurs.join(' ; ')} ?`,
          bonne: moyenne,
          pieges: [
            [somme, 'moyenne-diviser'],
            [(Math.min(...valeurs) + Math.max(...valeurs)) / 2, 'moyenne-extremes'],
          ],
          unite: ' °C',
        };
      },
    },
    {
      recit: 'Il reste à vider le ballast pour remonter. La pompe débite toujours la même quantité d’eau par minute.',
      tirer: ({ entre }) => {
        const r = entre(2, 9);
        const b = entre(2, 6);
        const c = b + entre(1, 8);
        return {
          question: `La pompe vide ${r * b} L en ${b} min. Et en ${c} min ?`,
          bonne: r * c,
          pieges: [[r * b + (c - b), 'proportion-ajouter'], [r * b * c, 'proportion-coefficient']],
          unite: ' L',
        };
      },
    },
  ],

  QUATRIEME: [
    {
      recit: 'Dans une boîte de culture, les bactéries se multiplient à toute vitesse. Le compteur affiche un produit de puissances.',
      tirer: ({ entre, au }) => {
        const base = au([2, 3, 5, 7, 10]);
        const a = entre(2, 7);
        const b = entre(2, 7);
        return {
          question: `${base}${exposant(a)} × ${base}${exposant(b)} = ${base}ⁿ. Combien vaut n ?`,
          bonne: a + b,
          pieges: [[a * b, 'puissances-multiplier-exposants']],
        };
      },
    },
    {
      recit: 'Le thermostat de la chambre froide est détraqué. Sur son écran, une multiplication clignote.',
      tirer: ({ entre, au }) => {
        let x = entre(2, 12) * au([-1, 1]);
        const y = entre(2, 12) * au([-1, 1]);
        if (x > 0 && y > 0) x = -x;
        const montrer = (n) => (n < 0 ? `(−${-n})` : String(n));
        return {
          question: `${montrer(x)} × ${montrer(y)} = ?`,
          bonne: x * y,
          pieges: [[-x * y, 'relatifs-regle-des-signes'], [x + y, 'relatifs-multiplier']],
        };
      },
    },
    {
      recit: 'Une balance est restée en équilibre sur la paillasse. L’étiquette posée dessus cache une équation.',
      tirer: ({ entre }) => {
        const a = entre(2, 9);
        const x = entre(2, 12);
        const b = entre(1, 20);
        const c = a * x + b;
        return {
          question: `${a}x + ${b} = ${c}. x = ?`,
          bonne: x,
          pieges: [[(c + b) / a, 'equation-changer-signe'], [c - b - a, 'equation-diviser']],
          positif: true,
        };
      },
    },
    {
      recit: 'La clé du placard est tout en haut, et l’échelle est posée de travers. Calcule sa longueur avant de grimper.',
      tirer: ({ au, melanger }) => {
        const [x, y, c] = au(TRIPLETS);
        const [a, b] = melanger([x, y]);
        return {
          question: `Triangle rectangle : côtés de l’angle droit ${a} cm et ${b} cm. Hypoténuse ?`,
          bonne: c,
          pieges: [[a + b, 'pythagore-somme'], [a * a + b * b, 'pythagore-racine']],
          unite: ' cm',
        };
      },
    },
    {
      recit: 'Le robot coursier du laboratoire rapporte un flacon. Le cadenas veut connaître sa vitesse moyenne.',
      tirer: ({ entre, au }) => {
        if (au([true, false])) {
          const v = entre(12, 95);
          const t = entre(2, 5);
          return {
            question: `${v * t} km en ${t} h : vitesse moyenne ?`,
            bonne: v,
            pieges: [[v * t * t, 'vitesse-multiplier']],
            unite: ' km/h',
          };
        }
        const minutes = au([15, 30]);
        const d = entre(3, 40);
        return {
          question: `${d} km en ${minutes} min : vitesse moyenne ?`,
          bonne: (d * 60) / minutes,
          pieges: [[d, 'vitesse-minutes'], [d * minutes, 'vitesse-multiplier']],
          unite: ' km/h',
        };
      },
    },
    {
      recit: 'Le bouton d’arrêt est dans une boîte de fioles, sous une fiole rouge. Tu en tires une au hasard.',
      tirer: ({ entre, au }) => {
        const total = au([4, 5, 10, 20, 25]);
        const r = entre(1, total - 1);
        const b = total - r;
        return {
          question: `Boîte : ${r} fiole${pluriel(r)} rouge${pluriel(r)} et ${b} bleue${pluriel(b)}. Probabilité de tirer une rouge, en % ?`,
          bonne: (r * 100) / total,
          pieges: [[(r * 100) / b, 'proba-sur-le-total'], [(b * 100) / total, 'proba-mauvaise-issue']],
          unite: ' %',
        };
      },
    },
  ],

  TROISIEME: [
    {
      recit: 'Le clavier de la porte demande un nombre. Une note collée dessous dit que ce nombre vérifie une équation.',
      tirer: ({ entre }) => {
        let a; let b; let c; let d; let x;
        do {
          c = entre(2, 4);
          a = c + entre(1, 4);
          x = entre(2, 12);
          b = entre(1, 15);
          d = (a - c) * x - b;
        } while (d < 1);
        return {
          question: `${a}x − ${b} = ${c}x + ${d}. x = ?`,
          bonne: x,
          pieges: [[(d + b) / (a + c), 'equation-regrouper'], [(d - b) / (a - c), 'equation-changer-signe'], [d + b, 'equation-diviser']],
        };
      },
    },
    {
      recit: 'Deux rayons laser parallèles barrent le couloir, l’un coupant le triangle de l’autre. M est sur [AB] et N sur [AC] : calcule MN pour passer.',
      tirer: ({ entre }) => {
        const q = entre(3, 6);
        const p = entre(1, q - 1);
        const s = entre(1, 4);
        const m = entre(2, 7);
        const [am, ab, bc] = [p * s, q * s, q * m];
        return {
          question: `(MN) ∥ (BC) : AM = ${am} cm, AB = ${ab} cm, BC = ${bc} cm. MN = ?`,
          bonne: p * m,
          pieges: [[(bc * ab) / am, 'thales-rapport-inverse'], [bc - (ab - am), 'thales-difference']],
          unite: ' cm',
          positif: true,
        };
      },
    },
    {
      recit: 'Le tarif du coffre de location suit une fonction affine. Le cadenas veut l’image d’un nombre.',
      tirer: ({ entre, au }) => {
        const a = entre(2, 6);
        const b = entre(1, 9);
        const k = au([-5, -4, -3, -2, -1, 2, 3, 4, 5, 6]);
        return {
          question: `f(x) = ${a}x + ${b}. f(${ecrire(k)}) = ?`,
          bonne: a * k + b,
          pieges: [
            [(k - b) / a, 'fonction-image-antecedent'],
            k < 0 ? [-a * k + b, 'fonction-signe'] : [Number(`${a}${k}`) + b, 'substituer-coller'],
          ],
        };
      },
    },
    {
      recit: 'La serrure tourne une roue de boules deux fois de suite, en remettant la boule à chaque fois. Elle s’ouvre seulement sur deux rouges.',
      tirer: ({ entre, au }) => {
        const t = au([5, 10]);
        const r = entre(1, t - 1);
        const un = (r * 100) / t;
        return {
          question: `Urne : ${r} boule${pluriel(r)} rouge${pluriel(r)} sur ${t}. Deux tirages avec remise : deux rouges, en % ?`,
          bonne: (r * r * 100) / (t * t),
          pieges: [[un, 'proba-un-tirage'], ...(2 * un <= 100 ? [[2 * un, 'proba-additionner']] : [])],
          unite: ' %',
        };
      },
    },
    {
      recit: 'Le registre du gardien note les passages de la semaine. Le code est la médiane de la série.',
      tirer: ({ melanger }) => {
        const tous = melanger(Array.from({ length: 19 }, (_, i) => i + 2));
        const valeurs = tous.slice(0, 7);
        const rangees = [...valeurs].sort((u, v) => u - v);
        if (valeurs[3] === rangees[3]) [valeurs[0], valeurs[3]] = [valeurs[3], valeurs[0]];
        const somme = valeurs.reduce((s, v) => s + v, 0);
        return {
          question: `Série : ${valeurs.join(' ; ')}. Médiane ?`,
          bonne: rangees[3],
          pieges: [[valeurs[3], 'mediane-ranger'], [somme / 7, 'mediane-moyenne']],
        };
      },
    },
    {
      recit: 'Dernier obstacle : le conduit d’aération, en forme de triangle rectangle. Calcule le côté qui te manque pour t’y glisser.',
      tirer: ({ au }) => {
        const [x, y, c] = au(TRIPLETS);
        const [a, bonne] = au([true, false]) ? [x, y] : [y, x];
        return {
          question: `ABC rectangle en A : BC = ${c} cm, AB = ${a} cm. AC = ?`,
          bonne,
          pieges: [[c - a, 'pythagore-difference'], [`√${c * c + a * a}`, 'pythagore-hypotenuse']],
          unite: ' cm',
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
    if (typeof v === 'number' && !Number.isInteger(v)) return;
    if (brut.positif && typeof v === 'number' && v <= 0) return;
    const s = typeof v === 'number' ? ecrire(v) : v;
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

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const o = outils(graine);
  const classe = ETAPES[niveau] ? niveau : 'SIXIEME';
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
  // ------------------------------------------------ 6e : le coffre du pirate
  '6e-etape-1': 'Premier cadenas : fais ce calcul en respectant les priorités.',
  '6e-etape-2': 'Deuxième cadenas : calcule cette fraction du trésor.',
  '6e-etape-3': 'Troisième cadenas : partage les pièces, et garde le reste.',
  '6e-etape-4': 'Quatrième cadenas : trouve la longueur de la clôture.',
  '6e-etape-5': 'Cinquième cadenas : calcule l’aire de la voile.',
  '6e-etape-6': 'Dernier cadenas : applique ce pourcentage.',
  '6e-etape-1-regle': 'La multiplication passe avant l’addition : calcule d’abord le produit, puis ajoute.',
  '6e-etape-2-regle': 'Pour prendre une fraction d’une quantité, divise par le dénominateur, puis multiplie par le numérateur.',
  '6e-etape-3-regle': 'Cherche combien de fois le diviseur tient dans le nombre : ce qu’on ne peut plus partager, c’est le reste, toujours plus petit que le diviseur.',
  '6e-etape-4-regle': 'Le périmètre, c’est le tour de la figure : ajoute la longueur et la largeur, puis double le tout.',
  '6e-etape-5-regle': 'L’aire d’un triangle, c’est la base fois la hauteur, divisé par deux.',
  '6e-etape-6-regle': 'Prendre un pourcentage, c’est multiplier par le pourcentage puis diviser par cent : dix pour cent, c’est le dixième ; cinquante pour cent, la moitié.',
  'priorites-gauche-droite': 'On ne calcule pas de gauche à droite : la multiplication passe avant l’addition.',
  'fraction-une-part': 'Tu as trouvé une seule part. Multiplie-la ensuite par le numérateur pour avoir toutes les parts demandées.',
  'fraction-inverser': 'On divise par le dénominateur, le nombre du bas, et on multiplie par le numérateur, celui du haut : pas l’inverse.',
  'reste-pas-quotient': 'Ça, c’est le quotient : le nombre de pièces par pirate. Le reste, c’est ce qui reste quand chacun a reçu sa part.',
  'perimetre-moitie': 'Tu as fait la moitié du tour : un rectangle a deux longueurs et deux largeurs.',
  'perimetre-aire': 'Multiplier la longueur par la largeur donne l’aire, la surface. Le périmètre, c’est le tour : on additionne les côtés.',
  'aire-triangle-moitie': 'Base fois hauteur, c’est l’aire du rectangle. Le triangle en occupe la moitié : divise par deux.',
  'aire-pas-somme': 'Une aire ne s’obtient pas en additionnant : on multiplie la base par la hauteur, puis on divise par deux.',
  'pourcentage-soustraire': 'Un pourcentage ne se soustrait pas : il dit combien on prend sur cent. Multiplie par le pourcentage, puis divise par cent.',

  // ------------------------------------------- 5e : le sous-marin en panne
  '5e-etape-1': 'Premier cadenas : calcule la nouvelle profondeur avec les nombres relatifs.',
  '5e-etape-2': 'Deuxième cadenas : règle le moteur, en commençant par les parenthèses.',
  '5e-etape-3': 'Troisième cadenas : remplace la lettre par sa valeur, puis calcule.',
  '5e-etape-4': 'Quatrième cadenas : trouve le troisième angle du triangle.',
  '5e-etape-5': 'Cinquième cadenas : calcule la moyenne des relevés.',
  '5e-etape-6': 'Dernier cadenas : combien la pompe vide-t-elle dans ce temps ?',
  '5e-etape-1-regle': 'Pour ajouter deux nombres de signes contraires, soustrais leurs distances à zéro et garde le signe du plus éloigné de zéro.',
  '5e-etape-2-regle': 'D’abord les parenthèses, puis la multiplication, puis la soustraction.',
  '5e-etape-3-regle': 'Un nombre collé à la lettre la multiplie : remplace la lettre par sa valeur, multiplie, puis ajoute.',
  '5e-etape-4-regle': 'Dans un triangle, les trois angles font cent quatre-vingts degrés en tout : enlève les deux angles connus.',
  '5e-etape-5-regle': 'La moyenne, c’est la somme des valeurs divisée par le nombre de valeurs.',
  '5e-etape-6-regle': 'Cherche d’abord ce que la pompe vide en une minute, puis multiplie par le nombre de minutes.',
  'relatifs-ajouter-distances': 'Les signes sont contraires : on ne cumule pas, on soustrait les distances à zéro.',
  'relatifs-signe': 'Le bon écart, mais pas le bon signe : le résultat prend le signe du nombre le plus éloigné de zéro.',
  'priorites-parentheses': 'Les parenthèses passent avant tout : calcule la somme entre parenthèses, puis multiplie.',
  'substituer-coller': 'Un nombre collé à la lettre, c’est une multiplication : on ne colle pas les chiffres, on multiplie.',
  'substituer-ajouter': 'Le nombre devant la lettre la multiplie, il ne s’y ajoute pas.',
  'angles-trois-cent-soixante': 'Trois cent soixante degrés, c’est le tour complet. Les angles d’un triangle font cent quatre-vingts degrés.',
  'angles-oublier-un': 'Tu n’as enlevé qu’un angle : il faut retirer les deux angles connus.',
  'moyenne-diviser': 'Ça, c’est la somme. Pour la moyenne, divise-la par le nombre de valeurs.',
  'moyenne-extremes': 'La moyenne ne se calcule pas avec la plus petite et la plus grande valeur seulement : additionne toutes les valeurs, puis divise.',
  'proportion-ajouter': 'Dans une situation de proportionnalité, on n’ajoute pas l’écart : on multiplie. Cherche ce que la pompe vide en une minute.',
  'proportion-coefficient': 'Tu as multiplié sans diviser : cherche d’abord ce que la pompe vide en une seule minute.',

  // ------------------------------------------ 4e : le laboratoire verrouillé
  '4e-etape-1': 'Premier cadenas : trouve l’exposant de ce produit de puissances.',
  '4e-etape-2': 'Deuxième cadenas : multiplie ces nombres relatifs.',
  '4e-etape-3': 'Troisième cadenas : résous l’équation de la balance.',
  '4e-etape-4': 'Quatrième cadenas : calcule l’hypoténuse avec le théorème de Pythagore.',
  '4e-etape-5': 'Cinquième cadenas : calcule la vitesse moyenne du robot.',
  '4e-etape-6': 'Dernier cadenas : quelle est la probabilité de tirer une fiole rouge ?',
  '4e-etape-1-regle': 'Quand on multiplie deux puissances d’un même nombre, on ajoute les exposants.',
  '4e-etape-2-regle': 'Multiplie les distances à zéro, puis applique la règle des signes : deux signes pareils donnent plus, deux signes contraires donnent moins.',
  '4e-etape-3-regle': 'Enlève d’abord le nombre ajouté, des deux côtés, puis divise par le nombre devant x.',
  '4e-etape-4-regle': 'Le carré de l’hypoténuse est égal à la somme des carrés des deux autres côtés : ajoute les carrés, puis prends la racine carrée.',
  '4e-etape-5-regle': 'La vitesse, c’est la distance divisée par la durée en heures.',
  '4e-etape-6-regle': 'Une probabilité, c’est le nombre d’issues favorables divisé par le nombre total d’issues ; en pourcentage, on multiplie par cent.',
  'puissances-multiplier-exposants': 'On ne multiplie pas les exposants : pour un produit de puissances d’un même nombre, on les ajoute.',
  'relatifs-regle-des-signes': 'Le bon nombre, mais pas le bon signe : deux signes pareils donnent un produit positif, deux signes contraires un produit négatif.',
  'relatifs-multiplier': 'Tu as additionné : ici, c’est une multiplication. Multiplie les distances à zéro, puis applique la règle des signes.',
  'equation-changer-signe': 'Pour faire passer un nombre de l’autre côté, fais l’opération contraire des deux côtés : un nombre ajouté se soustrait, un nombre soustrait s’ajoute.',
  'equation-diviser': 'Le nombre devant x le multiplie : pour isoler x, divise, ne soustrais pas.',
  'pythagore-somme': 'On n’ajoute pas les côtés : on ajoute leurs carrés, puis on prend la racine carrée.',
  'pythagore-racine': 'Tu as trouvé le carré de l’hypoténuse. Il reste à prendre sa racine carrée.',
  'vitesse-multiplier': 'Une vitesse, c’est une distance divisée par une durée, pas multipliée.',
  'vitesse-minutes': 'Une vitesse en kilomètres par heure demande une durée en heures : convertis d’abord les minutes en heures.',
  'proba-sur-le-total': 'On divise par le nombre total de fioles, pas seulement par les fioles de l’autre couleur.',
  'proba-mauvaise-issue': 'Ça, c’est la probabilité de tirer une bleue. Compte les fioles rouges, puis divise par le total.',

  // ------------------------------------------------ 3e : la chambre forte
  '3e-etape-1': 'Premier cadenas : résous l’équation du clavier.',
  '3e-etape-2': 'Deuxième cadenas : calcule la longueur avec le théorème de Thalès.',
  '3e-etape-3': 'Troisième cadenas : calcule l’image par la fonction affine.',
  '3e-etape-4': 'Quatrième cadenas : calcule la probabilité de ces deux tirages.',
  '3e-etape-5': 'Cinquième cadenas : trouve la médiane de la série.',
  '3e-etape-6': 'Dernier cadenas : calcule le côté qui manque au triangle rectangle.',
  '3e-etape-1-regle': 'Regroupe les x d’un côté et les nombres de l’autre, puis divise par le nombre devant x.',
  '3e-etape-2-regle': 'Avec Thalès, les rapports sont égaux : AM sur AB égale MN sur BC. Multiplie BC par AM, puis divise par AB.',
  '3e-etape-3-regle': 'L’image d’un nombre, c’est f de ce nombre : remplace x par la valeur donnée, multiplie, puis ajoute.',
  '3e-etape-4-regle': 'Sur un arbre, on multiplie les probabilités le long d’une branche : la probabilité d’une rouge, fois elle-même.',
  '3e-etape-5-regle': 'Range d’abord les valeurs dans l’ordre croissant : la médiane est celle du milieu.',
  '3e-etape-6-regle': 'Le carré du côté cherché, c’est le carré de l’hypoténuse moins le carré de l’autre côté ; puis on prend la racine carrée.',
  'equation-regrouper': 'Pour regrouper les x, on soustrait le terme en x des deux côtés : on ne l’ajoute pas.',
  'thales-rapport-inverse': 'Les rapports sont à l’envers : on met le petit triangle sur le grand. AM sur AB, c’est MN sur BC.',
  'thales-difference': 'Thalès, c’est de la proportionnalité, pas une différence : on ne retranche pas l’écart, on multiplie par le rapport.',
  'fonction-image-antecedent': 'Ça, c’est un antécédent : le nombre qui a pour image la valeur donnée. Ici, on cherche l’image : remplace x et calcule.',
  'fonction-signe': 'Attention au signe : x est négatif, donc le produit aussi. Garde le moins jusqu’au bout.',
  'proba-un-tirage': 'Ça, c’est la probabilité pour un seul tirage. Pour deux tirages, on multiplie les deux probabilités.',
  'proba-additionner': 'Le long d’une branche, on n’additionne pas : on multiplie les probabilités.',
  'mediane-ranger': 'Tu as pris la valeur du milieu sans ranger : range d’abord la série dans l’ordre croissant.',
  'mediane-moyenne': 'Ça, c’est la moyenne. La médiane partage la série rangée en deux moitiés de même effectif.',
  'pythagore-difference': 'On ne soustrait pas les côtés : on soustrait leurs carrés, puis on prend la racine carrée.',
  'pythagore-hypotenuse': 'L’hypoténuse est déjà connue, c’est le côté opposé à l’angle droit : soustrais les carrés, ne les ajoute pas.',
};
