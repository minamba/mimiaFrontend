import { render, screen } from '@testing-library/react';
import QuotaEnfants from '../components/QuotaEnfants';

// Le routeur est simulé partout dans ce projet : seul `Link` est utilisé ici.
jest.mock('react-router-dom', () => ({
  // eslint-disable-next-line react/prop-types
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
}));

/**
 * LE DROIT RETIRÉ N'EST PAS UNE LIMITE DE FORMULE.
 *
 * Les deux refus arrivent au même endroit à l'écran, et c'est précisément le
 * piège : renvoyer vers les tarifs un parent dont on a retiré le DROIT lui
 * ferait payer plus cher pour revenir tout aussi bloqué.
 */
const afficher = (capacite) => render(<QuotaEnfants capacite={capacite} />);

describe('QuotaEnfants', () => {
  test('formule saturée : on propose de changer de formule', () => {
    afficher({ offreLibelle: 'Solo', maximum: 1, actuels: 1, droitRetire: false });

    expect(screen.getByText(/formule Solo couvre 1 enfant/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voir les formules/i })).toBeInTheDocument();
  });

  test('droit retiré : on ne parle PAS de formule, et aucun lien vers les tarifs', () => {
    afficher({ offreLibelle: 'Duo', maximum: 3, actuels: 1, droitRetire: true });

    expect(screen.getByText(/n’est pas autorisé sur ce compte/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /voir les formules/i })).toBeNull();
    expect(screen.queryByText(/formule Duo/)).toBeNull();
  });

  /**
   * Le cas qui prouve que les deux motifs sont bien distincts : la formule
   * couvre encore deux places, et pourtant on refuse.
   */
  test('droit retiré alors qu’il reste de la place', () => {
    afficher({ offreLibelle: 'Duo', maximum: 3, actuels: 1, droitRetire: true });

    expect(screen.getByText(/n’est pas autorisé sur ce compte/)).toBeInTheDocument();
  });

  test('sans capacité, rien ne s’affiche', () => {
    const { container } = afficher(null);
    expect(container).toBeEmptyDOMElement();
  });
});
