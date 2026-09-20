/**
 * LA PRÉPARATION AU BREVET — la section sous « Mes contrôles ».
 *
 * Quatre garanties :
 *
 * 1. SANS EXAMEN CETTE ANNÉE, RIEN — pas une section vide qui promettrait un
 *    examen à un enfant de 5e.
 * 2. LA BARRE GLOBALE DIT D'OÙ ELLE VIENT : la moyenne des épreuves.
 * 3. UNE ÉPREUVE À PLUSIEURS PROFESSEURS a un bouton par professeur, et le
 *    bouton remonte l'épreuve ET la matière : c'est ce qui ouvre la bonne
 *    séance, dans le bon mode.
 * 4. LE VERDICT « PRÊT » PARLE D'ÉPREUVE, jamais de contrôle.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PreparationExamen from '../components/PreparationExamen';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
}));

const matiere = (matiereId, libelle, profPrenom, preparation = {}, nombrePreparations = 0) => ({
  matiereId,
  code: libelle.toUpperCase(),
  libelle,
  profPrenom,
  nombrePreparations,
  preparation: {
    pourcent: 0, perimetreConnu: true, total: 10, acquises: 0, notions: [], ...preparation,
  },
});

const EXAMEN = {
  code: 'DNB_2027',
  libelle: 'Brevet',
  titreSection: 'Préparation au brevet',
  session: 2027,
  pourcent: 31,
  epreuves: [
    {
      code: 'DNB_2027_MATHS',
      libelle: 'Brevet de mathématiques',
      pourcent: 42,
      matieres: [matiere(1, 'Mathématiques', 'Nora', { pourcent: 42, pretStatut: 'pret' }, 3)],
    },
    {
      code: 'DNB_2027_SCIENCES',
      libelle: 'Brevet de sciences',
      pourcent: 20,
      matieres: [
        matiere(5, 'Physique-chimie', 'Salim', { pourcent: 30 }),
        matiere(6, 'SVT', 'Marine', { pourcent: 10 }, 1),
      ],
    },
  ],
};

test('sans examen cette année, la section n’existe pas', () => {
  const { container } = render(<PreparationExamen eleveId="9" examen={null} onPreparer={jest.fn()} />);

  expect(container).toBeEmptyDOMElement();
});

test('le titre vient du serveur, et la barre globale dit qu’elle est une moyenne', () => {
  render(<PreparationExamen eleveId="9" examen={EXAMEN} onPreparer={jest.fn()} />);

  expect(screen.getByRole('heading', { name: 'Préparation au brevet' })).toBeInTheDocument();
  expect(screen.getByText('31 %')).toBeInTheDocument();
  expect(screen.getByText('La moyenne de tes 2 épreuves.')).toBeInTheDocument();
});

test('chaque épreuve mène à sa fiche', () => {
  render(<PreparationExamen eleveId="9" examen={EXAMEN} onPreparer={jest.fn()} />);

  expect(screen.getByRole('link', { name: 'Brevet de mathématiques' }))
    .toHaveAttribute('href', '/eleves/9/examen/DNB_2027_MATHS');
});

test('une épreuve à deux professeurs a un bouton par professeur', async () => {
  const onPreparer = jest.fn();

  render(<PreparationExamen eleveId="9" examen={EXAMEN} onPreparer={onPreparer} />);

  expect(screen.getByRole('button', { name: 'Commencer à réviser avec Salim' })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Continuer la préparation avec Marine' }));

  expect(onPreparer).toHaveBeenCalledTimes(1);
  expect(onPreparer.mock.calls[0][0]).toMatchObject({ code: 'DNB_2027_SCIENCES' });
  expect(onPreparer.mock.calls[0][1]).toMatchObject({ matiereId: 6 });

  // Une épreuve à un seul professeur n'a pas besoin de le nommer.
  expect(screen.getByRole('button', { name: 'Continuer la préparation' })).toBeInTheDocument();
});

test('sans spécialités cochées, la section le dit au lieu de réduire le bac à la philosophie', () => {
  const bac = {
    code: 'BAC_GENERAL_2027',
    libelle: 'Bac',
    titreSection: 'Préparation au bac',
    session: 2027,
    pourcent: 10,
    specialitesARenseigner: true,
    epreuves: [
      {
        code: 'BAC_GENERAL_2027_PHILOSOPHIE',
        libelle: 'Philosophie',
        pourcent: 10,
        matieres: [matiere(8, 'Philosophie', 'Adrien', { pourcent: 10 })],
      },
    ],
  };

  render(<PreparationExamen eleveId="9" examen={bac} onPreparer={jest.fn()} />);

  expect(screen.getByRole('note')).toHaveTextContent('Tes spécialités ne sont pas encore renseignées');
  expect(screen.getByRole('link', { name: 'Philosophie' })).toBeInTheDocument();
});

test('la section s’affiche pour le rappel même si aucune épreuve n’est encore visible', () => {
  const bac = { ...EXAMEN, titreSection: 'Préparation au bac', specialitesARenseigner: true, epreuves: [] };

  render(<PreparationExamen eleveId="9" examen={bac} onPreparer={jest.fn()} />);

  expect(screen.getByRole('note')).toBeInTheDocument();
  expect(screen.queryByText(/La moyenne de tes/)).not.toBeInTheDocument();
});

// LE CAS DE CAMARA, LE 20/09/2026 : son fils en terminale n'avait que NSI de
// cochée, l'alerte ne partait qu'à zéro spécialité, et la section montrait un
// bac réduit à la philosophie et à NSI sans dire pourquoi.
test('une seule spécialité sur deux : la section dit celle qui manque', () => {
  const bac = {
    ...EXAMEN,
    titreSection: 'Préparation au bac général',
    specialitesARenseigner: true,
    specialitesManquantes: 1,
    epreuves: [
      {
        code: 'BAC_GENERAL_2027_PHILOSOPHIE',
        libelle: 'Philosophie',
        pourcent: 0,
        matieres: [matiere(8, 'Philosophie', 'Camille', { pourcent: 0 })],
      },
      {
        code: 'BAC_GENERAL_2027_NSI',
        libelle: 'Numérique et sciences informatiques',
        pourcent: 0,
        matieres: [matiere(9, 'Numérique et sciences informatiques', 'Minamba', { pourcent: 0 })],
      },
    ],
  };

  render(<PreparationExamen eleveId="9" examen={bac} onPreparer={jest.fn()} />);

  expect(screen.getByRole('note')).toHaveTextContent(/Il manque une spécialité/);
  expect(screen.queryByText(/ne sont pas encore renseignées/)).not.toBeInTheDocument();
});

test('les langues vivantes sont dites en contrôle continu, sans carte d’épreuve', () => {
  const note = 'Tes langues vivantes, ta LVA et ta LVB (l\'anglais comme l\'espagnol), n\'ont pas d\'épreuve '
    + 'finale au bac : elles comptent en contrôle continu, avec tes moyennes de première et de terminale.';
  const bac = { ...EXAMEN, titreSection: 'Préparation au bac', notesControleContinu: [note] };

  render(<PreparationExamen eleveId="9" examen={bac} onPreparer={jest.fn()} />);

  expect(screen.getByText(note)).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /espagnol|anglais/i })).not.toBeInTheDocument();
});

test('« prêt » parle de l’épreuve, jamais du contrôle', () => {
  render(<PreparationExamen eleveId="9" examen={EXAMEN} onPreparer={jest.fn()} />);

  expect(screen.getByText('Prêt pour l’épreuve')).toBeInTheDocument();
  expect(screen.queryByText('Prêt pour le contrôle')).not.toBeInTheDocument();
});
