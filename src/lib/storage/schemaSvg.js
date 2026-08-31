import { cleSchema, schemaDeLaBibliotheque } from './schemas';

/**
 * Le schéma que le professeur trace au tableau.
 *
 * POURQUOI DU SVG ET PLUS DES CARACTÈRES
 * -------------------------------------
 * En texte monospace, l'alignement est BINAIRE : un caractère de décalage et
 * la figure est fausse, donc illisible. C'est pour ça que le professeur de
 * maths n'avait le droit de dessiner que trois modèles pré-validés — à ce
 * jeu-là, on ne peut pas faire confiance à une génération, et l'écrasante
 * majorité des schémas du programme étaient purement et simplement interdits.
 *
 * En SVG, les coordonnées sont continues : une figure imprécise reste
 * reconnaissable. Une coupe de la Terre dont le noyau est décentré de trois
 * pixels se lit toujours comme une coupe de la Terre. L'échec passe de
 * « faux » à « un peu maladroit », et le dessin redevient autorisable.
 *
 * ON NE FAIT CONFIANCE À RIEN DE CE QUI ARRIVE ICI
 * -----------------------------------------------
 * Le SVG est du balisage exécutable, et ce balisage est produit par un modèle
 * qu'un élève peut essayer d'influencer. On ne l'injecte donc JAMAIS dans le
 * document : on l'analyse, et on reconstruit un arbre neuf en ne gardant que
 * ce qui figure sur les listes blanches ci-dessous. Tout le reste — un
 * `<script>`, un `<foreignObject>`, un `onclick`, un `href` — n'est pas filtré
 * ni échappé : il n'est simplement jamais recopié.
 *
 * LES COULEURS NE SONT PAS AU MODÈLE
 * ---------------------------------
 * `stroke` et `fill` n'acceptent que `currentColor` et `none`. La craie est
 * imposée par la feuille de style, exactement comme les couleurs de matière.
 * Le professeur décide de CE QU'IL dessine ; l'apparence appartient au code.
 */

/** Ce qu'on sait dessiner. Volontairement court. */
const BALISES = new Set([
  'svg', 'g', 'title', 'desc',
  'line', 'polyline', 'polygon', 'path', 'rect', 'circle', 'ellipse',
  'text', 'tspan',
]);

/**
 * Attributs géométriques et typographiques. Aucun n'est exécutable.
 *
 * Absents volontairement : `style` et `class` (ils rouvriraient la porte aux
 * couleurs et aux polices), `id` et tout ce qui pourrait être référencé par
 * `url(...)`, et bien sûr `href` et les gestionnaires `on*`.
 */
const ATTRIBUTS = new Set([
  'viewBox', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry',
  'width', 'height', 'd', 'points', 'transform', 'opacity',
  'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin',
  'fill-rule', 'text-anchor', 'dominant-baseline', 'font-size', 'font-style',
  'font-weight', 'letter-spacing',
]);

/** Les deux seules valeurs admises pour une couleur. */
const COULEURS = new Set(['currentColor', 'none']);

/**
 * Cadre de repli.
 *
 * Un schéma sans viewBox exploitable serait rendu à sa taille intrinsèque,
 * c'est-à-dire minuscule dans un coin du tableau. On lui en impose un.
 */
const CADRE_DEFAUT = '0 0 400 300';

/**
 * Ce contenu d'ardoise est-il un dessin plutôt que du texte ?
 *
 * Deux façons d'en être un : le professeur a dessiné lui-même, ou il a appelé
 * une figure de la bibliothèque par sa clé. Les deux passent ensuite par le
 * MÊME assainissement — y compris la bibliothèque, pourtant écrite à la main.
 * Un second chemin « de confiance » serait exactement l'endroit où une faille
 * s'installerait sans qu'on la voie.
 */
export function estUnSchema(contenu) {
  if (typeof contenu !== 'string') return false;
  return contenu.trimStart().startsWith('<svg') || cleSchema(contenu) !== null;
}

/** Le SVG à rendre : celui de la bibliothèque, ou celui qu'on a reçu. */
export function svgDuContenu(contenu) {
  const cle = cleSchema(contenu);
  return cle ? schemaDeLaBibliotheque(cle) : contenu;
}

