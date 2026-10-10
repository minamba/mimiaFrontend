// Données du « Défi des drapeaux » — écrit le 09/10/2026 pour les jeux bonus.
// Codes ISO 3166-1 alpha-2 (images : flag-icons, flags/4x3/<code>.svg).
// niveau : 1 = CP-CE1, 2 = fin du primaire, 3 = collège, 4 = lycée.

export const PAYS = [
  // ——— Niveau 1 ———
  { code: 'fr', nom: 'France', continent: 'Europe', niveau: 1 },
  { code: 'it', nom: 'Italie', continent: 'Europe', niveau: 1 },
  { code: 'es', nom: 'Espagne', continent: 'Europe', niveau: 1 },
  { code: 'de', nom: 'Allemagne', continent: 'Europe', niveau: 1 },
  { code: 'gb', nom: 'Royaume-Uni', continent: 'Europe', niveau: 1 },
  { code: 'be', nom: 'Belgique', continent: 'Europe', niveau: 1 },
  { code: 'ch', nom: 'Suisse', continent: 'Europe', niveau: 1 },
  { code: 'pt', nom: 'Portugal', continent: 'Europe', niveau: 1 },
  { code: 'gr', nom: 'Grèce', continent: 'Europe', niveau: 1 },
  { code: 'ru', nom: 'Russie', continent: 'Europe', niveau: 1 },
  { code: 'us', nom: 'États-Unis', continent: 'Amérique', niveau: 1 },
  { code: 'ca', nom: 'Canada', continent: 'Amérique', niveau: 1 },
  { code: 'br', nom: 'Brésil', continent: 'Amérique', niveau: 1 },
  { code: 'mx', nom: 'Mexique', continent: 'Amérique', niveau: 1 },
  { code: 'ar', nom: 'Argentine', continent: 'Amérique', niveau: 1 },
  { code: 'jp', nom: 'Japon', continent: 'Asie', niveau: 1 },
  { code: 'cn', nom: 'Chine', continent: 'Asie', niveau: 1 },
  { code: 'in', nom: 'Inde', continent: 'Asie', niveau: 1 },
  { code: 'kr', nom: 'Corée du Sud', continent: 'Asie', niveau: 1 },
  { code: 'ma', nom: 'Maroc', continent: 'Afrique', niveau: 1 },
  { code: 'dz', nom: 'Algérie', continent: 'Afrique', niveau: 1 },
  { code: 'tn', nom: 'Tunisie', continent: 'Afrique', niveau: 1 },
  { code: 'sn', nom: 'Sénégal', continent: 'Afrique', niveau: 1 },
  { code: 'au', nom: 'Australie', continent: 'Océanie', niveau: 1 },

  // ——— Niveau 2 ———
  { code: 'nl', nom: 'Pays-Bas', continent: 'Europe', niveau: 2 },
  { code: 'se', nom: 'Suède', continent: 'Europe', niveau: 2 },
  { code: 'no', nom: 'Norvège', continent: 'Europe', niveau: 2 },
  { code: 'dk', nom: 'Danemark', continent: 'Europe', niveau: 2 },
  { code: 'fi', nom: 'Finlande', continent: 'Europe', niveau: 2 },
  { code: 'ie', nom: 'Irlande', continent: 'Europe', niveau: 2 },
  { code: 'at', nom: 'Autriche', continent: 'Europe', niveau: 2 },
  { code: 'pl', nom: 'Pologne', continent: 'Europe', niveau: 2 },
  { code: 'ua', nom: 'Ukraine', continent: 'Europe', niveau: 2 },
  { code: 'hr', nom: 'Croatie', continent: 'Europe', niveau: 2 },
  { code: 'tr', nom: 'Turquie', continent: 'Asie', niveau: 2 },
  { code: 'sa', nom: 'Arabie saoudite', continent: 'Asie', niveau: 2 },
  { code: 'th', nom: 'Thaïlande', continent: 'Asie', niveau: 2 },
  { code: 'vn', nom: 'Viêt Nam', continent: 'Asie', niveau: 2 },
  { code: 'eg', nom: 'Égypte', continent: 'Afrique', niveau: 2 },
  { code: 'za', nom: 'Afrique du Sud', continent: 'Afrique', niveau: 2 },
  { code: 'ci', nom: 'Côte d’Ivoire', continent: 'Afrique', niveau: 2 },
  { code: 'cm', nom: 'Cameroun', continent: 'Afrique', niveau: 2 },
  { code: 'ml', nom: 'Mali', continent: 'Afrique', niveau: 2 },
  { code: 'ng', nom: 'Nigeria', continent: 'Afrique', niveau: 2 },
  { code: 'co', nom: 'Colombie', continent: 'Amérique', niveau: 2 },
  { code: 'cl', nom: 'Chili', continent: 'Amérique', niveau: 2 },
  { code: 'pe', nom: 'Pérou', continent: 'Amérique', niveau: 2 },
  { code: 'cu', nom: 'Cuba', continent: 'Amérique', niveau: 2 },
  { code: 'jm', nom: 'Jamaïque', continent: 'Amérique', niveau: 2 },
  { code: 'ht', nom: 'Haïti', continent: 'Amérique', niveau: 2 },
  { code: 'nz', nom: 'Nouvelle-Zélande', continent: 'Océanie', niveau: 2 },

  // ——— Niveau 3 ———
  { code: 'cz', nom: 'Tchéquie', continent: 'Europe', niveau: 3 },
  { code: 'sk', nom: 'Slovaquie', continent: 'Europe', niveau: 3 },
  { code: 'hu', nom: 'Hongrie', continent: 'Europe', niveau: 3 },
  { code: 'ro', nom: 'Roumanie', continent: 'Europe', niveau: 3 },
  { code: 'bg', nom: 'Bulgarie', continent: 'Europe', niveau: 3 },
  { code: 'rs', nom: 'Serbie', continent: 'Europe', niveau: 3 },
  { code: 'si', nom: 'Slovénie', continent: 'Europe', niveau: 3 },
  { code: 'is', nom: 'Islande', continent: 'Europe', niveau: 3 },
  { code: 'ee', nom: 'Estonie', continent: 'Europe', niveau: 3 },
  { code: 'lv', nom: 'Lettonie', continent: 'Europe', niveau: 3 },
  { code: 'lt', nom: 'Lituanie', continent: 'Europe', niveau: 3 },
  { code: 'lu', nom: 'Luxembourg', continent: 'Europe', niveau: 3 },
  { code: 'mc', nom: 'Monaco', continent: 'Europe', niveau: 3 },
  { code: 'td', nom: 'Tchad', continent: 'Afrique', niveau: 3 },
  { code: 'ne', nom: 'Niger', continent: 'Afrique', niveau: 3 },
  { code: 'bf', nom: 'Burkina Faso', continent: 'Afrique', niveau: 3 },
  { code: 'ga', nom: 'Gabon', continent: 'Afrique', niveau: 3 },
  { code: 'cg', nom: 'Congo', continent: 'Afrique', niveau: 3 },
  { code: 'cd', nom: 'République démocratique du Congo', continent: 'Afrique', niveau: 3 },
  { code: 'mg', nom: 'Madagascar', continent: 'Afrique', niveau: 3 },
  { code: 'ke', nom: 'Kenya', continent: 'Afrique', niveau: 3 },
  { code: 'et', nom: 'Éthiopie', continent: 'Afrique', niveau: 3 },
  { code: 'gh', nom: 'Ghana', continent: 'Afrique', niveau: 3 },
  { code: 'gn', nom: 'Guinée', continent: 'Afrique', niveau: 3 },
  { code: 'mr', nom: 'Mauritanie', continent: 'Afrique', niveau: 3 },
  { code: 've', nom: 'Venezuela', continent: 'Amérique', niveau: 3 },
  { code: 'bo', nom: 'Bolivie', continent: 'Amérique', niveau: 3 },
  { code: 'uy', nom: 'Uruguay', continent: 'Amérique', niveau: 3 },
  { code: 'py', nom: 'Paraguay', continent: 'Amérique', niveau: 3 },
  { code: 'ec', nom: 'Équateur', continent: 'Amérique', niveau: 3 },
  { code: 'ir', nom: 'Iran', continent: 'Asie', niveau: 3 },
  { code: 'iq', nom: 'Irak', continent: 'Asie', niveau: 3 },
  { code: 'pk', nom: 'Pakistan', continent: 'Asie', niveau: 3 },
  { code: 'id', nom: 'Indonésie', continent: 'Asie', niveau: 3 },
  { code: 'ph', nom: 'Philippines', continent: 'Asie', niveau: 3 },
  { code: 'my', nom: 'Malaisie', continent: 'Asie', niveau: 3 },
  { code: 'sg', nom: 'Singapour', continent: 'Asie', niveau: 3 },
  { code: 'kp', nom: 'Corée du Nord', continent: 'Asie', niveau: 3 },
  { code: 'mn', nom: 'Mongolie', continent: 'Asie', niveau: 3 },
  { code: 'np', nom: 'Népal', continent: 'Asie', niveau: 3 },
  { code: 'lb', nom: 'Liban', continent: 'Asie', niveau: 3 },
  { code: 'ae', nom: 'Émirats arabes unis', continent: 'Asie', niveau: 3 },
  { code: 'fj', nom: 'Fidji', continent: 'Océanie', niveau: 3 },
  { code: 'pg', nom: 'Papouasie-Nouvelle-Guinée', continent: 'Océanie', niveau: 3 },

  // ——— Niveau 4 ———
  { code: 'al', nom: 'Albanie', continent: 'Europe', niveau: 4 },
  { code: 'mk', nom: 'Macédoine du Nord', continent: 'Europe', niveau: 4 },
  { code: 'me', nom: 'Monténégro', continent: 'Europe', niveau: 4 },
  { code: 'ba', nom: 'Bosnie-Herzégovine', continent: 'Europe', niveau: 4 },
  { code: 'md', nom: 'Moldavie', continent: 'Europe', niveau: 4 },
  { code: 'mt', nom: 'Malte', continent: 'Europe', niveau: 4 },
  { code: 'cy', nom: 'Chypre', continent: 'Europe', niveau: 4 },
  { code: 'ad', nom: 'Andorre', continent: 'Europe', niveau: 4 },
  { code: 'li', nom: 'Liechtenstein', continent: 'Europe', niveau: 4 },
  { code: 'bj', nom: 'Bénin', continent: 'Afrique', niveau: 4 },
  { code: 'tg', nom: 'Togo', continent: 'Afrique', niveau: 4 },
  { code: 'cf', nom: 'Centrafrique', continent: 'Afrique', niveau: 4 },
  { code: 'rw', nom: 'Rwanda', continent: 'Afrique', niveau: 4 },
  { code: 'tz', nom: 'Tanzanie', continent: 'Afrique', niveau: 4 },
  { code: 'ao', nom: 'Angola', continent: 'Afrique', niveau: 4 },
  { code: 'na', nom: 'Namibie', continent: 'Afrique', niveau: 4 },
  { code: 'sd', nom: 'Soudan', continent: 'Afrique', niveau: 4 },
  { code: 'ly', nom: 'Libye', continent: 'Afrique', niveau: 4 },
  { code: 'dj', nom: 'Djibouti', continent: 'Afrique', niveau: 4 },
  { code: 'km', nom: 'Comores', continent: 'Afrique', niveau: 4 },
  { code: 'mu', nom: 'Maurice', continent: 'Afrique', niveau: 4 },
  { code: 'kz', nom: 'Kazakhstan', continent: 'Asie', niveau: 4 },
  { code: 'bd', nom: 'Bangladesh', continent: 'Asie', niveau: 4 },
  { code: 'lk', nom: 'Sri Lanka', continent: 'Asie', niveau: 4 },
  { code: 'kh', nom: 'Cambodge', continent: 'Asie', niveau: 4 },
  { code: 'la', nom: 'Laos', continent: 'Asie', niveau: 4 },
  { code: 'bt', nom: 'Bhoutan', continent: 'Asie', niveau: 4 },
  { code: 'jo', nom: 'Jordanie', continent: 'Asie', niveau: 4 },
  { code: 'sy', nom: 'Syrie', continent: 'Asie', niveau: 4 },
  { code: 'ye', nom: 'Yémen', continent: 'Asie', niveau: 4 },
  { code: 'kw', nom: 'Koweït', continent: 'Asie', niveau: 4 },
  { code: 'am', nom: 'Arménie', continent: 'Asie', niveau: 4 },
  { code: 'ge', nom: 'Géorgie', continent: 'Asie', niveau: 4 },
  { code: 'hn', nom: 'Honduras', continent: 'Amérique', niveau: 4 },
  { code: 'sv', nom: 'Salvador', continent: 'Amérique', niveau: 4 },
  { code: 'ni', nom: 'Nicaragua', continent: 'Amérique', niveau: 4 },
  { code: 'cr', nom: 'Costa Rica', continent: 'Amérique', niveau: 4 },
  { code: 'pa', nom: 'Panama', continent: 'Amérique', niveau: 4 },
  { code: 'do', nom: 'République dominicaine', continent: 'Amérique', niveau: 4 },
  { code: 'tt', nom: 'Trinité-et-Tobago', continent: 'Amérique', niveau: 4 },
  { code: 'ws', nom: 'Samoa', continent: 'Océanie', niveau: 4 },
  { code: 'to', nom: 'Tonga', continent: 'Océanie', niveau: 4 },
  { code: 'vu', nom: 'Vanuatu', continent: 'Océanie', niveau: 4 },
];

