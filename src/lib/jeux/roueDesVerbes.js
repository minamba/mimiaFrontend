/**
 * LA ROUE DES VERBES — le quatrième nouveau jeu de français du CE1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CE1_LANG_PRESENT — « Conjuguer être, avoir et les verbes en -er au
 *   présent »
 *
 * LE JEU. La roue s'arrête sur un pronom ; un verbe est donné. L'enfant
 * choisit la bonne forme parmi trois.
 *
 * LA DIFFICULTÉ DU CE1 NE S'ENTEND PAS : « je chante », « tu chantes », « ils
 * chantent » se disent pareil. Les leurres sont donc d'abord les formes
 * sœurs qui SONNENT PAREIL — c'est là que l'enfant se trompe à l'écrit —,
 * puis une autre personne.
 *
 * ADRIEN NE DIT PAS LA RÉPONSE, ni le pronom avec le verbe : « tu chantes »
 * dit à voix haute ne dirait rien de la terminaison à écrire.
 *
 * L'ERREUR DONNE LA TERMINAISON DU PRONOM (« avec nous, le verbe finit par
 * -ons »), ou rappelle qu'être et avoir ne suivent pas la règle.
 *
 * AU CE2, TROIS TEMPS — Camara, le 21/09/2026. Compétence :
 *   FR_CE2_LANG_TROIS_TEMPS — « Conjuguer les verbes fréquents au présent, à
 *   l'imparfait et au futur »
 * La roue tire aussi un moment — hier, aujourd'hui, demain — qui dit le temps.
 * Les leurres : une forme du même temps qui sonne pareil (chantais, chantait),
 * et la même personne à un autre temps. L'erreur ne s'épelle plus lettre à
 * lettre : elle donne un MODÈLE (« comme dans « il chantait » »), qu'un enfant
 * retient mieux et qu'une voix dit sans buter.
 */

export const MANCHES = 10;

export const PRONOMS = ['je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles'];

/** La personne d'un pronom : il et elle se conjuguent pareil, ils et elles aussi. */
const PERSONNE = {
  je: 0, tu: 1, il: 2, elle: 2, nous: 3, vous: 4, ils: 5, elles: 5,
};

const IRREGULIERS = {
  être: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
  avoir: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
};

const IRREGULIERS_TEMPS = {
  imparfait: {
    être: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'],
    avoir: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
  },
  futur: {
    être: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'],
    avoir: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'],
  },
};

const FINS_IMPARFAIT = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
const FINS_FUTUR = ['ai', 'as', 'a', 'ons', 'ez', 'ont'];

/** Les trois temps, et le moment qui les annonce sur la roue. */
export const TEMPS = [
  { cle: 'present', moment: 'Aujourd’hui', nom: 'Au présent' },
  { cle: 'imparfait', moment: 'Hier', nom: 'À l’imparfait' },
  { cle: 'futur', moment: 'Demain', nom: 'Au futur' },
];

export const VERBES = ['être', 'avoir', 'chanter', 'jouer', 'aimer', 'parler', 'danser', 'regarder', 'marcher', 'écouter'];

const FINS_ER = ['e', 'es', 'e', 'ons', 'ez', 'ent'];

/** La forme d'un verbe à une personne : « chantons ». */
export function forme(verbe, pronom, temps = 'present') {
  const p = PERSONNE[pronom];
  if (temps === 'imparfait') {
    if (IRREGULIERS_TEMPS.imparfait[verbe]) return IRREGULIERS_TEMPS.imparfait[verbe][p];
    return verbe.slice(0, -2) + FINS_IMPARFAIT[p];
  }
  if (temps === 'futur') {
    if (IRREGULIERS_TEMPS.futur[verbe]) return IRREGULIERS_TEMPS.futur[verbe][p];
    return verbe + FINS_FUTUR[p];
  }
  if (IRREGULIERS[verbe]) return IRREGULIERS[verbe][p];
  return verbe.slice(0, -2) + FINS_ER[p];
}

/**
 * LES TROIS FORMES DU CE2 : la bonne, une forme du même temps à une autre
 * personne — d'abord celle qui sonne pareil —, et la même personne à un autre
 * temps.
 */
