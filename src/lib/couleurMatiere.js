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
  sciences: 'SCIENCES',
  'sciences et technologie': 'SCIENCES',
  'physique chimie': 'PHYSIQUE_CHIMIE',
  physique: 'PHYSIQUE_CHIMIE',
  svt: 'SVT',
  'sciences de la vie et de la terre': 'SVT',
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
