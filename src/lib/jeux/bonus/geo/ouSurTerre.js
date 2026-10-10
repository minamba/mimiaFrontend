import { outils } from '../../outils.js';
import { rangDe } from '../reglages.js';

/**
 * OÙ SUR TERRE ? — Camara, le 09/10/2026 (cahier « Nouveaux jeux d'histoire
 * et de géographie », famille « Cap sur le Monde »).
 *
 * Un dossier = un lieu secret. La première preuve est offerte : le PAYSAGE
 * (climat, végétation, relief). Les autres s'ouvrent en échange de points :
 * l'ARCHITECTURE, puis le REPÈRE (le monument qui trahit la ville). On
 * resserre sur la carte : la RÉGION, puis le PAYS, puis la VILLE parmi
 * quelques points. Moins on ouvre de preuves, plus on gagne.
 *
 * TROIS NIVEAUX : Facile (deux preuves offertes et une aide de Salim), Normal
 * (une preuve, à toi de fouiller), Expert (une preuve, aucune aide, +30 %).
 * LA CLASSE choisit les lieux (les plus connus pour les petits) et le nombre
 * de villes proposées à la fin (3 au CP, 6 au lycée).
 *
 * Coordonnées vérifiées le 10/10/2026 (centre-ville, à 0,01° près).
 */

/**
 * `regions` : les régions acceptées (Le Caire est en Afrique, et au
 * Moyen-Orient pour beaucoup d'atlas ; Istanbul, à cheval sur deux continents).
 * `alts` : ce que montre chaque preuve, pour qui ne voit pas l'image — sans
 * jamais nommer le lieu.
 */