/**
 * Analyse un schéma et rend un arbre sûr, ou null.
 *
 * L'arbre est de la donnée pure — `{ balise, attributs, enfants, texte }` —
 * et non du JSX : c'est le composant qui décide comment le rendre, et rien
 * dans cette structure ne peut porter de comportement.
 */
export function analyserSchema(contenu) {
  if (!estUnSchema(contenu) || typeof DOMParser === 'undefined') return null;

  // La bibliothèque est résolue AVANT l'analyse : à partir d'ici il n'y a plus
  // qu'un seul chemin, donc une seule chose à auditer.
  const source = svgDuContenu(contenu);
  if (!source) return null;

  try {
    const document = new DOMParser().parseFromString(source, 'image/svg+xml');

    // Un SVG malformé produit un document d'erreur au lieu de lever.
    if (document.querySelector('parsererror')) return null;

    const racine = document.documentElement;
    if (!racine || racine.nodeName.toLowerCase() !== 'svg') return null;

    const arbre = convertir(racine, 0);
    if (!arbre) return null;

    // Le cadre est réimposé : celui du modèle s'il est plausible, le nôtre
    // sinon. Sans lui, la figure ne s'adapterait pas à la surface.
    arbre.attributs.viewBox = cadreValide(racine.getAttribute('viewBox'))
      ? racine.getAttribute('viewBox')
      : CADRE_DEFAUT;

    return arbre;
  } catch {
    return null;
  }
}

/** Un viewBox plausible : quatre nombres, largeur et hauteur positives. */
function cadreValide(valeur) {
  if (!valeur) return false;

  const bornes = valeur.trim().split(/[\s,]+/).map(Number);
  return (
    bornes.length === 4
    && bornes.every((n) => Number.isFinite(n))
    && bornes[2] > 0
    && bornes[3] > 0
  );
}

/**
 * Profondeur maximale de l'arbre.
 *
 * Un garde-fou, pas une contrainte de dessin : aucun schéma scolaire n'a
 * besoin de vingt niveaux de groupes, et une structure profonde envoyée
 * exprès ferait travailler le rendu pour rien.
 */
const PROFONDEUR_MAX = 12;

/** Nombre total de nœuds. Même raison. */
const NOEUDS_MAX = 600;

let compteur = 0;

function convertir(element, profondeur) {
  if (profondeur > PROFONDEUR_MAX) return null;
  if (profondeur === 0) compteur = 0;
  if (compteur > NOEUDS_MAX) return null;

  const balise = element.nodeName.toLowerCase();
  if (!BALISES.has(balise)) return null;

  compteur += 1;

  const attributs = {};

  for (const attribut of Array.from(element.attributes ?? [])) {
    // Le nom d'attribut est comparé tel quel, sans normalisation de casse :
    // `viewBox` est sensible à la casse, et accepter `VIEWBOX` reviendrait à
    // accepter n'importe quelle graphie, donc à élargir la liste blanche.
    const nom = attribut.name;

    if (nom === 'stroke' || nom === 'fill') {
      if (COULEURS.has(attribut.value.trim())) attributs[nom] = attribut.value.trim();
      continue;
    }

    if (!ATTRIBUTS.has(nom)) continue;

    // Ceinture et bretelles : une valeur qui contient du balisage ou un
    // protocole n'a rien à faire dans une coordonnée.
    const valeur = attribut.value;
    if (/[<>]/.test(valeur) || /javascript:/i.test(valeur)) continue;

    attributs[nom] = valeur;
  }

  // Seuls `text` et `tspan` portent du texte. Ailleurs, un nœud textuel n'est
  // que de l'indentation.
  const porteDuTexte = balise === 'text' || balise === 'tspan';

  const enfants = [];

  for (const enfant of Array.from(element.childNodes)) {
    if (enfant.nodeType === 3) {
      if (porteDuTexte && enfant.nodeValue?.trim()) enfants.push(enfant.nodeValue);
      continue;
    }

    if (enfant.nodeType !== 1) continue;

    const converti = convertir(enfant, profondeur + 1);
    if (converti) enfants.push(converti);
  }

  return { balise, attributs, enfants };
}
