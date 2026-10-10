import { outils } from '../../outils.js';
import { rangDe } from '../reglages.js';

/**
 * L'IMAGE QUI MENT — « Détective de l'Histoire », Camara, le 10/10/2026
 * (cahier « Nouveaux jeux d'histoire et de géographie »). Une scène d'une
 * époque passée, dessinée par Camara ; un objet n'a rien à y faire. L'enfant
 * promène une loupe sur l'image et touche l'intrus pour l'accuser.
 *
 * LES POSITIONS ONT ÉTÉ RELEVÉES À L'ŒIL, SUR CHAQUE IMAGE (10/10/2026), une
 * grille en pour cent posée dessus : `x`, `y` le centre de l'objet, en pour
 * cent de la largeur et de la hauteur ; `r` le rayon de la zone qui compte
 * comme juste, en pour cent de la LARGEUR (l'image est en 16:9 : voir
 * `RAPPORT`). Généreux exprès, et plus encore pour les petits (`marge`).
 *
 * CE QUE L'IMAGE MONTRE EN PLUS :
 *   - `aussi` : un SECOND objet impossible que le générateur a glissé (la
 *     longue-vue de 1492). L'accuser est juste : ce serait injuste de punir
 *     l'enfant qui a raison. Les deux s'entourent à la fin ;
 *   - `leurres` : un objet d'époque qui RESSEMBLE à un objet moderne (les
 *     lampes de l'usine, l'instrument de visée de Bagdad). Le soupçon est
 *     raisonnable : Salim l'explique, et la loupe n'est pas perdue.
 * Ces scènes sont signalées à Camara pour être refaites.
 *
 * LA DIFFICULTÉ SUIT LA CLASSE (`niveau` de la scène : 1 l'objet est grand et
 * connu de tous, 2 il est petit ou se cache, 3 il faut savoir ce qui est
 * moderne — la télé plate dans un salon des années 1960).
 *
 * TOUT CE QUE SALIM DIT est dans `PHRASES`, avec des clés stables : la
 * consigne, l'indice et l'explication de chaque scène, les leurres.
 */

/** Hauteur sur largeur des images (1672 × 941). */
export const RAPPORT = 941 / 1672;

/** Le nombre de scènes d'une partie. */
export const SCENES_PAR_PARTIE = 5;