export const LIEUX = [
  {
    id: '01-londres', ville: 'Londres', pays: 'GB', nomPays: 'le Royaume-Uni', regions: ['europe'], lon: -0.128, lat: 51.507, niveau: 1,
    autres: [['Manchester', -2.244, 53.48], ['Édimbourg', -3.189, 55.953], ['Birmingham', -1.89, 52.486], ['Glasgow', -4.252, 55.864], ['Cardiff', -3.179, 51.481]],
    alts: {
      paysage: 'Une campagne verte, des haies, des moutons et un village de pierre sous un ciel gris.',
      archi: 'Une rue de maisons de brique sous la pluie, une boîte aux lettres rouge et un taxi noir.',
      repere: 'Une grande tour d’horloge et un palais au bord d’un fleuve, un bus rouge à étage.',
    },
  },
  {
    id: '02-tokyo', ville: 'Tokyo', pays: 'JP', nomPays: 'le Japon', regions: ['asie'], lon: 139.759, lat: 35.682, niveau: 1,
    autres: [['Osaka', 135.502, 34.694], ['Sapporo', 141.354, 43.062], ['Fukuoka', 130.402, 33.59], ['Hiroshima', 132.455, 34.385], ['Sendai', 140.872, 38.268]],
    alts: {
      paysage: 'Des rizières vertes, des collines, et un volcan enneigé au loin.',
      archi: 'Une ruelle de lanternes, des distributeurs de boissons et des boutiques en bois.',
      repere: 'Un carrefour géant la nuit, des écrans immenses et une tour rouge et blanche.',
    },
  },
  {
    id: '03-rio', ville: 'Rio de Janeiro', pays: 'BR', nomPays: 'le Brésil', regions: ['amerique-sud'], lon: -43.173, lat: -22.907, niveau: 1,
    autres: [['São Paulo', -46.633, -23.551], ['Brasilia', -47.882, -15.794], ['Salvador', -38.501, -12.978], ['Manaus', -60.022, -3.119], ['Fortaleza', -38.527, -3.732]],
    alts: {
      paysage: 'Des montagnes tropicales couvertes de forêt qui plongent dans la mer, des palmiers.',
      archi: 'Des maisons colorées à flanc de colline et un trottoir en mosaïque à vagues noires et blanches.',
      repere: 'Une immense statue aux bras ouverts au-dessus d’une baie et d’un pain de sucre de roche.',
    },
  },
  {
    id: '04-le-caire', ville: 'Le Caire', pays: 'EG', nomPays: 'l’Égypte', regions: ['afrique', 'moyen-orient'], lon: 31.236, lat: 30.044, niveau: 1,
    autres: [['Alexandrie', 29.919, 31.2], ['Louxor', 32.64, 25.687], ['Assouan', 32.899, 24.089], ['Port-Saïd', 32.302, 31.265], ['Hurghada', 33.812, 27.257]],
    alts: {
      paysage: 'Un désert de dunes, et un grand fleuve aux rives vertes où glissent des voiliers.',
      archi: 'Une rue de marché animée, des minarets et des maisons couleur de sable.',
      repere: 'Des pyramides et un sphinx de pierre, avec une grande ville derrière.',
    },
  },
  {
    id: '05-new-york', ville: 'New York', pays: 'US', nomPays: 'les États-Unis', regions: ['amerique-nord'], lon: -74.006, lat: 40.713, niveau: 1,
    autres: [['Los Angeles', -118.244, 34.052], ['Chicago', -87.63, 41.878], ['Miami', -80.192, 25.762], ['Houston', -95.37, 29.76], ['Seattle', -122.332, 47.606]],
    alts: {
      paysage: 'Une forêt d’automne aux arbres rouges et orange, et une rivière.',
      archi: 'Des maisons de pierre brune avec des escaliers dehors, un taxi jaune, des échelles de secours.',
      repere: 'Une statue verte qui lève une torche, devant une forêt de gratte-ciel.',
    },
  },
  {
    id: '06-sydney', ville: 'Sydney', pays: 'AU', nomPays: 'l’Australie', regions: ['oceanie'], lon: 151.209, lat: -33.869, niveau: 1,
    autres: [['Melbourne', 144.963, -37.814], ['Perth', 115.86, -31.95], ['Brisbane', 153.026, -27.47], ['Darwin', 130.842, -12.463], ['Adélaïde', 138.601, -34.929]],
    alts: {
      paysage: 'Un désert de terre rouge, des eucalyptus et des kangourous.',
      archi: 'Une promenade au bord d’une plage, des surfeurs et des maisons aux toits de tôle.',
      repere: 'Un bâtiment aux toits blancs en forme de voiles, et un grand pont en arc.',
    },
  },
  {
    id: '07-rome', ville: 'Rome', pays: 'IT', nomPays: 'l’Italie', regions: ['europe'], lon: 12.496, lat: 41.903, niveau: 1,
    autres: [['Milan', 9.19, 45.464], ['Naples', 14.268, 40.852], ['Florence', 11.256, 43.77], ['Turin', 7.687, 45.07], ['Palerme', 13.361, 38.116]],
    alts: {
      paysage: 'Des collines douces, des cyprès et des vignes sous un soleil chaud.',
      archi: 'Une rue ocre avec des balcons, un scooter rouge et une petite terrasse de café.',
      repere: 'Un immense amphithéâtre de pierre aux arcades, au coucher du soleil.',
    },
  },
  {
    id: '08-pekin', ville: 'Pékin', pays: 'CN', nomPays: 'la Chine', regions: ['asie'], lon: 116.407, lat: 39.904, niveau: 1,
    autres: [['Shanghai', 121.474, 31.23], ['Canton', 113.264, 23.129], ['Chengdu', 104.066, 30.573], ['Xi’an', 108.94, 34.341], ['Harbin', 126.535, 45.803]],
    alts: {
      paysage: 'Des montagnes aux sommets dans la brume et des cultures en terrasses.',
      archi: 'Une ruelle aux murs de brique grise, des lanternes rouges et des vélos.',
      repere: 'De grands palais rouges aux toits dorés autour d’une immense cour de pierre.',
    },
  },
  {
    id: '09-marrakech', ville: 'Marrakech', pays: 'MA', nomPays: 'le Maroc', regions: ['afrique'], lon: -7.981, lat: 31.629, niveau: 2,
    autres: [['Casablanca', -7.59, 33.573], ['Rabat', -6.841, 34.02], ['Fès', -5.0, 34.033], ['Tanger', -5.834, 35.759], ['Agadir', -9.598, 30.427]],
    alts: {
      paysage: 'Des montagnes enneigées au-dessus d’une palmeraie et d’une terre rouge.',
      archi: 'Une ruelle de marché pleine d’épices, de lanternes et de tapis, entre des murs rouges.',
      repere: 'Un haut minaret de pierre au-dessus d’une grande place pleine d’échoppes.',
    },
  },
  {
    id: '10-venise', ville: 'Venise', pays: 'IT', nomPays: 'l’Italie', regions: ['europe'], lon: 12.316, lat: 45.441, niveau: 1,
    autres: [['Rome', 12.496, 41.903], ['Milan', 9.19, 45.464], ['Naples', 14.268, 40.852], ['Florence', 11.256, 43.77], ['Palerme', 13.361, 38.116]],
    alts: {
      paysage: 'Une lagune calme avec de petites îles, des barques de pêche et des roseaux.',
      archi: 'Un canal étroit entre de vieilles maisons pastel, un petit pont et une gondole.',
      repere: 'Une grande place au bord de l’eau, une basilique à coupoles et un haut clocher.',
    },
  },
  {
    id: '11-istanbul', ville: 'Istanbul', pays: 'TR', nomPays: 'la Turquie', regions: ['europe', 'moyen-orient'], lon: 28.978, lat: 41.008, niveau: 2,
    autres: [['Ankara', 32.86, 39.934], ['Izmir', 27.143, 38.423], ['Antalya', 30.713, 36.897], ['Trabzon', 39.717, 41.002], ['Konya', 32.493, 37.874]],
    alts: {
      paysage: 'Un large détroit entre deux côtes, des ferries et des mouettes.',
      archi: 'Une rue en pente aux maisons de bois, des verres de thé et un vendeur de pains en anneau.',
      repere: 'De grandes mosquées à coupoles et à minarets au-dessus de la mer.',
    },
  },
  {
    id: '12-moscou', ville: 'Moscou', pays: 'RU', nomPays: 'la Russie', regions: ['europe'], lon: 37.617, lat: 55.756, niveau: 1,
    autres: [['Saint-Pétersbourg', 30.336, 59.934], ['Novossibirsk', 82.935, 55.008], ['Vladivostok', 131.882, 43.116], ['Iekaterinbourg', 60.597, 56.838], ['Mourmansk', 33.075, 68.97]],
    alts: {
      paysage: 'Une forêt de bouleaux sous la neige et un ciel pâle.',
      archi: 'Une large avenue de grands immeubles de pierre en hiver, des passants en chapka.',
      repere: 'Une cathédrale aux coupoles colorées en forme de bulbes, sur une grande place.',
    },
  },
  {
    id: '13-mexico', ville: 'Mexico', pays: 'MX', nomPays: 'le Mexique', regions: ['amerique-nord', 'amerique-sud'], lon: -99.133, lat: 19.433, niveau: 2,
    autres: [['Guadalajara', -103.35, 20.659], ['Monterrey', -100.316, 25.686], ['Cancún', -86.851, 21.161], ['Tijuana', -117.038, 32.515], ['Mérida', -89.592, 20.967]],
    alts: {
      paysage: 'Un plateau sec couvert de cactus et d’agaves, et un volcan à l’horizon.',
      archi: 'Des maisons coloniales colorées, des guirlandes de papier découpé et des musiciens en sombrero.',
      repere: 'Un palais à coupole dorée et une colonne surmontée d’un ange doré.',
    },
  },
  {
    id: '14-nairobi', ville: 'Nairobi', pays: 'KE', nomPays: 'le Kenya', regions: ['afrique'], lon: 36.822, lat: -1.292, niveau: 3,
    autres: [['Mombasa', 39.668, -4.043], ['Kisumu', 34.768, -0.092], ['Eldoret', 35.27, 0.514], ['Garissa', 39.646, -0.453], ['Lodwar', 35.597, 3.119]],
    alts: {
      paysage: 'Une savane aux acacias, avec des girafes et des zèbres.',
      archi: 'Une rue animée, des minibus peints de toutes les couleurs et des vendeurs de fruits.',
      repere: 'Les tours d’une grande ville juste derrière une savane où marchent des girafes.',
    },
  },
  {
    id: '15-reykjavik', ville: 'Reykjavik', pays: 'IS', nomPays: 'l’Islande', regions: ['europe'], lon: -21.943, lat: 64.147, niveau: 3,
    autres: [['Akureyri', -18.091, 65.683], ['Ísafjörður', -23.124, 66.075], ['Egilsstaðir', -14.395, 65.266], ['Vík', -19.006, 63.419], ['Höfn', -15.212, 64.254]],
    alts: {
      paysage: 'Des champs de lave noire, un geyser qui fume et des aurores boréales.',
      archi: 'De petites maisons aux toits de tôle colorés au bord d’un port.',
      repere: 'Une église blanche en forme de tuyaux d’orgue qui montent vers le ciel.',
    },
  },
  {
    id: '16-amsterdam', ville: 'Amsterdam', pays: 'NL', nomPays: 'les Pays-Bas', regions: ['europe'], lon: 4.895, lat: 52.37, niveau: 2,
    autres: [['Rotterdam', 4.478, 51.924], ['Groningue', 6.567, 53.219], ['Eindhoven', 5.47, 51.441], ['Maastricht', 5.691, 50.851], ['Enschede', 6.894, 52.221]],
    alts: {
      paysage: 'Des terres toutes plates, des champs de tulipes et des moulins à vent.',
      archi: 'De hautes maisons étroites au bord d’un canal, des vélos partout et des péniches.',
      repere: 'Un grand musée de brique rouge à tourelles au bord d’un canal.',
    },
  },
  {
    id: '17-bombay', ville: 'Bombay', pays: 'IN', nomPays: 'l’Inde', regions: ['asie'], lon: 72.878, lat: 19.076, niveau: 3,
    autres: [['New Delhi', 77.209, 28.614], ['Calcutta', 88.364, 22.573], ['Chennai', 80.271, 13.083], ['Bangalore', 77.595, 12.972], ['Jaipur', 75.787, 26.912]],
    alts: {
      paysage: 'Une pluie de mousson sur des cocotiers et sur la mer.',
      archi: 'Une rue bondée, des rickshaws, des saris colorés et des étals de fruits.',
      repere: 'Une grande porte en arc de pierre au bord de la mer, et un palace à coupole rouge.',
    },
  },
  {
    id: '18-buenos-aires', ville: 'Buenos Aires', pays: 'AR', nomPays: 'l’Argentine', regions: ['amerique-sud'], lon: -58.382, lat: -34.604, niveau: 3,
    autres: [['Córdoba', -64.189, -31.42], ['Mendoza', -68.845, -32.89], ['Salta', -65.423, -24.782], ['Ushuaïa', -68.303, -54.801], ['Bariloche', -71.31, -41.134]],
    alts: {
      paysage: 'Une immense plaine d’herbe, des chevaux et des cavaliers qui gardent un troupeau.',
      archi: 'Des maisons de tôle peintes de toutes les couleurs et un couple qui danse.',
      repere: 'Un grand obélisque blanc au milieu d’une avenue immense.',
    },
  },
  {
    id: '19-le-cap', ville: 'Le Cap', pays: 'ZA', nomPays: 'l’Afrique du Sud', regions: ['afrique'], lon: 18.424, lat: -33.925, niveau: 3,
    autres: [['Johannesburg', 28.047, -26.204], ['Durban', 31.022, -29.858], ['Port Elizabeth', 25.615, -33.961], ['Bloemfontein', 26.16, -29.085], ['Kimberley', 24.762, -28.728]],
    alts: {
      paysage: 'Une côte de rochers, une mer agitée et des manchots sur la plage.',
      archi: 'Des maisons peintes de couleurs vives sur une colline au-dessus de la mer.',
      repere: 'Une montagne au sommet tout plat au-dessus d’une ville et d’un port.',
    },
  },
  {
    id: '20-quebec', ville: 'Québec', pays: 'CA', nomPays: 'le Canada', regions: ['amerique-nord'], lon: -71.208, lat: 46.813, niveau: 2,
    autres: [['Toronto', -79.383, 43.653], ['Vancouver', -123.121, 49.283], ['Calgary', -114.072, 51.045], ['Winnipeg', -97.138, 49.895], ['Halifax', -63.575, 44.649]],
    alts: {
      paysage: 'Une forêt d’érables rouges en automne, au bord d’un lac.',
      archi: 'Une vieille rue de pierre aux toits pentus, de la neige et des cafés.',
      repere: 'Un château aux toits verts au-dessus d’un large fleuve.',
    },
  },
];

