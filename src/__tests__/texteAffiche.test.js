/**
 * CE QUE L'APPLICATION GLISSE DANS UN MESSAGE NE SE RELIT JAMAIS — relevé par
 * Camara le 12/10/2026 dans « Mes conversations » (conversation du 18/09 avec
 * Adrien) : les consignes ajoutées au message de Bilal s'affichaient en clair.
 */

import { render, screen } from '@testing-library/react';
import { texteLisible } from '../lib/storage/texteAffiche';
import ExpressionOraleDetail from '../components/ExpressionOraleDetail';

// Les textes exacts relevés en base.
const VITESSE = 'C’est bon pour moi.\n[L’élève a choisi la vitesse. LANCE LA CONVERSATION MAINTENANT : c’est à toi '
  + 'de parler en premier, dans la langue du cours, et de lui poser une question pour qu’il puisse rebondir.]';
const CAHIER = 'J’écris sur mon cahier.\n[TEXTE AU CAHIER : il écrit sur son cahier. Sa copie ne peut te parvenir '
  + 'qu’en PHOTO — tant qu’elle n’est pas arrivée, tu n’as rien à corriger. QUAND ELLE ARRIVE, retranscris son '
  + 'texte AU TABLEAU sous « Ton texte », mot pour mot, fautes comprises.]';

describe('texteLisible', () => {
  test('les consignes de l’application disparaissent, les mots de l’élève restent', () => {
    expect(texteLisible(VITESSE)).toBe('C’est bon pour moi.');
    expect(texteLisible(CAHIER)).toBe('J’écris sur mon cahier.');
  });

  test('un message ordinaire ne bouge pas', () => {
    expect(texteLisible('Je voudrais faire un exercice d’expression écrite.'))
      .toBe('Je voudrais faire un exercice d’expression écrite.');
  });
});

test('« Mes conversations » ne montre que ce qui a été dit', () => {
  render(
    <ExpressionOraleDetail
      conversation={{
        id: 1,
        dateCreation: '2026-09-18T10:00:00Z',
        echange: [
          { qui: 'eleve', texte: VITESSE },
          { qui: 'professeur', texte: 'Salut Bilal ! Alors, qu’est-ce que tu as fait le week-end dernier ?' },
          { qui: 'eleve', texte: CAHIER },
        ],
      }}
      prenomEleve="Bilal"
    />,
  );

  expect(screen.getByText('C’est bon pour moi.')).toBeInTheDocument();
  expect(screen.getByText('J’écris sur mon cahier.')).toBeInTheDocument();
  expect(screen.queryByText(/LANCE LA CONVERSATION/)).not.toBeInTheDocument();
  expect(screen.queryByText(/TEXTE AU CAHIER/)).not.toBeInTheDocument();
});
