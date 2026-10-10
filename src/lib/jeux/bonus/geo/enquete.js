import { outils } from '../../outils.js';
import { rangDe } from '../reglages.js';
import {
  cap, direction, distanceKm, temperature,
} from './geodesie.js';

/**
 * ENQUÊTE SUR LA CARTE — Camara, le 09/10/2026 (cahier « Nouveaux jeux
 * d'histoire et de géographie », famille « Cap sur le Monde »).
 *
 * Trois enquêtes au choix : Monuments du monde, Merveilles de la nature,
 * Villes de France. Salim lit un indice ; l'enfant touche la carte ; une
 * boussole dit « froid, tiède, chaud » avec la distance et la direction.
 * Chaque erreur ouvre un indice de plus (quatre en tout, de plus en plus
 * précis), et la carte se resserre à mesure qu'on s'approche. Trouvé, le lieu
 * se dévoile en image, avec une phrase de Salim. Six lieux par partie.
 *
 * LES COORDONNÉES ont été vérifiées le 10/10/2026 (le monument lui-même, ou le
 * cœur de la merveille ; le centre-ville pour les villes de France), et les
 * distances écrites dans les indices recalculées par le grand cercle.
 * `rayon` : à combien de kilomètres un clic compte comme trouvé — plus large
 * pour une merveille immense (le Sahara, l'Amazonie) que pour une tour.
 */
