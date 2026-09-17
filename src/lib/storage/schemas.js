import {
  MUETTE,
  PREFIXE,
  catalogue as catalogueSvt,
  plancheRecommandee as plancheRecommandeeSvt,
  schemaDeLaBibliotheque,
  separerVariante,
  urlCreditPlanche,
  urlPlanche,
} from './schemasSvt';
import { EMPLACEMENTS } from './planchesCatalogue';

/**
 * Le catalogue des figures, toutes matières confondues.
 *
 * C'est le point d'entrée unique : le tableau, l'administration et
 * l'assainisseur passent tous par ici. Deux sources l'alimentent, et elles ne
 * jouent pas le même rôle.
 *
 * `schemasSvt.js` — TRENTE-HUIT FIGURES DESSINÉES
 * ----------------------------------------------
 * Elles s'affichent sans rien importer. Une planche peut les remplacer, mais
 * n'est jamais nécessaire.
 *
 * `planchesCatalogue.js` — DES EMPLACEMENTS VIDES
 * ----------------------------------------------
 * Une clé, un titre, un niveau, et rien à afficher tant qu'aucune planche n'a
 * été déposée. C'est voulu : dessiner au trait une carte de l'Empire romain ou
 * un montage de distillation donnerait une figure fausse, et une figure fausse
 * est pire que pas de figure.
 *
 * CE QUI EMPÊCHE UN TABLEAU VIDE
 * -----------------------------
 * Un emplacement non rempli n'est JAMAIS annoncé au professeur. Sa consigne ne
 * reçoit que le relevé des planches réellement en base, construit côté serveur.
 * Il ne peut donc pas écrire une clé qui n'afficherait rien : il ne la connaît
 * pas, et il dessine à main levée comme avant.
 */

/** Toutes les clés connues, dessinées ou en attente de planche. */
const CLES = new Set([
  ...catalogueSvt().map((f) => f.cle),
  ...EMPLACEMENTS.map((f) => f.cle),
]);

export {
  MUETTE, PREFIXE, schemaDeLaBibliotheque, urlCreditPlanche, urlPlanche,
};

/**
 * Le catalogue complet, chaque figure sachant si elle a un dessin.
 *
 * `dessinee` n'est pas cosmétique : c'est lui qui dit à l'administration si
 * une ligne sans planche est un manque à combler ou un cas déjà couvert.
 */
export function catalogue() {
  return [
    ...catalogueSvt().map((f) => ({ ...f, dessinee: true })),
    ...EMPLACEMENTS.map((f) => ({ ...f, dessinee: false })),
  ];
}

/** Les seules figures qui s'affichent sans planche — celles de la SVT. */
export function catalogueDessine() {
  return catalogueSvt();
}

/**
 * Le titre d'une figure, pour le dire au professeur quand l'élève la montre.
 *
 * Sans lui, le message d'un clic ne désigne qu'une position sur « le schéma
 * affiché » — et le professeur doit deviner de quelle figure on parle en
 * remontant sa propre conversation. Le nommer coûte cinq mots et supprime
 * l'ambiguïté.
 */
export function titreFigure(cle) {
  return catalogue().find((f) => f.cle === cle)?.titre ?? null;
}

/**
 * La clé d'une figure si le contenu de l'ardoise en désigne une, sinon null.
 *
 * Reconnaît AUSSI les emplacements sans dessin : c'est ce qui permet à une
 * planche importée de s'afficher pour une matière qui n'a aucun tracé à elle.
 */
export function cleSchema(contenu) {
  if (typeof contenu !== 'string') return null;

  const propre = contenu.trim();
  if (!propre.startsWith(PREFIXE)) return null;

  // LE SUFFIXE DE VARIANTE EST RETIRÉ ICI, et c'est volontaire : la clé
  // reste celle du catalogue. Une figure et sa version muette sont le même
  // document — même titre, même niveau, même ligne d'administration.
  const { cle } = separerVariante(propre.slice(PREFIXE.length).trim().toLowerCase());
  return CLES.has(cle) ? cle : null;
}

/**
 * La variante demandée par l'ardoise : `muette` ou `legende`.
 *
 * Séparée de `cleSchema` parce que les deux ne servent pas au même moment :
 * la clé dit QUOI afficher et vaut pour le catalogue, la variante dit
 * LAQUELLE DES DEUX images et ne quitte jamais l'affichage.
 *
 * Rend `legende` pour tout ce qui n'est pas une figure : un appelant qui
 * teste la variante sans tester la clé ne doit pas se retrouver avec null.
 */
export function varianteSchema(contenu) {
  if (cleSchema(contenu) === null) return 'legende';

  const { variante } = separerVariante(
    contenu.trim().slice(PREFIXE.length).trim().toLowerCase(),
  );

  return variante;
}

/**
 * Vrai pour les figures dessinées où une planche vaut quand même mieux : les
 * sept planches d'anatomie de la SVT, où le trait ne rend pas les formes
 * organiques.
 *
 * Les emplacements sans dessin ne sont PAS marqués ici. Ce serait redondant —
 * ils n'ont rien d'autre que la planche — et cent trente lignes toutes
 * signalées ne signalent plus rien. L'administration les distingue par
 * `dessinee`, qui dit ce qui se passe vraiment sans planche.
 */
export function plancheRecommandee(cle) {
  return plancheRecommandeeSvt(cle);
}
