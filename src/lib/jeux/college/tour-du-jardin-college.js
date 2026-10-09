/**
 * LE TOUR DU JARDIN — périmètres, aires, volumes, de la 6e à la 3e.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   6e : MATH_6E_MES_PERIMETRE, MATH_6E_MES_AIRE, MATH_6E_MES_VOLUME
 *   5e : MATH_5E_MES_AIRE_PARAL, MATH_5E_MES_AIRE_DISQUE, MATH_5E_MES_VOLUME,
 *        MATH_5E_MES_CONVERSION
 *   3e : MATH_3E_MES_SPHERE, MATH_3E_MES_COMPOSEES
 *
 * L'unité est dans la question (« Périmètre en cm ? »), les choix sont des
 * nombres : l'unité ne trahit pas la bonne réponse. Avec π, la question dit
 * toujours la forme attendue : « arrondi au dixième », « à l'unité » ou
 * « en fonction de π ».
 *
 * EN 6e (3 + 3 + 2) :
 *   - LE PÉRIMÈTRE : LES PIÈGES, calculer l'aire, oublier des côtés ;
 *   - L'AIRE : LES PIÈGES, calculer le périmètre, oublier la moitié du triangle ;
 *   - LE VOLUME DU PAVÉ : LES PIÈGES, l'aire des faces, la somme des dimensions.
 *
 * EN 5e (2 + 2 + 2 + 2) :
 *   - PARALLÉLOGRAMME ET TRIANGLE : LE PIÈGE, le côté oblique pris pour la hauteur ;
 *   - LE DISQUE : LES PIÈGES, confondre aire et périmètre, rayon et diamètre ;
 *   - PRISME ET CYLINDRE : aire de la base fois hauteur ;
 *   - LES CONVERSIONS D'AIRES (× 100) ET DE VOLUMES (× 1 000), et les litres.
 *
 * EN 3e (2 + 3 + 3) :
 *   - L'AIRE DE LA SPHÈRE, 4πr² : LES PIÈGES, oublier le 4, donner le volume ;
 *   - LE VOLUME DE LA BOULE, 4/3 πr³ : LES PIÈGES, l'aire, le diamètre pris
 *     pour le rayon, oublier 4/3 ;
 *   - LES GRANDEURS COMPOSÉES : km/h et m/s, litres par seconde et m³ par heure.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'tour-du-jardin-college', titre: 'Le tour du jardin', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le tour du jardin',
    accroche: 'Périmètre, aire et volume du pavé.',
    competences: ['MATH_6E_MES_PERIMETRE', 'MATH_6E_MES_AIRE', 'MATH_6E_MES_VOLUME'],
  },
  CINQUIEME: {
    titre: 'Le tour du jardin',
    accroche: 'Disques, prismes, cylindres, conversions.',
    competences: ['MATH_5E_MES_AIRE_PARAL', 'MATH_5E_MES_AIRE_DISQUE', 'MATH_5E_MES_VOLUME', 'MATH_5E_MES_CONVERSION'],
  },
  TROISIEME: {
    titre: 'Le tour du jardin',
    accroche: 'La sphère, la boule, les vitesses.',
    competences: ['MATH_3E_MES_SPHERE', 'MATH_3E_MES_COMPOSEES'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

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

/** Arrondi au dixième, toujours écrit avec son chiffre après la virgule : « 78,5 », « 50,0 ». */
const auDixieme = (x) => (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
const aLUnite = (x) => nombre(Math.round(x));
/** « 36π ». */
const pi = (k) => (Number.isInteger(k) && k > 0 ? `${nombre(k)}π` : null);

/* ---------------------------------------------------------------- 6e */

function perimetre6(sorte, { entre, melanger }) {
  if (sorte === 'carre') {
    let c = entre(2, 15);
    if (c === 4) c = 5;
    return manche(melanger, {
      consigne: 'perimetre',
      question: `Carré de côté ${c} cm. Périmètre en cm ?`,
      bonne: 4 * c,
      pieges: [[c * c, 'aire-ou-perimetre'], [2 * c, 'perimetre-tous-les-cotes']],
      voisin: (k) => 4 * c + k,
    });
  }
  if (sorte === 'triangle') {
    let a;
    let b;
    let c;
    do {
      [a, b, c] = [entre(3, 15), entre(3, 15), entre(3, 15)];
    } while (a + b <= c || a + c <= b || b + c <= a);
    return manche(melanger, {
      consigne: 'perimetre',
      question: `Triangle de côtés ${a} cm, ${b} cm et ${c} cm. Périmètre en cm ?`,
      bonne: a + b + c,
      pieges: [[a + b, 'perimetre-tous-les-cotes']],
      voisin: (k) => a + b + c + k,
    });
  }
  const l = entre(2, 12);
  const lo = l + entre(1, 10);
  return manche(melanger, {
    consigne: 'perimetre',
    question: `Rectangle de ${lo} cm sur ${l} cm. Périmètre en cm ?`,
    bonne: 2 * (lo + l),
    pieges: [[lo * l, 'aire-ou-perimetre'], [lo + l, 'perimetre-tous-les-cotes']],
    voisin: (k) => 2 * (lo + l) + k,
  });
}

function aire6(sorte, { entre, melanger }) {
  if (sorte === 'rectangle') {
    const l = entre(2, 12);
    const lo = l + entre(1, 10);
    return manche(melanger, {
      consigne: 'aire',
      question: `Rectangle de ${lo} cm sur ${l} cm. Aire en cm² ?`,
      bonne: lo * l,
      pieges: [[2 * (lo + l), 'aire-ou-perimetre'], [lo + l, 'aire-regle']],
      voisin: (k) => lo * l + k,
    });
  }
  const b = 2 * entre(2, 8);
  const h = entre(3, 12);
  const question = sorte === 'triangle-rectangle'
    ? `Triangle rectangle : les côtés de l’angle droit mesurent ${b} cm et ${h} cm. Aire en cm² ?`
    : `Triangle : base ${b} cm, hauteur ${h} cm. Aire en cm² ?`;
  return manche(melanger, {
    consigne: 'aire',
    question,
    bonne: (b * h) / 2,
    pieges: [[b * h, 'triangle-moitie'], [b + h, 'aire-regle']],
    voisin: (k) => (b * h) / 2 + k,
  });
}

function volume6({ entre, melanger }) {
  const [lo, l, h] = [entre(3, 12), entre(2, 9), entre(2, 9)];
  return manche(melanger, {
    consigne: 'volume',
    question: `Pavé droit de ${lo} cm × ${l} cm × ${h} cm. Volume en cm³ ?`,
    bonne: lo * l * h,
    pieges: [[2 * (lo * l + l * h + lo * h), 'volume-ou-aire'], [lo + l + h, 'volume-multiplier']],
    voisin: (k) => lo * l * h + k,
  });
}

/* ---------------------------------------------------------------- 5e */

function aire5(sorte, { entre, melanger }) {
  const b = 2 * entre(2, 8);
  const h = entre(2, 9);
  const c = h + entre(1, 5);
  if (sorte === 'parallelogramme') {
    return manche(melanger, {
      consigne: 'aire',
      question: `Parallélogramme : base ${b} cm, côté oblique ${c} cm, hauteur ${h} cm. Aire en cm² ?`,
      bonne: b * h,
      pieges: [[b * c, 'hauteur-pas-cote'], [2 * (b + c), 'aire-ou-perimetre']],
      voisin: (k) => b * h + k,
    });
  }
  return manche(melanger, {
    consigne: 'aire',
    question: `Triangle : base ${b} cm, autre côté ${c} cm, hauteur ${h} cm. Aire en cm² ?`,
    bonne: (b * h) / 2,
    pieges: [[b * h, 'triangle-moitie'], [(b * c) / 2, 'hauteur-pas-cote']],
    voisin: (k) => (b * h) / 2 + k,
  });
}

function disque5(sorte, { entre, melanger }) {
  if (sorte === 'aire') {
    let d = 2 * entre(3, 10);
    if (d === 4) d = 6;
    const r = d / 2;
    return manche(melanger, {
      consigne: 'disque',
      question: `Disque de diamètre ${d} cm. Aire en cm², arrondie au dixième ?`,
      bonne: auDixieme(Math.PI * r * r),
      pieges: [[auDixieme(Math.PI * d * d), 'rayon-ou-diametre'], [auDixieme(Math.PI * d), 'aire-ou-perimetre']],
      voisin: (k) => auDixieme(Math.PI * r * r + k),
    });
  }
  let r = entre(3, 12);
  if (r === 2) r = 3;
  return manche(melanger, {
    consigne: 'disque',
    question: `Cercle de rayon ${r} cm. Périmètre en cm, en fonction de π ?`,
    bonne: pi(2 * r),
    pieges: [[pi(r * r), 'aire-ou-perimetre'], [pi(r), 'perimetre-cercle']],
    voisin: (k) => pi(2 * r + k),
  });
}

function volume5(sorte, { entre, melanger }) {
  if (sorte === 'prisme') {
    const a = 2 * entre(2, 6);
    const b = entre(3, 9);
    const h = entre(3, 15);
    return manche(melanger, {
      consigne: 'volume-5e',
      question: `Prisme droit : sa base est un triangle rectangle de côtés ${a} cm et ${b} cm autour de l’angle droit ; hauteur ${h} cm. Volume en cm³ ?`,
      bonne: (a * b * h) / 2,
      pieges: [[a * b * h, 'triangle-moitie'], [(a * b) / 2 + h, 'volume-base-fois-hauteur']],
      voisin: (k) => (a * b * h) / 2 + k,
    });
  }
  const r = entre(2, 9);
  const h = entre(3, 15);
  return manche(melanger, {
    consigne: 'volume-5e',
    question: `Cylindre : rayon ${r} cm, hauteur ${h} cm. Volume en cm³, arrondi à l’unité ?`,
    bonne: aLUnite(Math.PI * r * r * h),
    pieges: [[aLUnite(2 * Math.PI * r * h), 'volume-ou-aire'], [aLUnite(r * r * h), 'volume-base-fois-hauteur']],
    voisin: (k) => aLUnite(Math.PI * r * r * h + k),
  });
}

const AIRES = [['m²', 'dm²', 100], ['dm²', 'cm²', 100], ['cm²', 'mm²', 100], ['m²', 'cm²', 10000]];

function conversion5(sorte, { entre, au, melanger }) {
  if (sorte === 'aire') {
    const [grande, petite, f] = au(AIRES);
    const pas = f === 100 ? 10 : 100;
    if (au([true, false])) {
      const x = entre(2, 99) / 10;
      return manche(melanger, {
        consigne: 'conversion',
        question: `${nombre(x)} ${grande} = ? ${petite}`,
        bonne: nombre(x * f),
        pieges: [[nombre(x * pas), 'conversion-aire'], [nombre(x * f * 10), 'conversion-aire']],
        voisin: (k) => nombre(x * f + k),
      });
    }
    const y = entre(2, 99) * (f / 10);
    return manche(melanger, {
      consigne: 'conversion',
      question: `${nombre(y)} ${petite} = ? ${grande}`,
      bonne: nombre(y / f),
      pieges: [[nombre(y / pas), 'conversion-aire'], [nombre(y / (f * 10)), 'conversion-aire']],
      voisin: (k) => nombre(y / f + k),
    });
  }
  if (sorte === 'litres') {
    const y = 100 * entre(2, 99);
    return manche(melanger, {
      consigne: 'conversion',
      question: `${nombre(y)} cm³ = ? L`,
      bonne: nombre(y / 1000),
      pieges: [[nombre(y / 100), 'litre-decimetre-cube'], [nombre(y / 10), 'litre-decimetre-cube']],
      voisin: (k) => nombre(y / 1000 + k),
    });
  }
  const [grande, petite] = au([['dm³', 'cm³'], ['m³', 'dm³']]);
  const x = entre(2, 99) / 10;
  return manche(melanger, {
    consigne: 'conversion',
    question: `${nombre(x)} ${grande} = ? ${petite}`,
    bonne: nombre(x * 1000),
    pieges: [[nombre(x * 100), 'conversion-volume'], [nombre(x * 10), 'conversion-volume']],
    voisin: (k) => nombre(x * 1000 + k),
  });
}

/* ---------------------------------------------------------------- 3e */

function sphere3(sorte, { entre, melanger }) {
  if (sorte === 'pi') {
    const r = entre(2, 10);
    return manche(melanger, {
      consigne: 'sphere',
      question: `Sphère de rayon ${r} cm. Aire en cm², en fonction de π ?`,
      bonne: pi(4 * r * r),
      pieges: [[pi(r * r), 'aire-sphere-quatre'], [pi((4 * r * r * r) / 3), 'aire-ou-volume']],
      voisin: (k) => pi(4 * r * r + k),
    });
  }
  const r = entre(2, 9);
  return manche(melanger, {
    consigne: 'sphere',
    question: `Sphère de rayon ${r} cm. Aire en cm², arrondie au dixième ?`,
    bonne: auDixieme(4 * Math.PI * r * r),
    pieges: [[auDixieme(Math.PI * r * r), 'aire-sphere-quatre'], [auDixieme((4 / 3) * Math.PI * r ** 3), 'aire-ou-volume']],
    voisin: (k) => auDixieme(4 * Math.PI * r * r + k),
  });
}

function boule3(sorte, { entre, au, melanger }) {
  if (sorte === 'arrondi') {
    const r = au([2, 4, 5, 7, 8, 10]);
    return manche(melanger, {
      consigne: 'boule',
      question: `Boule de rayon ${r} cm. Volume en cm³, arrondi à l’unité ?`,
      bonne: aLUnite((4 / 3) * Math.PI * r ** 3),
      pieges: [[aLUnite(4 * Math.PI * r * r), 'aire-ou-volume'], [aLUnite(Math.PI * r ** 3), 'volume-boule-formule']],
      voisin: (k) => aLUnite((4 / 3) * Math.PI * r ** 3 + k),
    });
  }
  const r = 3 * entre(1, 3);
  const v = (4 * r ** 3) / 3;
  if (sorte === 'diametre') {
    return manche(melanger, {
      consigne: 'boule',
      question: `Boule de diamètre ${2 * r} cm. Volume en cm³, en fonction de π ?`,
      bonne: pi(v),
      pieges: [[pi((4 * (2 * r) ** 3) / 3), 'rayon-ou-diametre'], [pi(4 * r * r), 'aire-ou-volume']],
      voisin: (k) => pi(v + k),
    });
  }
  return manche(melanger, {
    consigne: 'boule',
    question: `Boule de rayon ${r} cm. Volume en cm³, en fonction de π ?`,
    bonne: pi(v),
    pieges: [[pi(4 * r * r), 'aire-ou-volume'], [pi(r ** 3), 'volume-boule-formule']],
    voisin: (k) => pi(v + k),
  });
}

function composee3(sorte, { au, melanger }) {
  if (sorte === 'kmh') {
    const v = au([18, 36, 54, 72, 90, 108]);
    return manche(melanger, {
      consigne: 'composee',
      question: `${v} km/h = ? m/s`,
      bonne: nombre(v / 3.6),
      pieges: [[nombre(v * 3.6), 'diviser-par-trois-six'], [nombre(v * 1000), 'convertir-temps-aussi']],
      voisin: (k) => nombre(v / 3.6 + k),
    });
  }
  if (sorte === 'ms') {
    const s = au([5, 10, 15, 20, 25, 30]);
    return manche(melanger, {
      consigne: 'composee',
      question: `${s} m/s = ? km/h`,
      bonne: nombre(s * 3.6),
      pieges: [[nombre(s * 3600), 'convertir-distance-aussi'], [nombre(s * 60), 'heure-trois-mille-six-cents']],
      voisin: (k) => nombre(s * 3.6 + k),
    });
  }
  const q = au([0.5, 1, 2, 3, 5]);
  return manche(melanger, {
    consigne: 'composee',
    question: `Un robinet débite ${nombre(q)} L/s. Combien de m³ par heure ?`,
    bonne: nombre(q * 3.6),
    pieges: [[nombre(q * 3600), 'litre-metre-cube'], [nombre(q * 0.06), 'heure-trois-mille-six-cents']],
    voisin: (k) => nombre(q * 3.6 + k),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const t = outils(graine);
  const { melanger } = t;
  let liste;
  if (niveau === 'TROISIEME') {
    liste = [
      sphere3('pi', t), sphere3('arrondi', t),
      ...melanger(['rayon', 'diametre', 'arrondi']).map((s) => boule3(s, t)),
      ...melanger(['kmh', 'ms', 'debit']).map((s) => composee3(s, t)),
    ];
  } else if (niveau === 'CINQUIEME') {
    liste = [
      aire5('parallelogramme', t), aire5('triangle', t),
      disque5('aire', t), disque5('perimetre', t),
      volume5('prisme', t), volume5('cylindre', t),
      conversion5('aire', t), conversion5(t.au(['litres', 'volume']), t),
    ];
  } else {
    liste = [
      ...melanger(['rectangle', 'carre', 'triangle']).map((s) => perimetre6(s, t)),
      ...melanger(['rectangle', 'triangle', 'triangle-rectangle']).map((s) => aire6(s, t)),
      volume6(t), volume6(t),
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
  perimetre: 'Calcule le périmètre : le tour complet de la figure.',
  aire: 'Calcule l’aire de cette figure.',
  volume: 'Calcule le volume de ce pavé droit.',
  disque: 'Calcule, avec pi, dans la forme demandée.',
  'volume-5e': 'Calcule le volume de ce solide.',
  conversion: 'Convertis dans l’unité demandée.',
  sphere: 'Calcule l’aire de cette sphère.',
  boule: 'Calcule le volume de cette boule.',
  composee: 'Convertis cette grandeur composée.',

  'aire-ou-perimetre': 'Ne confonds pas : le périmètre, c’est le tour de la figure, une longueur ; l’aire, c’est la surface à l’intérieur.',
  'perimetre-tous-les-cotes': 'Le périmètre fait le tour complet : additionne tous les côtés, sans en oublier.',
  'triangle-moitie': 'Un triangle, c’est la moitié d’un rectangle : base fois hauteur, divisé par deux.',
  'volume-ou-aire': 'Tu as calculé une aire, la surface qui l’entoure. Le volume, c’est la place à l’intérieur.',
  'volume-multiplier': 'Le volume d’un pavé droit, c’est longueur fois largeur fois hauteur : on multiplie, on n’additionne pas.',
  'hauteur-pas-cote': 'La hauteur est perpendiculaire à la base : ce n’est pas le côté oblique.',
  'rayon-ou-diametre': 'Le rayon, c’est la moitié du diamètre : divise d’abord le diamètre par deux.',
  'perimetre-cercle': 'Le périmètre d’un cercle, c’est deux fois pi fois le rayon, ou pi fois le diamètre.',
  'volume-base-fois-hauteur': 'Le volume d’un prisme ou d’un cylindre, c’est l’aire de la base fois la hauteur, avec pi pour un disque.',
  'conversion-aire': 'En aires, chaque unité vaut cent fois la suivante : deux chiffres par rang dans le tableau.',
  'conversion-volume': 'En volumes, chaque unité vaut mille fois la suivante : trois chiffres par rang dans le tableau.',
  'litre-decimetre-cube': 'Un litre, c’est un décimètre cube, soit mille centimètres cubes : divise par mille.',
  'aire-sphere-quatre': 'L’aire d’une sphère, c’est quatre fois pi fois le rayon au carré : n’oublie pas le quatre.',
  'aire-ou-volume': 'Ne confonds pas : l’aire se mesure avec le rayon au carré, le volume avec le rayon au cube.',
  'volume-boule-formule': 'Le volume d’une boule, c’est quatre tiers de pi fois le rayon au cube : n’oublie pas les quatre tiers.',
  'diviser-par-trois-six': 'Pour passer des kilomètres par heure aux mètres par seconde, on divise par trois virgule six, on ne multiplie pas.',
  'convertir-temps-aussi': 'Convertis les deux unités : les kilomètres en mètres, et aussi les heures en secondes.',
  'convertir-distance-aussi': 'Convertis les deux unités : les secondes en heures, et aussi les mètres en kilomètres.',
  'heure-trois-mille-six-cents': 'Une heure, c’est trois mille six cents secondes, pas soixante.',
  'litre-metre-cube': 'Un mètre cube, c’est mille litres : divise les litres par mille.',

  'perimetre-regle': 'Additionne les longueurs de tous les côtés.',
  'aire-regle': 'Rectangle : longueur fois largeur. Triangle : base fois hauteur, divisé par deux.',
  'volume-regle': 'Longueur fois largeur fois hauteur.',
  'disque-regle': 'Aire du disque : pi fois le rayon au carré. Périmètre : deux fois pi fois le rayon.',
  'volume-5e-regle': 'Aire de la base fois la hauteur.',
  'conversion-regle': 'Aires : cent par rang. Volumes : mille par rang. Un litre, c’est un décimètre cube.',
  'sphere-regle': 'L’aire d’une sphère : quatre fois pi fois le rayon au carré.',
  'boule-regle': 'Le volume d’une boule : quatre tiers de pi fois le rayon au cube.',
  'composee-regle': 'Convertis chaque unité, une par une : la distance, puis le temps.',
};
