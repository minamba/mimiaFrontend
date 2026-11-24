import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Diffusion from '../components/Diffusion';
import * as api from '../lib/api/adminApi';
import {
  MARQUEUR_HTML_COMPLET, avecMarqueur, estHtmlComplet, sansMarqueur,
} from '../lib/htmlComplet';

jest.mock('../lib/api/adminApi');

/**
 * LE MODE « HTML COMPLET » DU MESSAGE DE DIFFUSION (Min's, 24/11/2026) : on colle le HTML du mail Black Friday de
 * Slimane, l'aperçu et l'envoi le prennent tel quel. Le mode est porté par le texte (marqueur en fin), invisible dans
 * le champ ; le mode texte ne change pas.
 */

const HTML_BF = '<!DOCTYPE html><html><body><h1>Black Friday</h1>'
  + '<a href="{{lien_desinscription}}">Se désinscrire</a></body></html>';

const RESUME = {
  id: 7, nature: 'Diffusion', nom: 'Rentrée', description: '', sujet: 'La rentrée', actif: false,
  supprimable: true, nombreImages: 0, nombreDocuments: 0, poidsTotal: 0,
};

const DETAIL = {
  ...RESUME, titre: 'Bonne rentrée', texte: 'Bonjour,\n\nÀ bientôt', images: [], documents: [],
  dateModification: '2026-09-15T10:00:00Z',
};

const DETAIL_HTML = {
  ...DETAIL, id: 8, nom: 'Black Friday', sujet: 'Black Friday', titre: '', texte: `${HTML_BF}\n${MARQUEUR_HTML_COMPLET}`,
};

beforeEach(() => {
  api.getEtatDiffusion.mockResolvedValue({ data: { enCours: false } });
  api.getModelesMail.mockResolvedValue({ data: [RESUME, { ...RESUME, id: 8, nom: 'Black Friday' }] });
  api.getModeleMail.mockImplementation((id) => Promise.resolve({ data: id === 8 ? DETAIL_HTML : DETAIL }));
  api.modifierModeleMail.mockResolvedValue({ data: { dateModification: '2026-09-15T10:05:00Z' } });
  api.apercuModeleMail.mockResolvedValue({ data: '<html></html>' });
  api.apercuDiffusion.mockResolvedValue({ data: '<html></html>' });
  api.diffuserModeleMail.mockResolvedValue({ data: {} });
  api.getDestinatairesDiffusion.mockResolvedValue({ data: { nombre: 3 } });
  window.open = jest.fn();
  global.URL.createObjectURL = jest.fn(() => 'blob:x');
  global.URL.revokeObjectURL = jest.fn();
});

afterEach(() => jest.useRealTimers());

const choisir = async (nom) => {
  fireEvent.click(await screen.findByRole('button', { name: new RegExp(`^${nom}`) }));
  await screen.findByText('Vous avez choisi un template');
};

test('les fonctions du marqueur suivent la règle du serveur (marqueur en fin de texte)', () => {
  expect(estHtmlComplet(`<p>a</p>\n${MARQUEUR_HTML_COMPLET}`)).toBe(true);
  expect(estHtmlComplet(`${MARQUEUR_HTML_COMPLET}\n<p>a</p>`)).toBe(false);
  expect(estHtmlComplet('Bonjour')).toBe(false);
  expect(sansMarqueur(`<p>a</p>\n${MARQUEUR_HTML_COMPLET}`)).toBe('<p>a</p>');
  expect(sansMarqueur('Bonjour')).toBe('Bonjour');
  expect(avecMarqueur('<p>a</p> ')).toBe(`<p>a</p> \n${MARQUEUR_HTML_COMPLET}`);
  // Jamais deux marqueurs : remettre le marqueur sur un texte qui l'a déjà ne le double pas.
  expect(avecMarqueur(avecMarqueur('<p>a</p>'))).toBe(`<p>a</p>\n${MARQUEUR_HTML_COMPLET}`);
});

test('cocher « HTML complet » change le champ et enregistre le HTML avec son marqueur', async () => {
  render(<Diffusion nombreParents={3} />);
  await choisir('Rentrée');

  const caseHtml = screen.getByRole('checkbox', { name: 'HTML complet' });
  expect(caseHtml).not.toBeChecked();
  expect(screen.getByLabelText('Titre affiché dans le message')).toBeInTheDocument();
  expect(screen.getByText('Images dans le message')).toBeInTheDocument();

  fireEvent.click(caseHtml);

  // Le champ devient « HTML du courriel » ; plus de titre, plus d'images à marqueur, plus de barre gras/émoji.
  expect(caseHtml).toBeChecked();
  expect(screen.queryByLabelText('Titre affiché dans le message')).not.toBeInTheDocument();
  expect(screen.queryByText('Images dans le message')).not.toBeInTheDocument();
  expect(screen.getByText('Documents joints')).toBeInTheDocument();
  const champ = screen.getByLabelText('HTML du courriel');
  expect(champ).toHaveValue('Bonjour,\n\nÀ bientôt');

  jest.useFakeTimers();
  fireEvent.change(champ, { target: { value: HTML_BF } });
  expect(champ).toHaveValue(HTML_BF);

  await act(async () => { jest.advanceTimersByTime(800); });
  expect(api.modifierModeleMail).toHaveBeenLastCalledWith(
    7, expect.objectContaining({ texte: `${HTML_BF}\n${MARQUEUR_HTML_COMPLET}` }),
  );
});