/** Les trois preuves, dans l'ordre où elles s'ouvrent. */
export const PREUVES = [
  { cle: 'paysage', nom: 'Le paysage', cout: 0 },
  { cle: 'archi', nom: 'L’architecture', cout: 20 },
  { cle: 'repere', nom: 'Le repère', cout: 30 },
];

export const NIVEAUX = [
  {
    cle: 'facile', nom: 'Facile', offertes: 2, aide: true, bonus: 1, detail: 'Deux preuves offertes et une aide de Salim.',
  },
  {
    cle: 'normal', nom: 'Normal', offertes: 1, aide: false, bonus: 1, detail: 'Une preuve : à toi de fouiller.',
  },
  {
    cle: 'expert', nom: 'Expert', offertes: 1, aide: false, bonus: 1.3, detail: 'Une preuve, aucune aide, 30 % de points en plus.',
  },
];

export const DOSSIERS = 5;
export const POINTS_DEPART = 100;
export const PENALITE = 10;
export const PLANCHER = 10;
/** Au troisième faux pas sur une étape, la carte montre la réponse. */
export const ESSAIS = 3;

export const ETAPES = ['region', 'pays', 'ville'];

export function niveauJeu(cle) {
  return NIVEAUX.find((n) => n.cle === cle) ?? NIVEAUX[1];
}

