/**
 * L'ESCAPE GAME DE SVT DU COLLÈGE — Inès, de la 5e à la 3e. Une histoire par
 * classe, six cadenas dans l'ordre du récit ; seuls les choix sont mélangés,
 * et certaines étapes tirent une variante (un échantillon, une espèce…).
 *
 * 5e — VOYAGE AU CŒUR DU CORPS (code ORGANE)
 *   1. d'où vient le glucose : les féculents (SV_5E_CORPS_ALIMENTATION) ;
 *   2. les nutriments passent dans le sang par l'intestin grêle
 *      (SV_5E_CORPS_DIGESTION) — piège : l'estomac ;
 *   3. micro-organismes utiles ou pathogènes (SV_5E_VIV_MICROORGANISMES) ;
 *   4. les échanges gazeux dans les alvéoles (SV_5E_VIV_RESPIRATION) —
 *      pièges : le sens des gaz, « l'air expiré n'a plus de dioxygène » ;
 *   5. le sang apporte nutriments ET dioxygène au muscle (SV_5E_VIV_NUTRITION) ;
 *   6. le réfrigérateur ralentit les microbes, il ne les tue pas
 *      (SV_5E_CORPS_HYGIENE).
 *
 * 4e — LE VOLCAN QUI SE RÉVEILLE (code SEISME)
 *   1. séismes et volcans aux limites des plaques (SV_4E_TERRE_TECTONIQUE) ;
 *   2. à une dorsale, les plaques s'écartent (SV_4E_TERRE_PLAQUES) ;
 *   3. basalte refroidi vite en surface, granite lentement en profondeur
 *      (SV_4E_TERRE_ROCHES) ;
 *   4. le réflexe passe par la moelle épinière (SV_4E_CORPS_SYSTEME_NERVEUX) ;
 *   5. la sélection naturelle, sans finalisme (SV_4E_VIV_SELECTION) ;
 *   6. la flèche d'une chaîne alimentaire : « est mangé par »
 *      (SV_4E_VIV_ECOSYSTEME).
 *
 * 3e — ALERTE AU LABORATOIRE HÉLIX (code VACCIN)
 *   1. la réaction innée agit la première (SV_3E_CORPS_IMMUNITE) ;
 *   2. un vaccin n'est pas un sérum (SV_3E_CORPS_VACCINATION) ;
 *   3. la mitose garde le nombre de chromosomes (SV_3E_VIV_MITOSE) ;
 *   4. A, B et O sont des allèles d'un même gène (SV_3E_VIV_CHROMOSOMES) ;
 *   5. méiose et fécondation font la diversité (SV_3E_VIV_MEIOSE) ;
 *   6. la résistance naît d'une mutation au hasard (SV_3E_VIV_MUTATION).
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'escape-svt', titre: 'Escape game de SVT', matiereCode: 'SVT' };

export const ESCAPE = true;

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'Voyage au cœur du corps',
    accroche: 'Une capsule minuscule, six portes du corps.',
    intro: 'Rétrécie à la taille d’une cellule, ta capsule suit le trajet d’une tartine dans le corps humain. Six portes se ferment devant toi : ouvre-les pour revenir à ta taille.',
    fin: 'Le code ORGANE te rend ta taille : tu connais le chemin de la tartine.',
    competences: [
      'SV_5E_CORPS_ALIMENTATION',
      'SV_5E_CORPS_DIGESTION',
      'SV_5E_VIV_MICROORGANISMES',
      'SV_5E_VIV_RESPIRATION',
      'SV_5E_VIV_NUTRITION',
      'SV_5E_CORPS_HYGIENE',
    ],
  },
  QUATRIEME: {
    titre: 'Le volcan qui se réveille',
    accroche: 'Le volcan gronde : six cadenas pour l’alerte.',
    intro: 'En Islande, le sol tremble sous la station d’observation du volcan. Ouvre les six cadenas du poste de contrôle pour lancer l’alerte à temps.',
    fin: 'Le code SEISME déclenche l’alerte : la vallée est évacuée à temps.',
    competences: [
      'SV_4E_TERRE_TECTONIQUE',
      'SV_4E_TERRE_PLAQUES',
      'SV_4E_TERRE_ROCHES',
      'SV_4E_CORPS_SYSTEME_NERVEUX',
      'SV_4E_VIV_SELECTION',
      'SV_4E_VIV_ECOSYSTEME',
    ],
  },
  TROISIEME: {
    titre: 'Alerte au laboratoire Hélix',
    accroche: 'Une bactérie s’échappe : six cadenas.',
    intro: 'Au laboratoire Hélix, une alerte a verrouillé la salle des échantillons : une souche de bactérie s’est échappée. Six cadenas te séparent du dossier qui explique ce qui s’est passé.',
    fin: 'Le code VACCIN ouvre la salle : la souche est identifiée et maîtrisée.',
    competences: [
      'SV_3E_CORPS_IMMUNITE',
      'SV_3E_CORPS_VACCINATION',
      'SV_3E_VIV_MITOSE',
      'SV_3E_VIV_CHROMOSOMES',
      'SV_3E_VIV_MEIOSE',
      'SV_3E_VIV_MUTATION',
    ],
  },
};

export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 6;

// ---------------------------------------------------------------- 5e

const UTILES = ['La levure du pain', 'Les bactéries du yaourt', 'La moisissure du roquefort'];
const PATHOGENES = ['Le virus de la grippe', 'La bactérie du tétanos', 'Le virus de la varicelle'];

const RESPIRATION = [
  {
    question: 'Dans les alvéoles des poumons, quel gaz passe de l’air vers le sang ?',
    bonne: 'Le dioxygène',
    pieges: { 'Le dioxyde de carbone': 'respi-sens', 'Le diazote': 'respi-diazote' },
  },
  {
    question: 'L’air que tu expires contient-il encore du dioxygène ?',
    bonne: 'Oui, un peu moins qu’à l’entrée',
    pieges: { 'Non, plus du tout': 'respi-expire', 'Oui, davantage qu’à l’entrée': 'respi-plus' },
  },
];

const CINQUIEME = [
  () => ({
    recit: 'Ta capsule est posée sur une tartine de pain, prête à être croquée. Sur l’écran de bord, une question sur le menu.',
    question: 'D’où vient surtout le glucose qui nourrira tes muscles ?',
    bonne: 'Pain, pâtes, riz',
    pieges: { 'Viande, poisson, œufs': 'alim-proteines', 'Huile et beurre': 'alim-lipides' },
  }),
  () => ({
    recit: 'La bouchée descend l’œsophage, traverse l’estomac et s’engage dans un long tube replié. La porte suivante est une paroi.',
    question: 'Où les nutriments passent-ils dans le sang ?',
    bonne: 'Dans l’intestin grêle',
    pieges: { 'Dans l’estomac': 'digestion-estomac', 'Dans le gros intestin': 'digestion-gros-intestin' },
  }),
  ({ au, melanger }) => {
    const utile = au(['oui', 'non']) === 'oui';
    const [a, b] = melanger(utile ? PATHOGENES : UTILES);
    return {
      recit: 'Autour de la capsule grouillent des milliards de micro-organismes. Le scanner les classe avant d’ouvrir la porte.',
      question: utile ? 'Lequel de ces micro-organismes nous est utile ?' : 'Lequel de ces micro-organismes provoque une maladie ?',
      bonne: au(utile ? UTILES : PATHOGENES),
      pieges: { [a]: utile ? 'microbe-pathogene' : 'microbe-utile', [b]: utile ? 'microbe-pathogene' : 'microbe-utile' },
    };
  },
  ({ au }) => ({
    recit: 'Emportée par le sang, la capsule passe par le foie, puis par le cœur, et arrive dans les poumons, au bord d’une alvéole gonflée d’air.',
    ...au(RESPIRATION),
  }),
  () => ({
    recit: 'Le sang file maintenant vers un muscle de la cuisse en plein effort : tu cours après le bus.',
    question: 'Qu’apporte le sang au muscle qui travaille ?',
    bonne: 'Nutriments et dioxygène',
    pieges: { 'Nutriments seulement': 'besoins-dioxygene', 'Dioxyde de carbone': 'besoins-dechet' },
  }),
  () => ({
    recit: 'La capsule ressort et se pose dans la cuisine. Dernière porte : le réfrigérateur, où attend la bouteille de lait entamée.',
    question: 'Pourquoi garder le lait entamé au réfrigérateur ?',
    bonne: 'Le froid ralentit les microbes',
    pieges: { 'Le froid tue tous les microbes': 'hygiene-froid', 'Le lait ne contient aucun microbe': 'hygiene-sans-microbe' },
  }),
];

// ---------------------------------------------------------------- 4e

const ROCHES = [
  {
    question: 'Le basalte noir de la coulée, à tout petits cristaux : comment s’est-il formé ?',
    bonne: 'Lave refroidie vite, en surface',
    pieges: { 'Magma refroidi lentement, en profondeur': 'roche-granite', 'Sédiments tassés au fond de l’eau': 'roche-sedimentaire' },
  },
  {
    question: 'Le granite de la vitrine, à gros cristaux : comment s’est-il formé ?',
    bonne: 'Magma refroidi lentement, en profondeur',
    pieges: { 'Lave refroidie vite, en surface': 'roche-basalte', 'Sédiments tassés au fond de l’eau': 'roche-sedimentaire' },
  },
];

const CHAINES = [
  ['Herbe', 'lapin', 'renard'],
  ['Herbe', 'criquet', 'lézard'],
  ['Feuille', 'chenille', 'mésange'],
  ['Graines', 'mulot', 'chouette'],
];

const majuscule = (mot) => mot[0].toUpperCase() + mot.slice(1);

const QUATRIEME = [
  () => ({
    recit: 'Sur la carte du monde du poste de contrôle, les séismes de l’année s’allument en points rouges. Ils dessinent des lignes.',
    question: 'Où se trouvent la plupart des volcans et des séismes ?',
    bonne: 'Aux limites des plaques',
    pieges: { 'Au milieu des plaques': 'tecto-milieu', 'Dans les pays chauds': 'tecto-chaleur' },
  }),
  () => ({
    recit: 'L’Islande est posée sur la dorsale de l’Atlantique. Les balises GPS de part et d’autre de la faille envoient leurs positions.',
    question: 'Sur la dorsale, que font les deux plaques ?',
    bonne: 'Elles s’écartent',
    pieges: { 'Elles se rapprochent': 'plaques-dorsale', 'Elles restent immobiles': 'plaques-immobiles' },
  }),
  ({ au }) => ({
    recit: 'Pour dater l’activité du volcan, il faut reconnaître les roches. Deux échantillons attendent sur la table.',
    ...au(ROCHES),
  }),
  () => ({
    recit: 'En ramassant un échantillon tout juste sorti de la coulée, tu retires ta main d’un coup, avant même d’avoir mal.',
    question: 'Quel trajet a suivi le message nerveux de ce réflexe ?',
    bonne: 'Peau → moelle épinière → muscle',
    pieges: { 'Muscle → moelle épinière → peau': 'reflexe-sens', 'Peau → cerveau → muscle': 'reflexe-cerveau' },
  }),
  () => ({
    recit: 'Sur les vieilles coulées noires, les scientifiques comptent les insectes. Les plus sombres sont devenus les plus nombreux.',
    question: 'Pourquoi les insectes sombres sont-ils devenus plus nombreux sur la lave noire ?',
    bonne: 'Moins repérés, ils survivent mieux',
    pieges: { 'Ils ont noirci pour se cacher': 'selection-finalisme', 'La cendre les a noircis': 'selection-acquis' },
  }),
  ({ au }) => {
    const [p, h, c] = au(CHAINES);
    return {
      recit: 'Dernier écran : la fiche de l’écosystème de la vallée, à vérifier avant l’évacuation.',
      question: 'Laquelle de ces chaînes alimentaires est bien écrite ?',
      bonne: `${p} → ${h} → ${c}`,
      pieges: {
        [`${majuscule(c)} → ${h} → ${p.toLowerCase()}`]: 'chaine-fleche',
        [`${majuscule(h)} → ${p.toLowerCase()} → ${c}`]: 'chaine-producteur',
      },
    };
  },
];

// ---------------------------------------------------------------- 3e

/** Nombre de chromosomes par cellule (hors cellules reproductrices). */
const ESPECES = [
  { nom: 'humaines', n: 46 },
  { nom: 'de souris', n: 40 },
  { nom: 'de chat', n: 38 },
  { nom: 'de cheval', n: 64 },
  { nom: 'de chien', n: 78 },
];

