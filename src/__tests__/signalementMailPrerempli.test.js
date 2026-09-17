import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignalementsAdmin from '../components/SignalementsAdmin';
import * as api from '../lib/api/adminApi';

/**
 * L'ADRESSE DU PARENT PART DU COMPTE CONNECTÉ — Camara, le 17/09/2026.
 *
 * Elle reste MODIFIABLE, et c'est la moitié du besoin : un signalement remonté
 * par téléphone concerne le compte de quelqu'un d'autre. Une valeur de départ,
 * pas une contrainte.
 */
const MAIL = 'camara@exemple.fr';

jest.mock('../lib/api/adminApi');

jest.mock('react-redux', () => ({
  useSelector: (selecteur) => selecteur({ auth: { utilisateur: { email: 'camara@exemple.fr' } } }),
}));

// Le flux d'événements ouvre une connexion : inutile ici, et il échouerait.
jest.mock('../lib/hooks/useEvenementsAdmin', () => ({
  useEvenementsAdmin: () => {},
}));

beforeEach(() => {
  jest.clearAllMocks();
  api.getSignalements.mockResolvedValue({ data: [] });
  api.creerSignalement.mockResolvedValue({ data: {} });
});

const ouvrirFormulaire = async () => {
  render(<SignalementsAdmin />);
  await userEvent.click(await screen.findByRole('button', { name: /ajouter un signalement/i }));

  return screen.getByLabelText(/adresse du parent/i);
};

describe('Ajouter un signalement', () => {
  test('l’adresse est pré-remplie avec le compte connecté', async () => {
    expect(await ouvrirFormulaire()).toHaveValue(MAIL);
  });

  test('elle reste modifiable : un autre parent peut être saisi', async () => {
    const champ = await ouvrirFormulaire();

    await userEvent.clear(champ);
    await userEvent.type(champ, 'autre@exemple.fr');

    expect(champ).toHaveValue('autre@exemple.fr');
  });
});