/** Le niveau mis en avant pour la classe : Facile en primaire, Normal au collège, Expert au lycée. */
export function niveauConseille(niveau) {
  const rang = rangDe(niveau);
  if (rang <= 5) return 'facile';
  if (rang <= 9) return 'normal';
  return 'expert';
}

/** Les lieux ouverts à la classe : les plus connus pour les petits. */
export function lieuxDeLaClasse(niveau) {
  const rang = rangDe(niveau);
  const max = rang <= 3 ? 1 : rang <= 6 ? 2 : 3;
  return LIEUX.filter((l) => l.niveau <= max);
}

/** Combien de villes la dernière étape propose (la bonne comprise). */
export function nombreDeVilles(niveau) {
  const rang = rangDe(niveau);
  if (rang <= 3) return 3;
  if (rang <= 6) return 4;
  if (rang <= 9) return 5;
  return 6;
}

/**
 * Une partie : cinq dossiers, chacun avec ses villes proposées (la bonne et
 * des voisines du même pays), mélangées.
 */
export function serie(graine = Date.now(), niveau = 'CP') {
  const o = outils(graine);
  const n = nombreDeVilles(niveau);
  return o.melanger(lieuxDeLaClasse(niveau)).slice(0, DOSSIERS).map((lieu) => {
    const autres = o.melanger(lieu.autres).slice(0, n - 1).map(([nom, lon, lat]) => ({
      id: `${lieu.id}/${nom}`, nom, lon, lat, juste: false,
    }));
    const villes = o.melanger([{
      id: lieu.id, nom: lieu.ville, lon: lieu.lon, lat: lieu.lat, juste: true,
    }, ...autres]);
    return { ...lieu, villes };
  });
}

