/**
 * LE PROJET D'ORIENTATION — Camara, le 11/10/2026 : noté par la conseillère
 * avec l'accord de l'enfant, transmis à ses professeurs, vu par le parent.
 *
 * Côté site, trois choses : le bloc [PROJET] ne s'affiche ni ne se dit (voir
 * blocsInvisibles.test.js), la fiche le montre, et la politique de
 * confidentialité le déclare.
 */

import { render, screen } from '@testing-library/react';
import ProjetOrientationFiche from '../components/ProjetOrientationFiche';
import Confidentialite from '../components/Confidentialite';
import RapportOrientationCarte from '../components/RapportOrientationCarte';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
}));

const PROJET = {
  objectif: 'ingénieur en informatique',
  le: '2026-10-11T14:00:00Z',
  matieres: [
    { matiereId: 1, matiereLibelle: 'Mathématiques', texte: 'calcul littéral ; fonctions (encore fragiles)' },
    { matiereId: 2, matiereLibelle: 'Physique-chimie', texte: 'mise en équation à consolider' },
  ],
};

describe('le projet sur la fiche de l’enfant', () => {
  test('rien quand il n’y en a pas', () => {
    render(<ProjetOrientationFiche projet={null} />);
    expect(screen.queryByRole('heading', { name: 'Orientation' })).not.toBeInTheDocument();
  });

  test('le but, sa date, et ce que chaque professeur en reçoit', () => {
    render(<ProjetOrientationFiche projet={PROJET} />);

    expect(screen.getByRole('heading', { name: 'Orientation' })).toBeInTheDocument();
    expect(screen.getByText('À part des cours')).toBeInTheDocument();
    expect(screen.getByText('ingénieur en informatique')).toBeInTheDocument();
    expect(screen.getByText(/Projet vu avec Maëlle, la conseillère d’orientation, le 11 octobre 2026/)).toBeInTheDocument();
    expect(screen.getByText(/ses professeurs en tiennent compte/)).toBeInTheDocument();
    expect(screen.getByText('Mathématiques')).toBeInTheDocument();
    expect(screen.getByText(/calcul littéral ; fonctions/)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  test('un but sans matière : pas de liste, pas de promesse sur les professeurs', () => {
    render(<ProjetOrientationFiche projet={{ ...PROJET, matieres: [] }} />);

    expect(screen.getByText('ingénieur en informatique')).toBeInTheDocument();
    expect(screen.queryByText(/ses professeurs en tiennent compte/)).not.toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});

test('la politique de confidentialité le déclare', () => {
  render(<Confidentialite />);

  expect(screen.getByText(/Seule la conseillère le met à jour/)).toBeInTheDocument();
  expect(screen.getByText('Projet d\'orientation')).toBeInTheDocument();
});

describe('les rapports d’orientation (11/10/2026)', () => {
  const RAPPORT = {
    id: 9,
    dateCreation: '2026-10-11T17:00:00Z',
    vuLe: null,
    discussion: 'Tu m’as parlé de ton goût pour les jeux vidéo.',
    pistes: 'BUT informatique ; école d’ingénieurs',
    chemin: '🎯 Ingénieur\n3e (toi aujourd’hui)\n ↓\n2de générale',
    atouts: 'la logique',
    aConsolider: 'le calcul littéral',
    etapes: 'en parler à tes parents ; regarder onisep.fr',
  };

  test('chaque rubrique écrite par Maëlle, les listes découpées, le chemin tel quel', () => {
    render(<RapportOrientationCarte rapport={RAPPORT} nouveau />);

    expect(screen.getByRole('heading', { name: /11 octobre 2026/ })).toBeInTheDocument();
    expect(screen.getByText('Nouveau')).toBeInTheDocument();
    expect(screen.getByText(/goût pour les jeux vidéo/)).toBeInTheDocument();
    expect(screen.getByText('BUT informatique')).toBeInTheDocument();
    expect(screen.getByText('école d’ingénieurs')).toBeInTheDocument();
    expect(screen.getByText(/3e \(toi aujourd’hui\)/)).toHaveTextContent('↓');
    expect(screen.getByText('le calcul littéral')).toBeInTheDocument();
    expect(screen.getByText('regarder onisep.fr')).toBeInTheDocument();
  });

  test('une rubrique vide ne s’affiche pas', () => {
    render(<RapportOrientationCarte rapport={{ ...RAPPORT, chemin: null, atouts: null, aConsolider: null }} />);

    expect(screen.queryByRole('heading', { name: /Ton chemin/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Tes atouts/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Nouveau')).not.toBeInTheDocument();
  });

  test('sur la fiche du parent : chaque séance, l’observation de Maëlle et le rapport de l’enfant', () => {
    const OBSERVATION = {
      id: 3163,
      dateCreation: '2026-10-11T16:59:00Z',
      travaille: 'découverte des pistes autour de l’informatique',
      remarque: 'Bilal a exprimé un intérêt clair pour l’informatique.',
    };
    const ANCIENNE = { ...OBSERVATION, id: 3000, dateCreation: '2026-10-01T10:00:00Z', remarque: 'Première rencontre.' };

    render(<ProjetOrientationFiche projet={null} rapports={[RAPPORT]} observations={[OBSERVATION, ANCIENNE]} />);

    expect(screen.getByRole('heading', { name: 'Orientation' })).toBeInTheDocument();
    expect(screen.getByText('Ses séances avec Maëlle (2)')).toBeInTheDocument();
    expect(screen.getByText(/intérêt clair pour l’informatique/)).toBeInTheDocument();
    expect(screen.getByText('Première rencontre.')).toBeInTheDocument();
    // Le rapport va avec l'observation de la même séance, pas avec l'ancienne.
    expect(screen.getAllByText('Son rapport d’orientation')).toHaveLength(1);
  });

  test('rien du tout : pas de section', () => {
    render(<ProjetOrientationFiche projet={null} rapports={[]} observations={[]} />);
    expect(screen.queryByRole('heading', { name: 'Orientation' })).not.toBeInTheDocument();
  });
});
