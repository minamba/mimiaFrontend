/**
 * LA RECETTE — la proportionnalité, de la 6e à la 4e.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   6e : MATH_6E_PROP_RECONNAITRE, MATH_6E_PROP_COEFF, MATH_6E_PROP_POURCENT,
 *        MATH_6E_PROP_ECHELLE
 *   5e : MATH_5E_PROP_QUATRIEME, MATH_5E_PROP_POURCENT, MATH_5E_PROP_ECHELLE
 *   4e : MATH_4E_PROP_VITESSE, MATH_4E_PROP_POURCENT, MATH_4E_MES_COMPOSEES
 *
 * EN 6e (2 + 2 + 2 + 2) :
 *   - PROPORTIONNEL OU PAS ? LES PIÈGES : ne vérifier que la première colonne,
 *     croire que « les deux augmentent » suffit ;
 *   - LE COEFFICIENT : LE PIÈGE, ajouter au lieu de multiplier ;
 *   - LE POURCENTAGE : 20 % de 70. LES PIÈGES, diviser par 20, retirer 20 ;
 *   - L'ÉCHELLE : LE PIÈGE, se tromper d'unité (un facteur dix).
 *
 * EN 5e (3 + 3 + 2) :
 *   - LA QUATRIÈME PROPORTIONNELLE (achats, agrandissement). LES PIÈGES :
 *     ajouter l'écart, oublier de passer par l'unité ;
 *   - LES POURCENTAGES : un prix soldé, un pourcentage à trouver. LES PIÈGES :
 *     retirer le pourcentage comme des euros, donner la réduction pour le
 *     prix, prendre l'effectif pour le pourcentage ;
 *   - L'ÉCHELLE D'UNE CARTE, en kilomètres.
 *
 * EN 4e (3 + 3 + 2) :
 *   - LES VITESSES : LE PIÈGE, lire 2 h 30 min comme 2,30 h ;
 *   - LES POURCENTAGES ENCHAÎNÉS : +20 % puis −20 % ne ramène pas au départ ;
 *     deux hausses ne s'additionnent pas ; le coefficient multiplicateur ;
 *   - LES GRANDEURS COMPOSÉES : km/h en m/s, énergie en kWh, débit en L/min.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'recette-college', titre: 'La recette', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'La recette',
    accroche: 'Proportionnel ou pas ? Et à l’échelle ?',
    competences: ['MATH_6E_PROP_RECONNAITRE', 'MATH_6E_PROP_COEFF', 'MATH_6E_PROP_POURCENT', 'MATH_6E_PROP_ECHELLE'],
  },
  CINQUIEME: {
    titre: 'La recette',
    accroche: 'Soldes, cartes, quatrième proportionnelle.',
    competences: ['MATH_5E_PROP_QUATRIEME', 'MATH_5E_PROP_POURCENT', 'MATH_5E_PROP_ECHELLE'],
  },
  QUATRIEME: {
    titre: 'La recette',
    accroche: 'Vitesses, débits, pourcentages enchaînés.',
    competences: ['MATH_4E_PROP_VITESSE', 'MATH_4E_PROP_POURCENT', 'MATH_4E_MES_COMPOSEES'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** Espace insécable, devant une unité ; espace fine, entre les milliers. */
const NB = ' ';
const FINE = ' ';

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/** Une manche à choix : la bonne réponse, ses pièges nommés, des voisins si deux se confondent. */
function manche(melanger, {
  consigne, question, bonne, pieges = [], voisin,
}) {
  const b = String(bonne);
  const valides = pieges.filter(([v]) => v !== null && String(v) !== b);
  const liste = troisChoix(b, valides.map(([v]) => String(v)), (k) => String(voisin(k)));
  const table = {};
  valides.forEach(([v, phrase]) => {
    const c = String(v);
    if (liste.includes(c) && !(c in table)) table[c] = phrase;
  });
  return {
    consigne, question, choix: cartes(melanger(liste)), bonne: b, pieges: table,
  };
}

const net = (x) => Math.round(x * 1e6) / 1e6;

/** « 4,5 », « 25 000 » : un nombre à la française. */
export function nombre(x) {
  const v = net(x);
  const [ent, dec] = String(Math.abs(v)).split('.');
  const groupe = ent.length > 4 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, FINE) : ent;
  return `${v < 0 ? '−' : ''}${groupe}${dec ? `,${dec}` : ''}`;
}

/** Un nombre et son unité, sans coupure entre les deux. Null si le nombre est négatif ou nul. */
const avec = (x, unite) => (x > 0 ? `${nombre(x)}${NB}${unite}` : null);