/** La clé d'une image de preuve dans `IMAGES_HISTOIRE_GEO['ou-sur-terre']`. */
export const cleImage = (lieu, preuve) => `${lieu.id}-${preuve}`;

/** Les jugements de chaque étape. */
export const jugerRegion = (lieu, cleRegion) => lieu.regions.includes(cleRegion);
export const jugerPays = (lieu, code) => code === lieu.pays;
export const jugerVille = (lieu, villeId) => villeId === lieu.id;

/**
 * Les points d'un dossier : cent au départ, moins les preuves ouvertes (sauf
 * celles que le niveau offre), moins dix par faux pas, jamais moins de dix ;
 * rien si la carte a dû montrer la réponse. +30 % en expert.
 */
export function pointsDuDossier({ preuvesOuvertes = 1, erreurs = 0, montre = false }, cleNiveau = 'normal') {
  if (montre) return 0;
  const n = niveauJeu(cleNiveau);
  const payees = PREUVES.slice(n.offertes, preuvesOuvertes).reduce((s, p) => s + p.cout, 0);
  const brut = Math.max(PLANCHER, POINTS_DEPART - payees - PENALITE * erreurs);
  return Math.round(brut * n.bonus);
}

/** LES PHRASES DE SALIM — clés stables, lues par `phrasesDe('bonus-ou-sur-terre', …)`. */
export const PHRASES = {
  consigne: 'Regarde la preuve, puis trouve le lieu : la région, le pays, la ville.',
  'choix-niveau': 'Choisis ton niveau d’enquête.',
  'etape-region': 'Dans quelle région du monde ? Touche-la sur la carte.',
  'etape-pays': 'Bien vu ! Maintenant, dans quel pays ?',
  'etape-ville': 'Bravo ! Et dans quelle ville ? Touche le bon point.',
  'pas-la-region': 'Non, pas dans cette région. Regarde encore les preuves.',
  'pas-le-pays': 'Ce n’est pas ce pays. Cherche encore.',
  'pas-la-ville': 'Ce n’est pas cette ville. Essaie un autre point.',
  mer: 'Là, c’est la mer ! Touche une terre.',
  montre: 'Regarde, c’était ici. On continue.',
  'preuve-ouverte': 'Une nouvelle preuve pour ton dossier.',
  passeport: 'Un nouveau tampon dans ton passeport !',
  bravo: 'Bravo, détective ! Tous les dossiers sont résolus.',
  ...Object.fromEntries(LIEUX.map((l) => [`aide-${l.id}`, ({
    '01-londres': 'Un indice : Dans ce pays, on roule à gauche et l’heure du thé est sacrée.',
    '02-tokyo': 'Un indice : Ce pays est fait d’îles, et un soleil rouge orne son drapeau.',
    '03-rio': 'Un indice : Dans ce pays, on parle portugais et on danse la samba.',
    '04-le-caire': 'Un indice : Le plus long fleuve d’Afrique traverse ce pays de déserts.',
    '05-new-york': 'Un indice : Cette ville géante n’est même pas la capitale de son pays.',
    '06-sydney': 'Un indice : Dans ce pays-continent, Noël tombe en plein été.',
    '07-rome': 'Un indice : Ce pays a la forme d’une botte.',
    '08-pekin': 'Un indice : Une très longue muraille traverse le nord de ce pays.',
    '09-marrakech': 'Un indice : Ce pays d’Afrique du Nord regarde l’Atlantique et la Méditerranée.',
    '10-venise': 'Un indice : Dans cette ville, pas de voitures : on circule en bateau.',
    '11-istanbul': 'Un indice : Cette ville est à cheval sur deux continents.',
    '12-moscou': 'Un indice : C’est le plus grand pays du monde, à l’hiver très froid.',
    '13-mexico': 'Un indice : Ici, on fête le jour des morts avec des crânes en sucre.',
    '14-nairobi': 'Un indice : Ce pays d’Afrique de l’Est est célèbre pour ses safaris.',
    '15-reykjavik': 'Un indice : Cette île du grand nord est faite de volcans et de geysers.',
    '16-amsterdam': 'Un indice : Ce pays tout plat a gagné des terres sur la mer.',
    '17-bombay': 'Un indice : Dans ce pays très peuplé, la mousson noie les rues en été.',
    '18-buenos-aires': 'Un indice : Dans ce pays, les gauchos gardent les troupeaux dans la pampa.',
    '19-le-cap': 'Un indice : Ce pays, tout au sud de l’Afrique, a trois capitales.',
    '20-quebec': 'Un indice : Ici, on parle français, sous un drapeau à feuille d’érable.',
  })[l.id]])),
  ...Object.fromEntries(LIEUX.map((l) => [`revele-${l.id}`, ({
    '01-londres': 'Londres, capitale du Royaume-Uni ! Big Ben, c’est le nom de la grosse cloche de la tour.',
    '02-tokyo': 'Tokyo, capitale du Japon ! Au carrefour de Shibuya, des milliers de piétons traversent en même temps.',
    '03-rio': 'Rio de Janeiro, au Brésil ! Son carnaval est l’un des plus célèbres du monde.',
    '04-le-caire': 'Le Caire, capitale de l’Égypte ! Les pyramides de Gizeh sont à ses portes.',
    '05-new-york': 'New York, aux États-Unis ! La statue de la Liberté y accueille les bateaux depuis 1886.',
    '06-sydney': 'Sydney, en Australie ! Ce n’est pourtant pas la capitale : la capitale, c’est Canberra.',
    '07-rome': 'Rome, capitale de l’Italie ! Le Colisée a presque deux mille ans.',
    '08-pekin': 'Pékin, capitale de la Chine ! La Cité interdite était le palais des empereurs.',
    '09-marrakech': 'Marrakech, au Maroc ! On la surnomme la ville rouge, à cause de ses remparts.',
    '10-venise': 'Venise, en Italie ! Elle est bâtie sur plus d’une centaine de petites îles.',
    '11-istanbul': 'Istanbul, en Turquie ! Elle s’est appelée Byzance, puis Constantinople.',
    '12-moscou': 'Moscou, capitale de la Russie ! La cathédrale Saint-Basile se dresse sur la place Rouge.',
    '13-mexico': 'Mexico, capitale du Mexique ! Elle est bâtie sur un ancien lac, à plus de deux mille mètres d’altitude.',
    '14-nairobi': 'Nairobi, capitale du Kenya ! Un parc national et ses girafes vivent aux portes de la ville.',
    '15-reykjavik': 'Reykjavik, capitale de l’Islande ! C’est la capitale la plus au nord du monde.',
    '16-amsterdam': 'Amsterdam, capitale des Pays-Bas ! Ses canaux sont inscrits au patrimoine mondial.',
    '17-bombay': 'Bombay, qu’on appelle aujourd’hui Mumbai, en Inde ! C’est la ville du cinéma de Bollywood.',
    '18-buenos-aires': 'Buenos Aires, capitale de l’Argentine ! C’est la ville du tango.',
    '19-le-cap': 'Le Cap, en Afrique du Sud ! La montagne de la Table domine la ville, et des manchots vivent sur ses plages.',
    '20-quebec': 'Québec, au Canada ! Fondée en 1608, c’est l’une des plus vieilles villes d’Amérique du Nord.',
  })[l.id]])),
};