export const SCENES = [
  {
    id: '01-lascaux',
    titre: 'Les peintres de Lascaux',
    epoque: 'Préhistoire, il y a environ 17 000 ans',
    niveau: 1,
    intrus: { nom: 'une lampe de poche', x: 46.5, y: 22, r: 6 },
  },
  {
    id: '02-pyramides',
    titre: 'Le chantier de la grande pyramide',
    epoque: 'Égypte, vers 2560 av. J.-C.',
    niveau: 2,
    intrus: { nom: 'une montre-bracelet', x: 24.3, y: 55, r: 4.5 },
  },
  {
    id: '03-agora',
    titre: 'L’agora d’Athènes',
    epoque: 'Grèce, vers 450 av. J.-C.',
    niveau: 1,
    intrus: { nom: 'des lunettes de soleil', x: 23.5, y: 39, r: 5 },
  },
  {
    id: '04-forum',
    titre: 'Le forum de Rome',
    epoque: 'Empire romain, vers l’an 100',
    niveau: 1,
    intrus: { nom: 'un vélo', x: 88.5, y: 75, r: 10 },
  },
  {
    id: '05-village-gaulois',
    titre: 'Un village gaulois',
    epoque: 'Gaule, vers 60 av. J.-C.',
    niveau: 1,
    intrus: { nom: 'un téléphone portable', x: 27.8, y: 60, r: 4.5 },
  },
  {
    id: '06-drakkar',
    titre: 'Les Vikings débarquent',
    epoque: 'Vikings, vers l’an 900',
    niveau: 1,
    intrus: { nom: 'un gilet de sauvetage', x: 30.5, y: 47.5, r: 5 },
  },
  {
    id: '07-tombouctou',
    titre: 'Tombouctou, la ville des savants',
    epoque: 'Empire du Mali, vers 1330',
    niveau: 2,
    intrus: { nom: 'un sac à dos fluo', x: 66, y: 72, r: 4.5 },
  },
  {
    id: '08-bagdad',
    titre: 'La Maison de la sagesse',
    epoque: 'Bagdad, vers 830',
    niveau: 2,
    intrus: { nom: 'un ordinateur portable', x: 39, y: 60, r: 5.5 },
    leurres: [{ x: 56.4, y: 32.3, r: 4 }],
  },
  {
    id: '09-chateau-fort',
    titre: 'La cour du château fort',
    epoque: 'Moyen Âge, vers 1200',
    niveau: 2,
    intrus: { nom: 'une ampoule électrique', x: 87, y: 13, r: 5 },
  },
  {
    id: '10-cathedrale',
    titre: 'Le chantier de la cathédrale',
    epoque: 'Moyen Âge, vers 1220',
    niveau: 1,
    intrus: { nom: 'un casque de chantier en plastique', x: 35, y: 51, r: 5 },
  },
  {
    id: '11-marche-medieval',
    titre: 'Le marché de la ville',
    epoque: 'Moyen Âge, vers 1350',
    niveau: 2,
    intrus: { nom: 'une canette de soda', x: 18, y: 73.5, r: 4 },
  },
  {
    id: '12-samourais',
    titre: 'Une ville de samouraïs',
    epoque: 'Japon, vers 1600',
    niveau: 1,
    intrus: { nom: 'une planche à roulettes', x: 91, y: 75, r: 8 },
  },
  {
    id: '13-cite-maya',
    titre: 'Une cité maya',
    epoque: 'Mayas, vers 750',
    niveau: 2,
    intrus: { nom: 'un avion', x: 39, y: 7, r: 5.5 },
  },
  {
    id: '14-atelier-vinci',
    titre: 'L’atelier de Léonard de Vinci',
    epoque: 'Renaissance, vers 1500',
    niveau: 2,
    intrus: { nom: 'un smartphone', x: 46.5, y: 84, r: 5 },
  },
  {
    id: '15-caravelle',
    titre: 'À bord de la caravelle',
    epoque: 'Océan Atlantique, 1492',
    niveau: 3,
    intrus: { nom: 'une montre connectée', x: 40.5, y: 62, r: 4.5 },
    aussi: [{ cle: 'longue-vue', nom: 'une longue-vue', x: 76.5, y: 54, r: 4.5 }],
  },
  {
    id: '16-versailles',
    titre: 'La galerie des Glaces',
    epoque: 'Versailles, vers 1685',
    niveau: 1,
    intrus: { nom: 'un ventilateur électrique', x: 13.5, y: 58, r: 7 },
  },
  {
    id: '17-bastille',
    titre: 'Devant la Bastille',
    epoque: 'Paris, 14 juillet 1789',
    niveau: 1,
    intrus: { nom: 'un mégaphone électrique', x: 26, y: 32.5, r: 5 },
  },
  {
    id: '18-usine',
    titre: 'Une usine textile',
    epoque: 'Révolution industrielle, vers 1850',
    niveau: 2,
    intrus: { nom: 'un écran d’ordinateur', x: 66.5, y: 59, r: 6 },
    leurres: [{ x: 5.1, y: 21.3, r: 4 }, { x: 19.9, y: 29.6, r: 3 }, { x: 24.4, y: 33.2, r: 2.5 }],
  },
  {
    id: '19-expo-1889',
    titre: 'L’Exposition universelle',
    epoque: 'Paris, 1889',
    niveau: 1,
    intrus: { nom: 'une trottinette électrique', x: 52.5, y: 77, r: 7 },
  },
  {
    id: '20-far-west',
    titre: 'Une ville du Far West',
    epoque: 'États-Unis, vers 1870',
    niveau: 3,
    intrus: { nom: 'une voiture moderne', x: 90.5, y: 51, r: 4.5 },
  },
  {
    id: '21-ecole-1900',
    titre: 'La classe du village',
    epoque: 'France, vers 1900',
    niveau: 1,
    intrus: { nom: 'une tablette tactile', x: 35.5, y: 78.5, r: 6 },
  },
  {
    id: '22-salon-1960',
    titre: 'Le salon des années 1960',
    epoque: 'France, vers 1965',
    niveau: 3,
    intrus: { nom: 'une télévision à écran plat', x: 23, y: 9, r: 6.5 },
    leurres: [{ x: 25, y: 44.5, r: 4.5 }],
  },
  {
    id: '23-lune-1969',
    titre: 'Les premiers pas sur la Lune',
    epoque: 'La Lune, juillet 1969',
    niveau: 2,
    intrus: { nom: 'un drone', x: 39.5, y: 8, r: 6 },
  },
  {
    id: '24-chantier-muraille',
    titre: 'Le chantier de la Grande Muraille',
    epoque: 'Chine, vers 210 av. J.-C.',
    niveau: 2,
    intrus: { nom: 'un ballon de football', x: 69, y: 81, r: 4.5 },
  },
];