const TROISIEME = [
  () => ({
    recit: 'Dans la précipitation, une chercheuse s’est enfoncé une écharde. En quelques minutes, la peau rougit, chauffe et gonfle.',
    question: 'Qui agit en premier contre les microbes de l’écharde ?',
    bonne: 'Les phagocytes : réaction innée',
    pieges: { 'Les anticorps : réaction adaptative': 'immunite-delai', 'Les globules rouges': 'immunite-globules' },
  }),
  () => ({
    recit: 'Au poste de soins, une affiche rappelle que tout le personnel est vacciné. Le cadenas veut savoir ce que contient une dose.',
    question: 'Que contient un vaccin ?',
    bonne: 'Un microbe inoffensif ou un morceau',
    pieges: { 'Des anticorps tout prêts': 'vaccin-anticorps', 'Un antibiotique': 'vaccin-antibiotique' },
  }),
  ({ au }) => {
    const e = au(ESPECES);
    return {
      recit: 'Dans l’incubateur, des cultures de cellules se divisent. Le microscope suit une cellule en pleine mitose.',
      question: `Des cellules ${e.nom} ont ${e.n} chromosomes. Après la mitose, chaque cellule fille en a… ?`,
      bonne: `${e.n} chromosomes`,
      pieges: { [`${e.n / 2} chromosomes`]: 'mitose-moitie', [`${e.n * 2} chromosomes`]: 'mitose-double' },
    };
  },
  () => ({
    recit: 'Le dossier médical de l’équipe s’ouvre sur les groupes sanguins. La question du cadenas porte sur leur origine.',
    question: 'Les groupes sanguins A, B et O sont dus à… ?',
    bonne: 'Trois allèles d’un même gène',
    pieges: { 'Trois gènes différents': 'allele-gene', 'Trois chromosomes différents': 'allele-chromosome' },
  }),
  () => ({
    recit: 'Deux frères travaillent au laboratoire. Mêmes parents, et pourtant des allèles différents sur leurs fiches.',
    question: 'Pourquoi deux frères, qui ne sont pas jumeaux, ont-ils des allèles différents ?',
    bonne: 'Méiose et fécondation, au hasard',
    pieges: { 'Chacun n’hérite que d’un parent': 'meiose-un-parent', 'Leurs gènes ont muté': 'meiose-mutation' },
  }),
  () => ({
    recit: 'Voici la souche échappée : elle résiste à l’antibiotique qui tuait ses ancêtres. Dernier cadenas.',
    question: 'D’où vient l’allèle qui rend cette bactérie résistante ?',
    bonne: 'D’une mutation de l’ADN, au hasard',
    pieges: { 'L’antibiotique l’a créé': 'mutation-provoquee', 'D’une méiose de la bactérie': 'mutation-meiose' },
  }),
];

