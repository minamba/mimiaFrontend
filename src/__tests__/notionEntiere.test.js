import { fireEvent, render, screen } from '@testing-library/react';
import ProgressionMatiere from '../components/ProgressionMatiere';

/*
 * UN NOM DE NOTION COUPÉ SE LIT EN ENTIER AU TOUCHER — Camara, le 17/10/2026 :
 * sur téléphone, les « … » cachaient la fin des notions longues.
 */
describe('les notions de la progression', () => {
  it('se déplient au toucher, et se replient au second', () => {
    const libelle = 'Calculer mentalement avec les quatre opérations sur des nombres décimaux';
    render(
      <ProgressionMatiere
        matiere={{
          matiereLibelle: 'Mathématiques',
          notes: [],
          notions: [{ competenceId: 7, libelle, score: 0.98 }],
        }}
      />,
    );

    const nom = screen.getByRole('button', { name: libelle });
    expect(nom).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(nom);
    expect(nom).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(nom);
    expect(nom).toHaveAttribute('aria-expanded', 'false');
  });
});