test('un template en HTML complet s’ouvre case cochée, sans le marqueur dans le champ, et se décoche', async () => {
  render(<Diffusion nombreParents={3} />);
  await choisir('Black Friday');

  expect(screen.getByRole('checkbox', { name: 'HTML complet' })).toBeChecked();
  expect(screen.getByLabelText('HTML du courriel')).toHaveValue(HTML_BF);

  jest.useFakeTimers();
  fireEvent.click(screen.getByRole('checkbox', { name: 'HTML complet' }));
  expect(screen.getByLabelText('Message')).toHaveValue(HTML_BF);

  await act(async () => { jest.advanceTimersByTime(800); });
  expect(api.modifierModeleMail).toHaveBeenLastCalledWith(8, expect.objectContaining({ texte: HTML_BF }));
});

test('HTML complet + balise : l’envoi exige « Promotion », l’aperçu et l’envoi passent en offres', async () => {
  render(<Diffusion nombreParents={3} />);
  await choisir('Black Friday');

  // Sans la case : la balise trahit une offre, l'envoi est bloqué (règle existante, inchangée).
  expect(screen.getByRole('alert')).toHaveTextContent('{{lien_desinscription}}');
  expect(screen.getByRole('button', { name: /Envoyer à tous les parents/ })).toBeDisabled();

  fireEvent.click(screen.getByRole('checkbox', { name: 'Promotion' }));

  fireEvent.click(screen.getByRole('button', { name: 'Voir l’aperçu' }));
  await waitFor(() => expect(api.apercuModeleMail).toHaveBeenCalledWith(8, { mode: 'offres' }));

  const envoyer = await screen.findByRole('button', { name: 'Envoyer aux 3 parents qui ont accepté les offres' });
  fireEvent.click(envoyer);
  fireEvent.click(await screen.findByRole('button', { name: 'Confirmer l’envoi à 3 parent(s)' }));
  await waitFor(() => expect(api.diffuserModeleMail).toHaveBeenCalledWith(8, { mode: 'offres' }));
});

test('l’aperçu s’affiche dans un cadre isolé (sandbox vide), jamais dans un onglet blob: du site', async () => {
  // Contrôle d'Omar (24/11/2026) : une adresse `blob:` prend l'origine du site admin, un script collé s'y exécutait.
  const piege = '<html><body><h1>BF</h1><img src="x" onerror="alert(1)"></body></html>';
  api.apercuModeleMail.mockResolvedValue({ data: piege });
  render(<Diffusion nombreParents={3} />);
  await choisir('Black Friday');
  fireEvent.click(screen.getByRole('checkbox', { name: 'Promotion' }));

  fireEvent.click(screen.getByRole('button', { name: 'Voir l’aperçu' }));

  const cadre = await screen.findByTitle('Aperçu du courriel');
  expect(cadre.tagName).toBe('IFRAME');
  expect(cadre).toHaveAttribute('sandbox', '');
  expect(cadre).toHaveAttribute('srcdoc', piege);
  expect(window.open).not.toHaveBeenCalled();
  expect(global.URL.createObjectURL).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog', { name: 'Aperçu du courriel' })).toBeInTheDocument();

  // « Téléphone » montre le courriel à 390 px ; Échap ferme.
  fireEvent.click(screen.getByRole('button', { name: 'Téléphone' }));
  expect(cadre).toHaveClass('apercu-courriel__cadre--telephone');
  expect(screen.getByRole('button', { name: 'Téléphone' })).toHaveAttribute('aria-pressed', 'true');

  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByTitle('Aperçu du courriel')).not.toBeInTheDocument();
});

test('un HTML complet vide n’est pas prêt à partir', async () => {
  render(<Diffusion nombreParents={3} />);
  await choisir('Rentrée');

  fireEvent.click(screen.getByRole('checkbox', { name: 'HTML complet' }));
  fireEvent.change(screen.getByLabelText('HTML du courriel'), { target: { value: '   ' } });

  expect(screen.getByRole('button', { name: 'Voir l’aperçu' })).toBeDisabled();
});