export const ENQUETES = [
  {
    cle: 'monuments', titre: 'Monuments du monde', carte: 'monde', image: 'monument-01-tour-eiffel',
    lieux: [
      {
        id: 'monument-01-tour-eiffel', nom: 'La tour Eiffel', lon: 2.2945, lat: 48.8584,
        indices: [
          'Cap sur l’Europe de l’Ouest, dans le pays qu’on surnomme l’Hexagone.',
          'Ce monument se dresse dans la capitale de ce pays, au bord de la Seine.',
          'C’est une tour de fer de 330 mètres, bâtie pour l’Exposition universelle de 1889.',
          'Elle est à Paris, sur la rive gauche de la Seine, face au Trocadéro.',
        ],
        revele: 'La tour Eiffel ! Elle devait être démontée au bout de vingt ans : la radio l’a sauvée.',
      },
      {
        id: 'monument-02-colisee', nom: 'Le Colisée', lon: 12.4922, lat: 41.8902,
        indices: [
          'Direction le sud de l’Europe, dans un pays en forme de botte.',
          'Ce monument est dans la capitale de ce pays, qu’on appelle la Ville éternelle.',
          'C’est un immense amphithéâtre de pierre où combattaient les gladiateurs, il y a près de deux mille ans.',
          'Il se trouve au cœur de Rome, à deux pas du Forum romain.',
        ],
        revele: 'Le Colisée ! Il pouvait accueillir environ cinquante mille spectateurs.',
      },
      {
        id: 'monument-03-taj-mahal', nom: 'Le Taj Mahal', lon: 78.0421, lat: 27.1751,
        indices: [
          'Cap sur l’Asie du Sud, dans le pays le plus peuplé du monde.',
          'Ce monument est dans le nord de ce pays, au bord de la rivière Yamuna.',
          'C’est un mausolée de marbre blanc, bâti par un empereur en souvenir de son épouse.',
          'Il se trouve à Agra, à moins de deux cents kilomètres au sud-est de New Delhi.',
        ],
        revele: 'Le Taj Mahal ! L’empereur Shah Jahan l’a fait bâtir au dix-septième siècle.',
      },
      {
        id: 'monument-04-muraille', nom: 'La Grande Muraille de Chine', lon: 116.02, lat: 40.36,
        indices: [
          'Direction l’Asie de l’Est, dans un pays immense, le plus peuplé du monde après l’Inde.',
          'Ce monument serpente sur des milliers de kilomètres à travers le nord de ce pays.',
          'C’est un mur bâti pendant des siècles pour protéger l’empire des attaques venues du nord.',
          'Son morceau le plus visité est tout près de Pékin, au nord-ouest de la capitale.',
        ],
        revele: 'La Grande Muraille de Chine ! Avec toutes ses branches, elle mesure plus de vingt mille kilomètres.',
      },
      {
        id: 'monument-05-pyramides', nom: 'Les pyramides de Gizeh', lon: 31.1342, lat: 29.9792,
        indices: [
          'Cap sur le nord de l’Afrique, dans un pays traversé par le plus long fleuve du continent.',
          'Ce monument est au bord du désert, tout près de la capitale de ce pays.',
          'Ce sont trois grandes pyramides gardées par le Sphinx, bâties il y a plus de quatre mille cinq cents ans.',
          'Elles se trouvent à Gizeh, juste à l’ouest du Caire et du Nil.',
        ],
        revele: 'Les pyramides de Gizeh ! La plus grande, celle de Khéops, est la seule des sept merveilles du monde antique encore debout.',
      },
      {
        id: 'monument-06-liberte', nom: 'La statue de la Liberté', lon: -74.0445, lat: 40.6892,
        indices: [
          'Direction l’Amérique du Nord, dans le pays aux cinquante étoiles sur son drapeau.',
          'Ce monument est sur la côte est de ce pays, au bord de l’océan Atlantique.',
          'C’est une statue offerte par la France en 1886, qui lève une torche.',
          'Elle se dresse sur une petite île, à l’entrée du port de New York.',
        ],
        revele: 'La statue de la Liberté ! Sa charpente de fer a été conçue par Gustave Eiffel.',
      },
      {
        id: 'monument-07-machu-picchu', nom: 'Le Machu Picchu', lon: -72.545, lat: -13.1631,
        indices: [
          'Cap sur l’Amérique du Sud, le long de la cordillère des Andes.',
          'Ce monument est au Pérou, dans les montagnes, loin de la côte.',
          'C’est une cité inca perchée à près de deux mille cinq cents mètres d’altitude.',
          'Elle domine la vallée de l’Urubamba, à environ soixante-quinze kilomètres au nord-ouest de Cuzco.',
        ],
        revele: 'Le Machu Picchu ! Les Incas l’ont bâti au quinzième siècle ; le monde entier l’a redécouvert en 1911.',
      },
      {
        id: 'monument-08-christ', nom: 'Le Christ Rédempteur', lon: -43.2105, lat: -22.9519,
        indices: [
          'Direction l’Amérique du Sud, dans le plus grand pays du continent.',
          'Ce monument domine une grande ville de la côte atlantique, dans le sud-est de ce pays.',
          'C’est une statue de trente mètres aux bras grands ouverts, au sommet du mont Corcovado.',
          'Elle veille sur Rio de Janeiro, sa baie et le Pain de Sucre.',
        ],
        revele: 'Le Christ Rédempteur ! Inauguré en 1931, ses bras mesurent vingt-huit mètres d’un bout à l’autre.',
      },
      {
        id: 'monument-09-opera-sydney', nom: 'L’opéra de Sydney', lon: 151.2153, lat: -33.8568,
        indices: [
          'Cap sur l’Océanie, dans un pays-continent où vivent les kangourous.',
          'Ce monument est sur la côte est de ce pays, au bord de l’océan Pacifique.',
          'C’est une salle de spectacle dont les toits blancs ressemblent à des voiles de bateau.',
          'Il se trouve dans le port de Sydney, tout près du grand pont en arc.',
        ],
        revele: 'L’opéra de Sydney ! Il a été inauguré en 1973.',
      },
      {
        id: 'monument-10-angkor', nom: 'Angkor Vat', lon: 103.867, lat: 13.4125,
        indices: [
          'Direction l’Asie du Sud-Est, entre la Thaïlande et le Viêt Nam.',
          'Ce monument est au Cambodge, dans le nord-ouest du pays.',
          'C’est un immense temple de pierre aux tours en bouton de lotus, entouré de douves.',
          'Il se trouve près de la ville de Siem Reap, au nord du grand lac Tonlé Sap.',
        ],
        revele: 'Angkor Vat ! Bâti au douzième siècle, c’est le plus grand monument religieux du monde.',
      },
    ],
  },
  {
    cle: 'nature', titre: 'Merveilles de la nature', carte: 'monde', image: 'nature-07-fuji',
    lieux: [
      {
        id: 'nature-01-grand-canyon', nom: 'Le Grand Canyon', lon: -112.11, lat: 36.1, rayon: 450,
        indices: [
          'Cap sur l’Amérique du Nord, dans l’ouest du pays aux cinquante étoiles.',
          'Cette merveille se trouve dans un État désertique, l’Arizona.',
          'C’est une gorge immense creusée par le fleuve Colorado, profonde de plus de mille cinq cents mètres.',
          'Elle est dans le nord de l’Arizona, à moins de trois cents kilomètres à l’est de Las Vegas.',
        ],
        revele: 'Le Grand Canyon ! Le Colorado a mis des millions d’années à le creuser.',
      },
      {
        id: 'nature-02-everest', nom: 'L’Everest', lon: 86.925, lat: 27.9881,
        indices: [
          'Direction l’Asie, dans la plus haute chaîne de montagnes du monde.',
          'Cette merveille se trouve dans l’Himalaya, à la frontière du Népal et de la Chine.',
          'C’est le plus haut sommet de la Terre : huit mille huit cent quarante-neuf mètres.',
          'Il se dresse à environ cent soixante kilomètres à l’est de Katmandou, la capitale du Népal.',
        ],
        revele: 'L’Everest ! Edmund Hillary et Tenzing Norgay ont été les premiers à atteindre son sommet, en 1953.',
      },
      {
        id: 'nature-03-victoria', nom: 'Les chutes Victoria', lon: 25.8572, lat: -17.9243,
        indices: [
          'Cap sur l’Afrique australe, dans le sud du continent.',
          'Cette merveille est à la frontière de la Zambie et du Zimbabwe.',
          'C’est une chute d’eau du fleuve Zambèze, large de près de mille sept cents mètres.',
          'On l’appelle « la fumée qui gronde » : elle est tout près de la ville de Livingstone, en Zambie.',
        ],
        revele: 'Les chutes Victoria ! Leur nuage d’embruns se voit à des dizaines de kilomètres.',
      },
      {
        id: 'nature-04-amazonie', nom: 'L’Amazonie', lon: -60.02, lat: -3.13, rayon: 700,
        indices: [
          'Direction l’Amérique du Sud, dans le nord du plus grand pays du continent.',
          'Cette merveille est la plus grande forêt tropicale du monde, traversée par un fleuve géant.',
          'Ce fleuve, l’Amazone, est le plus puissant du monde : il se jette dans l’océan Atlantique.',
          'Rends-toi au cœur de la forêt, près de la ville de Manaus, là où deux fleuves se rejoignent.',
        ],
        revele: 'L’Amazonie ! Environ une espèce animale ou végétale connue sur dix y vit.',
      },
      {
        id: 'nature-05-sahara', nom: 'Le Sahara', lon: 5.5, lat: 23.0, rayon: 900,
        indices: [
          'Cap sur le nord de l’Afrique, dans le plus grand désert chaud du monde.',
          'Ce désert s’étend sur une dizaine de pays, de l’océan Atlantique à la mer Rouge.',
          'Ses dunes sont parcourues depuis des siècles par des caravanes de dromadaires.',
          'Son cœur est en Algérie, autour des montagnes du Hoggar et de la ville de Tamanrasset.',
        ],
        revele: 'Le Sahara ! Il est presque aussi grand que les États-Unis.',
      },
      {
        id: 'nature-06-barriere-corail', nom: 'La Grande Barrière de corail', lon: 147.7, lat: -18.29, rayon: 600,
        indices: [
          'Direction l’Océanie, au large d’un pays-continent.',
          'Cette merveille est dans la mer de Corail, le long de la côte nord-est de l’Australie.',
          'C’est le plus grand récif de corail du monde : on le voit même depuis l’espace.',
          'Il s’étire sur plus de deux mille kilomètres, au large de l’État du Queensland.',
        ],
        revele: 'La Grande Barrière de corail ! Elle est bâtie par des milliards de minuscules animaux, les polypes.',
      },
      {
        id: 'nature-07-fuji', nom: 'Le mont Fuji', lon: 138.7274, lat: 35.3606,
        indices: [
          'Cap sur l’Asie de l’Est, dans un pays fait de milliers d’îles.',
          'Cette merveille est sur Honshu, la plus grande île de ce pays.',
          'C’est un volcan au sommet enneigé, le plus haut du pays : trois mille sept cent soixante-seize mètres.',
          'Il se dresse à environ cent kilomètres au sud-ouest de Tokyo.',
        ],
        revele: 'Le mont Fuji ! Sa dernière éruption date de 1707.',
      },
      {
        id: 'nature-08-niagara', nom: 'Les chutes du Niagara', lon: -79.0849, lat: 43.0896,
        indices: [
          'Direction l’Amérique du Nord, entre deux grands pays voisins.',
          'Cette merveille est à la frontière du Canada et des États-Unis.',
          'Ces chutes relient deux des cinq Grands Lacs : le lac Érié et le lac Ontario.',
          'Elles se trouvent à moins de soixante-dix kilomètres au sud de Toronto, de l’autre côté du lac Ontario.',
        ],
        revele: 'Les chutes du Niagara ! Chaque seconde, des millions de litres d’eau y tombent.',
      },
      {
        id: 'nature-09-kilimandjaro', nom: 'Le Kilimandjaro', lon: 37.3556, lat: -3.0674,
        indices: [
          'Cap sur l’Afrique de l’Est, près de l’équateur.',
          'Cette merveille est en Tanzanie, tout près de la frontière du Kenya.',
          'C’est le plus haut sommet d’Afrique : un volcan de cinq mille huit cent quatre-vingt-quinze mètres.',
          'Il se dresse à environ deux cents kilomètres au sud-est de Nairobi, la capitale du Kenya.',
        ],
        revele: 'Le Kilimandjaro ! Ses neiges, si près de l’équateur, fondent peu à peu.',
      },
      {
        id: 'nature-10-fjords', nom: 'Les fjords de Norvège', lon: 7.094, lat: 62.1049, rayon: 450,
        indices: [
          'Direction le nord de l’Europe, en Scandinavie.',
          'Cette merveille est sur la côte ouest de la Norvège, battue par l’océan.',
          'Ce sont des vallées creusées par les glaciers, puis envahies par la mer.',
          'Le plus célèbre, le fjord de Geiranger, est entre Bergen et Trondheim.',
        ],
        revele: 'Les fjords de Norvège ! Le fjord de Geiranger et sa cascade des Sept Sœurs sont protégés par l’Unesco.',
      },
    ],
  },
  {
    cle: 'france', titre: 'Villes de France', carte: 'france', image: 'france-08-nice',
    lieux: [
      {
        id: 'france-01-paris', nom: 'Paris', lon: 2.3522, lat: 48.8566,
        indices: [
          'Cette ville est dans le nord de la France, au centre d’un grand bassin.',
          'Un fleuve la traverse avant de rejoindre la Manche : la Seine.',
          'C’est la plus grande ville du pays, et sa capitale.',
          'Sur ses quais, on voit la cathédrale Notre-Dame et, au loin, la tour Eiffel.',
        ],
        revele: 'Paris ! Avec ses environs, c’est la plus grande ville de l’Union européenne.',
      },
      {
        id: 'france-02-marseille', nom: 'Marseille', lon: 5.3698, lat: 43.2965,
        indices: [
          'Cette ville est dans le sud de la France, au bord de la mer.',
          'Elle regarde la Méditerranée, à l’est du delta du Rhône.',
          'C’est la plus vieille ville de France, fondée par des marins grecs il y a deux mille six cents ans.',
          'Sur sa colline, la basilique Notre-Dame-de-la-Garde veille sur le Vieux-Port.',
        ],
        revele: 'Marseille ! Ses habitants surnomment la basilique « la Bonne Mère ».',
      },
      {
        id: 'france-03-lyon', nom: 'Lyon', lon: 4.8357, lat: 45.764,
        indices: [
          'Cette ville est dans l’est de la France, entre le Massif central et les Alpes.',
          'Deux cours d’eau s’y rejoignent : le Rhône et la Saône.',
          'C’est la troisième ville de France, célèbre pour sa cuisine et sa fête des Lumières.',
          'La basilique de Fourvière la domine depuis sa colline.',
        ],
        revele: 'Lyon ! Au temps des Romains, elle s’appelait Lugdunum.',
      },
      {
        id: 'france-04-toulouse', nom: 'Toulouse', lon: 1.4442, lat: 43.6047,
        indices: [
          'Cette ville est dans le sud-ouest de la France.',
          'La Garonne la traverse, entre le Massif central et les Pyrénées.',
          'On l’appelle la ville rose, à cause de ses briques couleur de terre cuite.',
          'C’est la ville des avions : on y assemble les Airbus.',
        ],
        revele: 'Toulouse, la ville rose ! Le Concorde y a fait son premier vol, en 1969.',
      },
      {
        id: 'france-05-bordeaux', nom: 'Bordeaux', lon: -0.5792, lat: 44.8378,
        indices: [
          'Cette ville est dans le sud-ouest de la France, près de l’océan Atlantique.',
          'Elle est bâtie au bord de la Garonne, qui y dessine un croissant de lune.',
          'Elle est célèbre dans le monde entier pour ses vignobles et son vin.',
          'Sur ses quais, le miroir d’eau reflète la place de la Bourse.',
        ],
        revele: 'Bordeaux ! Son port de la Lune est inscrit au patrimoine mondial de l’Unesco.',
      },
      {
        id: 'france-06-strasbourg', nom: 'Strasbourg', lon: 7.7521, lat: 48.5734,
        indices: [
          'Cette ville est dans le nord-est de la France.',
          'Elle est en Alsace, au bord du Rhin, tout près de l’Allemagne.',
          'On y trouve le Parlement européen et des maisons à colombages.',
          'La flèche de sa cathédrale de grès rose s’élève à cent quarante-deux mètres.',
        ],
        revele: 'Strasbourg ! Son marché de Noël est l’un des plus anciens de France.',
      },
      {
        id: 'france-07-lille', nom: 'Lille', lon: 3.0573, lat: 50.6292,
        indices: [
          'Cette ville est tout au nord de la France.',
          'Elle est toute proche de la frontière avec la Belgique.',
          'Chaque année, sa grande braderie attire des millions de visiteurs.',
          'Sur la Grand-Place, la Vieille Bourse fait face à un haut beffroi.',
        ],
        revele: 'Lille ! Le général de Gaulle y est né, en 1890.',
      },
      {
        id: 'france-08-nice', nom: 'Nice', lon: 7.262, lat: 43.7102,
        indices: [
          'Cette ville est dans le sud-est de la France, au bord de la mer.',
          'Elle regarde la Méditerranée, sur la Côte d’Azur, entre Cannes et Monaco.',
          'Derrière elle, les montagnes des Alpes tombent presque dans la mer.',
          'Sa longue promenade des Anglais longe la baie des Anges.',
        ],
        revele: 'Nice ! Elle n’est devenue française qu’en 1860.',
      },
      {
        id: 'france-09-nantes', nom: 'Nantes', lon: -1.5536, lat: 47.2184,
        indices: [
          'Cette ville est dans l’ouest de la France.',
          'Elle est au bord de la Loire, à une cinquantaine de kilomètres de l’océan.',
          'Elle a longtemps été la ville des ducs de Bretagne.',
          'Un éléphant mécanique géant y promène ses passagers, non loin du château des ducs.',
        ],
        revele: 'Nantes ! L’écrivain Jules Verne y est né, en 1828.',
      },
      {
        id: 'france-10-carcassonne', nom: 'Carcassonne', lon: 2.3631, lat: 43.2066,
        indices: [
          'Cette ville est dans le sud de la France, entre Toulouse et la mer Méditerranée.',
          'Elle est dans l’Aude, entre les Pyrénées et la Montagne Noire.',
          'Sa cité médiévale a deux enceintes de remparts et cinquante-deux tours.',
          'Cette cité fortifiée domine la rivière Aude, sur la route de Toulouse à Narbonne.',
        ],
        revele: 'Carcassonne ! L’architecte Viollet-le-Duc a restauré ses remparts au dix-neuvième siècle.',
      },
    ],
  },
];

