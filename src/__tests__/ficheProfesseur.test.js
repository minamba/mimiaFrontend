import { render, screen, fireEvent } from '@testing-library/react';
import FicheProfesseur from '../components/FicheProfesseur';

const KARIM = {
  prenom: 'Karim',
  avatar: 'karim',
  couleur: '#166534',
  code: 'SCIENCES_GESTION',
  titre: 'Management / Droit et économie',
  presentation: 'On part d’exemples concrets.',
  disciplines: [
    {
      libelle: 'Sciences de gestion et numérique',
      promesse: 'Organisations, données et décisions de gestion',
      niveaux: '1re et Terminale',
      voie: 'Série STMG',
    },
    {
      libelle: 'Sciences économiques et sociales',
      promesse: 'L’économie, la société et le politique',
      niveaux: '1re et Terminale',
      voie: 'Spécialité, voie générale',
    },
  ],
};

test('le professeur se présente, puis détaille chacune de ses disciplines', () => {
  render(<FicheProfesseur prof={KARIM} onFermer={() => {}} />);

  expect(screen.getByRole('dialog', { name: 'Karim' })).toBeInTheDocument();
  expect(screen.getByText('Management / Droit et économie')).toBeInTheDocument();
  expect(screen.getByText('Bonjour, moi c’est Karim.')).toBeInTheDocument();

  const disciplines = screen.getAllByRole('listitem');
  expect(disciplines).toHaveLength(2);
  expect(disciplines[0]).toHaveTextContent('Sciences de gestion et numérique');
  expect(disciplines[0]).toHaveTextContent('Série STMG');
  expect(disciplines[1]).toHaveTextContent('Spécialité, voie générale');
});

test('Échap, la croix et « Fermer » referment la fiche', () => {
  const onFermer = jest.fn();
  render(<FicheProfesseur prof={KARIM} onFermer={onFermer} />);

  fireEvent.keyDown(document, { key: 'Escape' });
  fireEvent.click(screen.getByRole('button', { name: 'Fermer la fiche' }));
  fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));

  expect(onFermer).toHaveBeenCalledTimes(3);
});

test('le clavier arrive dans la fiche, sur le bouton de fermeture', () => {
  render(<FicheProfesseur prof={KARIM} onFermer={() => {}} />);

  expect(screen.getByRole('button', { name: 'Fermer la fiche' })).toHaveFocus();
});
