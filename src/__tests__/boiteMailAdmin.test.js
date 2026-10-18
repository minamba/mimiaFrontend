import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Messagerie from '../components/Messagerie';
import ConnexionBoite from '../components/ConnexionBoite';
import { getMessages, connecterBoite } from '../lib/api/adminApi';

/*
 * LA BOÎTE MAIL DE CHAQUE ADMINISTRATEUR — Camara, le 17/10/2026 : à la première
 * ouverture de l'onglet Mails, on demande l'adresse et le mot de passe de SA
 * boîte LWS ; ensuite ses messages partent de son adresse.
 */
jest.mock('../lib/api/adminApi', () => ({
  getMessages: jest.fn(),
  getMessage: jest.fn(),
  marquerMessageLu: jest.fn(),
  repondreMessage: jest.fn(),
  deconnecterBoite: jest.fn(),
  connecterBoite: jest.fn(),
}));

describe('la boîte mail de l’administrateur', () => {
  beforeEach(() => jest.clearAllMocks());

  it('première visite : la messagerie demande la boîte, adresse proposée', async () => {
    getMessages.mockRejectedValueOnce({ response: { status: 409, data: { code: 'a_configurer', adresse: 'camara@mimia.fr' } } });
    render(<Messagerie />);

    expect(await screen.findByRole('heading', { name: 'Connectez votre boîte mail' })).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse de la boîte')).toHaveValue('camara@mimia.fr');
  });

  it('une fois connectée, la boîte s’ouvre et son adresse s’affiche', async () => {
    getMessages
      .mockRejectedValueOnce({ response: { status: 409, data: { code: 'a_configurer', adresse: 'camara@mimia.fr' } } })
      .mockResolvedValueOnce({ data: { configuree: true, adresse: 'camara@mimia.fr', messages: [] } });
    connecterBoite.mockResolvedValue({});
    render(<Messagerie />);

    fireEvent.change(await screen.findByLabelText('Mot de passe de la boîte'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Connecter ma boîte' }));

    await waitFor(() => expect(connecterBoite).toHaveBeenCalledWith('camara@mimia.fr', 'secret'));
    expect(await screen.findByText('camara@mimia.fr')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Déconnecter' })).toBeInTheDocument();
  });

  it('la boîte Support : toujours ouverte, sans connexion, à l’adresse commune', async () => {
    getMessages.mockResolvedValueOnce({ data: { configuree: true, adresse: null, messages: [] } });
    render(<Messagerie boite="support" />);

    expect(await screen.findByText('support@mimia.fr')).toBeInTheDocument();
    expect(getMessages).toHaveBeenCalledWith('support', 'reception', 1);
    expect(screen.queryByRole('button', { name: 'Déconnecter' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Connectez votre boîte mail' })).not.toBeInTheDocument();
  });

  it('un mot de passe refusé par LWS se dit, rien ne part', async () => {
    connecterBoite.mockRejectedValue({ response: { data: { message: 'Adresse ou mot de passe refusé par la boîte mail.' } } });
    const onConnectee = jest.fn();
    render(<ConnexionBoite code="a_configurer" adresse="camara@mimia.fr" onConnectee={onConnectee} />);

    fireEvent.change(screen.getByLabelText('Mot de passe de la boîte'), { target: { value: 'faux' } });
    fireEvent.click(screen.getByRole('button', { name: 'Connecter ma boîte' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('refusé par la boîte mail');
    expect(onConnectee).not.toHaveBeenCalled();
  });

  it('sans clé sur le serveur : un message, pas de formulaire', () => {
    render(<ConnexionBoite code="cle_absente" message="La clé de chiffrement des boîtes manque sur le serveur." />);
    expect(screen.getByText('La clé de chiffrement des boîtes manque sur le serveur.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Mot de passe de la boîte')).not.toBeInTheDocument();
  });
});
