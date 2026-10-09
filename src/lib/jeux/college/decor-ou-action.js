/**
 * DÉCOR OU ACTION ? — l'imparfait et le passé simple selon leur valeur, en 6e.
 * Professeur : Adrien (français).
 *
 * DANS UN RÉCIT AU PASSÉ, deux temps se partagent le travail : l'imparfait
 * peint l'arrière-plan (le décor, la description, l'habitude, ce qui dure) ;
 * le passé simple porte le premier plan (l'action précise, soudaine, qui fait
 * avancer l'histoire, les actions qui s'enchaînent).
 *
 * TROIS SORTES DE MANCHES (3 + 3 + 2, mélangées) :
 *   - LA BONNE FORME (3) : une phrase à trou, deux formes du même verbe ;
 *     chaque phrase porte son indice (soudain, chaque soir, autrefois…) ;
 *   - LA VALEUR (3) : un verbe entre crochets, déjà conjugué. Décor, habitude
 *     ou action de premier plan ? LE PIÈGE : confondre description et habitude,
 *     toutes deux à l'imparfait ;
 *   - LES DEUX PLANS (2) : deux verbes manquent, l'un décrit, l'autre agit.
 *     Choisir la bonne paire, dans un ordre qui varie.
 *
 * Toutes les formes sont écrites à la main et relues (passé simple compris :
 * atteignîmes, marchâmes, ouvrit, fut).
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'decor-ou-action', titre: 'Décor ou action ?', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Décor ou action ?',
    accroche: 'Imparfait ou passé simple : qui fait quoi ?',
    competences: ['FR_6E_LANG_VALEURS'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** [phrase à trou, forme à l'imparfait, forme au passé simple, bonne, phrase de la valeur]. */
const FORMES = [
  ['Ce matin-là, le ciel ___ gris et le vent soufflait.', 'était', 'fut', 'imparfait', 'imparfait-description'],
  ['Le château ___ au sommet d’une colline couverte de pins.', 'se dressait', 'se dressa', 'imparfait', 'imparfait-description'],
  ['Chaque dimanche, ma grand-mère ___ une tarte aux pommes.', 'préparait', 'prépara', 'imparfait', 'imparfait-habitude'],
  ['Soudain, un bruit terrible ___ le silence.', 'rompait', 'rompit', 'passe-simple', 'passe-simple-soudain'],
  ['Tout à coup, la porte ___ violemment.', 'claquait', 'claqua', 'passe-simple', 'passe-simple-soudain'],
  ['Le chevalier ___ son épée et se jeta sur le dragon.', 'tirait', 'tira', 'passe-simple', 'passe-simple-succession'],
  ['La princesse ___ de longs cheveux noirs.', 'avait', 'eut', 'imparfait', 'imparfait-description'],
  ['Autrefois, les paysans ___ à la lueur des bougies.', 'vivaient', 'vécurent', 'imparfait', 'imparfait-habitude'],
  ['Il ouvrit la lettre, la ___ et pâlit.', 'lisait', 'lut', 'passe-simple', 'passe-simple-succession'],
  ['À cet instant, le loup ___ de derrière un arbre.', 'surgissait', 'surgit', 'passe-simple', 'passe-simple-soudain'],
  ['Tous les soirs, le gardien ___ les grilles du parc.', 'fermait', 'ferma', 'imparfait', 'imparfait-habitude'],
  ['La maison ___ silencieuse ; personne ne bougeait.', 'était', 'fut', 'imparfait', 'imparfait-description'],
  ['Elle se leva, ___ son manteau et sortit.', 'prenait', 'prit', 'passe-simple', 'passe-simple-succession'],
];

const VALEURS_LIBELLES = {
  description: 'Le décor, une description',
  habitude: 'Une habitude',
  'premier-plan': 'Une action de premier plan',
};

/** [phrase, le verbe entre crochets, sa valeur]. */
const VALEURS = [
  ['La nuit [tombait] doucement sur le village.', 'description'],
  ['Tous les matins, Léon [promenait] son chien.', 'habitude'],
  ['Soudain, un cri [retentit] dans la nuit.', 'premier-plan'],
  ['Le vieil homme [portait] un manteau usé.', 'description'],
  ['Chaque été, nous [partions] chez nos cousins.', 'habitude'],
  ['Il [saisit] la corde et grimpa jusqu’au toit.', 'premier-plan'],
  ['Les rues [étaient] désertes et froides.', 'description'],
  ['Le dimanche, mon père [jouait] du violon.', 'habitude'],
  ['Tout à coup, la lumière [s’éteignit].', 'premier-plan'],
  ['Elle [avait] les yeux verts d’un chat.', 'description'],
  ['Le soir, ils [racontaient] des histoires au coin du feu.', 'habitude'],
  ['Le prince [ouvrit] la porte et entra dans la salle.', 'premier-plan'],
];

const PHRASE_VALEUR = {
  description: 'imparfait-description',
  habitude: 'imparfait-habitude',
  'premier-plan': 'premier-plan',
};

/**
 * [phrase à deux trous, [imparfait, passé simple] du premier verbe, [imparfait,
 * passé simple] du second, l'ordre juste : 'imp-ps' ou 'ps-imp'].
 */
