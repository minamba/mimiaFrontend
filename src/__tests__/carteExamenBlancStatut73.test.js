/**
 * SIGNALEMENT #73 (23/11/2026) — LA CARTE D'UN BREVET BLANC À PLUSIEURS MATIÈRES.
 *
 * Adam : brevet blanc Maths + Français ; Maths « Bientôt prêt », Français « Pas encore prêt » (30 %). La carte de
 * « Mes contrôles » affichait « Bientôt prêt » (le statut de la PREMIÈRE matière qui en avait un), sans dire à
 * quelle matière il correspondait, alors que la page de l'examen blanc montrait les deux.
 *
 * Attendu (décision de Min's, 24/11/2026) : UNE PASTILLE PAR MATIÈRE, précédée de son nom, dans l'ordre de
 * l'examen ; « Prêt pour l'épreuve » (et non « Prêt pour le contrôle ») sur un examen blanc.
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import ExamenBlancCarte, { etatsDeLaCarte } from '../components/ExamenBlancCarte';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
}));

const dansJours = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const matiere = (id, libelle, pretStatut, pourcent = 50, pretObservation = null) => ({
  id,
  matiereId: id,
  matiereLibelle: libelle,
  controleId: 500 + id,
  programmeValide: true,
  preparation: pretStatut === undefined
    ? null
    : { pourcent, perimetreConnu: true, pretStatut, pretObservation, commence: true },
});

const brevet = (matieres) => ({
  id: 1,
  libelle: 'Brevet blanc 1',
  dateExamen: dansJours(10),
  heureExamen: null,
  pourcent: 45,
  matieres,
});

const carte = (examen) => render(<ul><ExamenBlancCarte examen={examen} eleveId={33} /></ul>);

/** La liste des pastilles de la carte (nommée pour un lecteur d'écran), ou null. */
const listeDesPastilles = () => screen.queryByRole('list', { name: 'Où tu en es, matière par matière' });

/** Les lignes de pastilles de la carte, lues comme l'enfant les lit : « Mathématiques Bientôt prêt ». */
const lignes = () => {
  const liste = listeDesPastilles();
  return liste ? within(liste).getAllByRole('listitem').map((li) => li.textContent.replace(/\s+/g, ' ').trim()) : [];
};

describe('#73 — une pastille par matière, nommée, dans l’ordre de l’examen', () => {
  test('cas d’Adam : Maths « Bientôt prêt » + Français « Pas encore prêt » → les DEUX, chacune avec son nom', () => {
    carte(brevet([
      matiere(1, 'Mathématiques', 'bientot', 60, 'Maths : presque.'),
      matiere(2, 'Français', 'pas-pret', 30, 'Français : les accords.'),
    ]));

    expect(lignes()).toEqual(['Mathématiques Bientôt prêt', 'Français Pas encore prêt']);
    // Chaque infobulle est l'observation du professeur de SA matière.
    expect(screen.getByTitle('Maths : presque.')).toHaveTextContent('Bientôt prêt');
    expect(screen.getByTitle('Français : les accords.')).toHaveTextContent('Pas encore prêt');
    // Plus de résumé « en Français » de la v1.
    expect(screen.queryByText(/^en /)).not.toBeInTheDocument();
  });

  test('ordre inverse (Français puis Maths) : les lignes suivent l’ordre de l’examen', () => {
    carte(brevet([
      matiere(2, 'Français', 'pas-pret', 30, 'Français : les accords.'),
      matiere(1, 'Mathématiques', 'bientot', 60, 'Maths : presque.'),
    ]));
    expect(lignes()).toEqual(['Français Pas encore prêt', 'Mathématiques Bientôt prêt']);
    expect(screen.getByTitle('Français : les accords.')).toHaveTextContent('Pas encore prêt');
  });

  test('même statut partout : une pastille par matière quand même (pas de résumé)', () => {
    carte(brevet([matiere(1, 'Mathématiques', 'bientot'), matiere(2, 'Français', 'bientot')]));
    expect(lignes()).toEqual(['Mathématiques Bientôt prêt', 'Français Bientôt prêt']);
  });

  test('trois matières, les quatre mots possibles dans l’ordre de l’examen', () => {
    carte(brevet([
      matiere(1, 'Mathématiques', 'pas-pret'),
      matiere(2, 'Français', 'pas-commence'),
      matiere(3, 'Histoire-Géographie', 'pret'),
    ]));
    expect(lignes()).toEqual([
      'Mathématiques Pas encore prêt',
      'Français Révision pas commencée',
      'Histoire-Géographie Prêt pour l’épreuve',
    ]);
  });

  test('une matière sans verdict : pas de ligne pour elle, l’autre garde son nom', () => {
    carte(brevet([matiere(1, 'Mathématiques', 'bientot'), matiere(2, 'Français', null)]));
    expect(lignes()).toEqual(['Mathématiques Bientôt prêt']);
  });

  test('aucune matière avec un statut : aucune pastille, aucune liste', () => {
    carte(brevet([matiere(1, 'Mathématiques', undefined), matiere(2, 'Français', null)]));
    expect(screen.queryByText(/prêt|Révision pas commencée/)).not.toBeInTheDocument();
    expect(listeDesPastilles()).toBeNull();
  });
});