/**
 * LES VILLES DE FRANCE EN POINTS sur la carte de France : les dix à trouver
 * et dix autres, pour que le point juste ne se devine pas au premier coup d'œil.
 */
export const AUTRES_VILLES_DE_FRANCE = [
  ['Rennes', -1.6778, 48.1173], ['Brest', -4.4861, 48.3904], ['Rouen', 1.0993, 49.4432], ['Reims', 4.0317, 49.2583],
  ['Dijon', 5.0415, 47.322], ['Clermont-Ferrand', 3.087, 45.7772], ['Limoges', 1.2611, 45.8336], ['Montpellier', 3.8767, 43.6108],
  ['Grenoble', 5.7245, 45.1885], ['Tours', 0.6848, 47.3941], ['La Rochelle', -1.1508, 46.1603], ['Metz', 6.1757, 49.1193],
  ['Pau', -0.3708, 43.2951], ['Perpignan', 2.8954, 42.6887],
].map(([nom, lon, lat]) => ({
  id: `france-autre-${nom}`, nom, lon, lat,
}));

export const LIEUX_PAR_PARTIE = 6;
/** Indices en tout ; après le quatrième, encore deux essais, puis la carte montre le lieu. */
export const INDICES = 4;
export const ESSAIS_MAX = 6;
export const POINTS_DEPART = 100;
export const PENALITE = 15;
export const PLANCHER = 10;