/**
 * CE QUE DIT SALIM. Une explication est EXACTE (date de l'invention, ce qu'on
 * faisait à la place) : relue le 10/10/2026 ; les points douteux sont dans le
 * rapport de ce jour-là, pas inventés ici.
 */
export const PHRASES = {
  consigne: 'Un objet n’a rien à faire ici : promène ta loupe et touche l’intrus !',
  trouve: 'Bien vu, détective ! C’est un anachronisme.',
  rate: 'Ce n’est pas ça… Cette loupe est perdue. Regarde encore !',
  'plus-de-loupes': 'Tu n’as plus de loupe. Je te montre l’intrus.',
  montre: 'Le voici, l’intrus. Regarde bien où il se cachait.',
  fin: 'Enquête terminée ! Tous ces objets sont rangés dans ton dossier.',

  'indice-01-lascaux': 'Regarde bien ce qui éclaire les peintures : ce n’est pas seulement le feu.',
  'explication-01-lascaux': 'Une lampe de poche ? Impossible ! Elle marche avec une pile et une ampoule : elle n’a été inventée que vers 1900. Les peintres de Lascaux s’éclairaient avec des torches et de petites lampes en pierre où brûlait de la graisse animale.',

  'indice-02-pyramides': 'Regarde le poignet du scribe qui écrit, à gauche.',
  'explication-02-pyramides': 'Une montre-bracelet ? Impossible ! Les premières montres-bracelets datent du XIXe siècle, et tout le monde en porte seulement depuis le XXe siècle. Les Égyptiens lisaient l’heure grâce au soleil et aux ombres ; plus tard, ils inventeront aussi des horloges à eau.',

  'indice-03-agora': 'Regarde le visage du vieux philosophe qui parle.',
  'explication-03-agora': 'Des lunettes de soleil ? Impossible ! Elles n’existent que depuis le XXe siècle, et même les simples lunettes de vue n’ont été inventées qu’au Moyen Âge, vers 1300. Pour se protéger du soleil, les Grecs portaient un chapeau à large bord, le pétase.',

  'indice-04-forum': 'Regarde au pied de la grande colonne, tout à droite.',
  'explication-04-forum': 'Un vélo ? Impossible ! Son ancêtre sans pédales, la draisienne, date de 1817, et le vélo à pédales et à chaîne d’environ 1885. Les Romains marchaient, montaient à cheval, ou se faisaient porter en litière.',

  'indice-05-village-gaulois': 'Regarde ce que tient l’enfant aux tresses, à gauche, près du chien.',
  'explication-05-village-gaulois': 'Un téléphone portable ? Impossible ! Le premier appel avec un téléphone portable date de 1973. Pour se prévenir, les Gaulois envoyaient des messagers ; Jules César raconte même qu’ils se passaient les nouvelles en criant de champ en champ.',

  'indice-06-drakkar': 'Regarde les rameurs assis dans le bateau.',
  'explication-06-drakkar': 'Un gilet de sauvetage ? Impossible ! Les premiers gilets de sauvetage, en liège, datent du XIXe siècle, et les gilets orange, faits pour être vus de loin, du XXe siècle. Les Vikings traversaient les mers sans rien de tel.',

  'indice-07-tombouctou': 'Regarde le dos du voyageur en blanc, qui marche au milieu des chameaux.',
  'explication-07-tombouctou': 'Un sac à dos fluo ? Impossible ! Ce tissu synthétique et ces couleurs fluo n’existent que depuis le XXe siècle. À Tombouctou, les marchandises voyageaient à dos de chameau, dans des sacs de cuir et de toile, comme ces grandes plaques de sel.',

  'indice-08-bagdad': 'Regarde le bureau du jeune savant qui réfléchit, la main sur le menton.',
  'explication-08-bagdad': 'Un ordinateur portable ? Impossible ! Les premiers ordinateurs portables datent des années 1980. À Bagdad, on avait déjà du papier, une invention venue de Chine, mais chaque livre était recopié et traduit à la main.',
  'leurre-08-bagdad': 'Bien vu de te méfier, mais cet instrument est de l’époque : les astronomes de Bagdad visaient les étoiles avec des instruments de cuivre, sans aucune lentille. Ta loupe est sauve, cherche encore !',

  'indice-09-chateau-fort': 'Lève les yeux vers la porte en bois, à droite.',
  'explication-09-chateau-fort': 'Une ampoule électrique ? Impossible ! L’ampoule électrique a été mise au point vers 1879, et il a fallu encore des années pour amener l’électricité dans les maisons. Au château, on s’éclairait avec des bougies, des torches et des lampes à huile.',

  'indice-10-cathedrale': 'Regarde la tête du tailleur de pierre, au premier plan.',
  'explication-10-cathedrale': 'Un casque de chantier ? Impossible ! Les casques de protection n’apparaissent qu’au XXe siècle, et ceux en plastique à partir des années 1950. Les bâtisseurs de cathédrales travaillaient tête nue, ou avec un simple bonnet.',

  'indice-11-marche-medieval': 'Regarde l’étal des fromages, à gauche.',
  'explication-11-marche-medieval': 'Une canette de soda ? Impossible ! Les sodas sont nés au XIXe siècle, et les boissons en canette dans les années 1930. Au Moyen Âge, on buvait de l’eau, du lait, de la bière ou du vin, servis dans des cruches et des gobelets.',

  'indice-12-samourais': 'Regarde contre le mur de la maison de thé, tout à droite.',
  'explication-12-samourais': 'Une planche à roulettes ? Impossible ! Elle a été inventée en Californie, dans les années 1950, par des surfeurs. Au Japon de 1600, on se déplaçait à pied, à cheval, ou porté dans une sorte de chaise à porteurs.',

  'indice-13-cite-maya': 'Lève les yeux vers le ciel, au-dessus des montagnes.',
  'explication-13-cite-maya': 'Un avion ? Impossible ! Le premier vol en avion date de 1903, et les avions de ligne comme celui-ci des années 1950. Les Mayas, eux, observaient le ciel pour suivre le Soleil, la Lune et Vénus, et régler leur calendrier.',

  'indice-14-atelier-vinci': 'Regarde la grande table de travail, au premier plan.',
  'explication-14-atelier-vinci': 'Un smartphone ? Impossible ! Les smartphones datent des années 1990 et 2000. Léonard de Vinci notait tout à la main dans ses carnets : on en a gardé des milliers de pages, pleines de dessins de machines.',

  'indice-15-caravelle': 'Regarde le poignet du capitaine qui tient la carte.',
  'explication-15-caravelle': 'Une montre connectée ? Impossible ! Les montres connectées sont apparues dans les années 2010. À bord, on mesurait le temps avec un sablier, qu’un mousse retournait toutes les demi-heures.',
  'aussi-15-caravelle-longue-vue': 'Et la longue-vue du marin ? Elle aussi est impossible : la lunette n’a été inventée qu’en 1608, aux Pays-Bas. En 1492, les marins guettaient la terre à l’œil nu.',

  'indice-16-versailles': 'Regarde la table dorée, à gauche, près des fleurs.',
  'explication-16-versailles': 'Un ventilateur électrique ? Impossible ! Il a été inventé en 1882. À la cour de Louis XIV, pour avoir un peu d’air, on agitait un éventail, comme la dame en bleu.',

  'indice-17-bastille': 'Regarde le jeune homme debout sur les caisses, à gauche.',
  'explication-17-bastille': 'Un mégaphone électrique ? Impossible ! Ce porte-voix à piles date du milieu du XXe siècle. En 1789, il existait des porte-voix en cuivre, mais les orateurs comptaient surtout sur leur voix, les affiches et les journaux.',

  'indice-18-usine': 'Regarde le bureau en bois, à côté du grand pilier.',
  'explication-18-usine': 'Un écran d’ordinateur ? Impossible ! Les premiers ordinateurs personnels datent des années 1970, et les écrans plats comme celui-ci des années 2000. En 1850, la grande nouveauté pour communiquer, c’était le télégraphe électrique.',
  'leurre-18-usine': 'Bonne idée de te méfier des lampes ! En 1850, les usines s’éclairaient au gaz, une flamme sous un globe de verre ; l’ampoule électrique n’arrivera que vers 1879. Celles-ci ressemblent à des ampoules : ta loupe est sauve. Mais un autre objet est encore plus impossible…',

  'indice-19-expo-1889': 'Regarde le garçon qui roule au milieu de la foule.',
  'explication-19-expo-1889': 'Une trottinette électrique ? Impossible ! Elles ont envahi les villes vers 2018. En 1889, les visiteurs venaient à pied, en fiacre ou en omnibus tiré par des chevaux. La tour Eiffel, elle, était toute neuve : construite pour cette exposition !',

  'indice-20-far-west': 'Regarde tout au bout de la rue, à droite, près de la voie ferrée.',
  'explication-20-far-west': 'Une voiture ? Impossible ! La première automobile a roulé en 1886, et une voiture comme celle-ci date de notre siècle. En 1870, dans l’Ouest américain, on voyageait à cheval, en diligence ou en train à vapeur.',

  'indice-21-ecole-1900': 'Regarde le pupitre du garçon qui rêvasse, au premier plan.',
  'explication-21-ecole-1900': 'Une tablette tactile ? Impossible ! Les tablettes tactiles se sont répandues à partir de 2010. En 1900, les élèves écrivaient à la plume, qu’ils trempaient dans l’encrier de leur pupitre, et sur une ardoise.',

  'indice-22-salon-1960': 'Lève les yeux vers l’étagère du haut, au-dessus de la maman.',
  'explication-22-salon-1960': 'Une télé à écran plat ? Impossible ! Les téléviseurs plats se sont répandus dans les années 2000. En 1965, la télévision avait un gros tube à l’arrière, comme celle posée sur le meuble, et l’image était en noir et blanc : en France, la couleur n’arrive qu’en 1967.',
  'leurre-22-salon-1960': 'Bien vu de te méfier de cet appareil ! Mais les postes de radio et les magnétophones existaient déjà en 1965. Ta loupe est sauve : cherche encore !',

  'indice-23-lune-1969': 'Lève les yeux vers le ciel noir, au-dessus des astronautes.',
  'explication-23-lune-1969': 'Un drone ? Impossible ! Les petits drones à hélices avec une caméra se sont répandus dans les années 2010. Et sur la Lune, il n’y a pas d’air : ses hélices ne pourraient même pas le faire voler !',

  'indice-24-chantier-muraille': 'Regarde par terre, au milieu des pierres, à droite.',
  'explication-24-chantier-muraille': 'Un ballon de football ? Impossible ! Les règles du football datent de 1863, en Angleterre, et ce ballon noir et blanc des années 1960. Pourtant, les Chinois jouaient déjà à un jeu de balle au pied, le cuju, avec une balle de cuir bourrée de plumes.',
};

