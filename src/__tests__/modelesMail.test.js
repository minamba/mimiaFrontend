import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Diffusion from '../components/Diffusion';
import MessageParent from '../components/MessageParent';
import * as api from '../lib/api/adminApi';

jest.mock('../lib/api/adminApi');

const RESUME = {
  id: 7,
  nature: 'Diffusion',
  nom: 'Rentrée',
  description: 'Le message de septembre',
  sujet: 'La rentrée',
  actif: false,
  supprimable: true,
  nombreImages: 1,
  nombreDocuments: 0,
  poidsTotal: 2048,
};

const DETAIL = {
  ...RESUME,
  titre: 'Bonne rentrée',
  texte: 'Bonjour,\n\n[image:1]',
  images: [{ id: 3, genre: 'Image', rang: 1, nomFichier: 'affiche.png', typeMime: 'image/png', taille: 2048 }],
  documents: [],
  dateModification: '2026-09-15T10:00:00Z',
};

const AUTOMATIQUES = [
  { id: 1, nature: 'Automatique', code: 'BILANS', nom: 'Bilans aux parents', actif: true, supprimable: false, reglesADefinir: false },
  { id: 2, nature: 'Automatique', code: 'RELANCE', nom: 'Relance', actif: false, supprimable: true, reglesADefinir: true },
];

beforeEach(() => {
  api.getEtatDiffusion.mockResolvedValue({ data: { enCours: false } });
  api.getModelesMail.mockImplementation((nature) => Promise.resolve({
    data: nature === 'Automatique' ? AUTOMATIQUES : [RESUME],
  }));
  api.getModeleMail.mockResolvedValue({ data: DETAIL });
  api.modifierModeleMail.mockResolvedValue({ data: { dateModification: '2026-09-15T10:05:00Z' } });
  api.creerModeleMail.mockImplementation(({ nature }) => Promise.resolve({
    data: nature === 'Automatique'
      ? {
        id: 11, nature: 'Automatique', code: null, nom: 'Relance J+7', description: '', sujet: '',
        titre: '', texte: '', images: [], documents: [], reglesADefinir: true, supprimable: true,
      }
      : { ...DETAIL, id: 9, nom: 'Nouveauté', sujet: 'Nouveauté', titre: '', texte: 'Bonjour', images: [] },
  }));
  api.diffuserModeleMail.mockResolvedValue({ data: {} });
  api.getDestinatairesDiffusion.mockResolvedValue({ data: { nombre: 3 } });
});

afterEach(() => jest.useRealTimers());

const choisirRentree = async () => {
  fireEvent.click(await screen.findByRole('button', { name: /^Rentrée/ }));
  await screen.findByText('Vous avez choisi un template');
};

const ecrire = (libelle, valeur) =>
  fireEvent.change(screen.getByLabelText(libelle), { target: { value: valeur } });

test('choisir un template remplit le formulaire, pièces comprises, et l’annonce', async () => {
  render(<Diffusion nombreParents={3} />);

  await choisirRentree();

  expect(screen.getByLabelText('Nom du template')).toHaveValue('Rentrée');
  expect(screen.getByLabelText('Description')).toHaveValue('Le message de septembre');
  expect(screen.getByLabelText('Objet du courriel')).toHaveValue('La rentrée');
  expect(screen.getByLabelText('Titre affiché dans le message')).toHaveValue('Bonne rentrée');
  expect(screen.getByLabelText('Message')).toHaveValue('Bonjour,\n\n[image:1]');
  expect(screen.getByText('affiche.png')).toBeInTheDocument();

  // Un template choisi s'enregistre tout seul : pas de bouton pour ça.
  expect(screen.queryByRole('button', { name: 'Enregistrer le template' })).not.toBeInTheDocument();
});

test('une modification s’enregistre 800 ms après la dernière frappe, une seule fois', async () => {
  render(<Diffusion nombreParents={3} />);
  await choisirRentree();

  jest.useFakeTimers();
  ecrire('Message', 'Nouveau texte');

  act(() => { jest.advanceTimersByTime(799); });
  expect(api.modifierModeleMail).not.toHaveBeenCalled();

  await act(async () => { jest.advanceTimersByTime(1); });

  expect(api.modifierModeleMail).toHaveBeenCalledTimes(1);
  expect(api.modifierModeleMail).toHaveBeenCalledWith(7, {
    nom: 'Rentrée',
    description: 'Le message de septembre',
    sujet: 'La rentrée',
    titre: 'Bonne rentrée',
    texte: 'Nouveau texte',
  });
});

