/**
 * LA PHRASE QUI DIT NON — le sixième nouveau jeu de français du CE1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CE1_LANG_NEGATION — « Écrire une phrase à la forme négative »
 *
 * LE JEU. Une phrase qui dit oui ; l'enfant la fait dire non. Il choisit
 * « ne » ou « n' », le pose dans un espace entre deux mots, puis pose
 * « pas », et annonce.
 *
 * LES DEUX RÈGLES DU CE1, ET L'ERREUR QUI LES NOMME :
 *   - « ne » et « pas » ENCADRENT le verbe : ne juste devant, pas juste après ;
 *   - devant une voyelle, « ne » devient « n' » : il n'aime pas.
 *
 * L'ENFANT POSE, PUIS ANNONCE — la leçon des paquets de dix. Poser « ne »
 * dans chaque espace jusqu'à ce que le jeu s'allume ne serait pas écrire.
 *
 * LES PHRASES SONT ÉCRITES À LA MAIN : un seul verbe, au présent, sans
 * pronom complément ni temps composé — « je ne l'ai pas vu » est pour plus
 * tard.
 */

export const MANCHES = 8;
export const ESSAIS_AVANT_AIDE = 3;

/** `verbe` est la place du verbe dans `mots`. */
export const PHRASES_JEU = [
  { mots: ['Le', 'chat', 'dort.'], verbe: 2 },
  { mots: ['Je', 'mange', 'une', 'pomme.'], verbe: 1 },
  { mots: ['Il', 'aime', 'les', 'épinards.'], verbe: 1 },
  { mots: ['Nous', 'jouons', 'dehors.'], verbe: 1 },
  { mots: ['Tu', 'écoutes', 'la', 'musique.'], verbe: 1 },
  { mots: ['Elle', 'regarde', 'la', 'télé.'], verbe: 1 },
  { mots: ['Le', 'bébé', 'pleure.'], verbe: 2 },
  { mots: ['Vous', 'arrivez', 'tôt.'], verbe: 1 },
  { mots: ['Mon', 'frère', 'travaille.'], verbe: 2 },
  { mots: ['Ils', 'habitent', 'ici.'], verbe: 1 },
];

/** « n' » devant une voyelle ou un h muet, « ne » sinon. */
export function formeDuNe(p) {
  return /^[aeéèêiouyh]/i.test(p.mots[p.verbe]) ? 'n’' : 'ne';
}

/** La phrase négative, écrite en entier. */
export function negative(p) {
  const ne = formeDuNe(p);
  const verbe = p.mots[p.verbe];
  const fin = /[.!?]$/.test(verbe) ? verbe.slice(-1) : '';
  const nu = fin ? verbe.slice(0, -1) : verbe;
  const mots = [...p.mots];
  mots[p.verbe] = ne === 'n’' ? `n’${nu} pas${fin}` : `ne ${nu} pas${fin}`;
  return mots.join(' ');
}

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;

  return () => {
    etat = (etat * 16807) % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/** Huit phrases différentes, dont au moins deux où il faut « n' ». */
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
  } while (choisies.filter((p) => formeDuNe(p) === 'n’').length < 2);
  return choisies.map((p) => PHRASES_JEU.indexOf(p));
}

export const phrase = (i) => PHRASES_JEU[i];

/**
 * Ce que vaut une phrase annoncée. `ne` et `pas` sont des ESPACES : l'espace
 * k est juste avant le mot k (l'espace après le dernier mot vaut mots.length).
 * L'ordre des vérifications suit la règle : la place de ne, puis celle de
 * pas, puis la forme de ne.
 */
export function verdict(p, { ne, pas, forme }) {
  if (ne !== p.verbe) return 'place-ne';
  if (pas !== p.verbe + 1) return 'place-pas';
  if (forme !== formeDuNe(p)) return forme === 'ne' ? 'elision' : 'pas-elision';
  return 'juste';
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
  consigne: 'Fais dire non à la phrase : pose « ne », puis « pas ».',
  'place-ne': '« ne » se place juste devant le verbe.',
  'place-pas': '« pas » se place juste après le verbe.',
  elision: 'Devant une voyelle, « ne » devient « n’ », avec une apostrophe.',
  'pas-elision': 'Devant une consonne, on écrit « ne » en entier.',
  aide: 'Regarde : « ne » et « pas » encadrent le verbe.',
};

