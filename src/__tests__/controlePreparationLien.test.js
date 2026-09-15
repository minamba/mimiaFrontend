/**
 * LE MAILLON QUI CASSE LE PLUS SILENCIEUSEMENT.
 *
 * « Préparer ce contrôle » doit produire une adresse qui porte `controleId=`.
 * C'est le premier anneau d'une chaîne de neuf — URL, Chat.js, action Redux,
 * saga, corps du POST d'accueil, puis quatre points côté serveur — et s'il
 * lâche, RIEN NE CASSE VISIBLEMENT : la séance s'ouvre normalement, le
 * professeur dit bonjour, et il ne parle simplement jamais du contrôle. Aucun
 * message d'erreur, aucune page blanche. Juste une fonctionnalité qui n'existe
 * plus.
 *
 * On teste donc l'adresse elle-même, au point où elle est construite.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ControleCarte } from '../components/MesControles';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
}));

const CONTROLE = {
  id: 42,
  eleveId: '9',
  matiereId: 3,
  matiereLibelle: 'Mathématiques',
  sujet: 'Les fractions',
  dateControle: '2026-09-20T00:00:00',
  joursRestants: 3,
  nombrePreparations: 1,
  preparation: { pourcent: 60, perimetreConnu: true, total: 4, acquises: 2, notions: [] },
};

test('le bouton remonte le contrôle entier, avec son identifiant et sa matière', async () => {
  const onPreparer = jest.fn();

  render(<ControleCarte controle={CONTROLE} onPreparer={onPreparer} />);

  await userEvent.click(screen.getByRole('button', { name: 'Continuer la préparation' }));

  // La matière sert à ouvrir le bon cours, l'identifiant à dire au
  // professeur de quoi il s'agit : les deux doivent arriver ensemble.
  expect(onPreparer).toHaveBeenCalledTimes(1);
  expect(onPreparer.mock.calls[0][0]).toMatchObject({ id: 42, matiereId: 3 });
});

test('la carte mène à la fiche du contrôle', () => {
  render(<ControleCarte controle={CONTROLE} onPreparer={jest.fn()} />);

  // C'est le SUJET qui fait le titre cliquable de la carte, pas la matière :
  // « Les fractions » est ce que l'enfant cherche, « Mathématiques » ne
  // distingue pas deux contrôles de la même matière.
  expect(screen.getByRole('link', { name: 'Les fractions' }))
    .toHaveAttribute('href', '/eleves/9/controles/42');

  expect(screen.getByText('Mathématiques')).toBeInTheDocument();
});

test('le délai est affiché en pastille, avec son degré d’urgence', () => {
  const { rerender, container } = render(
    <ControleCarte controle={{ ...CONTROLE, joursRestants: 1 }} onPreparer={jest.fn()} />,
  );
  expect(container.querySelector('.controle-carte__delai.est-imminent')).not.toBeNull();

  rerender(<ControleCarte controle={{ ...CONTROLE, joursRestants: 3 }} onPreparer={jest.fn()} />);
  expect(container.querySelector('.controle-carte__delai.est-proche')).not.toBeNull();

  rerender(<ControleCarte controle={{ ...CONTROLE, joursRestants: 12 }} onPreparer={jest.fn()} />);
  expect(container.querySelector('.controle-carte__delai.est-lointain')).not.toBeNull();
});

test('un contrôle passé ne propose plus de le préparer', () => {
  render(<ControleCarte controle={CONTROLE} onPreparer={jest.fn()} passe />);

  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

/**
 * L'anneau suivant : l'action Redux doit transporter le contrôle jusqu'au
 * saga, qui le passera au corps du POST d'accueil.
 *
 * Testé sur le VRAI créateur d'action, pas sur une copie de sa logique : un
 * test qui recopie le code qu'il vérifie ne prouve rien.
 */
test('l’action d’ouverture transporte le contrôle', () => {
  const { ouvrirConversation } = require('../lib/actions/chatActions');

  expect(ouvrirConversation(9, 3, false, 25, 42).payload)
    .toMatchObject({ eleveId: 9, matiereId: 3, dureeChoisieMinutes: 25, controleId: 42 });

  // Une séance ordinaire n'en porte pas — et surtout, la valeur par défaut
  // doit rester `null` : `undefined` disparaîtrait du corps JSON envoyé.
  expect(ouvrirConversation(9, 3).payload.controleId).toBeNull();
});

/**
 * LE MODE DE LA SÉANCE — voulu par Camara le 14/09/2026 : le professeur sait
 * d'où vient l'élève. S'il ne voyage pas jusqu'au serveur, un élève venu
 * préparer son brevet entendrait parler de son contrôle de mardi, et
 * inversement : rien ne casse, le cloisonnement disparaît simplement.
 */
test('l’action d’ouverture transporte le mode et l’épreuve', () => {
  const { ouvrirConversation } = require('../lib/actions/chatActions');

  expect(ouvrirConversation(9, 3, false, 25, null, 'examen', 'DNB_2027_MATHS').payload)
    .toMatchObject({ mode: 'examen', epreuveCode: 'DNB_2027_MATHS', controleId: null });

  expect(ouvrirConversation(9, 3, false, 25, 42, 'bilan').payload)
    .toMatchObject({ mode: 'bilan', controleId: 42, epreuveCode: null });

  // Un cours normal n'envoie aucun mode : c'est le serveur qui le pose.
  expect(ouvrirConversation(9, 3).payload.mode).toBeNull();
});

test('un contrôle passé propose d’en faire le point, par son propre bouton', async () => {
  const onBilan = jest.fn();

  render(<ControleCarte controle={{ ...CONTROLE, joursRestants: -2 }} onBilan={onBilan} passe />);

  expect(screen.queryByRole('button', { name: /préparation|réviser/ })).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Faire le point sur ce contrôle' }));

  expect(onBilan).toHaveBeenCalledTimes(1);
  expect(onBilan.mock.calls[0][0]).toMatchObject({ id: 42, matiereId: 3 });
});
