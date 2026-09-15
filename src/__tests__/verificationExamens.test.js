/**
 * LA VÉRIFICATION DES CARTES D'EXAMEN, dans l'administration.
 *
 * Deux garanties : un problème s'affiche en tête, en toutes lettres, avec la
 * carte qu'il concerne ; sans problème, le bilan le dit.
 */

import { render, screen } from '@testing-library/react';
import VerificationExamensAdmin from '../components/VerificationExamensAdmin';
import { getVerificationExamens } from '../lib/api/adminApi';

jest.mock('../lib/api/adminApi', () => ({ getVerificationExamens: jest.fn() }));

const carte = (code, libelle, retenues, problemes = []) => ({
  code,
  libelle,
  problemes,
  matieres: [{ code: 'MATHS', libelle: 'Mathématiques', active: true, notionsDuProgramme: 40, notionsRetenues: retenues }],
});

test('un problème est dit en tête, avec la carte concernée', async () => {
  getVerificationExamens.mockResolvedValue({
    data: [{
      code: 'BACFR_G_2027',
      libelle: 'Préparation au bac de français et de maths',
      session: 2027,
      problemes: [],
      epreuves: [
        carte('BACFR_G_2027_MATHS_ES', 'Maths anticipées', 0,
          ['Partie retenue « Enseignement scientifque » : aucune notion ne s\'appelle ainsi. Faute de frappe ?']),
      ],
    }],
  });

  render(<VerificationExamensAdmin />);

  expect(await screen.findByText('1 carte vérifiée : 1 problème à corriger.')).toBeInTheDocument();
  expect(screen.getByText(/Enseignement scientifque/)).toBeInTheDocument();
});

test('sans problème, le bilan le dit', async () => {
  getVerificationExamens.mockResolvedValue({
    data: [{
      code: 'DNB_2027',
      libelle: 'Préparation au brevet',
      session: 2027,
      problemes: [],
      epreuves: [carte('DNB_2027_MATHS', 'Brevet de mathématiques', 38), carte('DNB_2027_FR', 'Brevet de français', 30)],
    }],
  });

  render(<VerificationExamensAdmin />);

  expect(await screen.findByRole('status')).toHaveTextContent('2 cartes vérifiées : aucune n’est vide');
});