export function enquete(cle) {
  return ENQUETES.find((e) => e.cle === cle) ?? null;
}

/** Le rayon de réussite, en kilomètres : plus large pour les petits, et sur le monde que sur la France. */
export function rayonDe(lieu, carte, niveau) {
  const rang = rangDe(niveau);
  if (carte === 'france') return rang <= 5 ? 45 : 30;
  const base = lieu.rayon ?? 350;
  return rang <= 5 ? Math.round(base * 1.4) : base;
}

/** Les noms des villes de France s'affichent en primaire : au collège, on les place sans étiquette. */
export const nomsDesVilles = (niveau) => rangDe(niveau) <= 5;

/** Une partie : six lieux de l'enquête, mélangés. */
export function serie(graine = Date.now(), cle = 'monuments') {
  const o = outils(graine);
  const e = enquete(cle) ?? ENQUETES[0];
  return o.melanger(e.lieux).slice(0, LIEUX_PAR_PARTIE);
}

/**
 * LE VERDICT D'UN CLIC : trouvé ou non, la distance (grand cercle), la
 * direction vers le lieu (« le nord-est ») et la température.
 */
export function verdict(point, lieu, { carte = 'monde', niveau = 'CM1' } = {}) {
  const km = distanceKm(point, [lieu.lon, lieu.lat]);
  const dir = direction(cap(point, [lieu.lon, lieu.lat]));
  return {
    trouve: km <= rayonDe(lieu, carte, niveau),
    km,
    cap: cap(point, [lieu.lon, lieu.lat]),
    direction: dir,
    temperature: temperature(km, carte),
  };
}