/** Les clés des phrases d'une scène. */
export const cleIndice = (scene) => `indice-${scene.id}`;
export const cleExplication = (scene) => `explication-${scene.id}`;
export const cleLeurre = (scene) => `leurre-${scene.id}`;
export const cleAussi = (scene, autre) => `aussi-${scene.id}-${autre.cle}`;

/** Les loupes d'une scène : une mauvaise accusation en coûte une. */
export function loupesDe(niveau) {
  const rang = rangDe(niveau);
  if (rang <= 3) return 4;
  if (rang <= 9) return 3;
  return 2;
}

/** Le rayon en plus pour les petits doigts : une zone plus large au primaire. */
export function marge(niveau) {
  const rang = rangDe(niveau);
  if (rang <= 3) return 1.4;
  if (rang <= 5) return 1.2;
  return 1;
}

/** Le nombre de scènes de chaque niveau d'une partie, selon l'année : [n1, n2, n3]. */
export function dosage(niveau) {
  const rang = rangDe(niveau);
  if (rang <= 3) return [5, 0, 0];
  if (rang <= 5) return [3, 2, 0];
  if (rang <= 9) return [2, 2, 1];
  return [1, 2, 2];
}

/** La distance d'un point (en pour cent) à une zone, en pour cent de la largeur. */
function distance(zone, x, y) {
  const dx = x - zone.x;
  const dy = (y - zone.y) * RAPPORT;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * CE QUE L'ENFANT A TOUCHÉ, en (x, y) pour cent de l'image :
 *   - { sorte: 'intrus' } : l'intrus, ou un objet de `aussi` (`autre`) ;
 *   - { sorte: 'leurre' } : un objet qui ressemble, sans le coût d'une loupe ;
 *   - { sorte: 'rien' } : une mauvaise accusation.
 */
export function toucher(scene, x, y, niveau = 'CP') {
  const m = marge(niveau);
  if (distance(scene.intrus, x, y) <= scene.intrus.r * m) return { sorte: 'intrus', autre: null };
  const autre = (scene.aussi ?? []).find((a) => distance(a, x, y) <= a.r * m);
  if (autre) return { sorte: 'intrus', autre };
  // Le leurre sans marge : il ne doit jamais manger la zone de l'intrus.
  if ((scene.leurres ?? []).some((l) => distance(l, x, y) <= l.r)) return { sorte: 'leurre' };
  return { sorte: 'rien' };
}

/** La taille du tampon (le petit, celui de cette scène), en pour cent de l'image. */
export const TAMPON = { demiLargeur: 21, demiHauteur: 9 };

/** Les places possibles du tampon « ANACHRONISME », en pour cent de l'image. */
const PLACES_DU_TAMPON = [
  { x: 27, y: 20 }, { x: 73, y: 20 }, { x: 27, y: 82 }, { x: 73, y: 82 }, { x: 50, y: 14 }, { x: 50, y: 86 },
];

/**
 * OÙ FRAPPE LE TAMPON : la place la plus loin de l'intrus (et du second
 * objet) — au milieu, il cachait l'objet même qu'on vient d'entourer.
 */
export function placeDuTampon(scene) {
  const zones = [scene.intrus, ...(scene.aussi ?? [])];
  // Le tampon, vu comme un rectangle d'environ 42 % × 18 % de l'image : la
  // marge (positive) qui le sépare de chaque cercle, en pour cent de la largeur.
  const marge = (p, z) => Math.max(
    Math.abs(p.x - z.x) - TAMPON.demiLargeur - z.r,
    (Math.abs(p.y - z.y) - TAMPON.demiHauteur) * RAPPORT - z.r,
  );
  const eloignement = (p) => Math.min(...zones.map((z) => marge(p, z)));
  return PLACES_DU_TAMPON.reduce((meilleure, p) => (eloignement(p) > eloignement(meilleure) ? p : meilleure));
}

/**
 * LES POINTS D'UNE SCÈNE : 100 pour l'intrus trouvé, moins 20 par loupe
 * perdue et 30 pour l'indice (jamais moins de 20) ; 10 quand on a demandé de
 * le voir ou qu'il n'y a plus de loupe — « moins de points », pas zéro.
 */
export function points({ trouve, loupesPerdues = 0, indice = false }) {
  if (!trouve) return 10;
  return Math.max(20, 100 - 20 * loupesPerdues - (indice ? 30 : 0));
}

/**
 * UNE PARTIE : cinq scènes selon le dosage de l'année, les plus faciles
 * d'abord. Les scènes que l'enfant n'a pas encore rangées dans son dossier
 * passent devant (`dejaVues` : leurs identifiants) ; s'il les a toutes vues,
 * on reprend parmi toutes.
 */
export function serie(graine = Date.now(), niveau = 'CP', dejaVues = []) {
  const o = outils(graine);
  const vues = new Set(dejaVues);
  const parNiveau = [1, 2, 3].map((n) => {
    const toutes = SCENES.filter((s) => s.niveau === n);
    return [...o.melanger(toutes.filter((s) => !vues.has(s.id))), ...o.melanger(toutes.filter((s) => vues.has(s.id)))];
  });
  const [n1, n2, n3] = dosage(niveau);
  const tirees = [
    ...parNiveau[0].slice(0, n1),
    ...parNiveau[1].slice(0, n2),
    ...parNiveau[2].slice(0, n3),
  ];
  // Faute de scènes d'un niveau, on complète par les plus faciles restantes.
  const reste = parNiveau.flat().filter((s) => !tirees.includes(s));
  while (tirees.length < SCENES_PAR_PARTIE && reste.length) tirees.push(reste.shift());
  return tirees.sort((a, b) => a.niveau - b.niveau);
}
