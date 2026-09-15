/**
 * Couleur d'identité d'une matière.
 *
 * Une matière = un professeur = une couleur. Le parent qui parcourt la fiche
 * de son enfant reconnaît « Français » à sa teinte avant d'avoir lu le mot,
 * exactement comme il reconnaît un classeur à sa tranche.
 *
 * CE QUE CETTE COULEUR N'EST PAS
 * ------------------------------
 * Ce n'est pas un encodage au sens des graphiques. Dans un graphique, la
 * couleur EST l'information : elle identifie une barre qui ne porte aucun
 * texte, et deux teintes trop proches rendent la lecture fausse. Ici la
 * couleur peint un mot qui dit déjà son nom. Elle est un rappel, pas une
 * donnée — le libellé reste lisible en noir et blanc, en impression, et pour
 * un daltonien.
 *
 * Cette distinction a une conséquence concrète : cinq teintes à clarté
 * constante ne peuvent PAS toutes se séparer deux à deux. Le vérificateur de
 * palette le confirme à chaque essai — dès qu'on écarte le vert du sarcelle,
 * le bleu se rapproche du violet, et réciproquement. On ne poursuit donc pas
 * cet objectif-là. Ce qu'on tient, en revanche, sans exception :
 *
 *   — 4,5:1 de contraste sur le fond, dans LES DEUX thèmes. C'est du texte,
 *     pas une marque : le seuil des graphiques (3:1) ne suffirait pas.
 *   — la meilleure séparation atteignable une fois ce seuil tenu : la pire
 *     paire en vision normale est maths ↔ anglais (ΔE 11,5 en clair).
 *
 * Les valeurs claires sont celles de `prof_couleur` en base — la couleur du
 * professeur et celle de sa matière sont la même chose. Deux ont été écartées
 * de leur valeur d'origine parce qu'elles se confondaient avec le sarcelle de
 * Nora et le bleu de Marine : histoire-géo (violet → magenta) et sciences
 * (vert → olive, puis olive → ambre le jour où la matière s'est scindée). Ces
 * matières n'étant pas encore ouvertes, le changement ne coûtait rien ; le
 * seeder a été aligné dans le même mouvement.
 *
 * Les valeurs sombres sont CHOISIES, pas calculées : éclaircir d'un
 * pourcentage donne un résultat qui dépend de la teinte de départ, et sur le
 * bleu marine du thème sombre trois des cinq tombaient sous le seuil.
 */
