/**
 * EST-IL PRÊT POUR SON CONTRÔLE ? La pastille.
 *
 * Voulue par Camara le 13/09/2026 : « c'est pas parce qu'on est pas à 100 %
 * partout que l'élève n'est pas prêt. C'est au prof de déterminer. »
 *
 * Trois garanties, et aucune n'est un détail d'affichage :
 *
 * 1. LE MOT EST TOUJOURS ÉCRIT, jamais porté par la seule couleur — un enfant
 *    daltonien lit cette pastille comme les autres, et une capture en noir et
 *    blanc reste lisible.
 * 2. UN STATUT INCONNU NE REND RIEN. Mieux vaut une carte sans pastille qu'une
 *    pastille qui affirme quelque chose de faux sur un enfant.
 * 3. LE STATUT VIENT DU SERVEUR, jamais du pourcentage. Un contrôle à 20 % peut
 *    porter « Prêt » — c'est tout l'intérêt du verdict.
 */

import { render, screen } from '@testing-library/react';
import PastillePret, { STATUTS_PRET } from '../components/PastillePret';

test('chaque statut écrit son libellé en toutes lettres', () => {
  const { container } = render(
    <>
      <PastillePret statut="pas-commence" />
      <PastillePret statut="pas-pret" />
      <PastillePret statut="bientot" />
      <PastillePret statut="pret" />
    </>,
  );

  expect(screen.getByText('Révision pas commencée')).toBeInTheDocument();
  expect(screen.getByText('Pas encore prêt')).toBeInTheDocument();
  expect(screen.getByText('Bientôt prêt')).toBeInTheDocument();
  expect(screen.getByText('Prêt pour le contrôle')).toBeInTheDocument();

  // Quatre couleurs distinctes, une par statut.
  expect(container.querySelectorAll('.pastille-pret')).toHaveLength(4);
  expect(container.querySelector('.pastille-pret.est-pret')).not.toBeNull();
  expect(container.querySelector('.pastille-pret.est-bientot')).not.toBeNull();
  expect(container.querySelector('.pastille-pret.est-pas-pret')).not.toBeNull();
  expect(container.querySelector('.pastille-pret.est-pas-commence')).not.toBeNull();
});

test('un statut absent ou inconnu ne rend rien du tout', () => {
  const { container } = render(
    <>
      <PastillePret />
      <PastillePret statut="presque-peut-etre" />
      <PastillePret statut={null} />
    </>,
  );

  expect(container.querySelector('.pastille-pret')).toBeNull();
});

/**
 * LA TABLE EST LA SOURCE UNIQUE. Si un statut est ajouté côté serveur sans
 * l'être ici, il ne s'affichera pas — ce test dit lesquels sont couverts, pour
 * que l'oubli se voie ici plutôt qu'à l'écran d'un enfant.
 */
test('les quatre statuts du serveur sont tous couverts', () => {
  expect(Object.keys(STATUTS_PRET).sort())
    .toEqual(['bientot', 'pas-commence', 'pas-pret', 'pret']);
});

test('l’observation du professeur voyage en infobulle', () => {
  render(<PastillePret statut="bientot" titre="Il te reste à poser le calcul." />);

  expect(screen.getByTitle('Il te reste à poser le calcul.')).toBeInTheDocument();
});
