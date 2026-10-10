import { outils } from '../../outils.js';
import { rangDe } from '../reglages.js';
import { CONTINENTS, continentDuClic } from './regions.js';
import { plusProche } from './geodesie.js';

/**
 * LE GRAND JEU DE GÉO — Camara, le 09/10/2026 (cahier « Nouveaux jeux
 * d'histoire et de géographie », famille « Cap sur le Monde »).
 *
 * Contre la montre : un continent, un pays, une capitale ou une ville
 * s'affiche, l'enfant le trouve sur la carte. Les petits ont les continents et
 * les grands pays ; les grands, les capitales et les pays plus petits. Un
 * clic juste rapporte des points (plus on est rapide, plus il en rapporte) et
 * deux secondes de plus pour la question suivante ; un clic faux, et la carte
 * montre où c'était.
 *
 * UNE CAPITALE OU UNE VILLE se trouve en touchant SON point : le clic est
 * juste si le point le plus proche est le bon, à moins de 300 km (250 au
 * lycée). Bratislava n'est qu'à 55 km de Vienne : la distance seule ne
 * suffirait pas. Les points des villes possibles s'affichent sur la carte,
 * sans leur nom.
 *
 * Coordonnées des villes vérifiées le 10/10/2026 (centre-ville, à 0,01° près).
 */

/** Les pays, par palier : 1 les géants, 2 les très connus, 3 les autres, 4 les petits. */
const PAYS_TEXTE = {
  1: 'FR:la France RU:la Russie CN:la Chine US:les États-Unis BR:le Brésil AU:l’Australie CA:le Canada IN:l’Inde',
  2: 'ES:l’Espagne IT:l’Italie DE:l’Allemagne GB:le Royaume-Uni MX:le Mexique AR:l’Argentine EG:l’Égypte JP:le Japon '
    + 'ZA:l’Afrique du Sud DZ:l’Algérie MA:le Maroc SA:l’Arabie saoudite KZ:le Kazakhstan MG:Madagascar PE:le Pérou '
    + 'CL:le Chili TR:la Turquie NO:la Norvège SE:la Suède ID:l’Indonésie MN:la Mongolie NG:le Nigeria IR:l’Iran',
  3: 'PT:le Portugal GR:la Grèce PL:la Pologne UA:l’Ukraine FI:la Finlande IE:l’Irlande IS:l’Islande CO:la Colombie '
    + 'VE:le Venezuela BO:la Bolivie CU:Cuba KE:le Kenya ET:l’Éthiopie ML:le Mali SN:le Sénégal TN:la Tunisie LY:la Libye '
    + 'SD:le Soudan NE:le Niger TD:le Tchad AO:l’Angola PK:le Pakistan TH:la Thaïlande VN:le Viêt Nam KR:la Corée du Sud '
    + 'PH:les Philippines NZ:la Nouvelle-Zélande AF:l’Afghanistan IQ:l’Irak CI:la Côte d’Ivoire CM:le Cameroun CD:la République démocratique du Congo',
  4: 'BE:la Belgique CH:la Suisse NL:les Pays-Bas AT:l’Autriche DK:le Danemark CZ:la Tchéquie HU:la Hongrie RO:la Roumanie '
    + 'BG:la Bulgarie HR:la Croatie RS:la Serbie LU:le Luxembourg AL:l’Albanie LT:la Lituanie LV:la Lettonie EE:l’Estonie '
    + 'SK:la Slovaquie SI:la Slovénie MD:la Moldavie BY:la Biélorussie NP:le Népal BT:le Bhoutan BD:le Bangladesh '
    + 'KH:le Cambodge LA:le Laos MM:la Birmanie KP:la Corée du Nord IL:Israël LB:le Liban JO:la Jordanie SY:la Syrie '
    + 'QA:le Qatar AE:les Émirats arabes unis YE:le Yémen OM:Oman UY:l’Uruguay PY:le Paraguay EC:l’Équateur '
    + 'GT:le Guatemala CR:le Costa Rica PA:le Panama HT:Haïti JM:la Jamaïque GH:le Ghana BF:le Burkina Faso RW:le Rwanda '
    + 'BJ:le Bénin TG:le Togo GA:le Gabon MZ:le Mozambique ZW:le Zimbabwe NA:la Namibie BW:le Botswana TZ:la Tanzanie '
    + 'UG:l’Ouganda SO:la Somalie MR:la Mauritanie GN:la Guinée KG:le Kirghizistan UZ:l’Ouzbékistan GE:la Géorgie '
    + 'AM:l’Arménie AZ:l’Azerbaïdjan',
};