// Groupes de drapeaux qui se ressemblent trop : jamais proposés ensemble.
export const SOSIES = [
  ['td', 'ro', 'ad', 'md'],   // bleu-jaune-rouge vertical
  ['id', 'mc', 'pl'],         // rouge et blanc
  ['ie', 'ci', 'it'],         // vert-blanc-orange / vert-blanc-rouge
  ['it', 'mx'],               // vert-blanc-rouge vertical
  ['nl', 'lu', 'hr', 'py'],   // rouge-blanc-bleu horizontal
  ['ru', 'si', 'sk', 'rs'],   // blanc-bleu-rouge à blason
  ['au', 'nz'],               // Union Jack et Croix du Sud
  ['ml', 'gn', 'sn', 'cm'],   // vert-jaune-rouge vertical
  ['ve', 'co', 'ec'],         // jaune-bleu-rouge
  ['no', 'is'],               // croix nordiques inversées
  ['dk', 'ch'],               // croix blanche sur rouge
  ['hn', 'sv', 'ni', 'ar'],   // bleu ciel-blanc-bleu ciel
  ['eg', 'iq', 'sy', 'ye'],   // rouge-blanc-noir horizontal
  ['ae', 'kw', 'jo', 'sd'],   // couleurs panarabes à triangle
  ['ne', 'in'],               // orange-blanc-vert à disque
  ['gh', 'bo', 'et', 'lt'],   // rouge-jaune-vert horizontal
  ['at', 'lv', 'lb', 'pe', 'ca'], // rouge-blanc-rouge
  ['ht', 'li'],               // bleu sur rouge
  ['us', 'my'],               // bandes rouges et blanches, canton bleu
  ['tr', 'tn'],               // croissant et étoile sur rouge
  ['cz', 'ph'],               // triangle bleu, bandes blanche et rouge
  ['bg', 'hu'],               // blanc / rouge, vert
  ['de', 'be'],               // noir, jaune, rouge
  ['cg', 'tz'],               // diagonale vert-jaune / jaune-noir
  ['bf', 'vn'],               // étoile jaune sur rouge
];