// ------------------------------------------------------------ le CE2

/**
 * AU CE2, TRANSFORMER UNE PHRASE — Camara, le 21/09/2026. Compétence :
 *   FR_CE2_LANG_FORMES — « Transformer une phrase : négative, exclamative,
 *   interrogative »
 *
 * LE JEU. Une phrase qui dit oui, et une forme à lui donner. L'enfant choisit
 * la bonne transformation parmi trois. Les deux autres sont LES FAUTES DU
 * CE2 : la négation sans « ne » (« Le chat dort pas. », celle qu'on entend à
 * l'oral), « ne » mal placé, la question sans son point d'interrogation, le
 * « est-ce que » glissé au milieu, l'exclamation sans son point.
 *
 * LA QUESTION SE FAIT AVEC « EST-CE QUE », la tournure du CE2 : l'inversion
 * du sujet (« Dort-il ? ») viendra plus tard.
 */

export const FORMES = ['negative', 'interrogative', 'exclamative'];

/** Une phrase sans son point final, et sans sa majuscule quand elle n'est pas un nom. */
const corps = (p) => {
  const texte = p.mots.join(' ').replace(/[.!?]$/, '');
  return texte.charAt(0).toLowerCase() + texte.slice(1);
};
const majuscule = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const estCeQue = (c) => (/^[aeéiouy]/i.test(c) ? `Est-ce qu’${c}` : `Est-ce que ${c}`);

/** Les trois propositions d'une manche : la bonne d'abord, puis ses deux fautes nommées. */
export function propositions(p, forme) {
  const c = corps(p);
  if (forme === 'negative') {
    const verbe = p.mots[p.verbe].replace(/[.!?]$/, '');
    const sansNe = p.mots.map((m, i) => (i === p.verbe ? `${verbe} pas` : m)).join(' ').replace(/[.!?]?$/, '.');
    const malPlace = p.mots.map((m, i) => (i === p.verbe ? `ne pas ${verbe}` : m)).join(' ').replace(/[.!?]?$/, '.');
    return [
      { texte: negative(p), faute: null },
      { texte: sansNe, faute: 'sans-ne' },
      { texte: malPlace, faute: 'place' },
    ];
  }
  if (forme === 'interrogative') {
    const debut = p.mots[0];
    const milieu = [debut, 'est-ce que', ...p.mots.slice(1)].join(' ').replace(/[.!?]$/, ' ?');
    return [
      { texte: `${estCeQue(c)} ?`, faute: null },
      { texte: `${estCeQue(c)}.`, faute: 'point-question' },
      { texte: milieu, faute: 'ordre' },
    ];
  }
  return [
    { texte: `Comme ${c} !`, faute: null },
    { texte: `Comme ${c} ?`, faute: 'point-exclamation' },
    { texte: `${majuscule(c)}.`, faute: 'pas-exclamation' },
  ];
}

/** Neuf transformations, trois de chaque forme, sur neuf phrases différentes. */
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
  const phrases = melanger(PHRASES_JEU.map((_, i) => i)).slice(0, 9);
  const formes = melanger([...FORMES, ...FORMES, ...FORMES]);
  return phrases.map((i, k) => ({
    phrase: i,
    forme: formes[k],
    choix: melanger(propositions(PHRASES_JEU[i], formes[k])),
  }));
}

export const PHRASES_CE2 = {
  negative: 'Transforme la phrase : fais-lui dire non.',
  interrogative: 'Transforme la phrase : fais-en une question, avec « est-ce que ».',
  exclamative: 'Transforme la phrase : fais-en une exclamation, avec « comme ».',
  'sans-ne': 'À l’écrit, la négation a deux mots : ne, et pas.',
  place: '« ne » et « pas » encadrent le verbe : ne juste devant, pas juste après.',
  'point-question': 'Une question se termine par un point d’interrogation.',
  ordre: '« Est-ce que » se met au début, et la phrase garde son ordre.',
  'point-exclamation': 'Une exclamation se termine par un point d’exclamation.',
  'pas-exclamation': 'Il manque « comme », et le point d’exclamation.',
};
