import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import VerrouConditions from '../components/VerrouConditions';
import { accepterConditions, getConditionsDuParent, getProfil } from '../lib/api/profilApi';
import { fermerSession } from '../lib/api/sessionEleveApi';
import { fermerSessionEleve, sessionEleve } from '../lib/storage/sessionEleve';

jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('react-router-dom', () => ({ useLocation: jest.fn(), useNavigate: jest.fn() }));
jest.mock('../lib/api/profilApi', () => ({
  accepterConditions: jest.fn(),
  getConditionsDuParent: jest.fn(),
  getProfil: jest.fn(),
}));
jest.mock('../lib/api/sessionEleveApi', () => ({ fermerSession: jest.fn() }));
jest.mock('../lib/storage/sessionEleve', () => ({ fermerSessionEleve: jest.fn(), sessionEleve: jest.fn() }));
jest.mock('../components/ConditionsVente', () => ({ __esModule: true, default: () => <p>Le texte des conditions</p> }));

const dispatch = jest.fn();
const navigate = jest.fn();

const monter = ({ authentifie = true, loading = false, chemin = '/eleves' } = {}) => {
  useSelector.mockImplementation((choix) => choix({ auth: { authentifie, loading } }));
  useDispatch.mockReturnValue(dispatch);
  useNavigate.mockReturnValue(navigate);
  useLocation.mockReturnValue({ pathname: chemin });
  return render(<VerrouConditions><p>La page du site</p></VerrouConditions>);
};

beforeEach(() => {
  jest.clearAllMocks();
  sessionEleve.mockReturnValue(null);
});

afterEach(() => jest.useRealTimers());

