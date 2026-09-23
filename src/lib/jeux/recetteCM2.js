/**
 * LA PROPORTIONNALITÉ DU CM2 — la recette pour 8 au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM2_PROP_RESOUDRE — « Reconnaître et traiter une situation de
 *                             proportionnalité »
 *
 * AU CM2, LES NOMBRES NE SE DOUBLENT PLUS SIMPLEMENT :
 *   - LE PRIX D'UN SEUL (3) : 3 cahiers coûtent 4,50 € ; 5 cahiers ? On passe
 *     par un cahier. Pièges : ajouter (4,50 € + 2 €), et multiplier le prix
 *     de 3 cahiers par 5 ;
 *   - LA VITESSE (3) : 60 km en une heure ; en 2 h 30 ? Pièges : oublier la
 *     demi-heure, et lire 2 h 30 comme 2,3 heures ;
 *   - LE TABLEAU (2) : 2 → 6, 5 → 15, 8 → ? Le piège : suivre l'écart au lieu
 *     du coefficient.
 */

import { bilan as bilanCommun, outils, troisChoix } from './outils.js';

export const MANCHES = 8;

const euros = (x) => `${x.toFixed(2).replace('.', ',')} €`;
const net = (x) => Math.round(x * 100) / 100;

export function serie(graine = Date.now()) {
  const { entre, au, melanger } = outils(graine);
  const liste = [];

  const objets = melanger(['cahiers', 'stylos', 'croissants', 'gommes', 'ballons']);
  for (let i = 0; i < 3; i += 1) {
    const p = entre(3, 12) / 2;
    const n1 = entre(2, 4);
    const n2 = n1 + entre(1, 3);
    const bonne = euros(net(p * n2));
    const ajout = euros(net(p * n1 + (n2 - n1)));
    const total = euros(net(p * n1 * n2));
    liste.push({
      consigne: 'unite',
      question: `${n1} ${objets[i]} coûtent ${euros(net(p * n1))}. Combien coûtent ${n2} ${objets[i]} ?`,
      bonne,
      choix: melanger(troisChoix(bonne, [ajout, total], (k) => euros(net(p * n2 + k / 2)))).map((c) => ({ cle: c, libelle: c })),
      pieges: { [total]: 'unite-total', [ajout]: 'ajout' },
    });
  }

  for (let i = 0; i < 3; i += 1) {
    const v = au([40, 60, 80, 90, 100]);
    const h = entre(1, 3);
    const bonne = `${v * h + v / 2} km`;
    const oubli = `${v * h} km`;
    const virgule = `${Math.round(v * (h + 0.3))} km`;
    liste.push({
      consigne: 'vitesse',
      question: `Une voiture parcourt ${v} km en une heure. En ${h} h 30, toujours à la même vitesse ?`,
      bonne,
      choix: melanger([bonne, oubli, virgule]).map((c) => ({ cle: c, libelle: c })),
      pieges: { [oubli]: 'vitesse-demi', [virgule]: 'vitesse-virgule' },
    });
  }

  for (let i = 0; i < 2; i += 1) {
    const k = entre(3, 6);
    const [x1, x2, x3] = [entre(2, 3), entre(4, 6), entre(7, 10)];
    const bonne = k * x3;
    const ecart = k * x2 + (x3 - x2);
    liste.push({
      consigne: 'tableau',
      question: `${x1} → ${k * x1}   ;   ${x2} → ${k * x2}   ;   ${x3} → ?`,
      bonne,
      choix: melanger(troisChoix(bonne, [ecart], (j) => bonne + j * k)).map((c) => ({ cle: c, libelle: String(c) })),
      pieges: { [ecart]: 'ajout' },
    });
  }
  return melanger(liste);
}

export function verdict(m, cle) {
  if (String(cle) === String(m.bonne)) return 'juste';
  return m.pieges[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  unite: 'Combien faut-il payer ? Tu peux chercher le prix d’un seul.',
  vitesse: 'Quelle distance parcourt la voiture ?',
  tableau: 'Ce tableau est proportionnel. Quel nombre manque ?',
  ajout: 'On n’ajoute pas le même écart : dans une situation proportionnelle, on multiplie toujours par le même nombre.',
  'unite-total': 'Tu as multiplié le prix de plusieurs objets. Cherche d’abord le prix d’un seul, puis multiplie.',
  'unite-regle': 'Divise pour trouver le prix d’un seul objet, puis multiplie par le nombre d’objets.',
  'vitesse-demi': 'N’oublie pas la demi-heure : en trente minutes, la voiture fait la moitié du chemin d’une heure.',
  'vitesse-virgule': 'Deux heures trente, ce n’est pas deux virgule trois heures : trente minutes, c’est une demi-heure.',
  'tableau-regle': 'Cherche par combien on multiplie le nombre de gauche pour trouver celui de droite.',
};