const HISTOIRES = {
  CINQUIEME: { prefixe: '5e', code: ['O', 'R', 'G', 'A', 'N', 'E'], etapes: CINQUIEME },
  QUATRIEME: { prefixe: '4e', code: ['S', 'E', 'I', 'S', 'M', 'E'], etapes: QUATRIEME },
  TROISIEME: { prefixe: '3e', code: ['V', 'A', 'C', 'C', 'I', 'N'], etapes: TROISIEME },
};

export function serie(graine = Date.now(), niveau = 'CINQUIEME') {
  const o = outils(graine);
  const h = HISTOIRES[niveau] ?? HISTOIRES.CINQUIEME;
  return h.etapes.map((etape, i) => {
    const {
      recit, question, bonne, pieges,
    } = etape(o);
    return {
      consigne: `${h.prefixe}-etape-${i + 1}`,
      recit,
      question,
      choix: o.melanger([bonne, ...Object.keys(pieges)]).map((c) => ({ cle: c, libelle: c })),
      bonne,
      pieges,
      cadenas: { avant: h.code.slice(0, i), piece: h.code[i], total: MANCHES },
    };
  });
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // 5e — les consignes
  '5e-etape-1': 'Première porte : trouve d’où vient le glucose de ton repas.',
  '5e-etape-2': 'Deuxième porte : trouve où les nutriments passent dans le sang.',
  '5e-etape-3': 'Troisième porte : trie les micro-organismes, les utiles et ceux qui rendent malade.',
  '5e-etape-4': 'Quatrième porte : explique les échanges de gaz dans les poumons.',
  '5e-etape-5': 'Cinquième porte : dis ce que le sang apporte au muscle.',
  '5e-etape-6': 'Dernière porte : explique cette règle d’hygiène par son effet sur les microbes.',
  // 5e — les erreurs
  'alim-proteines': 'La viande, le poisson et les œufs apportent surtout des protéines, qui construisent le corps. Le glucose vient de l’amidon des féculents.',
  'alim-lipides': 'L’huile et le beurre apportent des lipides. Le glucose vient de l’amidon du pain, des pâtes et du riz.',
  'digestion-estomac': 'L’estomac poursuit la digestion, mais c’est à travers la paroi de l’intestin grêle, très longue et repliée, que les nutriments passent dans le sang.',
  'digestion-gros-intestin': 'Le gros intestin reçoit surtout ce qui n’a pas été digéré : les nutriments sont déjà passés dans le sang au niveau de l’intestin grêle.',
  'microbe-pathogene': 'Celui-là est pathogène : il provoque une maladie. D’autres micro-organismes nous servent, comme la levure du pain ou les bactéries du yaourt.',
  'microbe-utile': 'Celui-là nous est utile. Beaucoup de micro-organismes sont inoffensifs ou utiles ; seuls certains, dits pathogènes, rendent malade.',
  'respi-sens': 'Le dioxyde de carbone fait le chemin inverse : il quitte le sang pour l’air expiré. C’est le dioxygène qui passe de l’air au sang.',
  'respi-diazote': 'Le diazote forme la plus grande part de l’air, mais le corps ne l’utilise pas : il ressort comme il est entré. C’est le dioxygène qui passe dans le sang.',
  'respi-expire': 'Le sang ne prend qu’une partie du dioxygène de l’air : l’air expiré en contient encore, un peu moins qu’à l’entrée.',
  'respi-plus': 'Le sang prend du dioxygène à l’air des poumons : il en reste donc moins dans l’air expiré, pas plus.',
  'besoins-dioxygene': 'Un muscle qui travaille consomme des nutriments et du dioxygène : le sang lui apporte les deux.',
  'besoins-dechet': 'Le dioxyde de carbone est un déchet que le muscle rejette : le sang l’emporte vers les poumons, il ne l’apporte pas.',
  'hygiene-froid': 'Le froid ne tue pas les microbes : il ralentit leur multiplication. Voilà pourquoi un aliment se garde quelques jours au frais, pas pour toujours.',
  'hygiene-sans-microbe': 'Une bouteille ouverte reçoit des microbes de l’air et des mains : le froid ralentit leur multiplication.',

  // 4e — les consignes
  '4e-etape-1': 'Premier cadenas : trouve où se produisent la plupart des séismes et des éruptions.',
  '4e-etape-2': 'Deuxième cadenas : dis comment bougent les plaques sous l’Islande.',
  '4e-etape-3': 'Troisième cadenas : retrouve comment cette roche s’est formée.',
  '4e-etape-4': 'Quatrième cadenas : retrace le trajet du message nerveux.',
  '4e-etape-5': 'Cinquième cadenas : explique le changement chez les insectes, en vrai biologiste.',
  '4e-etape-6': 'Dernier cadenas : choisis la chaîne alimentaire bien écrite.',
  // 4e — les erreurs
  'tecto-milieu': 'Séismes et volcans se concentrent le long des limites des plaques, là où elles s’écartent, se rapprochent ou glissent l’une contre l’autre.',
  'tecto-chaleur': 'Le climat n’y est pour rien : le magma vient des profondeurs. L’Islande, couverte de glaciers, compte de nombreux volcans parce qu’elle est posée sur une limite de plaques.',
  'plaques-dorsale': 'À une dorsale, les plaques s’écartent et le magma qui remonte forme une croûte nouvelle. Elles se rapprochent ailleurs, dans les zones de subduction.',
  'plaques-immobiles': 'Les plaques bougent sans cesse, de quelques centimètres par an : trop lentement pour le voir, assez pour le mesurer par satellite.',
  'roche-granite': 'Le basalte a de tout petits cristaux : la lave a refroidi vite, en surface. C’est le granite, aux gros cristaux, qui a refroidi lentement en profondeur.',
  'roche-basalte': 'Le granite a de gros cristaux : il lui a fallu un refroidissement lent, en profondeur. Refroidi vite en surface, le magma donne le basalte.',
  'roche-sedimentaire': 'Les roches faites de sédiments tassés sont des roches sédimentaires, comme le calcaire. Le basalte et le granite viennent d’un magma refroidi.',
  'reflexe-sens': 'Le message part toujours du récepteur, ici la peau, et finit au muscle, qui retire la main.',
  'reflexe-cerveau': 'Dans ce réflexe, c’est la moelle épinière qui commande la réponse, avant même que le cerveau ne ressente la douleur.',
  'selection-finalisme': 'Un être vivant ne change pas pour s’adapter. Parmi des insectes déjà variés, les plus sombres, moins vus des oiseaux, survivent et se reproduisent davantage.',
  'selection-acquis': 'Une couleur acquise pendant la vie, comme de la cendre, ne se transmet pas aux petits : seule la couleur héritée, inscrite dans les gènes, passe aux générations suivantes.',
  'chaine-fleche': 'Dans une chaîne alimentaire, la flèche se lit « est mangé par » : elle part de l’aliment et va vers celui qui le mange.',
  'chaine-producteur': 'Une chaîne alimentaire commence par un végétal, le producteur : c’est lui qui fabrique la matière que les animaux mangent ensuite.',

  // 3e — les consignes
  '3e-etape-1': 'Premier cadenas : dis qui défend le corps en premier.',
  '3e-etape-2': 'Deuxième cadenas : dis ce que contient un vaccin.',
  '3e-etape-3': 'Troisième cadenas : compte les chromosomes après la mitose.',
  '3e-etape-4': 'Quatrième cadenas : explique l’origine des groupes sanguins.',
  '3e-etape-5': 'Cinquième cadenas : explique pourquoi deux frères sont différents.',
  '3e-etape-6': 'Dernier cadenas : trouve d’où vient la résistance de la bactérie.',
  // 3e — les erreurs
  'immunite-delai': 'Les anticorps de la réaction adaptative mettent plusieurs jours à arriver. La réponse immédiate, sur place, c’est la réaction innée : les phagocytes avalent les microbes.',
  'immunite-globules': 'Les globules rouges transportent le dioxygène. Ce sont des globules blancs, les phagocytes, qui attaquent les microbes en premier.',
  'vaccin-anticorps': 'Un vaccin n’apporte pas d’anticorps : il présente au corps un microbe rendu inoffensif, ou un de ses morceaux, pour qu’il fabrique lui-même ses anticorps et sa mémoire.',
  'vaccin-antibiotique': 'Un antibiotique tue des bactéries déjà présentes. Le vaccin, lui, prépare le corps à l’avance, en lui faisant construire sa propre mémoire immunitaire.',
  'mitose-moitie': 'Avant la mitose, chaque chromosome est copié : chaque cellule fille reçoit donc autant de chromosomes que la cellule mère.',
  'mitose-double': 'Les copies se partagent entre les deux cellules filles : chacune garde autant de chromosomes que la cellule mère, pas le double.',
  'allele-gene': 'Un gène occupe une place précise sur un chromosome ; ses différentes versions sont des allèles. A, B et O sont trois versions du même gène.',
  'allele-chromosome': 'Un chromosome porte de nombreux gènes. Le groupe sanguin dépend d’un seul gène, dont A, B et O sont les allèles.',
  'meiose-un-parent': 'Chaque enfant reçoit la moitié de ses chromosomes de son père, l’autre moitié de sa mère. C’est le tri au hasard de la méiose qui change le lot d’un enfant à l’autre.',
  'meiose-mutation': 'Les mutations sont rares. La diversité entre frères vient surtout du tri des chromosomes pendant la méiose, puis de la rencontre au hasard des gamètes à la fécondation.',
  'mutation-provoquee': 'L’antibiotique ne crée pas la résistance : la mutation est apparue au hasard, avant. L’antibiotique tue les autres bactéries et laisse les résistantes se multiplier.',
  'mutation-meiose': 'Une bactérie ne fait pas de méiose : elle se divise en deux. Un allèle nouveau naît d’une mutation, une modification de l’ADN.',
};