test('le nom et la description s’enregistrent comme le reste', async () => {
  render(<Diffusion nombreParents={3} />);
  await choisirRentree();

  jest.useFakeTimers();
  ecrire('Nom du template', 'Rentrée 2026');
  ecrire('Description', 'Envoyé fin août');

  await act(async () => { jest.advanceTimersByTime(800); });

  expect(api.modifierModeleMail).toHaveBeenCalledWith(
    7, expect.objectContaining({ nom: 'Rentrée 2026', description: 'Envoyé fin août' }),
  );
});

test('« Enregistrer les modifications » enregistre tout de suite, sans attendre', async () => {
  render(<Diffusion nombreParents={3} />);
  await choisirRentree();

  const bouton = screen.getByRole('button', { name: 'Enregistrer les modifications' });
  expect(bouton).toBeDisabled();

  ecrire('Objet du courriel', 'La rentrée 2026');
  expect(bouton).toBeEnabled();

  fireEvent.click(bouton);

  await waitFor(() => expect(api.modifierModeleMail).toHaveBeenCalledWith(
    7, expect.objectContaining({ sujet: 'La rentrée 2026' }),
  ));
  expect(api.diffuserModeleMail).not.toHaveBeenCalled();
});

test('ouvrir un template sans rien toucher n’enregistre rien', async () => {
  render(<Diffusion nombreParents={3} />);
  await choisirRentree();

  jest.useFakeTimers();
  act(() => { jest.advanceTimersByTime(3000); });

  expect(api.modifierModeleMail).not.toHaveBeenCalled();
});

test('« Enregistrer le template » crée le template et le choisit', async () => {
  render(<Diffusion nombreParents={3} />);

  ecrire('Objet du courriel', 'Nouveauté');
  ecrire('Message', 'Bonjour');
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le template' }));

  await screen.findByText('Vous avez choisi un template');
  expect(api.creerModeleMail).toHaveBeenCalledWith(
    expect.objectContaining({ nature: 'Diffusion', sujet: 'Nouveauté', texte: 'Bonjour' }),
  );
});

test('un nouveau template reçoit son nom et sa description dès sa création', async () => {
  render(<Diffusion nombreParents={3} />);

  ecrire('Nom du template', 'Annonce des vacances');
  ecrire('Description', 'Envoyé la veille des vacances scolaires');
  ecrire('Objet du courriel', 'Bonnes vacances');
  ecrire('Message', 'Bonjour');
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le template' }));

  await waitFor(() => expect(api.creerModeleMail).toHaveBeenCalledWith(expect.objectContaining({
    nature: 'Diffusion',
    nom: 'Annonce des vacances',
    description: 'Envoyé la veille des vacances scolaires',
  })));
});

test('« Écrire à un parent » a aussi le nom et la description du template', async () => {
  render(<MessageParent parents={[]} />);
  await screen.findByRole('button', { name: /^Rentrée/ });

  expect(screen.getByLabelText('Nom du template')).toBeInTheDocument();
  expect(screen.getByLabelText('Description')).toBeInTheDocument();
});

test('envoyer sans template enregistre le message comme template avant de le diffuser', async () => {
  render(<Diffusion nombreParents={3} />);

  ecrire('Objet du courriel', 'Nouveauté');
  ecrire('Message', 'Bonjour');
  fireEvent.click(screen.getByRole('button', { name: 'Envoyer à tous les parents' }));
  fireEvent.click(await screen.findByRole('button', { name: /Confirmer l’envoi à 3 parent/ }));

  await waitFor(() => expect(api.diffuserModeleMail).toHaveBeenCalledWith(9));
  expect(api.creerModeleMail.mock.invocationCallOrder[0])
    .toBeLessThan(api.diffuserModeleMail.mock.invocationCallOrder[0]);
});