const MATIERES = {
  MATHS: { clair: '#0E7C7B', sombre: '#35B3AB' },
  FRANCAIS: { clair: '#B4531F', sombre: '#E2894F' },
  HISTOIRE_GEO: { clair: '#99277F', sombre: '#DC90D8' },
  ANGLAIS: { clair: '#1D6FB8', sombre: '#7AB8F0' },

  // Les sciences occupent trois entrées pour DEUX teintes seulement, et c'est
  // volontaire — voir plus bas.
  SCIENCES: { clair: '#6B4400', sombre: '#E8C88E' },
  PHYSIQUE_CHIMIE: { clair: '#6B4400', sombre: '#E8C88E' },
  SVT: { clair: '#5C7F14', sombre: '#8FCE5C' },
  PHILOSOPHIE: { clair: '#5A4A8C', sombre: '#B7A8E8' },
  ESPAGNOL: { clair: '#BE123C', sombre: '#FB7185' },

  // LES SPÉCIALITÉS DES SÉRIES TECHNOLOGIQUES (STMG, ST2S, STL). Une
  // couleur suit le professeur : les trois matières de Karim partagent son
  // vert, les spécialités scientifiques gardent l'ambre de Yann et l'olive
  // d'Inès.
  SCIENCES_GESTION: { clair: '#166534', sombre: '#6FCF8B' },
  MANAGEMENT: { clair: '#166534', sombre: '#6FCF8B' },
  DROIT_ECONOMIE: { clair: '#166534', sombre: '#6FCF8B' },
  SPCL: { clair: '#6B4400', sombre: '#E8C88E' },
  BIOTECHNOLOGIES: { clair: '#5C7F14', sombre: '#8FCE5C' },
  BIOLOGIE_HUMAINE: { clair: '#5C7F14', sombre: '#8FCE5C' },
  SANITAIRE_SOCIAL: { clair: '#B91C1C', sombre: '#F59E9E' },

  // LES SPÉCIALITÉS DE LA VOIE GÉNÉRALE : même règle, la couleur suit le
  // professeur — Salim en HGGSP, Camille en HLP, Karim en SES, Nora en NSI.
  HGGSP: { clair: '#99277F', sombre: '#DC90D8' },
  HLP: { clair: '#5A4A8C', sombre: '#B7A8E8' },
  SES: { clair: '#166534', sombre: '#6FCF8B' },
  NSI: { clair: '#0E7C7B', sombre: '#35B3AB' },
  LLCER_ANGLAIS: { clair: '#1D6FB8', sombre: '#7AB8F0' },
  AMC: { clair: '#1D6FB8', sombre: '#7AB8F0' },
  LLCER_ESPAGNOL: { clair: '#BE123C', sombre: '#FB7185' },
  SI: { clair: '#6B4400', sombre: '#E8C88E' },
  LLCA_LATIN: { clair: '#B4531F', sombre: '#E2894F' },
  LLCA_GREC: { clair: '#B4531F', sombre: '#E2894F' },
  // Deux nouveaux professeurs : Théo (EPPCS), Jeanne (les sept arts).
  EPPCS: { clair: '#C2410C', sombre: '#FDBA74' },
  ARTS_PLASTIQUES: { clair: '#86198F', sombre: '#F0ABFC' },
  HISTOIRE_ARTS: { clair: '#86198F', sombre: '#F0ABFC' },
  CINEMA_AUDIOVISUEL: { clair: '#86198F', sombre: '#F0ABFC' },
  MUSIQUE: { clair: '#86198F', sombre: '#F0ABFC' },
  THEATRE: { clair: '#86198F', sombre: '#F0ABFC' },
  DANSE: { clair: '#86198F', sombre: '#F0ABFC' },
  ARTS_CIRQUE: { clair: '#86198F', sombre: '#F0ABFC' },
};

/**
 * POURQUOI DEUX MATIÈRES PARTAGENT L'AMBRE
 * ---------------------------------------
 * Une couleur suit le PROFESSEUR, pas la ligne du catalogue. Yann enseigne
 * « Sciences et technologie » jusqu'à la 6e puis la physique-chimie à partir de
 * la 5e : c'est le même professeur, l'élève doit le reconnaître en passant au
 * collège. Deux entrées, une identité.
 *
 * Et les deux ne s'affichent jamais ensemble : leurs plages de niveaux sont
 * disjointes. La règle « deux teintes voisines doivent se séparer » ne
 * s'applique qu'à ce qui coexiste — d'où l'olive rendu disponible pour la SVT,
 * qui est la continuité réelle du volet vivant des sciences de cycle 3.
 *
 * L'ambre a été mesuré, pas choisi à l'œil : 8,0:1 de contraste sur le fond
 * clair, 11,1:1 sur le sombre, et sa pire paire (ΔE 15,4 en clair, 14,0 en
 * sombre) fait mieux que la pire paire déjà en place, maths ↔ anglais.
 */

/**
 * Teinte de repli, pour une matière qu'on ne connaît pas encore.
 *
 * Un gris ardoise plutôt qu'une couleur au hasard : une matière inconnue doit
 * se voir comme telle, pas se déguiser en matière connue. Il tient 4,5:1 sur
 * les deux fonds — il est aussi lisible que les autres, juste muet.
 */
const REPLI = { clair: '#55617A', sombre: '#9AA8BD' };

/**
 * Table de correspondance depuis le LIBELLÉ.
 *
 * Tous les écrans n'ont pas le code de la matière sous la main — les lignes
 * d'évaluation et de compte rendu ne transportent que le libellé. Plutôt que
 * de faire descendre le code dans une demi-douzaine de contrats d'API pour
 * une couleur, on reconnaît le libellé.
 *
 * La clé est normalisée : accents retirés, traits d'union et apostrophes
 * ramenés à l'espace. « Histoire-Géographie », « histoire geographie » et
 * « Histoire Géographie » désignent la même matière et doivent se valoir.
 */