describe('#73 — « Prêt pour l’épreuve » sur un examen blanc (décision de Min’s)', () => {
  test('une matière prête : « Prêt pour l’épreuve », jamais « Prêt pour le contrôle »', () => {
    carte(brevet([matiere(1, 'Mathématiques', 'pret'), matiere(2, 'Français', 'pret')]));
    expect(screen.getAllByText('Prêt pour l’épreuve')).toHaveLength(2);
    expect(screen.queryByText('Prêt pour le contrôle')).not.toBeInTheDocument();
  });

  test('les trois autres mots ne changent pas', () => {
    carte(brevet([
      matiere(1, 'Mathématiques', 'pas-commence'),
      matiere(2, 'Français', 'pas-pret'),
      matiere(3, 'Sciences', 'bientot'),
    ]));
    expect(screen.getByText('Révision pas commencée')).toBeInTheDocument();
    expect(screen.getByText('Pas encore prêt')).toBeInTheDocument();
    expect(screen.getByText('Bientôt prêt')).toBeInTheDocument();
  });
});

describe('#73 v2 — cas limites (contrôle d’Ismail)', () => {
  const sansLibelle = (id, libelle, pretStatut) => ({ ...matiere(id, 'x', pretStatut), matiereLibelle: libelle });

  test.each([
    ['absent', undefined],
    ['null', null],
    ['vide', ''],
    ['blanc', '   '],
  ])('matière sans libellé (%s) : sa pastille sans nom, jamais « undefined » ni « null »', (_, libelle) => {
    carte(brevet([matiere(1, 'Mathématiques', 'bientot'), sansLibelle(2, libelle, 'pas-pret')]));
    expect(lignes()).toEqual(['Mathématiques Bientôt prêt', 'Pas encore prêt']);
    expect(screen.queryByText(/undefined|null/)).not.toBeInTheDocument();
    expect(listeDesPastilles()).not.toHaveTextContent(/undefined|null/);
  });

  test('examen à une seule matière : sa pastille et son infobulle SANS nom, le bouton ouvre SA séance (`seule`)', () => {
    const onPreparer = jest.fn();
    const une = matiere(1, 'Mathématiques', 'bientot', 60, 'Maths : presque.');
    render(<ul><ExamenBlancCarte examen={brevet([une])} eleveId={33} onPreparer={onPreparer} /></ul>);

    expect(lignes()).toEqual(['Bientôt prêt']);
    expect(screen.getByTitle('Maths : presque.')).toHaveTextContent('Bientôt prêt');
    // Le nom n'est pas répété devant la pastille : le titre de la carte (« Mathématiques ») le dit déjà.
    expect(within(listeDesPastilles()).queryByText('Mathématiques')).not.toBeInTheDocument();
    // La pastille est exactement la préparation de `seule` (l'ancienne priorité), pas une copie recalculée.
    expect(etatsDeLaCarte([une])[0].preparation).toBe(une.preparation);

    fireEvent.click(screen.getByRole('button', { name: 'Continuer la préparation' }));
    expect(onPreparer).toHaveBeenCalledWith({ id: 501, matiereId: 1 });
  });

  test('examen à une seule matière prête : « Prêt pour l’épreuve »', () => {
    carte(brevet([matiere(1, 'Mathématiques', 'pret')]));
    expect(screen.getByText('Prêt pour l’épreuve')).toBeInTheDocument();
  });

  test('examen à une seule matière sans statut : aucune pastille (comme avant)', () => {
    carte(brevet([matiere(1, 'Mathématiques', null)]));
    expect(screen.queryByText(/prêt|Révision pas commencée/)).not.toBeInTheDocument();
  });

  test('chaque ligne est un élément de liste (lecteur d’écran : « liste, 2 éléments »)', () => {
    carte(brevet([matiere(1, 'Mathématiques', 'bientot'), matiere(2, 'Français', 'pas-pret')]));
    expect(within(listeDesPastilles()).getAllByRole('listitem')).toHaveLength(2);
  });
});

describe('#73 — etatsDeLaCarte', () => {
  test('liste absente ou vide : rien', () => {
    expect(etatsDeLaCarte(undefined)).toEqual([]);
    expect(etatsDeLaCarte([])).toEqual([]);
  });

  test('statut inconnu ou hérité du prototype : ignoré (comme PastillePret, qui ne rend rien)', () => {
    const r = etatsDeLaCarte([
      matiere(1, 'Mathématiques', 'inconnu'),
      matiere(2, 'Histoire', 'toString'),
      matiere(3, 'Français', 'bientot'),
    ]);
    expect(r).toEqual([{ cle: 3, matiere: 'Français', preparation: expect.objectContaining({ pretStatut: 'bientot' }) }]);
  });

  test('libellé rogné ; clé de repli sans identifiant', () => {
    const r = etatsDeLaCarte([
      { matiereLibelle: '  Français ', preparation: { pretStatut: 'pret' } },
      { matiereLibelle: 'Maths', preparation: { pretStatut: 'pas-pret' } },
    ]);
    expect(r.map((e) => [e.cle, e.matiere])).toEqual([['rang-0', 'Français'], ['rang-1', 'Maths']]);
  });
});
