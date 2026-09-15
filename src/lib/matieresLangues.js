import { LANGUES_ETUDIEES } from './storage/langueTranscription';

/**
 * LES MATIÈRES DE LANGUE : dictées, compréhension orale, tirets muets.
 *
 * UNE SEULE LISTE, DÉRIVÉE — et c'est le point. Cette liste existait en
 * double avec celle de `langueTranscription.js`, et deux listes finissent
 * toujours par diverger : la langue ajoutée d'un côté, oubliée de l'autre,
 * arrivait avec sa reconnaissance vocale mais sans « Mes dictées », sans ses
 * archives et avec un professeur qui disait « moins » devant chaque tiret.
 *
 * Le français s'y ajoute à la main : il n'est pas dans l'autre liste, qui ne
 * porte que les langues ÉTUDIÉES — le français est la langue par défaut de la
 * reconnaissance vocale. Il n'en est pas moins une matière de langue, avec ses
 * dictées.
 *
 * Ajouter une langue à l'application, c'est donc trois endroits, et pas un de
 * plus côté écran :
 *   1. `LANGUES_ETUDIEES` ici à côté (code matière → code BCP-47) ;
 *   2. `LANGUES_ECOUTE` dans `ardoise.js` (la balise d'écoute [XX]) ;
 *   3. côté serveur, `BaliseParAgent` et `VocabulaireTranscription`.
 */
const MATIERES_LANGUES = new Set(['FRANCAIS', ...Object.keys(LANGUES_ETUDIEES)]);

/** Cette matière porte-t-elle des dictées ? */
export const estMatiereLangue = (code) => Boolean(code) && MATIERES_LANGUES.has(code.toUpperCase());