const DEUX_PLANS = [
  ['Nous ___ tranquillement quand soudain l’orage ___.', ['marchions', 'marchâmes'], ['éclatait', 'éclata'], 'imp-ps'],
  ['Le chevalier ___ soudain dans la salle ; un grand feu ___ dans la cheminée.', ['entrait', 'entra'], ['brûlait', 'brûla'], 'ps-imp'],
  ['Je ___ mes devoirs quand le téléphone ___.', ['faisais', 'fis'], ['sonnait', 'sonna'], 'imp-ps'],
  ['Les enfants ___ dans la cour lorsqu’un ballon ___ la vitre.', ['jouaient', 'jouèrent'], ['brisait', 'brisa'], 'imp-ps'],
  ['Le voyageur ___ brusquement la porte de l’auberge : des marins ___ déjà autour d’une table.', ['poussait', 'poussa'], ['chantaient', 'chantèrent'], 'ps-imp'],
  ['Il ___ nuit noire quand le navire ___ le port.', ['faisait', 'fit'], ['quittait', 'quitta'], 'imp-ps'],
  ['Elle ___ enfin les yeux : la chambre ___ déjà inondée de soleil.', ['ouvrait', 'ouvrit'], ['était', 'fut'], 'ps-imp'],
  ['Le roi ___ paisiblement lorsqu’un messager ___ dans sa chambre.', ['dormait', 'dormit'], ['entrait', 'entra'], 'imp-ps'],
  ['Nous ___ enfin le sommet ; en bas, la vallée ___ encore sous la brume.', ['atteignions', 'atteignîmes'], ['disparaissait', 'disparut'], 'ps-imp'],
];

const fabriquerForme = ([question, imparfait, passeSimple, bonne, valeur], melanger) => {
  const mauvaise = bonne === 'imparfait' ? 'passe-simple' : 'imparfait';
  const libelles = { imparfait, 'passe-simple': passeSimple };
  return {
    consigne: 'choisir-forme',
    question,
    bonne,
    choix: melanger(['imparfait', 'passe-simple']).map((c) => ({ cle: c, libelle: libelles[c] })),
    pieges: { [mauvaise]: valeur },
    aide: valeur,
  };
};

const fabriquerValeur = ([question, bonne], melanger) => {
  const autres = Object.keys(VALEURS_LIBELLES).filter((c) => c !== bonne);
  return {
    consigne: 'valeur',
    question,
    bonne,
    choix: melanger(Object.keys(VALEURS_LIBELLES)).map((c) => ({ cle: c, libelle: VALEURS_LIBELLES[c] })),
    pieges: Object.fromEntries(autres.map((c) => [c, PHRASE_VALEUR[bonne]])),
    aide: PHRASE_VALEUR[bonne],
  };
};

const fabriquerPlans = ([question, [imp1, ps1], [imp2, ps2], bonne], melanger) => {
  const paires = {
    'imp-ps': `${imp1} / ${ps2}`,
    'ps-imp': `${ps1} / ${imp2}`,
    'imp-imp': `${imp1} / ${imp2}`,
    'ps-ps': `${ps1} / ${ps2}`,
  };
  const inverse = bonne === 'imp-ps' ? 'ps-imp' : 'imp-ps';
  const pareil = melanger(['imp-imp', 'ps-ps'])[0];
  const cles = [bonne, inverse, pareil];
  return {
    consigne: 'deux-plans',
    question,
    bonne,
    choix: melanger(cles).map((c) => ({ cle: c, libelle: paires[c] })),
    pieges: { [inverse]: 'deux-plans-inverses', [pareil]: 'deux-plans-meme-temps' },
    aide: 'deux-plans-inverses',
  };
};

export const SORTES = {
  SIXIEME: [
    { banque: FORMES, nombre: 3, fabriquer: fabriquerForme },
    { banque: VALEURS, nombre: 3, fabriquer: fabriquerValeur },
    { banque: DEUX_PLANS, nombre: 2, fabriquer: fabriquerPlans },
  ],
};

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { melanger } = outils(graine);
  const sortes = SORTES[niveau] ?? SORTES[CLASSES[0]];
  const liste = sortes.flatMap(({ banque, nombre, fabriquer }) => melanger(banque).slice(0, nombre).map((item) => fabriquer(item, melanger)));
  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'choisir-forme': 'Imparfait ou passé simple ? Choisis la forme qui convient à ce récit.',
  valeur: 'Ce verbe peint-il le décor, une habitude, ou une action de premier plan ?',
  'deux-plans': 'Deux verbes manquent : l’un décrit le décor, l’autre raconte l’action. Choisis la bonne paire.',
  'choisir-forme-regle': 'Le décor et l’habitude se mettent à l’imparfait ; l’action précise, qui fait avancer l’histoire, au passé simple.',
  'valeur-regle': 'L’imparfait peint le décor ou une habitude ; le passé simple raconte une action de premier plan.',
  'deux-plans-regle': 'Ce qui dure, en arrière-plan, est à l’imparfait ; l’action qui arrive et fait avancer l’histoire est au passé simple.',
  'imparfait-description': 'On décrit un lieu, un personnage ou le temps qu’il fait : c’est le décor, l’arrière-plan du récit. On le met à l’imparfait.',
  'imparfait-habitude': 'Chaque dimanche, tous les soirs, autrefois : l’action se répète. C’est une habitude, à l’imparfait.',
  'passe-simple-soudain': 'Soudain, tout à coup, à cet instant : ces mots annoncent une action brève, qui surgit au premier plan. On la met au passé simple.',
  'passe-simple-succession': 'Les actions s’enchaînent, l’une après l’autre, et font avancer l’histoire : elles sont au passé simple.',
  'premier-plan': 'Ce verbe est au passé simple : c’est une action précise, qui arrive à un moment donné et fait avancer l’histoire. C’est le premier plan.',
  'deux-plans-inverses': 'Cherche le verbe qui décrit ce qui dure, en arrière-plan : il est à l’imparfait. Celui de l’action qui arrive, ou qui fait avancer l’histoire, est au passé simple.',
  'deux-plans-meme-temps': 'Les deux verbes n’ont pas le même rôle : l’un peint le décor, à l’imparfait ; l’autre raconte l’action, au passé simple.',
};