export const PAYS = Object.entries(PAYS_TEXTE).flatMap(([palier, texte]) => texte.match(/[A-Z]{2}:[^:]+?(?= [A-Z]{2}:|$)/g)
  .map((m) => ({ type: 'pays', code: m.slice(0, 2), nom: m.slice(3), palier: Number(palier) })));

/** Les capitales : [nom, code du pays, longitude, latitude, palier]. */
const CAPITALES_TEXTE = [
  ['Paris', 'FR', 2.352, 48.857, 1], ['Londres', 'GB', -0.128, 51.507, 1], ['Rome', 'IT', 12.496, 41.903, 1],
  ['Madrid', 'ES', -3.704, 40.417, 1], ['Berlin', 'DE', 13.405, 52.52, 1], ['Washington', 'US', -77.037, 38.907, 1],
  ['Pékin', 'CN', 116.407, 39.904, 1], ['Tokyo', 'JP', 139.759, 35.682, 1], ['Moscou', 'RU', 37.617, 55.756, 1],
  ['Le Caire', 'EG', 31.236, 30.044, 1],
  ['Bruxelles', 'BE', 4.352, 50.85, 2], ['Lisbonne', 'PT', -9.139, 38.722, 2], ['Athènes', 'GR', 23.728, 37.984, 2],
  ['Vienne', 'AT', 16.373, 48.208, 2], ['Berne', 'CH', 7.447, 46.948, 2], ['Amsterdam', 'NL', 4.895, 52.37, 2],
  ['Varsovie', 'PL', 21.012, 52.23, 2], ['Stockholm', 'SE', 18.069, 59.329, 2], ['Oslo', 'NO', 10.752, 59.914, 2],
  ['Dublin', 'IE', -6.26, 53.35, 2], ['Ottawa', 'CA', -75.697, 45.421, 2], ['Mexico', 'MX', -99.133, 19.433, 2],
  ['Brasilia', 'BR', -47.882, -15.794, 2], ['Buenos Aires', 'AR', -58.382, -34.604, 2], ['Canberra', 'AU', 149.13, -35.281, 2],
  ['New Delhi', 'IN', 77.209, 28.614, 2], ['Alger', 'DZ', 3.059, 36.754, 2], ['Rabat', 'MA', -6.841, 34.02, 2],
  ['Dakar', 'SN', -17.467, 14.716, 2], ['Nairobi', 'KE', 36.822, -1.292, 2], ['Pretoria', 'ZA', 28.229, -25.747, 2],
  ['Ankara', 'TR', 32.86, 39.934, 2], ['Séoul', 'KR', 126.978, 37.567, 2], ['Bangkok', 'TH', 100.502, 13.756, 2],
  ['Helsinki', 'FI', 24.938, 60.17, 3], ['Copenhague', 'DK', 12.568, 55.676, 3], ['Prague', 'CZ', 14.438, 50.076, 3],
  ['Budapest', 'HU', 19.04, 47.498, 3], ['Bucarest', 'RO', 26.103, 44.426, 3], ['Kiev', 'UA', 30.523, 50.45, 3],
  ['Reykjavik', 'IS', -21.943, 64.147, 3], ['Lima', 'PE', -77.043, -12.046, 3], ['Bogota', 'CO', -74.072, 4.711, 3],
  ['Santiago', 'CL', -70.669, -33.449, 3], ['Caracas', 'VE', -66.904, 10.481, 3], ['La Havane', 'CU', -82.366, 23.113, 3],
  ['Abuja', 'NG', 7.399, 9.076, 3], ['Addis-Abeba', 'ET', 38.74, 9.03, 3], ['Kinshasa', 'CD', 15.266, -4.441, 3],
  ['Tunis', 'TN', 10.181, 36.806, 3], ['Bamako', 'ML', -8.003, 12.639, 3], ['Riyad', 'SA', 46.675, 24.713, 3],
  ['Téhéran', 'IR', 51.389, 35.689, 3], ['Islamabad', 'PK', 73.048, 33.684, 3], ['Jakarta', 'ID', 106.846, -6.208, 3],
  ['Manille', 'PH', 120.984, 14.6, 3], ['Hanoï', 'VN', 105.834, 21.028, 3], ['Wellington', 'NZ', 174.776, -41.287, 3],
  ['Oulan-Bator', 'MN', 106.906, 47.886, 3], ['Astana', 'KZ', 71.449, 51.169, 3], ['Bagdad', 'IQ', 44.366, 33.315, 3],
  ['Luxembourg', 'LU', 6.13, 49.611, 4], ['Bratislava', 'SK', 17.107, 48.149, 4], ['Ljubljana', 'SI', 14.506, 46.057, 4],
  ['Zagreb', 'HR', 15.982, 45.815, 4], ['Belgrade', 'RS', 20.449, 44.787, 4], ['Sofia', 'BG', 23.322, 42.698, 4],
  ['Tirana', 'AL', 19.819, 41.328, 4], ['Vilnius', 'LT', 25.28, 54.687, 4], ['Riga', 'LV', 24.105, 56.95, 4],
  ['Tallinn', 'EE', 24.754, 59.437, 4], ['Minsk', 'BY', 27.567, 53.9, 4], ['Chisinau', 'MD', 28.864, 47.011, 4],
  ['Katmandou', 'NP', 85.324, 27.717, 4], ['Thimphou', 'BT', 89.639, 27.472, 4], ['Dacca', 'BD', 90.413, 23.81, 4],
  ['Phnom Penh', 'KH', 104.928, 11.556, 4], ['Vientiane', 'LA', 102.633, 17.975, 4], ['Naypyidaw', 'MM', 96.079, 19.763, 4],
  ['Pyongyang', 'KP', 125.762, 39.039, 4], ['Beyrouth', 'LB', 35.502, 33.894, 4], ['Amman', 'JO', 35.91, 31.954, 4],
  ['Doha', 'QA', 51.531, 25.285, 4], ['Abou Dabi', 'AE', 54.377, 24.454, 4], ['Mascate', 'OM', 58.383, 23.588, 4],
  ['Montevideo', 'UY', -56.165, -34.901, 4], ['Asuncion', 'PY', -57.576, -25.264, 4], ['Quito', 'EC', -78.468, -0.18, 4],
  ['Accra', 'GH', -0.187, 5.604, 4], ['Ouagadougou', 'BF', -1.52, 12.371, 4], ['Kigali', 'RW', 30.062, -1.944, 4],
  ['Niamey', 'NE', 2.112, 13.512, 4], ['N’Djamena', 'TD', 15.056, 12.134, 4], ['Luanda', 'AO', 13.289, -8.839, 4],
  ['Maputo', 'MZ', 32.573, -25.969, 4], ['Harare', 'ZW', 31.052, -17.829, 4], ['Windhoek', 'NA', 17.083, -22.56, 4],
  ['Gaborone', 'BW', 25.923, -24.628, 4], ['Kampala', 'UG', 32.582, 0.348, 4], ['Dodoma', 'TZ', 35.752, -6.163, 4],
  ['Mogadiscio', 'SO', 45.318, 2.047, 4], ['Nouakchott', 'MR', -15.965, 18.079, 4], ['Conakry', 'GN', -13.578, 9.641, 4],
  ['Yamoussoukro', 'CI', -5.289, 6.827, 4], ['Yaoundé', 'CM', 11.502, 3.848, 4], ['Libreville', 'GA', 9.467, 0.416, 4],
  ['Tbilissi', 'GE', 44.783, 41.716, 4], ['Erevan', 'AM', 44.499, 40.179, 4], ['Bakou', 'AZ', 49.867, 40.409, 4],
  ['Tachkent', 'UZ', 69.24, 41.299, 4], ['Bichkek', 'KG', 74.57, 42.875, 4], ['Kaboul', 'AF', 69.207, 34.555, 4],
  ['Antananarivo', 'MG', 47.508, -18.879, 4], ['Panama', 'PA', -79.517, 8.983, 4], ['San José', 'CR', -84.091, 9.928, 4],
  ['Guatemala', 'GT', -90.507, 14.634, 4], ['Kingston', 'JM', -76.793, 17.971, 4], ['Port-au-Prince', 'HT', -72.307, 18.594, 4],
];