describe('la fenêtre bloquante des conditions générales', () => {
  test('un parent à jour entre sans fenêtre', async () => {
    getProfil.mockResolvedValue({ data: { conditionsAAccepter: false } });
    monter();

    expect(screen.queryByText('La page du site')).not.toBeInTheDocument();
    expect(await screen.findByText('La page du site')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('à accepter : la fenêtre, et la page n’est pas montée derrière', async () => {
    getProfil.mockResolvedValue({ data: { conditionsAAccepter: true, conditionsPremiereFois: false } });
    monter();

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nos conditions générales ont été mises à jour' })).toBeInTheDocument();
    expect(screen.queryByText('La page du site')).not.toBeInTheDocument();
  });

  test('elle ne se ferme pas avec Échap', async () => {
    getProfil.mockResolvedValue({ data: { conditionsAAccepter: true } });
    monter();
    await screen.findByRole('dialog');

    await userEvent.keyboard('{Escape}');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByText('La page du site')).not.toBeInTheDocument();
  });

  test('accepter : le serveur le note et le site s’ouvre', async () => {
    getProfil.mockResolvedValue({ data: { conditionsAAccepter: true } });
    accepterConditions.mockResolvedValue({});
    monter();

    await userEvent.click(await screen.findByRole('button', { name: 'J’accepte' }));

    expect(accepterConditions).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('La page du site')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('l’accord qui ne s’enregistre pas : il reste bloqué, avec un message', async () => {
    getProfil.mockResolvedValue({ data: { conditionsAAccepter: true } });
    accepterConditions.mockRejectedValue(new Error('panne'));
    monter();

    await userEvent.click(await screen.findByRole('button', { name: 'J’accepte' }));

    expect(await screen.findByText(/n’a pas pu être enregistré/)).toBeInTheDocument();
    expect(screen.queryByText('La page du site')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'J’accepte' })).toBeEnabled();
  });

  test('refuser : la déconnexion, sans rien noter', async () => {
    getProfil.mockResolvedValue({ data: { conditionsAAccepter: true } });
    monter();

    await userEvent.click(await screen.findByRole('button', { name: 'Je refuse' }));

    expect(dispatch).toHaveBeenCalledWith({ type: 'AUTH_LOGOUT_REQUEST' });
    expect(accepterConditions).not.toHaveBeenCalled();
    expect(screen.queryByText('La page du site')).not.toBeInTheDocument();
  });

  test('consulter : le texte dans la fenêtre, le retour, et on peut accepter depuis la lecture', async () => {
    getProfil.mockResolvedValue({ data: { conditionsAAccepter: true } });
    accepterConditions.mockResolvedValue({});
    monter();

    await userEvent.click(await screen.findByRole('button', { name: 'Consulter les conditions' }));
    expect(screen.getByText('Le texte des conditions')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Je refuse' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Retour' }));
    expect(screen.getByRole('button', { name: 'Je refuse' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Consulter les conditions' }));
    await userEvent.click(screen.getByRole('button', { name: 'J’accepte' }));
    expect(await screen.findByText('La page du site')).toBeInTheDocument();
  });

  test('un parent neuf, arrivé par Google : on ne lui parle pas de mise à jour', async () => {
    getProfil.mockResolvedValue({ data: { conditionsAAccepter: true, conditionsPremiereFois: true } });
    monter();

    expect(await screen.findByRole('heading', { name: 'Avant de commencer' })).toBeInTheDocument();
    expect(screen.queryByText(/mis à jour/)).not.toBeInTheDocument();
  });
});

describe('l’enfant dont le parent n’a pas accepté', () => {
  beforeEach(() => {
    sessionEleve.mockReturnValue({ id: 3 });
    fermerSession.mockResolvedValue({});
  });

  test('le message, et la page n’est pas montée derrière', async () => {
    getConditionsDuParent.mockResolvedValue({ data: { conditionsAAccepter: true } });
    monter({ authentifie: false, chemin: '/eleves/3/matieres' });

    expect(await screen.findByRole('heading', { name: 'Ton parent doit valider nos nouvelles conditions' })).toBeInTheDocument();
    expect(screen.getByText(/tu ne pourras pas utiliser le site/)).toBeInTheDocument();
    expect(screen.queryByText('La page du site')).not.toBeInTheDocument();
  });

  test('il n’a rien à accepter, et il ne lit pas le profil de son parent', async () => {
    getConditionsDuParent.mockResolvedValue({ data: { conditionsAAccepter: true } });
    monter({ authentifie: false });
    await screen.findByRole('dialog');

    expect(screen.queryByRole('button', { name: 'J’accepte' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Je refuse' })).not.toBeInTheDocument();
    expect(getProfil).not.toHaveBeenCalled();
  });

  test('son parent connecté sur le même appareil ne change rien : c’est l’enfant qui compte', async () => {
    getConditionsDuParent.mockResolvedValue({ data: { conditionsAAccepter: true } });
    monter({ authentifie: true });

    expect(await screen.findByRole('heading', { name: 'Ton parent doit valider nos nouvelles conditions' })).toBeInTheDocument();
    expect(getProfil).not.toHaveBeenCalled();
  });

  test('le parent a accepté : il entre sans message', async () => {
    getConditionsDuParent.mockResolvedValue({ data: { conditionsAAccepter: false } });
    monter({ authentifie: false });

    expect(screen.queryByText('La page du site')).not.toBeInTheDocument();
    expect(await screen.findByText('La page du site')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('réessayer, pas encore validé : il reste bloqué, et on le lui dit', async () => {
    getConditionsDuParent.mockResolvedValue({ data: { conditionsAAccepter: true } });
    monter({ authentifie: false });

    await userEvent.click(await screen.findByRole('button', { name: 'Réessayer' }));

    expect(await screen.findByText('Ton parent n’a pas encore validé les conditions.')).toBeInTheDocument();
    expect(screen.queryByText('La page du site')).not.toBeInTheDocument();
  });

  test('réessayer, le parent vient de valider : le site s’ouvre', async () => {
    getConditionsDuParent.mockResolvedValueOnce({ data: { conditionsAAccepter: true } });
    getConditionsDuParent.mockResolvedValueOnce({ data: { conditionsAAccepter: false } });
    monter({ authentifie: false });

    await userEvent.click(await screen.findByRole('button', { name: 'Réessayer' }));

    expect(await screen.findByText('La page du site')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('réessayer pendant une panne : il reste bloqué, avec un message', async () => {
    getConditionsDuParent.mockResolvedValueOnce({ data: { conditionsAAccepter: true } });
    getConditionsDuParent.mockRejectedValueOnce(new Error('panne'));
    monter({ authentifie: false });

    await userEvent.click(await screen.findByRole('button', { name: 'Réessayer' }));

    expect(await screen.findByText(/La vérification n’a pas marché/)).toBeInTheDocument();
    expect(screen.queryByText('La page du site')).not.toBeInTheDocument();
  });

  test('quitter : la session se ferme au serveur puis ici, et retour à l’accueil', async () => {
    getConditionsDuParent.mockResolvedValue({ data: { conditionsAAccepter: true } });
    monter({ authentifie: false });

    await userEvent.click(await screen.findByRole('button', { name: 'Quitter' }));

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/'));
    expect(fermerSession).toHaveBeenCalledTimes(1);
    expect(fermerSessionEleve).toHaveBeenCalledTimes(1);
  });

  test('quitter marche même si le serveur ne répond pas', async () => {
    getConditionsDuParent.mockResolvedValue({ data: { conditionsAAccepter: true } });
    fermerSession.mockRejectedValue(new Error('panne'));
    monter({ authentifie: false });

    await userEvent.click(await screen.findByRole('button', { name: 'Quitter' }));

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/'));
    expect(fermerSessionEleve).toHaveBeenCalledTimes(1);
  });

  test('quitter sur l’appareil du parent : sa fenêtre à lui, avec sa propre réponse', async () => {
    getConditionsDuParent.mockResolvedValue({ data: { conditionsAAccepter: true } });
    getProfil.mockResolvedValue({ data: { conditionsAAccepter: true } });
    fermerSessionEleve.mockImplementation(() => sessionEleve.mockReturnValue(null));
    const { rerender } = monter({ authentifie: true });

    await userEvent.click(await screen.findByRole('button', { name: 'Quitter' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/'));
    rerender(<VerrouConditions><p>La page du site</p></VerrouConditions>);

    expect(await screen.findByRole('button', { name: 'J’accepte' })).toBeEnabled();
    expect(getProfil).toHaveBeenCalledTimes(1);
    fermerSessionEleve.mockReset();
  });

  test('une panne à l’ouverture laisse passer, comme pour le parent', async () => {
    getConditionsDuParent.mockRejectedValue(new Error('panne'));
    monter({ authentifie: false });
    expect(await screen.findByText('La page du site')).toBeInTheDocument();
  });

  test('une API plus ancienne que le front, sans la route, laisse passer', async () => {
    getConditionsDuParent.mockRejectedValue(Object.assign(new Error('405'), { response: { status: 405 } }));
    monter({ authentifie: false });
    expect(await screen.findByText('La page du site')).toBeInTheDocument();
  });

  test('sa page de scanner reste ouverte, le téléphone l’ouvre en plein cours', async () => {
    getConditionsDuParent.mockResolvedValue({ data: { conditionsAAccepter: true } });
    monter({ authentifie: false, chemin: '/scan/abc' });
    expect(screen.getByText('La page du site')).toBeInTheDocument();
    await waitFor(() => expect(getConditionsDuParent).toHaveBeenCalled());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('ce qui ne bloque pas', () => {
  test('un visiteur non connecté : rien à demander', () => {
    monter({ authentifie: false });
    expect(screen.getByText('La page du site')).toBeInTheDocument();
    expect(getProfil).not.toHaveBeenCalled();
  });

  test('le retour de connexion et le renouvellement passent toujours', async () => {
    getProfil.mockResolvedValue({ data: { conditionsAAccepter: true } });
    monter({ chemin: '/callback' });
    expect(screen.getByText('La page du site')).toBeInTheDocument();
    await waitFor(() => expect(getProfil).toHaveBeenCalled());
  });

  test('une panne du profil laisse passer', async () => {
    getProfil.mockRejectedValue(new Error('panne'));
    monter();
    expect(await screen.findByText('La page du site')).toBeInTheDocument();
  });

  test('une API plus ancienne que le front, sans le champ, laisse passer', async () => {
    getProfil.mockResolvedValue({ data: { tutorielVu: true } });
    monter();
    expect(await screen.findByText('La page du site')).toBeInTheDocument();
  });

  test('un profil qui ne répond jamais laisse passer au bout de 6 secondes', async () => {
    jest.useFakeTimers();
    getProfil.mockReturnValue(new Promise(() => {}));
    monter();

    expect(screen.queryByText('La page du site')).not.toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(6000); });
    expect(screen.getByText('La page du site')).toBeInTheDocument();
  });

  test('tant que la session n’est pas connue, rien ne s’affiche', () => {
    monter({ authentifie: false, loading: true });
    expect(screen.queryByText('La page du site')).not.toBeInTheDocument();
  });
});