test('une modification en attente est enregistrée avant l’envoi', async () => {
  render(<Diffusion nombreParents={3} />);
  await choisirRentree();

  ecrire('Message', 'Corrigé à la dernière seconde');
  fireEvent.click(screen.getByRole('button', { name: 'Envoyer à tous les parents' }));
  fireEvent.click(await screen.findByRole('button', { name: /Confirmer l’envoi à 3 parent/ }));

  await waitFor(() => expect(api.diffuserModeleMail).toHaveBeenCalledWith(7));

  expect(api.modifierModeleMail).toHaveBeenCalledWith(
    7, expect.objectContaining({ texte: 'Corrigé à la dernière seconde' }),
  );
  expect(api.modifierModeleMail.mock.invocationCallOrder[0])
    .toBeLessThan(api.diffuserModeleMail.mock.invocationCallOrder[0]);
  expect(api.creerModeleMail).not.toHaveBeenCalled();
});

test('« Nouveau message » quitte le template et vide le formulaire', async () => {
  render(<Diffusion nombreParents={3} />);
  await choisirRentree();

  fireEvent.click(screen.getByRole('button', { name: 'Nouveau message' }));

  await waitFor(() => expect(screen.getByLabelText('Objet du courriel')).toHaveValue(''));
  expect(screen.getByLabelText('Message')).toHaveValue('');
  expect(screen.queryByText('Vous avez choisi un template')).not.toBeInTheDocument();
});

test('« Nouveau message » dans la liste Automatique crée un courriel automatique', async () => {
  render(<Diffusion nombreParents={3} />);

  fireEvent.click(await screen.findByRole('tab', { name: 'Automatique' }));
  await screen.findByRole('button', { name: /^Relance/ });

  fireEvent.click(screen.getByRole('button', { name: 'Nouveau message' }));

  const creer = await screen.findByRole('button', { name: 'Créer le courriel automatique' });
  expect(creer).toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Envoyer à tous les parents' })).not.toBeInTheDocument();

  ecrire('Nom du courriel automatique', 'Relance J+7');
  ecrire('Description', 'Une semaine sans cours');
  fireEvent.click(creer);

  await waitFor(() => expect(api.creerModeleMail).toHaveBeenCalledWith(
    expect.objectContaining({ nature: 'Automatique', nom: 'Relance J+7', description: 'Une semaine sans cours' }),
  ));
  expect(await screen.findByText(/ne sont pas encore définies/)).toBeInTheDocument();
});