/** Des centimes en euros : « 12 € », « 7,50 € ». */
function euros(centimes) {
  if (!(centimes > 0) || !Number.isInteger(centimes)) return null;
  if (centimes % 100 === 0) return `${centimes / 100}${NB}€`;
  return `${(centimes / 100).toFixed(2).replace('.', ',')}${NB}€`;
}

/** Un décimal qui s'écrit avec au plus deux chiffres après la virgule. */
const court = (x) => Number.isInteger(net(x * 100));

/* ---------------------------------------------------------------- 6e */

const GRANDEURS = [
  ['Masse (kg)', 'Prix (€)'],
  ['Nombre de tickets', 'Prix (€)'],
  ['Durée (h)', 'Distance (km)'],
  ['Nombre de gâteaux', 'Farine (g)'],
];

function proportionnel6(sorte, { entre, au, melanger }) {
  const [x, y] = au(GRANDEURS);
  const valeurs = melanger([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 3).sort((p, q) => p - q);
  const k = entre(2, 9);
  let image;
  if (sorte === 'proportionnel') image = valeurs.map((v) => v * k);
  else if (sorte === 'presque') image = valeurs.map((v, i) => v * k + (i === 2 ? 1 : 0));
  else image = valeurs.map((v) => v + k);
  const bonne = sorte === 'proportionnel' ? 'oui' : 'non';
  let piege = 'quotient-constant';
  if (sorte === 'presque') piege = 'verifier-chaque-colonne';
  if (sorte === 'additif') piege = 'augmenter-ensemble';
  return {
    consigne: 'proportionnel',
    question: `${x} : ${valeurs.join(' ; ')}. ${y} : ${image.join(' ; ')}. Proportionnel ?`,
    choix: [{ cle: 'oui', libelle: 'Oui' }, { cle: 'non', libelle: 'Non' }],
    bonne,
    pieges: { [bonne === 'oui' ? 'non' : 'oui']: piege },
  };
}

function coefficient6({ entre, melanger }) {
  const a = entre(2, 9);
  let b = entre(2, 12);
  if (b === a) b += 1;
  const k = entre(2, 9);
  return manche(melanger, {
    consigne: 'coefficient',
    question: `Quantité : ${a} et ${b}. Prix (€) : ${a * k} et ?`,
    bonne: b * k,
    pieges: [[b + a * k - a, 'ajouter-pas-multiplier']],
    voisin: (j) => b * k + j * k,
  });
}

function pourcentage6({ entre, au, melanger }) {
  const p = au([10, 20, 25, 50, 75]);
  const pas = 100 / pgcd(p, 100);
  const n = pas * entre(Math.ceil(20 / pas), Math.floor(200 / pas));
  const bonne = (p * n) / 100;
  return manche(melanger, {
    consigne: 'pourcentage',
    question: `${p} % de ${n} = ?`,
    bonne: nombre(bonne),
    pieges: [
      [court(n / p) ? nombre(n / p) : null, 'diviser-par-le-pourcentage'],
      [n - p > 0 ? nombre(n - p) : null, 'soustraire-le-pourcentage'],
    ],
    voisin: (j) => nombre(bonne + j),
  });
}

function pgcd(a, b) { return b === 0 ? a : pgcd(b, a % b); }

function echelle6({ entre, au, melanger }) {
  const n = au([50, 100, 200, 250, 500]);
  const l = entre(2, 12);
  const reel = (l * n) / 100;
  return manche(melanger, {
    consigne: 'echelle',
    question: `Plan à l’échelle 1/${n} : un mur mesure ${l} cm sur le plan. Longueur réelle ?`,
    bonne: avec(reel, 'm'),
    pieges: [[avec(reel * 10, 'm'), 'convertir-les-unites'], [avec(reel / 10, 'm'), 'convertir-les-unites']],
    voisin: (j) => avec(reel + j, 'm'),
  });
}

/* ---------------------------------------------------------------- 5e */

const ACHATS = ['cahiers', 'stylos', 'croissants', 'baguettes', 'places de cinéma', 'tickets de bus'];

function quatrieme5(agrandir, { entre, au, melanger }) {
  if (agrandir) {
    const r = au([1.5, 2, 3]);
    const l = au([2, 4, 6, 8]);
    const lo = l + 2 * entre(1, 3);
    const lo2 = lo * r;
    return manche(melanger, {
      consigne: 'quatrieme',
      question: `Un rectangle de ${l} cm sur ${lo} cm est agrandi : sa longueur passe de ${lo} cm à ${nombre(lo2)} cm. Que devient sa largeur ?`,
      bonne: avec(l * r, 'cm'),
      pieges: [[avec(l + lo2 - lo, 'cm'), 'ajouter-pas-multiplier'], [avec(lo2, 'cm'), 'quatrieme-regle']],
      voisin: (j) => avec(l * r + j, 'cm'),
    });
  }
  const objet = au(ACHATS);
  const u = au([40, 50, 60, 75, 80, 120, 125, 150, 250]);
  const a = entre(2, 6);
  let b = entre(2, 12);
  if (b === a) b += 1;
  return manche(melanger, {
    consigne: 'quatrieme',
    question: `${a} ${objet} coûtent ${euros(a * u)}. Combien coûtent ${b} ${objet} ?`,
    bonne: euros(b * u),
    pieges: [[euros(a * u + (b - a) * 100), 'ajouter-pas-multiplier'], [euros(a * u * b), 'unitaire-d-abord']],
    voisin: (j) => euros(b * u + 10 * j),
  });
}

function solde5({ entre, au, melanger }) {
  const p = au([10, 20, 25, 30, 40]);
  const n = 10 * entre(2, 20);
  return manche(melanger, {
    consigne: 'pourcentage',
    question: `Un article à ${n} € est soldé de ${p} %. Nouveau prix ?`,
    bonne: euros(n * (100 - p)),
    pieges: [[euros((n - p) * 100), 'soustraire-le-pourcentage'], [euros(n * p), 'reduction-pas-prix']],
    voisin: (j) => euros(n * (100 - p) + 100 * j),
  });
}

function quelPourcentage5({ entre, au, melanger }) {
  const total = au([20, 25, 50]);
  const part = entre(1, total - 1);
  const p = (part * 100) / total;
  return manche(melanger, {
    consigne: 'pourcentage',
    question: `${part} élèves sur ${total} font du sport. Quel pourcentage ?`,
    bonne: `${p}${NB}%`,
    pieges: [[`${part}${NB}%`, 'pourcentage-sur-cent']],
    voisin: (j) => `${p + j}${NB}%`,
  });
}

function carte5({ entre, au, melanger }) {
  const n = au([25000, 50000, 100000, 200000]);
  const l = entre(1, 12);
  const km = (l * n) / 100000;
  return manche(melanger, {
    consigne: 'echelle',
    question: `Carte à l’échelle 1/${nombre(n)} : ${l} cm sur la carte. Distance réelle ?`,
    bonne: avec(km, 'km'),
    pieges: [[avec(km * 10, 'km'), 'convertir-les-unites'], [avec(km / 10, 'km'), 'convertir-les-unites']],
    voisin: (j) => avec(km + j, 'km'),
  });
}

/* ---------------------------------------------------------------- 4e */

const duree = (h, m) => `${h}${NB}h${NB}${m}${NB}min`;

function vitesse4(sorte, { entre, au, melanger }) {
  const m = au([15, 30, 45]);
  const h = entre(1, 3);
  const t = h + m / 60;
  if (sorte === 'distance') {
    const v = au([60, 80, 100, 120]);
    return manche(melanger, {
      consigne: 'vitesse',
      question: `Un train roule à ${v} km/h pendant ${duree(h, m)}. Distance parcourue ?`,
      bonne: avec(v * t, 'km'),
      pieges: [[avec(v * (h + m / 100), 'km'), 'heures-decimales'], [avec(v * h + m, 'km'), 'vitesse-regle']],
      voisin: (j) => avec(v * t + 10 * j, 'km'),
    });
  }
  if (sorte === 'vitesse') {
    const v = au([12, 16, 20, 24, 36, 40]);
    const d = v * t;
    return manche(melanger, {
      consigne: 'vitesse',
      question: `Un cycliste parcourt ${nombre(d)} km en ${duree(h, m)}. Vitesse moyenne ?`,
      bonne: avec(v, 'km/h'),
      pieges: [[avec(d * t, 'km/h'), 'distance-sur-temps']],
      voisin: (j) => avec(v + 2 * j, 'km/h'),
    });
  }
  // 'temps'
  const v = au([40, 60, 80, 100, 120]);
  const d = v * t;
  const faux = Math.round((m / 60) * 100);
  return manche(melanger, {
    consigne: 'vitesse',
    question: `Combien de temps faut-il pour parcourir ${nombre(d)} km à ${v} km/h ?`,
    bonne: duree(h, m),
    pieges: [[duree(h, faux), 'heures-decimales']],
    voisin: (j) => duree(h + j, m),
  });
}

function pourcentages4(sorte, { au, melanger }) {
  if (sorte === 'aller-retour') {
    let p;
    let n;
    do {
      p = au([10, 20, 25, 50]);
      n = au([50, 100, 200, 300, 400]);
    } while (!Number.isInteger((n * (10000 - p * p)) / 100));
    const final = (n * (10000 - p * p)) / 100;
    return manche(melanger, {
      consigne: 'pourcentages',
      question: `Un prix de ${n} € augmente de ${p} %, puis baisse de ${p} %. Prix final ?`,
      bonne: euros(final),
      pieges: [[euros(n * 100), 'hausse-baisse-pas-nulle'], [euros(n * (100 + p)), 'pourcentages-regle']],
      voisin: (j) => euros(final - 100 * j),
    });
  }
  if (sorte === 'deux-hausses') {
    const [a, b] = melanger([10, 20, 30, 50]).slice(0, 2);
    const total = a + b + (a * b) / 100;
    return manche(melanger, {
      consigne: 'pourcentages',
      question: `Un prix augmente de ${a} %, puis de ${b} %. Hausse totale ?`,
      bonne: `${nombre(total)}${NB}%`,
      pieges: [[`${a + b}${NB}%`, 'additionner-pourcentages']],
      voisin: (j) => `${nombre(total + j)}${NB}%`,
    });
  }
  // 'coefficient'
  const p = au([3, 5, 12, 15, 20, 35]);
  const baisse = au([true, false]);
  const bonne = baisse ? 1 - p / 100 : 1 + p / 100;
  const contraire = baisse ? 1 + p / 100 : 1 - p / 100;
  return manche(melanger, {
    consigne: 'pourcentages',
    question: `${baisse ? 'Baisser' : 'Augmenter'} de ${p} %, c’est multiplier par… ?`,
    bonne: nombre(bonne),
    pieges: [[nombre(p / 100), 'coefficient-part'], [nombre(contraire), 'hausse-ou-baisse']],
    voisin: (j) => nombre(bonne + j / 10),
  });
}

function composee4(sorte, { entre, au, melanger }) {
  if (sorte === 'kmh') {
    const v = au([18, 36, 54, 72, 90, 108]);
    return manche(melanger, {
      consigne: 'composee',
      question: `${v} km/h = ? m/s`,
      bonne: nombre(v / 3.6),
      pieges: [[nombre(v * 3.6), 'diviser-par-trois-six'], [nombre(v * 1000), 'convertir-temps-aussi']],
      voisin: (j) => nombre(v / 3.6 + j),
    });
  }
  if (sorte === 'debit') {
    const q = au([6, 8, 12, 15, 20]);
    const m = au([15, 30, 45]);
    const h = entre(1, 2);
    const minutes = 60 * h + m;
    return manche(melanger, {
      consigne: 'composee',
      question: `Un robinet débite ${q} L/min. Combien de litres coulent en ${duree(h, m)} ?`,
      bonne: nombre(q * minutes),
      pieges: [[nombre(q * (h + m / 60)), 'debit-minutes'], [nombre(q * (100 * h + m)), 'heures-decimales']],
      voisin: (j) => nombre(q * minutes + 10 * j),
    });
  }
  const p = au([2, 3, 4]);
  const m = au([15, 30, 45]);
  const h = entre(1, 3);
  const e = p * (h + m / 60);
  return manche(melanger, {
    consigne: 'composee',
    question: `Un radiateur de ${p} kW fonctionne ${duree(h, m)}. Énergie consommée, en kWh ?`,
    bonne: nombre(e),
    pieges: [[nombre(p * (h + m / 100)), 'heures-decimales'], [nombre(p * (60 * h + m)), 'duree-en-heures']],
    voisin: (j) => nombre(e + j),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const t = outils(graine);
  const { melanger } = t;
  let liste;
  if (niveau === 'QUATRIEME') {
    liste = [
      ...melanger(['distance', 'vitesse', 'temps']).map((s) => vitesse4(s, t)),
      ...melanger(['aller-retour', 'deux-hausses', 'coefficient']).map((s) => pourcentages4(s, t)),
      ...melanger(['kmh', 'energie', 'debit']).slice(0, 2).map((s) => composee4(s, t)),
    ];
  } else if (niveau === 'CINQUIEME') {
    liste = [
      quatrieme5(false, t), quatrieme5(false, t), quatrieme5(true, t),
      solde5(t), solde5(t), quelPourcentage5(t),
      carte5(t), carte5(t),
    ];
  } else {
    const [s1, s2] = melanger(['proportionnel', 'presque', 'additif']);
    liste = [
      proportionnel6(s1, t), proportionnel6(s2, t),
      coefficient6(t), coefficient6(t),
      pourcentage6(t), pourcentage6(t),
      echelle6(t), echelle6(t),
    ];
  }
  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  proportionnel: 'Ce tableau est-il un tableau de proportionnalité ?',
  coefficient: 'Trouve le nombre qui manque dans ce tableau de proportionnalité.',
  pourcentage: 'Calcule ce pourcentage.',
  echelle: 'Retrouve la vraie longueur grâce à l’échelle.',
  quatrieme: 'Trouve la quantité qui manque, en restant proportionnel.',
  vitesse: 'Vitesse, distance, durée : calcule ce qui manque.',
  pourcentages: 'Attention, les pourcentages s’enchaînent.',
  composee: 'Convertis ou calcule cette grandeur.',

  'quotient-constant': 'Divise chaque nombre du bas par celui du haut : si tu trouves toujours le même quotient, c’est proportionnel.',
  'verifier-chaque-colonne': 'Vérifie toutes les colonnes, pas seulement la première : une seule colonne qui ne suit pas, et ce n’est plus proportionnel.',
  'augmenter-ensemble': 'Augmenter ensemble ne suffit pas : il faut multiplier par le même nombre à chaque colonne.',
  'ajouter-pas-multiplier': 'En proportionnalité, on multiplie toujours par le même nombre : on n’ajoute pas.',
  'diviser-par-le-pourcentage': 'Prendre un pourcentage, c’est multiplier par ce nombre, puis diviser par cent.',
  'soustraire-le-pourcentage': 'Un pourcentage n’est pas un nombre d’euros à retirer : calcule d’abord le pourcentage de la quantité.',
  'convertir-les-unites': 'Attention aux unités : convertis les centimètres en mètres ou en kilomètres, en comptant bien les zéros.',
  'unitaire-d-abord': 'Passe par l’unité : divise d’abord pour trouver le prix d’un seul, puis multiplie.',
  'reduction-pas-prix': 'Tu as calculé la réduction : enlève-la au prix de départ pour avoir le nouveau prix.',
  'pourcentage-sur-cent': 'Un pourcentage, c’est une part sur cent : ramène l’effectif total à cent.',
  'heures-decimales': 'Les minutes ne sont pas des centièmes d’heure : divise-les par soixante. Une demi-heure, c’est zéro virgule cinq heure.',
  'distance-sur-temps': 'La vitesse, c’est la distance divisée par la durée, pas multipliée.',
  'hausse-baisse-pas-nulle': 'La baisse se calcule sur le prix déjà augmenté, plus grand : on ne revient pas au prix de départ.',
  'additionner-pourcentages': 'Deux hausses ne s’additionnent pas : la deuxième s’applique au prix déjà augmenté. Multiplie les coefficients.',
  'coefficient-part': 'Ce nombre ne donne que la variation. Pour le nouveau prix, pars de cent pour cent : ajoute la hausse ou retire la baisse, puis divise par cent.',
  'hausse-ou-baisse': 'Une baisse donne un coefficient plus petit que un ; une hausse, un coefficient plus grand que un.',
  'diviser-par-trois-six': 'Pour passer des kilomètres par heure aux mètres par seconde, on divise par trois virgule six, on ne multiplie pas.',
  'convertir-temps-aussi': 'Convertis les deux unités : les kilomètres en mètres, et aussi les heures en secondes.',
  'debit-minutes': 'Le débit est en litres par minute : compte la durée en minutes, une heure fait soixante minutes.',
  'duree-en-heures': 'La puissance est en kilowatts et l’énergie en kilowattheures : la durée doit être en heures, pas en minutes.',

  'proportionnel-regle': 'Cherche le nombre par lequel on multiplie chaque colonne : il doit être toujours le même.',
  'coefficient-regle': 'Trouve le coefficient en divisant le prix par la quantité, puis multiplie.',
  'pourcentage-regle': 'Un pourcentage, c’est une fraction sur cent : multiplie, puis divise par cent.',
  'echelle-regle': 'Multiplie la longueur sur le plan par le nombre de l’échelle, puis convertis.',
  'quatrieme-regle': 'Cherche par combien on multiplie, ou passe par l’unité, et applique-le à l’autre grandeur.',
  'vitesse-regle': 'La distance, c’est la vitesse fois la durée, la durée écrite en heures.',
  'pourcentages-regle': 'Chaque pourcentage s’applique au résultat du précédent : multiplie les coefficients.',
  'composee-regle': 'Convertis chaque unité, une par une, et vérifie l’ordre de grandeur.',
};