/** Les grandes villes qui ne sont pas des capitales : [nom, code du pays, longitude, latitude, palier]. */
const VILLES_TEXTE = [
  ['New York', 'US', -74.006, 40.713, 1], ['Marseille', 'FR', 5.37, 43.296, 1], ['Los Angeles', 'US', -118.244, 34.052, 1],
  ['Rio de Janeiro', 'BR', -43.173, -22.907, 1], ['Sydney', 'AU', 151.209, -33.869, 1], ['Shanghai', 'CN', 121.474, 31.23, 1],
  ['Barcelone', 'ES', 2.173, 41.385, 1], ['Venise', 'IT', 12.316, 45.441, 1], ['Bombay', 'IN', 72.878, 19.076, 1],
  ['Istanbul', 'TR', 28.978, 41.008, 1],
  ['Saint-Pétersbourg', 'RU', 30.336, 59.934, 2], ['Le Cap', 'ZA', 18.424, -33.925, 2], ['Casablanca', 'MA', -7.59, 33.573, 2],
  ['Lagos', 'NG', 3.379, 6.524, 2], ['Toronto', 'CA', -79.383, 43.653, 2], ['Montréal', 'CA', -73.567, 45.502, 2],
  ['São Paulo', 'BR', -46.633, -23.551, 2], ['Chicago', 'US', -87.63, 41.878, 2], ['Hong Kong', 'CN', 114.17, 22.32, 2],
  ['Dubaï', 'AE', 55.271, 25.205, 2], ['Osaka', 'JP', 135.502, 34.694, 2], ['Milan', 'IT', 9.19, 45.464, 2],
  ['Munich', 'DE', 11.582, 48.135, 2], ['Genève', 'CH', 6.143, 46.204, 2], ['Vancouver', 'CA', -123.121, 49.283, 2],
  ['Melbourne', 'AU', 144.963, -37.814, 2], ['Karachi', 'PK', 67.01, 24.861, 2], ['Alexandrie', 'EG', 29.919, 31.2, 2],
  ['Marrakech', 'MA', -7.981, 31.629, 2],
];