test('seuls les courriels non reliés à un envoi se suppriment', async () => {
  render(<Diffusion nombreParents={3} />);

  fireEvent.click(await screen.findByRole('tab', { name: 'Automatique' }));
  await screen.findByRole('button', { name: /^Relance/ });

  expect(screen.getByRole('button', { name: 'Supprimer le template Relance' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Supprimer le template Bilans aux parents' })).not.toBeInTheDocument();
});

test('la diffusion propose les deux listes, « Écrire à un parent » seulement les diffusions', async () => {
  const { unmount } = render(<Diffusion nombreParents={3} />);
  expect(await screen.findByRole('tab', { name: 'Automatique' })).toBeInTheDocument();
  unmount();

  render(<MessageParent parents={[]} />);
  await screen.findByRole('button', { name: /^Rentrée/ });
  expect(screen.queryByRole('tab', { name: 'Automatique' })).not.toBeInTheDocument();
});

// --------------------- message de diffusion = information à tous (Min's, 20/11/2026)

test('message de diffusion : à TOUS les parents, sans case à cocher ni avertissement « offres »', async () => {
  api.getDestinatairesDiffusion.mockImplementation((mode) =>
    Promise.resolve({ data: { nombre: mode === 'offres' ? 2 : 5 } }));
  render(<Diffusion nombreParents={5} />);

  // Rien en haut de l'écran : ni cadre « offres », ni interdit.
  await screen.findByRole('button', { name: /^Rentrée/ });
  expect(screen.queryByText(/Réservé aux offres/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Aucune offre, promotion ou incitation commerciale/)).not.toBeInTheDocument();
  expect(api.getDestinatairesDiffusion).not.toHaveBeenCalled();

  ecrire('Objet du courriel', 'Du nouveau sur Mimia');
  ecrire('Message', 'Bonjour {{prenom}}, les fiches de révision arrivent.');
  fireEvent.click(screen.getByRole('button', { name: 'Envoyer à tous les parents' }));

  const confirmer = await screen.findByRole('button', { name: /Confirmer l’envoi à 5 parent/ });
  expect(api.getDestinatairesDiffusion).toHaveBeenCalledWith();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(screen.queryByText(/accepté de recevoir les offres/)).not.toBeInTheDocument();
  expect(confirmer).toBeEnabled();

  fireEvent.click(confirmer);
  await waitFor(() => expect(api.diffuserModeleMail).toHaveBeenCalledWith(9));
});

test('message de diffusion : les courriels automatiques restent ici', async () => {
  render(<Diffusion nombreParents={3} />);
  expect(await screen.findByRole('tab', { name: 'Automatique' })).toBeInTheDocument();
});

test('message de diffusion : un modèle d’offre ({{lien_desinscription}}) est renvoyé vers « Offres et promotions »', async () => {
  render(<Diffusion nombreParents={5} />);

  ecrire('Objet du courriel', 'Black Friday');
  ecrire('Message', 'Bonjour {{prenom}}, -50 % ce week-end : {{ lienDesinscription }}');
  fireEvent.click(screen.getByRole('button', { name: 'Envoyer à tous les parents' }));

  const confirmer = await screen.findByRole('button', { name: /Confirmer l’envoi à/ });
  expect(screen.getByRole('alert')).toHaveTextContent('Offres et promotions');
  expect(confirmer).toBeDisabled();
  fireEvent.click(confirmer);
  expect(api.diffuserModeleMail).not.toHaveBeenCalled();
});

test('nombre de destinataires illisible : on ne peut pas confirmer', async () => {
  api.getDestinatairesDiffusion.mockRejectedValue(new Error('réseau'));
  render(<Diffusion nombreParents={5} />);

  ecrire('Objet du courriel', 'Du nouveau');
  ecrire('Message', 'Bonjour');
  fireEvent.click(screen.getByRole('button', { name: 'Envoyer à tous les parents' }));

  expect(await screen.findByText(/n’a pas pu être lu/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Confirmer l’envoi/ })).toBeDisabled();
});

// ----------------------------------------- offres et promotions (consentants seulement)

test('offres et promotions : le cadre dit « réservé aux offres » et le nombre de consentants dès l’ouverture', async () => {
  api.getDestinatairesDiffusion.mockImplementation((mode) =>
    Promise.resolve({ data: { nombre: mode === 'offres' ? 2 : 5 } }));
  render(<Diffusion mode="offres" nombreParents={5} />);

  const cadre = await screen.findByRole('note');
  await waitFor(() => expect(cadre).toHaveTextContent(
    /Réservé aux offres\s*: envoyé seulement aux parents qui ont accepté les offres \(2 parents\)/,
  ));
  expect(api.getDestinatairesDiffusion).toHaveBeenCalledWith('offres');

  // Pas de courriels automatiques ici : ils sont des informations, réglés dans « Message de diffusion ».
  await screen.findByRole('button', { name: /^Rentrée/ });
  expect(screen.queryByRole('tab', { name: 'Automatique' })).not.toBeInTheDocument();
});

test('offres et promotions : la confirmation compte les consentants et l’envoi part en mode « offres »', async () => {
  api.getDestinatairesDiffusion.mockResolvedValue({ data: { nombre: 2 } });
  render(<Diffusion mode="offres" nombreParents={5} />);

  ecrire('Objet du courriel', 'Black Friday');
  ecrire('Message', 'Bonjour {{prenom}} ! {{lien_desinscription}}');
  fireEvent.click(screen.getByRole('button', { name: 'Envoyer aux parents inscrits aux offres' }));

  const confirmer = await screen.findByRole('button', { name: /Confirmer l’envoi à 2 parent/ });
  expect(screen.getByText(/sur 5 compte/)).toBeInTheDocument();
  expect(screen.getByText(/accepté de recevoir les offres et nouveautés par e-mail/)).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

  fireEvent.click(confirmer);
  await waitFor(() => expect(api.diffuserModeleMail).toHaveBeenCalledWith(9, { mode: 'offres' }));
});

test('offres et promotions : personne n’a accepté les offres, la confirmation reste grisée', async () => {
  api.getDestinatairesDiffusion.mockResolvedValue({ data: { nombre: 0 } });
  render(<Diffusion mode="offres" nombreParents={5} />);

  ecrire('Objet du courriel', 'Black Friday');
  ecrire('Message', 'Bonjour');
  fireEvent.click(screen.getByRole('button', { name: 'Envoyer aux parents inscrits aux offres' }));

  expect(await screen.findByRole('button', { name: /Confirmer l’envoi à 0 parent/ })).toBeDisabled();
});