const PAR_LIBELLE = {
  mathematiques: 'MATHS',
  maths: 'MATHS',
  francais: 'FRANCAIS',
  'histoire geographie': 'HISTOIRE_GEO',
  'histoire geo': 'HISTOIRE_GEO',
  anglais: 'ANGLAIS',
  espagnol: 'ESPAGNOL',
  sciences: 'SCIENCES',
  'sciences et technologie': 'SCIENCES',
  'physique chimie': 'PHYSIQUE_CHIMIE',
  physique: 'PHYSIQUE_CHIMIE',
  svt: 'SVT',
  'sciences de la vie et de la terre': 'SVT',
  philosophie: 'PHILOSOPHIE',
  'sciences de gestion et numerique': 'SCIENCES_GESTION',
  management: 'MANAGEMENT',
  'droit et economie': 'DROIT_ECONOMIE',
  'biochimie, biologie et biotechnologies': 'BIOTECHNOLOGIES',
  'sciences physiques et chimiques en laboratoire': 'SPCL',
  'biologie et physiopathologie humaines': 'BIOLOGIE_HUMAINE',
  'sciences et techniques sanitaires et sociales': 'SANITAIRE_SOCIAL',
  'histoire geographie, geopolitique et sciences politiques': 'HGGSP',
  hggsp: 'HGGSP',
  'humanites, litterature et philosophie': 'HLP',
  hlp: 'HLP',
  'sciences economiques et sociales': 'SES',
  ses: 'SES',
  'numerique et sciences informatiques': 'NSI',
  nsi: 'NSI',
  'langues, litteratures et cultures etrangeres — anglais': 'LLCER_ANGLAIS',
  'llcer anglais': 'LLCER_ANGLAIS',
  'anglais, monde contemporain': 'AMC',
  'llcer anglais, monde contemporain (amc)': 'AMC',
  'llcer anglais, monde contemporain': 'AMC',
  amc: 'AMC',
  'langues, litteratures et cultures etrangeres — espagnol': 'LLCER_ESPAGNOL',
  'llcer espagnol': 'LLCER_ESPAGNOL',
  'sciences de l ingenieur': 'SI',
  'litterature, langues et cultures de l antiquite — latin': 'LLCA_LATIN',
  'llca latin': 'LLCA_LATIN',
  'litterature, langues et cultures de l antiquite — grec': 'LLCA_GREC',
  'llca grec': 'LLCA_GREC',
  'education physique, pratiques et culture sportives': 'EPPCS',
  eppcs: 'EPPCS',
  'arts plastiques': 'ARTS_PLASTIQUES',
  'histoire des arts': 'HISTOIRE_ARTS',
  'cinema audiovisuel': 'CINEMA_AUDIOVISUEL',
  musique: 'MUSIQUE',
  theatre: 'THEATRE',
  danse: 'DANSE',
  'arts du cirque': 'ARTS_CIRQUE',
};

const normaliser = (texte) =>
  (texte ?? '')
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(/['’`-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

/**
 * Retrouve la matière depuis ce qu'on a sous la main.
 *
 * Tolère aussi bien une chaîne nue (le libellé) qu'un objet portant
 * `matiereCode` ou `matiereLibelle` : les appelants n'ont pas tous la même
 * forme, et leur imposer de trier serait déplacer le problème.
 */
function teintes(matiere) {
  if (matiere == null) return REPLI;

  if (typeof matiere === 'string') {
    return MATIERES[matiere] ?? MATIERES[PAR_LIBELLE[normaliser(matiere)]] ?? REPLI;
  }

  const parCode = matiere.matiereCode ?? matiere.code;
  if (parCode && MATIERES[parCode]) return MATIERES[parCode];

  const libelle = matiere.matiereLibelle ?? matiere.libelle;
  return MATIERES[PAR_LIBELLE[normaliser(libelle)]] ?? REPLI;
}

export function couleurMatiere(matiere) {
  return teintes(matiere).clair;
}

export function couleurMatiereClaire(matiere) {
  return teintes(matiere).sombre;
}

/**
 * Les deux variables d'instance à poser sur l'élément.
 *
 * Le composant ne choisit pas selon le thème — il pose les deux valeurs, et
 * la feuille de style tranche. C'est le seul moyen de suivre un changement de
 * thème système sans remonter par React.
 *
 *   <td style={styleMatiere(e)} className="matiere-nom">{e.matiereLibelle}</td>
 */
export function styleMatiere(matiere) {
  const { clair, sombre } = teintes(matiere);
  return { '--matiere': clair, '--matiere-claire': sombre };
}

export default couleurMatiere;
