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

describe('la conseillère d’orientation (11/10/2026)', () => {
  const MAELLE = {
    prenom: 'Maëlle',
    avatar: 'maelle',
    couleur: '#6D28D9',
    code: 'ORIENTATION',
    titre: 'Conseillère d’orientation',
    presentation: 'On construit ton projet.',
    disciplines: [{ libelle: 'Orientation', promesse: 'Choisir sa voie', niveaux: 'De la 3e à la Terminale' }],
  };

  test('elle dit ce qu’elle fait, et ce qu’elle fait avec les professeurs', () => {
    render(<FicheProfesseur prof={MAELLE} onFermer={() => {}} />);

    expect(screen.getByRole('heading', { name: 'Ce que je fais' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ce que j’enseigne' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Avec tes professeurs' })).toBeInTheDocument();
    expect(screen.getByText(/je te demande si je peux en parler à tes professeurs/)).toBeInTheDocument();
    expect(screen.getByText(/C’est avec moi que tu en parles/)).toBeInTheDocument();
  });

  test('un professeur, lui, n’a pas cet encadré', () => {
    render(<FicheProfesseur prof={KARIM} onFermer={() => {}} />);

    expect(screen.getByRole('heading', { name: 'Ce que j’enseigne' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Avec tes professeurs' })).not.toBeInTheDocument();
  });
});
