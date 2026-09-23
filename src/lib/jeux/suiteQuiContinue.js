/**
 * LA SUITE QUI CONTINUE — un jeu du CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM1_ALG_MOTIFS — « Poursuivre et généraliser une suite de motifs ou de
 *                         nombres »
 *
 * TROIS SORTES DE SUITES :
 *   - ON AJOUTE TOUJOURS LE MÊME NOMBRE (3) : 3, 7, 11, 15, … → 19 ;
 *   - ON MULTIPLIE (2) : 2, 4, 8, 16, … → 32. LE PIÈGE : 18, on a cru qu'on
 *     ajoutait 2 comme au début ;
 *   - LE MOTIF QUI REVIENT (3) : ▲ ● ● ▲ ● ● ▲ … → ●. Le piège : croire que
 *     le motif s'alterne un sur deux.
 */

import { bilan as bilanCommun, outils, troisChoix } from './outils.js';

export const MANCHES = 8;

export const FORMES = ['▲', '●', '■', '★'];

export function serie(graine = Date.now()) {
  const { entre, au, melanger } = outils(graine);
  const liste = [];

  for (let i = 0; i < 3; i += 1) {
    const depart = entre(1, 30);
    const pas = entre(3, 12) * (i === 2 ? -1 : 1);
    const debut = i === 2 ? depart + 60 : depart;
    const termes = [0, 1, 2, 3].map((k) => debut + k * pas);
    const bonne = debut + 4 * pas;
    liste.push({
      consigne: 'ajoute',
      question: `${termes.join(', ')}, … ?`,
      bonne,
      choix: melanger(troisChoix(bonne, [bonne + pas, termes[3] + 1], (k) => bonne + k)).map((c) => ({ cle: c, libelle: String(c) })),
      pieges: { [bonne + pas]: 'ajoute-saute', [termes[3] + 1]: 'ajoute-un' },
    });
  }

  for (let i = 0; i < 2; i += 1) {
    const debut = entre(1, 3);
    const f = i === 0 ? 2 : 3;
    const termes = [0, 1, 2, 3].map((k) => debut * f ** k);
    const bonne = debut * f ** 4;
    const ajout = termes[3] + (termes[1] - termes[0]);
    liste.push({
      consigne: 'multiplie',
      question: `${termes.join(', ')}, … ?`,
      bonne,
      choix: melanger(troisChoix(bonne, [ajout, termes[3] + termes[2]], (k) => bonne + k * f)).map((c) => ({ cle: c, libelle: String(c) })),
      pieges: { [ajout]: 'multiplie-ajout', [termes[3] + termes[2]]: 'multiplie-regle' },
    });
  }

  for (let i = 0; i < 3; i += 1) {
    const [a, b, c] = melanger(FORMES);
    const motif = au([[a, b, b], [a, b, c], [a, a, b], [a, b, c, c]]);
    const longueur = motif.length * 2 + entre(0, motif.length - 1);
    const suite = Array.from({ length: longueur }, (_, k) => motif[k % motif.length]);
    const bonne = motif[longueur % motif.length];
    const autres = [...new Set(motif)].filter((x) => x !== bonne);
    const choix = [bonne, ...autres, ...FORMES.filter((x) => !motif.includes(x))].slice(0, 3);
    liste.push({
      consigne: 'motif',
      question: `${suite.join(' ')} … ?`,
      bonne,
      choix: melanger(choix).map((x) => ({ cle: x, libelle: x })),
    });
  }
  return liste;
}

export function verdict(m, cle) {
  if (String(cle) === String(m.bonne)) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  ajoute: 'Quel nombre vient ensuite ?',
  multiplie: 'Quel nombre vient ensuite ? Attention, les écarts grandissent.',
  motif: 'Quelle forme vient ensuite ?',
  'ajoute-saute': 'Tu as sauté un nombre : on ajoute l’écart une seule fois au dernier nombre.',
  'ajoute-un': 'Calcule l’écart entre deux nombres qui se suivent : c’est lui qu’on ajoute à chaque fois.',
  'ajoute-regle': 'Calcule l’écart entre deux nombres qui se suivent, puis ajoute-le au dernier.',
  'multiplie-ajout': 'L’écart n’est pas toujours le même ici : chaque nombre est multiplié pour donner le suivant.',
  'multiplie-regle': 'Par combien multiplie-t-on chaque nombre pour trouver le suivant ?',
  'motif-regle': 'Trouve le petit groupe de formes qui se répète, puis continue-le.',
};
