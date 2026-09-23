/**
 * LES LONGUEURS DU CM2 — le mètre ruban au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM2_MES_LONGUEUR — « Utiliser les unités de longueur »
 *
 * LA MÊME MÉCANIQUE QUE LES MASSES DU CM1 (`mesuresCM1.js`), sur toute la
 * table des longueurs, du kilomètre au millimètre. Les pièges sont les mêmes :
 * un zéro de trop ou de moins, et le mauvais sens.
 */

import { serieDe, verdict as verdictMesures, PHRASES as PHRASES_MESURES } from './mesuresCM1.js';
import { bilan as bilanCommun } from './outils.js';

export const MANCHES = 8;

/** [grande unité, petite unité, combien de petites dans une grande]. */
const GRANDES = [['km', 'm', 1000], ['km', 'hm', 10], ['hm', 'm', 100], ['dam', 'm', 10]];
const PETITES = [['m', 'cm', 100], ['m', 'mm', 1000], ['cm', 'mm', 10], ['m', 'dm', 10], ['dm', 'cm', 10]];

export const serie = (graine = Date.now()) => serieDe(graine, [GRANDES, PETITES]);
export const verdict = verdictMesures;
export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = PHRASES_MESURES;