/** Les points d'un lieu : cent, moins quinze par essai manqué, au moins dix ; rien si la carte l'a montré. */
export function pointsDuLieu(manques, montre = false) {
  if (montre) return 0;
  return Math.max(PLANCHER, POINTS_DEPART - PENALITE * manques);
}

const TOUS_LES_LIEUX = ENQUETES.flatMap((e) => e.lieux);

/** LES PHRASES DE SALIM — clés stables, lues par `phrasesDe('bonus-enquete-carte', …)`. */
export const PHRASES = {
  consigne: 'Écoute l’indice et touche la carte : la boussole te dit si tu chauffes.',
  'choix-enquete': 'Choisis ton enquête : monuments, nature ou villes de France.',
  froid: 'Froid ! Tu es encore très loin.',
  tiede: 'Tiède… Tu te rapproches.',
  chaud: 'Chaud ! Tu y es presque.',
  'indice-suivant': 'Voici un nouvel indice.',
  montre: 'Regarde, c’était ici. On passe au lieu suivant.',
  bravo: 'Bravo, enquêteur ! Tu as fini l’enquête.',
  ...Object.fromEntries(TOUS_LES_LIEUX.flatMap((l) => l.indices.map((t, i) => [`indice-${l.id}-${i + 1}`, t]))),
  ...Object.fromEntries(TOUS_LES_LIEUX.map((l) => [`revele-${l.id}`, l.revele])),
};
