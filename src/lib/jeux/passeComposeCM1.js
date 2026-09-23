/**
 * LE PASSÉ COMPOSÉ AVEC ÊTRE — le sujet qui s'éloigne au CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM1_LANG_PASSE_COMPOSE — « Former le passé composé et accorder le
 *                               participe passé avec être »
 *
 * DEUX SORTES DE MANCHES :
 *   - L'ACCORD (5) : « Les filles sont ___ au parc. (aller) » → allées. Avec
 *     être, le participe s'accorde avec le sujet, comme un adjectif. Pièges :
 *     pas d'accord du tout, ou le mauvais genre, ou le mauvais nombre ;
 *   - L'AUXILIAIRE (3) : « Elle ___ partie hier. » → est. Les verbes de
 *     mouvement (aller, partir, venir, arriver, tomber…) prennent être ; les
 *     autres, avoir.
 */

import { bilan as bilanCommun, outils } from './outils.js';

export const MANCHES = 8;

/** [phrase, infinitif, participe au masculin singulier, genre, pluriel]. */
export const ACCORDS = [
  ['Les filles sont ___ au parc.', 'aller', 'allé', 'f', true],
  ['Mon frère est ___ de vélo.', 'tomber', 'tombé', 'm', false],
  ['Ma sœur est ___ très tôt.', 'partir', 'parti', 'f', false],
  ['Nos cousins sont ___ dîner.', 'venir', 'venu', 'm', true],
  ['Les feuilles sont ___ cette nuit.', 'tomber', 'tombé', 'f', true],
  ['Julie et Léa sont ___ en retard.', 'arriver', 'arrivé', 'f', true],
  ['Mes parents sont ___ tard.', 'rentrer', 'rentré', 'm', true],
  ['La neige est ___ toute la nuit.', 'tomber', 'tombé', 'f', false],
  ['Les oiseaux sont ___ vers le sud.', 'partir', 'parti', 'm', true],
];

/** [phrase, bonne, piège de l'autre auxiliaire, piège de la personne]. */
export const AUXILIAIRES = [
  ['Elle ___ partie hier.', 'est', 'a', 'sont'],
  ['Ils ___ venus à pied.', 'sont', 'ont', 'est'],
  ['Nous ___ mangé une pizza.', 'avons', 'sommes', 'ont'],
  ['Le bébé ___ tombé du lit.', 'est', 'a', 'sont'],
  ['Tu ___ fini tes devoirs.', 'as', 'es', 'a'],
  ['Les invités ___ arrivés à midi.', 'sont', 'ont', 'est'],
];

const accorder = (p, genre, pluriel) => `${p}${genre === 'f' ? 'e' : ''}${pluriel ? 's' : ''}`;

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);
  const liste = [];
  melanger(ACCORDS).slice(0, 5).forEach(([phrase, infinitif, p, genre, pluriel]) => {
    const bonne = accorder(p, genre, pluriel);
    const sans = p;
    const autreGenre = accorder(p, genre === 'f' ? 'm' : 'f', pluriel);
    const autreNombre = accorder(p, genre, !pluriel);
    const pieges = { [sans]: 'accord-oubli', [autreGenre]: 'accord-genre', [autreNombre]: 'accord-nombre' };
    // Trois choix : la bonne forme, l'oubli d'accord s'il diffère, puis le genre ou le nombre.
    const formes = [...new Set([sans, autreGenre, autreNombre].filter((f) => f !== bonne))].slice(0, 2);
    liste.push({
      consigne: 'accord',
      question: `${phrase} (${infinitif})`,
      bonne,
      choix: melanger([bonne, ...formes]).map((c) => ({ cle: c, libelle: c })),
      pieges,
    });
  });
  melanger(AUXILIAIRES).slice(0, 3).forEach(([question, bonne, autre, personne]) => {
    liste.push({
      consigne: 'auxiliaire',
      question,
      bonne,
      choix: melanger([bonne, autre, personne]).map((c) => ({ cle: c, libelle: c })),
      pieges: { [autre]: ['est', 'sont'].includes(bonne) ? 'auxiliaire-etre' : 'auxiliaire-avoir', [personne]: 'auxiliaire-personne' },
    });
  });
  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges[cle];
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  accord: 'Écris le participe passé bien accordé.',
  auxiliaire: 'Choisis le bon auxiliaire : être ou avoir ?',
  'accord-oubli': 'Avec l’auxiliaire être, le participe s’accorde avec le sujet, comme un adjectif.',
  'accord-genre': 'Regarde le sujet : masculin ou féminin ? Au féminin, on ajoute un e.',
  'accord-nombre': 'Regarde le sujet : un seul, ou plusieurs ? Au pluriel, on ajoute un s.',
  'auxiliaire-etre': 'Les verbes qui disent un mouvement, comme aller, partir, venir, arriver ou tomber, se conjuguent avec être.',
  'auxiliaire-avoir': 'Ce verbe ne dit pas un mouvement : il se conjugue avec avoir.',
  'auxiliaire-personne': 'C’est le bon auxiliaire, mais regarde le sujet : il décide de la personne.',
};