export function formesCE2(verbe, pronom, temps, tirer) {
  const bonne = forme(verbe, pronom, temps);
  const memeTemps = [...new Set(['je', 'tu', 'il', 'nous', 'vous', 'ils'].map((x) => forme(verbe, x, temps)))]
    .filter((f) => f !== bonne);
  const sonnePareil = memeTemps.filter((f) => f.slice(0, -1) === bonne.slice(0, -1) || f.replace(/(s|t|ent)$/, '') === bonne.replace(/(s|t|ent)$/, ''));
  const soeur = (sonnePareil[0] ?? memeTemps[0]);
  const autresTemps = TEMPS.filter((t) => t.cle !== temps).map((t) => forme(verbe, pronom, t.cle))
    .filter((f) => f !== bonne && f !== soeur);
  const liste = [bonne, soeur, autresTemps[Math.floor(tirer() * autresTemps.length)]];
  for (let i = liste.length - 1; i > 0; i -= 1) {
    const j = Math.floor(tirer() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
  return liste;
}

/** « je » devient « j’ » devant une voyelle : j’aime, j’ai, j’écoute. */
export function avecPronom(pronom, f) {
  return pronom === 'je' && /^[aeéiouh]/i.test(f) ? `j’${f}` : `${pronom} ${f}`;
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

/**
 * LES TROIS FORMES PROPOSÉES : la bonne, puis d'abord celles qui s'entendent
 * pareil, puis les autres — toutes différentes à l'écrit.
 */
export function formesProposees(verbe, pronom, tirer) {
  const bonne = forme(verbe, pronom);
  const toutes = [...new Set([0, 1, 2, 3, 4, 5].map((p) => forme(verbe, PRONOMS[[0, 1, 2, 4, 5, 6][p]])))];
  const autres = toutes.filter((f) => f !== bonne);
  // Les sœurs qui sonnent pareil : même début, fin muette (chante, chantes, chantent).
  const soeurs = autres.filter((f) => /^(.*?)(e|es|ent)$/.test(f) && f.replace(/(es|ent|e)$/, '') === bonne.replace(/(es|ent|e|ons|ez)$/, ''));
  const reste = autres.filter((f) => !soeurs.includes(f));
  const leurres = [...soeurs, ...reste].slice(0, 2);
  const liste = [bonne, ...leurres];
  for (let i = liste.length - 1; i > 0; i -= 1) {
    const j = Math.floor(tirer() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
  return liste;
}

/** Dix manches : être et avoir une fois chacun au moins, et des verbes en -er. */
export function serie(graine = Date.now(), niveau = 'CE1') {
  const tirer = suite(graine);
  if (niveau === 'CE2') return serieCE2(tirer);
  const au = (l) => l[Math.floor(tirer() * l.length)];
  const liste = [];
  for (let i = 0; i < MANCHES; i += 1) {
    let verbe;
    if (i === 2) verbe = 'être';
    else if (i === 6) verbe = 'avoir';
    else verbe = au(VERBES.slice(2));
    let pronom;
    do { pronom = au(PRONOMS); } while (liste.length > 0 && liste[liste.length - 1].pronom === pronom);
    liste.push({ verbe, pronom, choix: formesProposees(verbe, pronom, tirer) });
  }
  return liste;
}

/** Le CE2 : dix manches, les trois temps à parts presque égales, être et avoir compris. */
function serieCE2(tirer) {
  const au = (l) => l[Math.floor(tirer() * l.length)];
  const temps = ['present', 'imparfait', 'futur', 'imparfait', 'futur', 'present', 'imparfait', 'futur', 'present', 'futur']
    .sort(() => tirer() - 0.5);
  const liste = [];
  for (let i = 0; i < MANCHES; i += 1) {
    let verbe;
    if (i === 2) verbe = 'être';
    else if (i === 6) verbe = 'avoir';
    else verbe = au(VERBES.slice(2));
    let pronom;
    do { pronom = au(PRONOMS); } while (liste.length > 0 && liste[liste.length - 1].pronom === pronom);
    liste.push({
      verbe, pronom, temps: temps[i], choix: formesCE2(verbe, pronom, temps[i], tirer),
    });
  }
  return liste;
}

/** Juste, ou la règle à rappeler : la terminaison du pronom, ou « irrégulier ». */
export function verdict(m, choix) {
  const temps = m.temps ?? 'present';
  if (choix === forme(m.verbe, m.pronom, temps)) return 'juste';
  if (temps === 'present') return IRREGULIERS[m.verbe] ? m.verbe : `personne-${PERSONNE[m.pronom]}`;
  return IRREGULIERS[m.verbe] ? `${m.verbe}-${temps}` : `${temps}-${PERSONNE[m.pronom]}`;
}

/** Le pronom qui sert de modèle à une personne : je, tu, il, nous, vous, ils. */
const MODELE = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

/**
 * LA RÈGLE D'UNE ERREUR DU CE2, PAR UN MODÈLE : « À l'imparfait, avec « il »,
 * on écrit comme dans « il chantait ». » Pour être et avoir, la liste.
 */
export function regleCE2(sens) {
  const [a, b] = sens.split('-');
  if (a === 'être' || a === 'avoir') {
    const t = TEMPS.find((x) => x.cle === b);
    const formes = MODELE.map((x) => avecPronom(x, forme(a, x, b))).join(', ');
    return `${t.nom}, le verbe ${a} fait : ${formes}.`;
  }
  const t = TEMPS.find((x) => x.cle === a);
  const pronom = MODELE[Number(b)];
  return `${t.nom}, avec « ${pronom} », on écrit comme dans « ${avecPronom(pronom, forme('chanter', pronom, a))} ».`;
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
  consigne: 'Conjugue le verbe au présent : choisis la bonne forme.',
  consigneCE2: 'Hier, aujourd’hui ou demain ? Conjugue le verbe au bon temps.',
  'personne-0': 'Avec « je », le verbe en -er finit par e.',
  'personne-1': 'Avec « tu », le verbe finit par s.',
  'personne-2': 'Avec « il » ou « elle », le verbe en -er finit par e.',
  'personne-3': 'Avec « nous », le verbe finit par o, n, s.',
  'personne-4': 'Avec « vous », le verbe finit par e, z.',
  'personne-5': 'Avec « ils » ou « elles », on écrit comme dans « ils chantent ».',
  être: 'Le verbe être ne suit pas la règle : je suis, tu es, il est, nous sommes, vous êtes, ils sont.',
  avoir: 'Le verbe avoir ne suit pas la règle : j’ai, tu as, il a, nous avons, vous avez, ils ont.',
};