const versPoint = (type) => ([nom, pays, lon, lat, palier]) => ({
  type, id: `${type}-${nom}`, nom, pays, lon, lat, palier,
});
export const CAPITALES = CAPITALES_TEXTE.map(versPoint('capitale'));
export const VILLES = VILLES_TEXTE.map(versPoint('ville'));

const NOM_DU_PAYS = Object.fromEntries(PAYS.map((p) => [p.code, p.nom]));

/** Le nom d'un pays avec son article, ou null s'il n'est pas dans la liste. */
export const nomDuPays = (code) => NOM_DU_PAYS[code] ?? null;

/** « de la France », « du Brésil », « des États-Unis », « d’Israël ». */
export function complementDu(nom) {
  if (!nom) return '';
  if (nom.startsWith('le ')) return `du ${nom.slice(3)}`;
  if (nom.startsWith('les ')) return `des ${nom.slice(4)}`;
  if (nom.startsWith('la ') || nom.startsWith('l’')) return `de ${nom}`;
  return /^[AEIOUYÉÈÊHaeiouyéèêh]/.test(nom) ? `d’${nom}` : `de ${nom}`;
}

/** « la France » → « France ». */
export const sansArticle = (nom) => nom.replace(/^(le |la |les |l’)/, '');

/** Ce qu'on demande à l'écran : « le Brésil », « Madrid, capitale de l’Espagne », « Venise (Italie) ». */
export function intitule(cible) {
  if (cible.type === 'continent' || cible.type === 'pays') return cible.nom;
  if (cible.type === 'capitale') return `${cible.nom}, capitale ${complementDu(nomDuPays(cible.pays))}`.replace(/, capitale $/, ', une capitale');
  const pays = nomDuPays(cible.pays);
  return pays ? `${cible.nom} (${sansArticle(pays)})` : cible.nom;
}

/** Le rayon d'une capitale ou d'une ville, en kilomètres. */
export const rayonDe = (niveau) => (rangDe(niveau) >= 10 ? 250 : 300);

/** Les manches d'une partie, selon l'année. */
export function manchesDe(niveau) {
  const rang = rangDe(niveau);
  if (rang <= 2) return 8;
  if (rang <= 5) return 10;
  return 12;
}

/**
 * CE QUE DEMANDE CHAQUE ANNÉE : le nombre de questions de chaque sorte, et
 * les paliers ouverts. Du CP au CE1, des continents et des géants ; au lycée,
 * de petits pays et des capitales qu'on connaît moins.
 */
export function programmeDe(niveau) {
  const rang = rangDe(niveau);
  if (rang <= 2) return { continents: 4, pays: [4, [1]], capitales: [0, []], villes: [0, []] };
  if (rang <= 5) return { continents: 2, pays: [5, [1, 2]], capitales: [3, [1]], villes: [0, []] };
  if (rang <= 9) return { continents: 0, pays: [5, [2, 3]], capitales: [4, [1, 2, 3]], villes: [3, [1]] };
  return { continents: 0, pays: [5, [3, 4]], capitales: [4, [3, 4]], villes: [3, [1, 2]] };
}

