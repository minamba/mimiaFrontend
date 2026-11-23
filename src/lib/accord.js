/**
 * ACCORD AVEC LE NOMBRE (#69 v4) — « 1 minute », « 2 minutes », « 0 point », « 1,5 heure ».
 *
 * En français, le pluriel commence à 2 : 0, 1 et 1,5 restent au singulier. Les
 * phrases qui changent aussi de déterminant (« ses 1 cours » → « son cours »)
 * s'écrivent en deux phrases entières : ce petit outil ne sert qu'au nom (ou au
 * participe) qui suit le nombre.
 */
export const accord = (n, singulier, pluriel = `${singulier}s`) => (Math.abs(Number(n)) >= 2 ? pluriel : singulier);

/** « 3 minutes », « 1 minute » : le nombre tel quel, puis le mot accordé. */
export const nombreEt = (n, singulier, pluriel) => `${n} ${accord(n, singulier, pluriel)}`;

/**
 * Le pluriel de chaque mot d'une petite unité de jeu : « mot trouvé » → « mots trouvés », et
 * « lieu trouvé » → « lieux trouvés » (jamais « lieus », #69 v4) : -eu et -au prennent un x.
 */
export const plurielDesMots = (unite) => unite.split(' ').map((m) => (/(eu|au)$/.test(m) ? `${m}x` : `${m}s`)).join(' ');

/** Le minuteur lu par le lecteur d'écran : « 1 seconde » dans la dernière seconde, jamais « 1 secondes ». */
export const secondesRestantes = (ms) => nombreEt(Math.ceil(ms / 1000), 'seconde');