/** Les points qu'on voit sur la carte, et parmi lesquels on cherche : ceux des paliers ouverts. */
export function pointsVisibles(niveau) {
  const p = programmeDe(niveau);
  const max = (paliers) => Math.max(0, ...paliers);
  const c = max(p.capitales[1]);
  const v = max(p.villes[1]);
  return [...CAPITALES.filter((x) => x.palier <= c), ...VILLES.filter((x) => x.palier <= v)];
}

/** Une partie : les questions mélangées, sans doublon. */
export function serie(graine = Date.now(), niveau = 'CP') {
  const o = outils(graine);
  const p = programmeDe(niveau);
  const tirer = (liste, [n, paliers]) => o.melanger(liste.filter((x) => paliers.includes(x.palier))).slice(0, n);
  const continents = o.melanger(CONTINENTS.filter((c) => c.cle !== 'antarctique' || p.continents > 3))
    .slice(0, p.continents)
    .map((c) => ({
      type: 'continent', id: `continent-${c.cle}`, cle: c.cle, nom: c.nom,
    }));
  const pays = tirer(PAYS, p.pays).map((x) => ({ ...x, id: `pays-${x.code}` }));
  const capitales = tirer(CAPITALES, p.capitales);
  const villes = tirer(VILLES, p.villes);
  return o.melanger([...continents, ...pays, ...capitales, ...villes]).slice(0, manchesDe(niveau));
}

/** Somaliland compte pour la Somalie, et Chypre du Nord pour Chypre. */
const ALIAS = { SOL: 'SO', CYN: 'CY' };

/**
 * LE JUGEMENT D'UN CLIC : `{ juste, mer }`. `clic` : `{ lon, lat, pays }` (le
 * code du pays touché, ou null en mer). La mer ne compte pas comme une erreur
 * pour un continent ou un pays : on dit seulement « c'est la mer ».
 */
export function juger(cible, clic, niveau = 'CM1') {
  const code = clic.pays ? (ALIAS[clic.pays] ?? clic.pays) : null;
  if (cible.type === 'continent') {
    if (!code) return { juste: false, mer: true };
    return { juste: continentDuClic(code, clic.lon) === cible.cle, mer: false };
  }
  if (cible.type === 'pays') {
    if (!code) return { juste: false, mer: true };
    return { juste: code === cible.code, mer: false };
  }
  const { lieu, km } = plusProche([clic.lon, clic.lat], pointsVisibles(niveau));
  return { juste: lieu?.id === cible.id && km <= rayonDe(niveau), mer: false, km };
}

/** Les secondes par question : moins en grandissant, et moins encore en défi. */
export function secondesParQuestion(niveau, defi = false) {
  const rang = rangDe(niveau);
  const base = rang <= 2 ? 25 : rang <= 5 ? 20 : rang <= 9 ? 15 : 12;
  return defi ? Math.max(7, Math.round(base * 0.6)) : base;
}

/** Le temps gagné par un clic juste, pour la question suivante. */
export const BONUS_SECONDES = 2;
export const BONUS_MAX = 8;

/** Les points d'un clic juste : cinquante, et cinq par seconde qui restait. */
export const pointsDuClic = (secondesRestantes) => 50 + 5 * Math.max(0, Math.round(secondesRestantes));

const TOUTES_LES_CIBLES = [
  ...CONTINENTS.map((c) => ({ id: `continent-${c.cle}`, texte: c.nom })),
  ...PAYS.map((x) => ({ id: `pays-${x.code}`, texte: x.nom })),
  ...CAPITALES.map((x) => ({ id: x.id, texte: intitule(x) })),
  ...VILLES.map((x) => ({ id: x.id, texte: intitule(x) })),
];

const majuscule = (t) => t.charAt(0).toUpperCase() + t.slice(1);

/** LES PHRASES DE SALIM — clés stables, lues par `phrasesDe('bonus-grand-jeu-de-geo', …)`. */
export const PHRASES = {
  consigne: 'Trouve-le sur la carte, vite ! Un clic juste : des points et du temps.',
  juste: 'Oui !',
  faux: 'Non, c’était ici.',
  'trop-tard': 'Trop tard ! C’était ici.',
  mer: 'Là, c’est la mer !',
  bravo: 'Bravo, la partie est finie !',
  ...Object.fromEntries(TOUTES_LES_CIBLES.map((c) => [`trouve-${c.id.toLowerCase()}`, `Trouve ${c.texte}.`])),
};

export const texteDeLaCible = (cible) => majuscule(intitule(cible));
